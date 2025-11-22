import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route requires the Supabase service role key to perform admin-level operations.
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables.
const supabaseAdmin = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
   // 1. Verify the user is an admin using the standard client
   // We can't use the admin client for this, as it bypasses RLS.
   const { createClient: createServerClient } = await import('@/lib/supabase/server');
   const supabase = createServerClient();

   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

   if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }

   // 2. If user is an admin, proceed with fetching stats using the admin client
   try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const listUsersPromise = supabaseAdmin.auth.admin.listUsers();
      const jobCountPromise = supabaseAdmin.from('scraping_tasks').select('id', { count: 'exact', head: true });
      const failedJobsPromise = supabaseAdmin.from('scraping_tasks').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', twentyFourHoursAgo);
      const activeSubsPromise = supabaseAdmin.from('user_profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active');

      const [
         { data: usersData, error: usersError },
         { count: totalJobs, error: jobsError },
         { count: failedJobs24h, error: failedJobsError },
         { count: activeSubscriptions, error: subsError }
      ] = await Promise.all([
         listUsersPromise,
         jobCountPromise,
         failedJobsPromise,
         activeSubsPromise
      ]);

      if (usersError || jobsError || failedJobsError || subsError) {
         console.error('Error fetching admin stats parts:', { usersError, jobsError, failedJobsError, subsError });
         throw new Error('One or more database queries failed.');
      }

      return NextResponse.json({
         totalUsers: usersData?.users?.length ?? 0,
         totalJobs: totalJobs ?? 0,
         failedJobs24h: failedJobs24h ?? 0,
         activeSubscriptions: activeSubscriptions ?? 0,
      });

   } catch (error) {
      console.error('Error fetching admin stats:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
