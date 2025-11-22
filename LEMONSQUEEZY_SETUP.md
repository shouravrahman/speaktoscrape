# Lemon Squeezy Setup Guide

This guide will walk you through the process of setting up Lemon Squeezy for your application.

## 1. Create a Lemon Squeezy Account

If you don't already have one, create a Lemon Squeezy account at [https://www.lemonsqueezy.com/](https://www.lemonsqueezy.com/).

## 2. Create a Store

Once you have an account, create a new store. You can do this from your Lemon Squeezy dashboard.

## 3. Create a Product

Create a new product in your store. This will represent the subscription your users will purchase.

## 4. Create a Variant

For your product, create a new variant. This will be the specific pricing tier for your subscription. In our case, this will be the "Pro" tier.

- **Name:** Pro
- **Price:** $29
- **Billing Interval:** Monthly

## 5. Get Your Store ID and Variant ID

You will need your Store ID and Variant ID for the environment variables.

- **Store ID:** You can find this in your Lemon Squeezy dashboard under **Settings > General**.
- **Variant ID:** You can find this on the product variant page.

## 6. Set Environment Variables

Set the following environment variables in your `.env.local` file:

```
LEMONSQUEEZY_STORE_ID=your_store_id
NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID=your_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

## 7. Create a Webhook

In your Lemon Squeezy dashboard, go to **Settings > Webhooks** and create a new webhook.

- **URL:** `https://your-domain.com/api/lemonsqueezy/webhook`
- **Secret:** Generate a new secret and add it to your environment variables as `LEMONSQUEEZY_WEBHOOK_SECRET`.
- **Events:** Select the following events:
    - `subscription_created`
    - `subscription_updated`
    - `subscription_payment_failed`
    - `subscription_cancelled`
    - `subscription_expired`

## 8. Run Migrations

Run the following command to apply the new `billing_events` table to your Supabase database:

```
npx supabase db push
```
