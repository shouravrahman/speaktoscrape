import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
   // 1. Verify the user is an admin
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

   // 2. Fetch users with pagination
   try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const perPage = 20; // Number of users per page

      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
         page: page,
         perPage: perPage,
      });

      if (usersError) throw usersError;

      const userIds = usersData.users.map(u => u.id);

      // Fetch corresponding profiles
      const { data: profilesData, error: profilesError } = await supabaseAdmin
         .from('user_profiles')
         .select('id, role, subscription_status, subscription_tier')
         .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles for easy lookup
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));

      // Combine user and profile data
      const combinedUsers = usersData.users.map(u => {
         const userProfile = profilesMap.get(u.id);
         return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            role: userProfile?.role || 'user',
            subscription_status: userProfile?.subscription_status || 'inactive',
            subscription_tier: userProfile?.subscription_tier || 'free',
         };
      });

      return NextResponse.json({
         users: combinedUsers,
      });

   } catch (error) {
      console.error('Error fetching users for admin:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
