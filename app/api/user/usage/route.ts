import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
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

	try {
		// Fetch user profile to get current plan
		const { data: userProfile, error: profileError } = await supabase
			.from("user_profiles")
			.select("subscription_tier")
			.eq("user_id", user.id)
			.single();

		if (profileError) {
			console.error("Error fetching user profile:", profileError);
			return NextResponse.json(
				{ success: false, error: "Failed to fetch user profile" },
				{ status: 500 }
			);
		}

		const currentPlanId = userProfile?.subscription_tier || "free";

		// Calculate scraping jobs used for the current month
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		// Assuming a 'scraping_tasks' table exists with 'user_id' and 'created_at'
		const { count: scrapingJobsUsed, error: jobsError } = await supabase
			.from("scraping_tasks")
			.select("id", { count: "exact" })
			.eq("user_id", user.id)
			.gte("created_at", startOfMonth.toISOString())
			.lt("created_at", now.toISOString());

		if (jobsError) {
			console.error("Error counting scraping jobs:", jobsError);
			return NextResponse.json(
				{ success: false, error: "Failed to count scraping jobs" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			scrapingJobsUsed: scrapingJobsUsed || 0,
			currentPlanId: currentPlanId,
		});
	} catch (error) {
		console.error("Error in /api/user/usage:", error);
		return NextResponse.json(
			{ success: false, error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
