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

	const { data: recentScrapes, error } = await supabase
		.from("scraping_tasks")
		.select("id, task_data, status, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(5); // Limit to 5 recent scrapes for the dashboard

	if (error) {
		console.error("Error fetching recent scrapes:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true, recentScrapes });
}
