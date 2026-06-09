import Stripe from "stripe";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { collection } from "@/server/db/mongo";
import { getCurrentUser } from "@/server/auth/local-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PACKAGE_CONFIG = {
  Starter: {
    credits: 1,
    amount: 12.5,
  },
  Deluxe: {
    credits: 5,
    amount: 47.5,
  },
  Ultimate: {
    credits: 10,
    amount: 97.5,
  },
  "Pro Plan": {
    credits: 20,
    amount: 190,
  },
  Unlimited: {
    credits: 0,
    amount: 675,
  },
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (user.accountType !== "employer") {
      return NextResponse.json(
        { error: "Only employers can purchase packages" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const packageName = body.packageName?.trim();
    const promoCode = body.promoCode?.trim()?.toUpperCase() || null;

    if (!packageName) {
      return NextResponse.json(
        { error: "Package name is required" },
        { status: 400 },
      );
    }

    const selectedPackage =
      PACKAGE_CONFIG[packageName as keyof typeof PACKAGE_CONFIG];

    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 },
      );
    }

    // EMPLOYER
    const employers = await collection("employers");
    const employer = await employers.findOne({ userId: user.id });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 },
      );
    }

    // PROMO VALIDATION
    let isFreePromo = false;

    if (promoCode) {
      const promoCodes = await collection("promoCodes");
      const promo = await promoCodes.findOne({
        code: promoCode,
        packageName,
        status: "Unused",
      });

      if (!promo) {
        return NextResponse.json(
          { error: "Invalid promo code" },
          { status: 400 },
        );
      }

      isFreePromo = true;
    }

    // FREE PROMO
    if (isFreePromo) {
      return NextResponse.json({
        success: true,
        freePromo: true,
        message: "Free promo applied successfully",
      });
    }

    // PAYMENT TRANSACTION
    const paymentTransactions = await collection("paymentTransactions");
    const transactionId = randomUUID();

    await paymentTransactions.insertOne({
      id: transactionId,
      employerId: employer.id,
      packageName,
      amount: selectedPackage.amount,
      currency: "CAD",
      paymentStatus: "pending",
      paymentProvider: "stripe",
      stripeSessionId: null,
      stripePaymentIntentId: null,
      promoCodeUsed: null,
      isPromoPayment: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // STRIPE SESSION
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `${packageName} Package`,
            },
            unit_amount: Math.round(selectedPackage.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        employerId: String(employer.id),
        packageName,
        transactionId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    });

    // UPDATE SESSION ID
    await paymentTransactions.updateOne(
      { id: transactionId },
      {
        $set: {
          stripeSessionId: session.id,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
