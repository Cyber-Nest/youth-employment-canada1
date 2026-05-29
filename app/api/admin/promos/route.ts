import { NextResponse } from "next/server";

import { collection } from "@/server/db/mongo";

export async function GET() {
  try {
    const promoCodes = await collection("promoCodes");

    const promos = await promoCodes
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json({
      success: true,

      promos,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch promos",
      },
      {
        status: 500,
      },
    );
  }
}
