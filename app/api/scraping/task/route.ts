import { NextRequest, NextResponse } from "next/server";
import { ScraperAgent } from "@/lib/agents/scraper-agent";
import { QAAgent } from "@/lib/agents/qa-agent";
import { VectorEmbeddingService } from "@/lib/vector/embeddings";
import { decrypt } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";
import { PRICING_TIERS } from "@/lib/constants/pricing";
import { inngest } from "@/lib/inngest/client";


export async function POST(request: NextRequest) {
	try {
		const { query, chatId } = await request.json();
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (chatId) {
			// Check for a completed task in this chat
			const { data: latestMessage } = await supabase
				.from("chat_messages")
				.select("task_id")
				.eq("chat_session_id", chatId)
				.not("task_id", "is", null)
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (latestMessage && latestMessage.task_id) {
				const { data: taskData } = await supabase
					.from("scraping_tasks")
					.select("status, id")
					.eq("id", latestMessage.task_id)
					.single();

				if (taskData && taskData.status === 'completed') {
					// Task is completed, use QA agent
					const vectorService = new VectorEmbeddingService();
					const similarChunks = await vectorService.searchSimilar(query, user.id, {});
					const context = similarChunks.map(chunk => chunk.content).join("\n\n");

					const qaAgent = new QAAgent();

					// Create callback to save AI completion
					const saveCompletion = async (content: string) => {
						await supabase.from("chat_messages").insert({
							chat_session_id: chatId,
							user_id: user.id,
							message_type: "assistant",
							content: content,
							task_id: latestMessage.task_id,
						});
					};

					const stream = await qaAgent.answer(query, context, saveCompletion);

					// Save user message
					const { error: messageError } = await supabase.from("chat_messages").insert({
						chat_session_id: chatId,
						user_id: user.id,
						message_type: "user",
						content: query,
					});

					if (messageError) {
						console.error("Error saving user message:", messageError);
						// Don't fail the request for message saving errors, just log
					}

					// Return the stream response
					return stream.toTextStreamResponse();
				}
			}
		}

		const agent = new ScraperAgent();

		// Parse the natural language query
		const task = await agent.parseTask(query, user.id);

		if (task.requiresAuth) {
			const { data: connectedAccount, error: accountError } = await supabase
				.from('user_connected_accounts')
				.select('encrypted_cookies, cookies_expire_at')
				.eq('user_id', user.id)
				.eq('domain', task.requiresAuth)
				.single();

			if (accountError && accountError.code !== 'PGRST116') { // PGRST116 = single row not found
				console.error("Error fetching connected account:", accountError);
				return NextResponse.json({ error: "Failed to check for connected accounts." }, { status: 500 });
			}

			const isExpired = connectedAccount && connectedAccount.cookies_expire_at && new Date(connectedAccount.cookies_expire_at) < new Date();

			if (!connectedAccount || isExpired) {
				return NextResponse.json({
					error: "Authentication required",
					type: "auth_required",
					domain: task.requiresAuth
				}, { status: 401 });
			}

			try {
				const decryptedCookies = decrypt(connectedAccount.encrypted_cookies);
				task.authentication = {
					strategy: 'cookies',
					cookies: JSON.parse(decryptedCookies)
				};
			} catch (e) {
				console.error("Failed to decrypt or parse cookies for task:", e);
				return NextResponse.json({
					error: "Authentication required",
					type: "auth_required",
					domain: task.requiresAuth,
					detail: "Could not use existing credentials. Please connect your account again."
				}, { status: 401 });
			}
		}

		// Create scraping_tasks record to get taskId
		const { data: newScrapingTask, error: insertError } = await supabase
			.from("scraping_tasks")
			.insert({
				user_id: user.id,
				query: query,
				status: "pending", // Initial status
				target: task.target,
				intent: task.intent,
				format: task.format,
				pagination: task.pagination,
				maxPages: task.maxPages,
			})
			.select()
			.single();

		if (insertError || !newScrapingTask) {
			console.error("Error creating scraping task:", insertError);
			return NextResponse.json(
				{ error: "Failed to create scraping task" },
				{ status: 500 }
			);
		}
		const taskId = newScrapingTask.id;

		// Handle chat session
		let sessionId = chatId;
		if (!sessionId) {
			// Create new chat session
			const { data: session, error: sessionError } = await supabase
				.from("chat_sessions")
				.insert({
					user_id: user.id,
					title:
						query.slice(0, 50) + (query.length > 50 ? "..." : ""),
					last_message: query,
				})
				.select()
				.single();

			if (sessionError) {
				console.error("Error creating chat session:", sessionError);
				return NextResponse.json(
					{ error: "Failed to create chat session" },
					{ status: 500 }
				);
			}

			sessionId = session?.id;
		}

		// Save user message
		if (sessionId) {
			const { error: messageError } = await supabase.from("chat_messages").insert({
				chat_session_id: sessionId,
				user_id: user.id,
				message_type: "user",
				content: query,
				task_id: taskId,
			});

			if (messageError) {
				console.error("Error saving user message:", messageError);
				// Don't fail the request for message saving errors, just log
			}
		}

		// Get user's current plan and check usage limits
		const { data: userProfile, error: profileError } = await supabase
			.from("user_profiles")
			.select("subscription_tier")
			.eq("user_id", user.id)
			.single();

		if (profileError) {
			console.error("Error fetching user profile:", profileError);
			return NextResponse.json(
				{ error: "Failed to fetch user profile" },
				{ status: 500 }
			);
		}

		const currentPlanId = userProfile?.subscription_tier || "hobby";

		// Check current month usage
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		const { count: scrapingJobsUsed, error: usageError } = await supabase
			.from("scraping_tasks")
			.select("id", { count: "exact" })
			.eq("user_id", user.id)
			.gte("created_at", startOfMonth.toISOString());

		if (usageError) {
			console.error("Error checking usage:", usageError);
			return NextResponse.json(
				{ error: "Failed to check usage limits" },
				{ status: 500 }
			);
		}

		// Get plan limits from constants
		const currentPlan = PRICING_TIERS.find(tier => tier.id === currentPlanId);
		const maxJobs = currentPlan?.maxScrapingJobs || 20;

		// Check if user has exceeded their scraping limit
		if ((scrapingJobsUsed || 0) >= maxJobs) {
			return NextResponse.json(
				{
					error: "Monthly scraping limit reached",
					limit: maxJobs,
					used: scrapingJobsUsed || 0,
					planId: currentPlanId
				},
				{ status: 429 }
			);
		}

		// Check storage limits before starting expensive scraping operations
		const maxDataStorageMB = currentPlan?.maxDataStorageMB;
		if (maxDataStorageMB !== null && maxDataStorageMB !== undefined) {
			const { data: currentStorageResults, error: storageError } = await supabase
				.from("scraping_results")
				.select("data_size")
				.eq("user_id", user.id);

			if (storageError) {
				console.error("Error checking storage usage:", storageError);
				return NextResponse.json(
					{ error: "Failed to check storage limits" },
					{ status: 500 }
				);
			}

			const currentStorageBytes = currentStorageResults?.reduce((sum, row) => sum + (row.data_size || 0), 0) || 0;
			const maxDataStorageBytes = maxDataStorageMB * 1024 * 1024;

			// Check if user is close to storage limit (90% threshold)
			if (currentStorageBytes >= maxDataStorageBytes * 0.9) {
				return NextResponse.json(
					{
						error: "Storage limit nearly reached",
						currentUsageMB: Math.round(currentStorageBytes / (1024 * 1024)),
						limitMB: maxDataStorageMB,
						planId: currentPlanId
					},
					{ status: 429 }
				);
			}
		}

		// Trigger background scraping job
		await inngest.send({
			name: "scraping/execute",
			data: { taskId, task, userPlanId: currentPlanId },
		});

		return NextResponse.json({
			success: true,
			taskId,
			task,
			chatId: sessionId,
			message: "Scraping task started successfully",
		});
	} catch (error) {
		console.error("Error processing scraping request:", error);
		return NextResponse.json(
			{ error: "Failed to process scraping request" },
			{ status: 500 }
		);
	}
}


export async function GET(request: NextRequest) {
	const supabase = await createClient();
	const { searchParams } = new URL(request.url);
	const taskId = searchParams.get("taskId");

	try {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (taskId) {
			// Get specific task
			const { data: task, error } = await supabase
				.from("scraping_tasks")
				.select(
					`
          *,
          scraping_results (*)
        `
				)
				.eq("id", taskId)
				.single();

			if (error) {
				return NextResponse.json(
					{ error: "Task not found" },
					{ status: 404 }
				);
			}

			return NextResponse.json({ task });
		} else {
			// Get all user tasks
			const { data: tasks, error } = await supabase
				.from("scraping_tasks")
				.select(
					`
          *,
          scraping_results (*)
        `
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				return NextResponse.json(
					{ error: "Failed to fetch tasks" },
					{ status: 500 }
				);
			}

			return NextResponse.json({ tasks });
		}
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return NextResponse.json(
			{ error: "Failed to fetch tasks" },
			{ status: 500 }
		);
	}
}
