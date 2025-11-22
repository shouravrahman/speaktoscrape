import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

	const { data: chatSessions, error } = await supabase
		.from("chat_sessions")
		.select(
			"id, title, last_message, message_count, created_at, updated_at, is_pinned"
		)
		.eq("user_id", user.id)
		.order("is_pinned", { ascending: false })
		.order("updated_at", { ascending: false });

	if (error) {
		console.error("Error fetching chat history:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true, chats: chatSessions });
}
