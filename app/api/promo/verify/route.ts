import { NextRequest, NextResponse } from "next/server";

import { collection } from "@/server/db/mongo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const code = body.code?.trim()?.toUpperCase();

    const packageName = body.packageName?.trim();

    if (!code || !packageName) {
      return NextResponse.json(
        {
          error: "Promo code and package name are required",
        },
        {
          status: 400,
        },
      );
    }

    const promoCodes = await collection("promoCodes");

    const promo = await promoCodes.findOne({
      code,

      packageName,

      active: true,
    });

    // INVALID
    if (!promo) {
      return NextResponse.json(
        {
          error: "Invalid promo code",
        },
        {
          status: 400,
        },
      );
    }

    // EXPIRED
    if (promo.expiresAt && new Date(promo.expiresAt as string) < new Date()) {
      return NextResponse.json(
        {
          error: "Promo code expired",
        },
        {
          status: 400,
        },
      );
    }

    // MAX USES REACHED
    if (promo.maxUses && (promo.usedCount as number) >= (promo.maxUses as number)) {
      return NextResponse.json(
        {
          error: "Promo code usage limit reached",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,

      valid: true,

      discountedPrice: 0,

      promo: {
        code: promo.code,

        packageName: promo.packageName,
      },

      message: "Promo code applied successfully",
    });
  } catch (error) {
    console.error("PROMO VERIFY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to verify promo code",
      },
      {
        status: 500,
      },
    );
  }
}
