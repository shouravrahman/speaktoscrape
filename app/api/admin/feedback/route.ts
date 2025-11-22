import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { checkAdmin } from '@/lib/auth/admin';

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

   const adminCheck = await checkAdmin(user.id);
   if (adminCheck) {
       return adminCheck;
   }

   // 2. Fetch feedback messages with pagination and filters
   try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const perPage = 20;
      const rangeFrom = (page - 1) * perPage;
      const rangeTo = rangeFrom + perPage - 1;
      const typeFilter = searchParams.get('type');
      const statusFilter = searchParams.get('status');

      let query = supabaseAdmin
         .from('feedback')
         .select('*, user_profiles ( email )', { count: 'exact' })
         .order('created_at', { ascending: false })
         .range(rangeFrom, rangeTo);

      if (typeFilter && typeFilter !== 'all') {
         query = query.eq('feedback_type', typeFilter);
      }
      if (statusFilter && statusFilter !== 'all') {
         query = query.eq('status', statusFilter);
      }

      const { data: feedback, error, count } = await query;

      if (error) throw error;

      return NextResponse.json({ feedback, count });

   } catch (error) {
      console.error('Error fetching feedback for admin:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}

export async function PUT(request: Request) {
   // 1. Verify the user is an admin
   const { createClient: createServerClient } = await import('@/lib/supabase/server');
   const supabase = createServerClient();

   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const adminCheck = await checkAdmin(user.id);
   if (adminCheck) {
       return adminCheck;
   }

   // 2. Update feedback status
   try {
      const { id, status } = await request.json();

      if (!id || !status) {
         return NextResponse.json({ error: 'ID and status are required.' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
         .from('feedback')
         .update({ status })
         .eq('id', id)
         .select();

      if (error) throw error;

      return NextResponse.json({ success: true, feedback: data[0] });

   } catch (error) {
      console.error('Error updating feedback status:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}