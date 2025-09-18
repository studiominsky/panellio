import * as admin from "firebase-admin";
import {onCall, HttpsError, onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";
import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config();
admin.initializeApp();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) {
  throw new Error("Missing STRIPE_SECRET_KEY env var.");
}
if (!webhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET env var.");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-08-27.basil",
});

export const validateUsername = onCall(
  {region: "europe-west3"},
  async (request) => {
    const username = request.data.username;

    if (!username || typeof username !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "Invalid or missing \"username\" parameter."
      );
    }

    try {
      const db = admin.firestore();
      const querySnapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();

      return {available: querySnapshot.empty};
    } catch (error) {
      logger.error("Error validating username:", error);
      throw new HttpsError(
        "internal",
        "An error occurred while validating the username. " +
        "Please try again later."
      );
    }
  }
);

export const validateEmail = onCall(
  {region: "europe-west3"},
  async (request) => {
    const email = request.data.email;

    if (!email || typeof email !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "Invalid or missing \"email\" parameter."
      );
    }

    try {
      const db = admin.firestore();
      const querySnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .get();

      return {available: querySnapshot.empty};
    } catch (error) {
      logger.error("Error validating email:", error);
      throw new HttpsError(
        "internal",
        "An error occurred while validating the email. " +
        "Please try again later."
      );
    }
  }
);

export const stripeWebhook = onRequest(
  {region: "europe-west3"},
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret,
      );
    } catch (err) {
      logger.error("Webhook signature verification failed.", err);
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      return;
    }

    switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        const priceId = subscription.items.data[0].price.id;
        let stripeRole: "core" | "pro" | "premium" = "core";

        if (priceId === "price_1S8QADKVr2xFb4ZKGNnsBUOt") {
          stripeRole = "pro";
        } else if (priceId === "price_1S8QATKVr2xFb4ZKZREF6gxA") {
          stripeRole = "premium";
        }

        const userRef = admin.firestore().collection("users").doc(userId);
        await userRef.update({
          stripeCustomerId: subscription.customer,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeRole: stripeRole,
          stripeCurrentPeriodEnd: admin.firestore.Timestamp.fromMillis(
            subscription.items.data[0].current_period_end * 1000
          ),
        });
      }
      break;
    }
    default: {
      logger.log(`Unhandled event type ${event.type}`);
      break;
    }
    }

    res.json({received: true});
  }
);
