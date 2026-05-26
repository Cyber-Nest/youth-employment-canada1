import { NextRequest, NextResponse } from "next/server";
import { collection } from "@/server/db/mongo";
import { getCurrentUser } from "@/server/auth/local-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get employer
    const employers = await collection("employers");
    const employer = await employers.findOne({ userId: user.id });

    if (!employer) {
      return NextResponse.json({
        success: true,
        jobs: [],
      });
    }

    // Get all jobs for this employer
    const jobs = await collection("jobs");
    const employerJobs = await jobs
      .find({ employerId: employer.id })
      .sort({ postedAt: -1 })
      .toArray();

    // Transform jobs for frontend
    const transformedJobs = employerJobs.map((job) => ({
      id: job.id,
      jobUniqueId: job.jobUniqueId,
      title: job.title,
      company: job.company,
      location: job.location,
      province: job.province,
      employmentType: job.employmentType,
      category: job.category,
      status: job.status,
      postedAt: job.postedAt,
      expiresAt: job.expiresAt,
      description: job.description,
      salary: job.salary,
      salaryPeriod: job.salaryPeriod,
    }));

    return NextResponse.json({
      success: true,
      jobs: transformedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
      },
      { status: 500 },
    );
  }
}
