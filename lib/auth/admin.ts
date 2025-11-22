import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function isAdmin(userId: string) {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (profileError || profile?.role !== 'admin') {
        return false;
    }

    return true;
}

export async function checkAdmin(userId: string) {
    const admin = await isAdmin(userId);
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null; // Indicates success
}
