import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const {
		fullName,
		email,
		password,
		companyName,
		role,
		useCase,
		accountType,
	} = await request.json();
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: fullName,
			},
		},
	});

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	if (data.user) {
		const { error: profileError } = await supabase
			.from("user_profiles")
			.insert({
				user_id: data.user.id,
				company_name: companyName,
				role: role,
				use_case: useCase,
				account_type: accountType,
			});

		if (profileError) {
			// If profile creation fails, we might want to delete the user
			// or handle it in some other way. For now, we'll just log the error.
			console.error("Error creating user profile:", profileError);
			// Important: In a real-world scenario, you should probably delete the auth user here to avoid orphaned users.
			// await supabase.auth.api.deleteUser(data.user.id)
			return NextResponse.json(
				{ error: "Error creating user profile." },
				{ status: 500 }
			);
		}
	}

	return NextResponse.json(
		{
			message:
				"Signup successful, please check your email for confirmation.",
			user: data.user,
		},
		{ status: 200 }
	);
}
