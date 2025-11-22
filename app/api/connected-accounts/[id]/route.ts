import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
	request: NextRequest,
	props: { params: Promise<{ id: string }> }
) {
	const params = await props.params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = params;

	if (!id) {
		return NextResponse.json(
			{ error: "Account ID is required" },
			{ status: 400 }
		);
	}

	const { error } = await supabase
		.from("user_connected_accounts")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) {
		console.error("Error deleting connected account:", error);
		return NextResponse.json(
			{ error: "Failed to delete account" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
