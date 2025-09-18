import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json();

    const idToken = req.headers
      .get('authorization')
      ?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await getAuth(adminApp).verifyIdToken(idToken);

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required.' },
        { status: 400 }
      );
    }

    const canceledSubscription =
      await stripe.subscriptions.cancel(subscriptionId);

    return NextResponse.json({ canceledSubscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
