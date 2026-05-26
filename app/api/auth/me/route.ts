import { NextRequest, NextResponse } from "next/server";
import { collection } from "@/server/db/mongo";
import { getCurrentUser } from "@/server/auth/local-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get employer profile if exists
    const employers = await collection("employers");
    const employer = await employers.findOne({ userId: user.id });

    // Get employer package if exists
    let employerPackage = null;
    if (employer) {
      const packages = await collection("employerPackages");
      employerPackage = await packages.findOne({ employerId: employer.id });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        username: user.username,
        accountType: user.accountType,
        employerProfile: employer
          ? {
              businessName: employer.orgName,
              phoneNumber: employer.phoneNumber,
              province: employer.province,
              packageName: employerPackage?.name || "Free Trial",
              packageStatus: employerPackage?.status || "Active",
              jobCredits: employerPackage?.jobCredits || 0,
              jobsPosted: employerPackage?.jobsPosted || 0,
              jobPostExpiryDays: employerPackage?.jobPostExpiryDays || 180,
              creditValidity: employerPackage?.creditValidity || "Never Expire",
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 },
    );
  }
}
