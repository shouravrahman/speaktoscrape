import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

		// Get all scraped data for the user
		const { data: results, error } = await supabase
			.from("scraping_results")
			.select(
				`
        id,
        task_id,
        format,
        created_at,
        data,
        scraping_tasks!inner (
          user_id,
          task_data,
          status
        )
      `
			)
			.eq("scraping_tasks.user_id", user.id)
			.eq("scraping_tasks.status", "completed")
			.order("created_at", { ascending: false })
			.limit(100);

		if (error) {
			return NextResponse.json(
				{ error: "Failed to fetch data" },
				{ status: 500 }
			);
		}

		const formattedData =
			results?.map((result) => {
				const taskData = result.scraping_tasks.task_data;
				const dataSize = JSON.stringify(result.data).length;

				return {
					id: result.id,
					taskId: result.task_id,
					title:
						`${taskData.intent} - ${taskData.target}`.slice(0, 60) +
						"...",
					dataType: taskData.dataType,
					format: result.format,
					size: dataSize,
					createdAt: new Date(result.created_at),
					summary: generateDataSummary(result.data, taskData),
				};
			}) || [];

		return NextResponse.json({
			success: true,
			data: formattedData,
		});
	} catch (error) {
		console.error("Error fetching scraped data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch scraped data" },
			{ status: 500 }
		);
	}
}

function generateDataSummary(data: any, taskData: any): string {
	if (Array.isArray(data)) {
		const count = data.length;
		const sampleKeys = data[0] ? Object.keys(data[0]).slice(0, 3) : [];
		return `${count} items with fields: ${sampleKeys.join(", ")}`;
	} else if (typeof data === "object" && data !== null) {
		const keys = Object.keys(data).slice(0, 5);
		return `Object with fields: ${keys.join(", ")}`;
	}
	return `${taskData.dataType} data from ${taskData.target}`;
}
