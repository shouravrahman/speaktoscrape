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

	const { searchParams } = new URL(request.url);
	const page = parseInt(searchParams.get('page') || '1', 10);
	const limit = parseInt(searchParams.get('limit') || '10', 10);
	const offset = (page - 1) * limit;

	const { data: scrapingTasks, error, count } = await supabase
		.from("scraping_tasks")
		.select("id, task_data, status, created_at, completed_at, error_message", { count: 'exact' })
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error("Error fetching scraping history:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({
		success: true,
		tasks: scrapingTasks,
		totalCount: count,
		page,
		limit,
	});
}
