import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const feedbackSchema = z.object({
	feedback_type: z.enum(["bug", "feature", "contact"]),
	message: z
		.string()
		.min(10, "Message must be at least 10 characters long.")
		.max(5000),
});

export async function POST(request: Request) {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const json = await request.json();
	const result = feedbackSchema.safeParse(json);

	if (!result.success) {
		return NextResponse.json(
			{ error: result.error.format() },
			{ status: 400 }
		);
	}

	const { feedback_type, message } = result.data;

	const { error: insertError } = await supabase.from("feedback").insert({
		user_id: user.id,
		user_email: user.email,
		feedback_type,
		message,
	});

	if (insertError) {
		console.error("Error submitting feedback:", insertError);
		return NextResponse.json(
			{ error: "Failed to submit feedback." },
			{ status: 500 }
		);
	}

	return NextResponse.json({
		success: true,
		message: "Feedback submitted successfully!",
	});
}
