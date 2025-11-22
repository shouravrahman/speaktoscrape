import { NextResponse } from 'next/server';
import { createCheckout, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { variantId, userEmail, userId } = await req.json();

    if (!variantId || !userEmail || !userId) {
      return NextResponse.json({ error: 'Missing variantId, userEmail, or userId' }, { status: 400 });
    }

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutData: {
          email: userEmail,
          custom: {
            user_id: userId,
          },
        },
        productOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/`,
          receiptButtonText: 'Go to Dashboard',
          receiptThankYouNote: 'Thank you for signing up!',
        },
      }
    );

    if (!checkout || !checkout.data?.data?.attributes?.url) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: checkout.data.data.attributes.url });

  } catch (error) {
    console.error('Error creating Lemon Squeezy checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
