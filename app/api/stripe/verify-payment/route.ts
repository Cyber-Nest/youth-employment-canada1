import Stripe from "stripe";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { collection } from "@/server/db/mongo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 },
      );
    }

    //Stripe directly Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found on Stripe" },
        { status: 404 },
      );
    }

    // Check payment 'paid' status
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment has not been completed yet" },
        { status: 400 },
      );
    }

    // Metadata
    const employerId = session.metadata?.employerId;
    const packageName = session.metadata?.packageName;
    const transactionId = session.metadata?.transactionId;

    if (!employerId || !packageName || !transactionId) {
      return NextResponse.json(
        { error: "Missing required metadata in Stripe Session" },
        { status: 400 },
      );
    }

    // Idempotency Check
    const paymentTransactions = await collection("paymentTransactions");
    const existingTx = await paymentTransactions.findOne({ id: transactionId });

    if (existingTx && existingTx.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified and processed.",
      });
    }

    //Card details fetch
    let paymentMethodType = "Card";
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
        );
        const paymentMethod = await stripe.paymentMethods.retrieve(
          paymentIntent.payment_method as string,
        );
        paymentMethodType = paymentMethod.card?.brand
          ? `${paymentMethod.card.brand.toUpperCase()} Card`
          : paymentMethod.type;
      } catch (e) {
        console.error("Failed to fetch payment method details:", e);
      }
    }

    const selectedPackage =
      PACKAGE_CONFIG[packageName as keyof typeof PACKAGE_CONFIG];

    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Invalid package config" },
        { status: 400 },
      );
    }

    const packages = await collection("employerPackages");
    const historyCollection = await collection("employerPackageHistory");
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + selectedPackage.expiryDays);

    //  DB UPDATE - A) PAYMENT TRANSACTION
    await paymentTransactions.updateOne(
      { id: transactionId },
      {
        $set: {
          paymentStatus: "paid",
          stripePaymentIntentId: session.payment_intent,
          paymentMethod: paymentMethodType,
          updatedAt: now,
        },
      },
    );

    //  DB UPDATE - B) EMPLOYER PACKAGE
    const existingPackage = await packages.findOne({ employerId });

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

      await packages.updateOne({ employerId }, updateDoc);
    } else {
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

    // DB UPDATE - C) LOG HISTORY
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

    return NextResponse.json({
      success: true,
      message: "Payment verified.",
    });
  } catch (error) {
    console.error("STRIPE VERIFICATION ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 },
    );
  }
}
