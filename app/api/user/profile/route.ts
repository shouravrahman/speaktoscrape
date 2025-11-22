import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { company_name, role, use_case, account_type } = await req.json();
  const supabase = await createClient();

  const { data: {
    user
  } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      error: "Unauthorized"
    }, {
      status: 401
    });
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      company_name,
      role,
      use_case,
      account_type,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
  }

  return NextResponse.json({
    message: "Profile updated successfully"
  });
}
