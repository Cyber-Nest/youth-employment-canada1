import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { collection } from "@/server/db/mongo";

import { getCurrentUser } from "@/server/auth/local-auth";

const PACKAGE_CONFIG = {
  Starter: {
    credits: 1,
    amount: 12.5,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  Deluxe: {
    credits: 5,
    amount: 47.5,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  Ultimate: {
    credits: 10,
    amount: 97.5,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  "Pro Plan": {
    credits: 20,
    amount: 190,
    unlimitedJobs: false,
    expiryDays: 180,
  },

  Unlimited: {
    credits: 0,
    amount: 675,
    unlimitedJobs: true,
    expiryDays: 365,
  },
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        {
          status: 401,
        },
      );
    }

    if (user.accountType !== "employer") {
      return NextResponse.json(
        {
          error: "Only employers can purchase packages",
        },
        {
          status: 403,
        },
      );
    }

    const body = await req.json();

    const packageName = body.packageName?.trim();

    if (!packageName) {
      return NextResponse.json(
        {
          error: "Package name is required",
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
          error: "Invalid package selected",
        },
        {
          status: 400,
        },
      );
    }

    // GET EMPLOYER
    const employers = await collection("employers");

    const employer = await employers.findOne({
      userId: user.id,
    });

    if (!employer) {
      return NextResponse.json(
        {
          error: "Employer profile not found",
        },
        {
          status: 404,
        },
      );
    }

    const packages = await collection("employerPackages");

    const historyCollection = await collection("employerPackageHistory");

    const existingPackage = await packages.findOne({
      employerId: employer.id,
    });

    const now = new Date();

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + selectedPackage.expiryDays);

    // UPDATE EXISTING PACKAGE
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
          employerId: employer.id,
        },
        updateDoc,
      );
    }

    // CREATE PACKAGE IF NOT EXISTS
    else {
      await packages.insertOne({
        id: randomUUID(),

        employerId: employer.id,

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

    // CREATE HISTORY ENTRY
    await historyCollection.insertOne({
      id: randomUUID(),

      employerId: employer.id,

      packageName,

      creditsAdded: selectedPackage.credits,

      unlimitedJobs: selectedPackage.unlimitedJobs,

      isFreePlan: false,

      jobPostExpiryDays: selectedPackage.expiryDays,

      purchasedAt: now,

      expiresAt,

      paymentStatus: "paid",

      paymentProvider: "dummy",

      transactionId: randomUUID(),

      amount: selectedPackage.amount,

      currency: "CAD",

      createdAt: now,

      updatedAt: now,
    });

    return NextResponse.json({
      success: true,

      message: "Package activated successfully",
    });
  } catch (error) {
    console.error("Error purchasing package:", error);

    return NextResponse.json(
      {
        error: "Failed to activate package",
      },
      {
        status: 500,
      },
    );
  }
}
