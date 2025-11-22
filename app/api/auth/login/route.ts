import { createClient } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const { email, password } = await request.json();

	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 401 });
	}

	return NextResponse.json({ message: "Logged in" }, { status: 200 });
}
