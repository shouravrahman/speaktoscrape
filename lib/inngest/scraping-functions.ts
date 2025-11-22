import { inngest } from "./client";
import { ScraperAgent } from "../agents/scraper-agent";
import { createClient } from "../supabase/server";
import { VectorEmbeddingService } from "../vector/embeddings";
import { sendEmail } from "../email/send"; // Import sendEmail
import { PRICING_TIERS } from "../constants/pricing";

export const scrapingJob = inngest.createFunction(
	{
		id: "scraping-job",
		priority: {
			run: "event.data.userPlanId == 'pro' ? 100 : 0", // Higher priority for 'pro' users
		},
	},
	{ event: "scraping/execute" },
	async ({ event, step }) => {
		const { taskId, task } = event.data;
		const supabase = await createClient();

		// Fetch user ID from the task
		const { data: taskData, error: taskError } = await supabase
			.from("scraping_tasks")
			.select("user_id")
			.eq("id", taskId)
			.single();

		if (taskError || !taskData) {
			console.error(
				"Error fetching task data for email notification:",
				taskError?.message
			);
			throw new Error(
				"Could not fetch task data for email notification."
			);
		}

		const userId = taskData.user_id;

		// Fetch user's current plan and storage usage
		const { data: userProfile, error: profileError } = await supabase
			.from("user_profiles")
			.select("subscription_tier")
			.eq("user_id", userId)
			.single();

		if (profileError) {
			console.error("Error fetching user profile for storage check:", profileError);
			throw new Error("Failed to fetch user profile for storage check.");
		}

		const currentPlanId = userProfile?.subscription_tier || "hobby"; // Default to hobby if no plan found
		const currentPlan = PRICING_TIERS.find(tier => tier.id === currentPlanId);

		if (!currentPlan) {
			throw new Error("Invalid plan configuration for storage check.");
		}

		const maxDataStorageMB = currentPlan.maxDataStorageMB;

		// Fetch current total storage used by the user
		const { data: currentStorageResults, error: storageError } = await supabase
			.from("scraping_results")
			.select("data_size")
			.eq("user_id", userId);

		if (storageError) {
			console.error("Error fetching current storage usage:", storageError);
			throw new Error("Failed to fetch current storage usage.");
		}

		const currentStorageBytes = currentStorageResults?.reduce((sum, row) => sum + (row.data_size || 0), 0) || 0;
		const maxDataStorageBytes = maxDataStorageMB * 1024 * 1024; // Convert MB to bytes

		// Pre-check storage limits to avoid wasting resources on scraping
		if (maxDataStorageMB !== null && currentStorageBytes >= maxDataStorageBytes * 0.95) {
			await supabase
				.from("scraping_tasks")
				.update({
					status: "failed",
					error_message: "Storage limit reached. Please upgrade your plan or free up space.",
					completed_at: new Date().toISOString(),
				})
				.eq("id", taskId);

			throw new Error("Storage limit reached. Please upgrade your plan or free up space.");
		}

		// Fetch user email from auth.users table
		const { data: authUserData, error: authUserError } =
			await supabase.auth.admin.getUserById(userId);

		if (authUserError || !authUserData?.user?.email) {
			console.error(
				"Error fetching user email for notification:",
				authUserError?.message
			);
			// Continue without sending email if email not found
		}

		const userEmail = authUserData?.user?.email;

		// Update task status
		await step.run("update-status-start", async () => {
			return await supabase
				.from("scraping_tasks")
				.update({ status: "running" })
				.eq("id", taskId);
		});

		try {
			const agent = new ScraperAgent();

			const scrapedData = await step.run("execute-scraping", async () => {
				return await agent.run(task);
			});

			// Store results
			await step.run("store-results", async () => {
				const newScrapedDataSize = JSON.stringify(scrapedData).length;
				if (maxDataStorageBytes !== null && (currentStorageBytes + newScrapedDataSize) > maxDataStorageBytes) {
					// Update task status to failed due to storage limit
					await supabase
						.from("scraping_tasks")
						.update({
							status: "failed",
							error_message: "Storage limit exceeded for your current plan.",
							completed_at: new Date().toISOString(),
						})
						.eq("id", taskId);

					throw new Error("Storage limit exceeded for your current plan.");
				}

				const { data: storedResult, error: insertError } = await supabase
					.from("scraping_results")
					.insert({
						task_id: taskId,
						user_id: userId,
						data: scrapedData,
						format: task.format,
						data_size: newScrapedDataSize,
						created_at: new Date().toISOString(),
					})
					.select()
					.single();

				if (insertError) {
					console.error("Error storing scraping results:", insertError);
					throw new Error("Failed to store scraping results.");
				}

				// Generate vector embeddings if enabled
				if (task.postProcessing?.generateEmbeddings) {
					try {
						const vectorService = new VectorEmbeddingService();
						await vectorService.processScrapedData(taskId, scrapedData);
					} catch (embeddingError) {
						console.error("Error generating embeddings:", embeddingError);
						// Don't fail the entire task for embedding errors
					}
				}

				return storedResult;
			});

			// Update task status
			await step.run("update-status-complete", async () => {
				return await supabase
					.from("scraping_tasks")
					.update({
						status: "completed",
						completed_at: new Date().toISOString(),
					})
					.eq("id", taskId);
			});

			// Send success email
			if (userEmail) {
				try {
					await sendEmail({
						to: userEmail,
						subject: `Scraping Task ${taskId.substring(
							0,
							8
						)}... Completed`,
						html: `
                            <p>Your scraping task for <strong>${task.target}</strong> has been completed successfully!</p>
                            <p>Task ID: ${taskId}</p>
                            <p>You can view the results in your dashboard.</p>
                            <p>Thank you for using our service.</p>
                        `,
					});
				} catch (emailError) {
					console.error("Error sending success email:", emailError);
					// Don't fail the task for email errors
				}
			}

			await step.sendEvent("send-notification", {
				name: "notification/send",
				data: {
					taskId,
					status: "completed",
					message: `Scraping task ${taskId} completed successfully.`,
				},
			});

			return scrapedData;
		} catch (error: any) {
			// Update task status to failed
			await step.run("update-status-failed", async () => {
				return await supabase
					.from("scraping_tasks")
					.update({
						status: "failed",
						error_message: error.message,
						completed_at: new Date().toISOString(),
					})
					.eq("id", taskId);
			});

			// Send failure email
			if (userEmail) {
				try {
					await sendEmail({
						to: userEmail,
						subject: `Scraping Task ${taskId.substring(
							0,
							8
						)}... Failed`,
						html: `
                            <p>Your scraping task for <strong>${task.target}</strong> has failed.</p>
                            <p>Task ID: ${taskId}</p>
                            <p>Error: ${error.message}</p>
                            <p>Please check your task configuration or contact support.</p>
                        `,
					});
				} catch (emailError) {
					console.error("Error sending failure email:", emailError);
					// Don't fail the task for email errors
				}
			}

			await step.sendEvent("send-notification", {
				name: "notification/send",
				data: {
					taskId,
					status: "failed",
					message: `Scraping task ${taskId} failed.`,
				},
			});

			throw error;
		}
	}
);

export const sendNotification = inngest.createFunction(
	{ id: "send-notification" },
	{ event: "notification/send" },
	async ({ event }) => {
		const { taskId, status, message } = event.data;
		// In a real-world scenario, you would use a service like Pusher or Ably to send a real-time message to the client.
		console.log(
			`Sending notification for task ${taskId}: ${status} - ${message}`
		);
	}
);

export const dataProcessingJob = inngest.createFunction(
	{ id: "data-processing" },
	{ event: "data/process" },
	async ({ event, step }) => {
		const { resultId, processingOptions } = event.data;
		const supabase = await createClient();

		// Get the raw data
		const { data: result } = await supabase
			.from("scraping_results")
			.select("*")
			.eq("id", resultId)
			.single();

		if (!result) return;

		// Process and structure the data based on requirements
		const processedData = await step.run("process-data", async () => {
			// Here you would implement LLM-based data structuring
			// For now, return the raw data
			return result.data;
		});

		// Store processed data
		await step.run("store-processed-data", async () => {
			return await supabase.from("processed_data").insert({
				result_id: resultId,
				processed_data: processedData,
				processing_options: processingOptions,
				created_at: new Date().toISOString(),
			});
		});

		return processedData;
	}
);
