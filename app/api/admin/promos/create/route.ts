import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { collection } from "@/server/db/mongo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const code = body.code?.trim()?.toUpperCase();

    const packageName = body.packageName?.trim();

    const maxUses = Number(body.maxUses) || null;

    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    if (!code || !packageName) {
      return NextResponse.json(
        {
          error: "Code and package name are required",
        },
        {
          status: 400,
        },
      );
    }

    const promoCodes = await collection("promoCodes");

    const existingPromo = await promoCodes.findOne({
      code,
    });

    if (existingPromo) {
      return NextResponse.json(
        {
          error: "Promo code already exists",
        },
        {
          status: 400,
        },
      );
    }

    const now = new Date();

    await promoCodes.insertOne({
      id: randomUUID(),

      code,

      packageName,

      active: true,

      usedCount: 0,

      maxUses,

      expiresAt,

      createdBy: "admin",

      createdAt: now,

      updatedAt: now,
    });

    return NextResponse.json({
      success: true,

      message: "Promo code created successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create promo code",
      },
      {
        status: 500,
      },
    );
  }
}
