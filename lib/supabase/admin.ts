
import { createClient } from '@supabase/supabase-js';

// This client is intended for server-side use only, where you need to bypass RLS.
// It uses the service role key, which has full access to your database.
// Be extremely careful where you use this client.

export const createAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};
