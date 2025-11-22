import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PRICING_TIERS } from "@/lib/constants/pricing";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value)
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		if (
			request.nextUrl.pathname !== "/" &&
			!request.nextUrl.pathname.startsWith("/login") &&
			!request.nextUrl.pathname.startsWith("/signup") &&
			!request.nextUrl.pathname.startsWith("/error")
		) {
			const url = request.nextUrl.clone();
			url.pathname = "/login";
			return NextResponse.redirect(url);
		}
	} else {
		const { data: userProfile } = await supabase
			.from("user_profiles")
			.select("*, subscription(*)")
			.eq("id", user.id)
			.single();

		const currentPlan = PRICING_TIERS.find(t => t.id === userProfile?.subscription?.current_plan_id) || PRICING_TIERS[0];

		if (request.nextUrl.pathname.startsWith("/api/scraping/task")) {
			const { data: tasks } = await supabase
				.from("scraping_tasks")
				.select("id")
				.eq("user_id", user.id)
				.gte("created_at", new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

			if (tasks && tasks.length >= currentPlan.maxScrapingJobs) {
				const url = request.nextUrl.clone();
				url.pathname = "/pricing";
				url.searchParams.set("error", "You have exceeded your scraping limit for this month.");
				return NextResponse.redirect(url);
			}
		}
	}

	return supabaseResponse;
}
