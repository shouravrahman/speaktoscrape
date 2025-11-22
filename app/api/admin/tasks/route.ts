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

   // 2. Fetch tasks with pagination
   try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const perPage = 20;
      const rangeFrom = (page - 1) * perPage;
      const rangeTo = rangeFrom + perPage - 1;

      const { data: tasks, error, count } = await supabaseAdmin
         .from('scraping_tasks')
         .select(`
            id,
            created_at,
            status,
            target,
            intent,
            query,
            user_profiles ( id, email )
         `, { count: 'exact' })
         .order('created_at', { ascending: false })
         .range(rangeFrom, rangeTo);

      if (error) throw error;

      return NextResponse.json({ tasks, count });

   } catch (error) {
      console.error('Error fetching tasks for admin:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
