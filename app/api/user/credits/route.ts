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

	const { data: userProfile, error } = await supabase
		.from("user_profiles")
		.select("credits, subscription_tier")
		.eq("user_id", user.id)
		.single();

	if (error) {
		console.error("Error fetching user credits:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}

	if (!userProfile) {
		// If no profile exists, create one with default values
		const { data: newProfile, error: insertError } = await supabase
			.from("user_profiles")
			.insert({ user_id: user.id, credits: 0, subscription_tier: "free" })
			.select("credits, subscription_tier")
			.single();

		if (insertError) {
			console.error("Error creating user profile:", insertError);
			return NextResponse.json(
				{ success: false, error: insertError.message },
				{ status: 500 }
			);
		}
		return NextResponse.json({
			success: true,
			credits: newProfile.credits,
			subscription_tier: newProfile.subscription_tier,
		});
	}

	return NextResponse.json({
		success: true,
		credits: userProfile.credits,
		subscription_tier: userProfile.subscription_tier,
	});
}
