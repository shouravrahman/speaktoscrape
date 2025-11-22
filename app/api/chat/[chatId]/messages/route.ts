import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { chatId: string } }
) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const { chatId } = await params;

	if (!chatId) {
		return NextResponse.json(
			{ success: false, error: "Chat ID is required" },
			{ status: 400 }
		);
	}

	// Verify that the chat session belongs to the user
	const { data: chatSession, error: chatSessionError } = await supabase
		.from("chat_sessions")
		.select("id")
		.eq("id", chatId)
		.eq("user_id", user.id)
		.single();

	if (chatSessionError || !chatSession) {
		console.error(
			"Error verifying chat session or chat not found:",
			chatSessionError
		);
		return NextResponse.json(
			{
				success: false,
				error: "Chat session not found or not authorized",
			},
			{ status: 404 }
		);
	}

	const { data: messages, error } = await supabase
		.from("chat_messages")
		.select("id, message_type, content, task_id, metadata, created_at")
		.eq("chat_session_id", chatId)
		.order("created_at", { ascending: true });

	if (error) {
		console.error("Error fetching chat messages:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true, messages });
}
