-- Create user_connected_accounts table
CREATE TABLE IF NOT EXISTS user_connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  encrypted_cookies TEXT,
  cookies_expire_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- Enable RLS on user_connected_accounts
ALTER TABLE user_connected_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_connected_accounts
CREATE POLICY "Users can view their own connected accounts"
  ON user_connected_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected accounts"
  ON user_connected_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connected accounts"
  ON user_connected_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected accounts"
    ON user_connected_accounts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
