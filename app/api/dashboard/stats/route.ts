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

	const { data: stats, error } = await supabase
		.from("user_scraping_analytics")
		.select(
			"total_tasks, completed_tasks, failed_tasks, avg_duration, active_days, last_activity"
		)
		.eq("user_id", user.id)
		.single(); // Expecting a single row for user stats

	if (error) {
		console.error("Error fetching user stats:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true, stats });
}
