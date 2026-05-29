import Stripe from "stripe";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { collection } from "@/server/db/mongo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const PACKAGE_CONFIG = {
  Starter: {
    credits: 1,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  Deluxe: {
    credits: 5,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  Ultimate: {
    credits: 10,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  "Pro Plan": {
    credits: 20,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  Unlimited: {
    credits: 0,
    unlimitedJobs: true,
    expiryDays: 365,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const headerPayload = await headers();

    const signature = headerPayload.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        {
          error: "Missing stripe signature",
        },
        {
          status: 400,
        },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log("WEBHOOK HIT");
      console.log(event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);

      return NextResponse.json(
        {
          error: "Invalid webhook signature",
        },
        {
          status: 400,
        },
      );
    }

    // PAYMENT SUCCESS
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      let paymentMethodType = "Card";

      if (session.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
        );

        const paymentMethod = await stripe.paymentMethods.retrieve(
          paymentIntent.payment_method as string,
        );

        paymentMethodType = paymentMethod.card?.brand
          ? `${paymentMethod.card.brand.toUpperCase()} Card`
          : paymentMethod.type;
      }
      const employerId = session.metadata?.employerId;

      const packageName = session.metadata?.packageName;

      const transactionId = session.metadata?.transactionId;

      if (!employerId || !packageName || !transactionId) {
        return NextResponse.json(
          {
            error: "Missing metadata",
          },
          {
            status: 400,
          },
        );
      }

      const selectedPackage =
        PACKAGE_CONFIG[packageName as keyof typeof PACKAGE_CONFIG];

      if (!selectedPackage) {
        return NextResponse.json(
          {
            error: "Invalid package config",
          },
          {
            status: 400,
          },
        );
      }

      const packages = await collection("employerPackages");

      const historyCollection = await collection("employerPackageHistory");

      const paymentTransactions = await collection("paymentTransactions");

      const existingPackage = await packages.findOne({
        employerId,
      });

      const now = new Date();

      const expiresAt = new Date();

      expiresAt.setDate(expiresAt.getDate() + selectedPackage.expiryDays);

      // UPDATE PAYMENT
      await paymentTransactions.updateOne(
        {
          id: transactionId,
        },
        {
          $set: {
            paymentStatus: "paid",

            stripePaymentIntentId: session.payment_intent,
            paymentMethod: paymentMethodType,
            updatedAt: now,
          },
        },
      );

      // UPDATE PACKAGE
      if (existingPackage) {
        const updateDoc: Record<string, unknown> = {
          $set: {
            packageName,

            unlimitedJobs: selectedPackage.unlimitedJobs,

            isFreePlan: false,

            status: "Active",

            purchasedAt: now,

            expiresAt,

            updatedAt: now,
          },
        };

        if (!selectedPackage.unlimitedJobs) {
          updateDoc.$inc = {
            remainingCredits: selectedPackage.credits,

            totalCreditsPurchased: selectedPackage.credits,
          };
        }

        await packages.updateOne(
          {
            employerId,
          },
          updateDoc,
        );
      }

      // CREATE PACKAGE
      else {
        await packages.insertOne({
          id: randomUUID(),

          employerId,

          packageName,

          remainingCredits: selectedPackage.credits,

          totalCreditsPurchased: selectedPackage.credits,

          unlimitedJobs: selectedPackage.unlimitedJobs,

          isFreePlan: false,

          jobPostExpiryDays: selectedPackage.expiryDays,

          status: "Active",

          purchasedAt: now,

          expiresAt,

          creditExpiresAt: null,

          createdAt: now,

          updatedAt: now,
        });
      }

      // HISTORY
      await historyCollection.insertOne({
        id: randomUUID(),

        employerId,

        packageName,
        creditsAdded: selectedPackage.credits,

        unlimitedJobs: selectedPackage.unlimitedJobs,

        isFreePlan: false,

        jobPostExpiryDays: selectedPackage.expiryDays,

        purchasedAt: now,

        expiresAt,

        paymentStatus: "paid",

        paymentProvider: "stripe",
        paymentMethod: paymentMethodType,
        transactionId,

        stripeSessionId: session.id,

        stripePaymentIntentId: session.payment_intent,

        amount: (session.amount_total || 0) / 100,

        currency: session.currency?.toUpperCase() || "CAD",

        createdAt: now,

        updatedAt: now,
      });
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("STRIPE WEBHOOK ERROR:", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
      },
      {
        status: 500,
      },
    );
  }
}
