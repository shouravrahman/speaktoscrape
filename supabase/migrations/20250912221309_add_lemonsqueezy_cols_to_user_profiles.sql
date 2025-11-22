-- Add Lemon Squeezy related columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN lemonsqueezy_customer_id TEXT,
ADD COLUMN lemonsqueezy_subscription_id TEXT;

-- Update existing free users to 'free' plan and 'active' status
UPDATE user_profiles
SET
  subscription_status = 'active',
  subscription_tier = 'free'
WHERE
  subscription_tier IS NULL OR subscription_tier = 'free';
