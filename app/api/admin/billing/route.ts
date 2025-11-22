import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';

export async function GET(req: Request) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('billing_events')
    .select('*')
    .order('created_at', { descending: true });

  if (error) {
    console.error('Error fetching billing events:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }

  return NextResponse.json(data);
}
