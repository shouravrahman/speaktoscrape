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

	const { chatId, newTitle } = await request.json();

	if (!chatId || !newTitle) {
		return NextResponse.json(
			{ success: false, error: "Chat ID and new title are required" },
			{ status: 400 }
		);
	}

	const { data, error } = await supabase
		.from("chat_sessions")
		.update({ title: newTitle, updated_at: new Date().toISOString() })
		.eq("id", chatId)
		.eq("user_id", user.id)
		.select();

	if (error) {
		console.error("Error renaming chat:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	if (!data || data.length === 0) {
		return NextResponse.json(
			{ success: false, error: "Chat not found or not authorized" },
			{ status: 404 }
		);
	}

	return NextResponse.json({ success: true, chat: data[0] });
}
