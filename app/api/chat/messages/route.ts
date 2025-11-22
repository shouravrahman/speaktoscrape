import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const chatId = searchParams.get("chatId");

	if (!chatId) {
		return NextResponse.json(
			{ error: "Chat ID required" },
			{ status: 400 }
		);
	}

	try {
		const supabase = await createClient();

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

		// Get messages for the chat session
		const { data: messages, error } = await supabase
			.from("chat_messages")
			.select("*")
			.eq("chat_session_id", chatId)
			.eq("user_id", user.id)
			.order("created_at", { ascending: true });

		if (error) {
			return NextResponse.json(
				{ error: "Failed to fetch messages" },
				{ status: 500 }
			);
		}

		const formattedMessages =
			messages?.map((msg) => ({
				id: msg.id,
				type: msg.message_type,
				content: msg.content,
				timestamp: new Date(msg.created_at),
				taskId: msg.task_id,
				metadata: msg.metadata,
			})) || [];

		return NextResponse.json({
			success: true,
			messages: formattedMessages,
		});
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}
