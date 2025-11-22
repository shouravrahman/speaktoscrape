import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { encrypt, decrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("user_connected_accounts")
		.select("id, domain, created_at, cookies_expire_at")
		.eq("user_id", user.id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ connectedAccounts: data });
}

export async function POST(request: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { domain, cookies, expires } = await request.json();

	if (!domain || !cookies) {
		return NextResponse.json(
			{ error: "Domain and cookies are required" },
			{ status: 400 }
		);
	}

	const encrypted_cookies = encrypt(JSON.stringify(cookies));

	const { data, error } = await supabase
		.from("user_connected_accounts")
		.upsert(
			{
				user_id: user.id,
				domain,
				encrypted_cookies,
				cookies_expire_at: expires,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "user_id, domain" }
		);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
