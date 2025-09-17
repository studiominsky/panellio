import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, success_url, cancel_url } = await req.json();

    const idToken = req.headers
      .get('authorization')
      ?.split('Bearer ')[1];

    if (!idToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const decodedToken =
      await getAuth(adminApp).verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url,
      cancel_url,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
