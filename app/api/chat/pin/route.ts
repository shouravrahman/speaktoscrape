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

	const { chatId, isPinned } = await request.json();

	if (!chatId || typeof isPinned !== "boolean") {
		return NextResponse.json(
			{
				success: false,
				error: "Chat ID and isPinned status are required",
			},
			{ status: 400 }
		);
	}

	const { data, error } = await supabase
		.from("chat_sessions")
		.update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
		.eq("id", chatId)
		.eq("user_id", user.id)
		.select();

	if (error) {
		console.error("Error pinning/unpinning chat:", error);
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
