import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRICING_TIERS } from '@/lib/constants/pricing';
import { verifyWebhookSignature } from '@/lib/lemonsqueezy/verifyWebhook';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('X-Signature') || '';

  try {
    const isValid = verifyWebhookSignature(Buffer.from(body), signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
    if (!isValid) {
      console.warn('Invalid Lemon Squeezy webhook signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { meta, data } = payload;
    const eventName = meta.event_name;
    const userId = meta.custom_data?.user_id;

    if (!userId) {
      console.error('Webhook received without userId in custom_data:', payload);
      return NextResponse.json({ message: 'Missing userId in custom_data' }, { status: 400 });
    }

    const supabase = createAdminClient();
    console.log(`Lemon Squeezy Webhook Event: ${eventName} for user ${userId}`);

    // Store the raw event in the billing_events table
    const { error: eventError } = await supabase.from('billing_events').insert({ 
      user_id: userId,
      event_name: eventName,
      payload: payload,
    });

    if (eventError) {
      console.error(`Error inserting billing event for user ${userId}:`, eventError);
      // We don't want to stop processing the webhook if this fails
    }

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        const subscription = data.attributes;
        const customerId = data.relationships.customer.data.id;
        
        let plan = 'free';
        const proTier = PRICING_TIERS.find(tier => tier.id === 'pro');

        if (subscription.variant_id === proTier?.variantId) {
          plan = 'pro';
        }

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: subscription.status,
            current_plan: plan,
            lemonsqueezy_customer_id: customerId,
            lemonsqueezy_subscription_id: data.id,
            subscription_ends_at: subscription.ends_at,
          })
          .eq('id', userId);

        if (updateError) {
          console.error(`Error updating user ${userId} subscription in DB:`, updateError);
          return NextResponse.json({ message: 'Database update failed' }, { status: 500 });
        }
        break;

      case 'subscription_payment_failed':
        const { error: paymentFailedError } = await supabase
          .from('user_profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', userId);

        if (paymentFailedError) {
          console.error(`Error updating user ${userId} status to past_due:`, paymentFailedError);
          return NextResponse.json({ message: 'Database update failed' }, { status: 500 });
        }
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        const cancelledSubscription = data.attributes;
        const { error: cancelError } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: cancelledSubscription.status,
            current_plan: 'free',
            lemonsqueezy_subscription_id: null,
            subscription_ends_at: cancelledSubscription.ends_at,
          })
          .eq('id', userId);

        if (cancelError) {
          console.error(`Error updating user ${userId} cancellation in DB:`, cancelError);
          return NextResponse.json({ message: 'Database update failed' }, { status: 500 });
        }
        break;

      default:
        console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
        break;
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Error processing Lemon Squeezy webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
