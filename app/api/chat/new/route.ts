import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

	// Create a new chat session with a default title
	const { data, error } = await supabase
		.from("chat_sessions")
		.insert({ user_id: user.id, title: "New Chat", message_count: 0 })
		.select("id")
		.single();

	if (error) {
		console.error("Error creating new chat session:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true, chatId: data.id });
}
