import { NextRequest, NextResponse } from "next/server";
import { collection } from "@/server/db/mongo";
import { getCurrentUser } from "@/server/auth/local-auth";

// GET single job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const jobs = await collection("jobs");
    const { id } = await params;

    // Try to find by id (UUID) or jobUniqueId
    let job = await jobs.findOne({ id: id });
    if (!job) {
      job = await jobs.findOne({ jobUniqueId: id });
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Transform for frontend
    const transformedJob = {
      id: job.id,
      jobUniqueId: job.jobUniqueId,
      title: job.title,
      company: job.company,
      city: job.location || "",
      province: job.province,
      location: job.location,
      employmentType: job.employmentType,
      category: job.category,
      salary: job.salary,
      salaryPeriod: job.salaryPeriod,
      vacancies: job.vacancies,
      adDurationDays: job.adDurationDays,
      startDate: job.startDate,
      positionType: job.positionType,
      experience: job.experience,
      education: job.education,
      travel: job.travel,
      vacation: job.vacation,
      nocCode: job.nocCode,
      contactName: job.contactName,
      contactType: job.contactType,
      companyName: job.contactCompany,
      descriptionHtml: job.description,
      requirementsHtml: job.requirements,
      website: job.website,
      remote: job.remote || false,
      indigenousOwned: job.indigenousPreference || false,
      howToApply: {
        byEmail: job.applyByEmail,
        email: job.applicationEmail,
        byMail: job.applyByMail,
        mailingAddress: job.mailingAddress,
        byPhone: job.applyByPhone,
        phone: job.applicationPhone,
        inPerson: job.applyInPerson,
        inPersonAddress: job.inPersonAddress,
        inPersonFromTime: job.inPersonFromTime,
        inPersonToTime: job.inPersonToTime,
      },
    };

    return NextResponse.json({ job: transformedJob });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// PUT - Update job
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const jobs = await collection("jobs");
    const employers = await collection("employers");
    const body = await req.json();
    const { id } = await params;

    // Find the job
    let existingJob = await jobs.findOne({ id: id });
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check authorization
    const employer = await employers.findOne({ userId: user.id });
    if (!employer || existingJob.employerId !== employer.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this job" },
        { status: 403 },
      );
    }

    // Validations
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Job title is required" },
        { status: 400 },
      );
    }
    if (!body.company?.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 },
      );
    }
    if (!body.city?.trim()) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }
    if (!body.province?.trim()) {
      return NextResponse.json(
        { error: "Province is required" },
        { status: 400 },
      );
    }
    if (!body.employmentType) {
      return NextResponse.json(
        { error: "Employment type is required" },
        { status: 400 },
      );
    }
    if (!body.category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }
    if (!body.descriptionHtml?.trim()) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    // Name validations
    const nameRegex = /^[A-Za-z\s\-\'À-ÿ]+$/;
    const companyRegex = /^[A-Za-z0-9\s\&\-\.\']+$/;
    const urlRegex =
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

    if (!companyRegex.test(body.company.trim())) {
      return NextResponse.json(
        {
          error:
            "Company name should contain only letters, numbers, spaces, &, ., -",
        },
        { status: 400 },
      );
    }
    if (!nameRegex.test(body.city.trim())) {
      return NextResponse.json(
        { error: "City should contain only letters and spaces" },
        { status: 400 },
      );
    }
    if (body.contactName?.trim() && !nameRegex.test(body.contactName.trim())) {
      return NextResponse.json(
        { error: "Contact name should contain only letters and spaces" },
        { status: 400 },
      );
    }
    if (body.website?.trim() && !urlRegex.test(body.website.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid website URL" },
        { status: 400 },
      );
    }
    if (body.salary?.trim() && !/^[\d,]+$/.test(body.salary.trim())) {
      return NextResponse.json(
        { error: "Salary should contain only numbers and commas" },
        { status: 400 },
      );
    }

    // Application methods validation
    const byEmail = body.howToApply?.byEmail || false;
    const byMail = body.howToApply?.byMail || false;
    const byPhone = body.howToApply?.byPhone || false;
    const inPerson = body.howToApply?.inPerson || false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+\s\-\(\)0-9]{10,20}$/;

    if (!byEmail && !byMail && !byPhone && !inPerson) {
      return NextResponse.json(
        { error: "Select at least one application method" },
        { status: 400 },
      );
    }
    if (
      byEmail &&
      (!body.howToApply?.email?.trim() ||
        !emailRegex.test(body.howToApply.email.trim()))
    ) {
      return NextResponse.json(
        { error: "A valid application email is required" },
        { status: 400 },
      );
    }
    if (byMail && !body.howToApply?.mailingAddress?.trim()) {
      return NextResponse.json(
        { error: "Mailing address is required when By Mail is selected" },
        { status: 400 },
      );
    }
    if (
      byPhone &&
      (!body.howToApply?.phone?.trim() ||
        !phoneRegex.test(body.howToApply.phone.trim()))
    ) {
      return NextResponse.json(
        { error: "A valid phone number is required when By Phone is selected" },
        { status: 400 },
      );
    }
    if (
      inPerson &&
      (!body.howToApply?.inPersonAddress?.trim() ||
        !body.howToApply?.inPersonFromTime?.trim() ||
        !body.howToApply?.inPersonToTime?.trim())
    ) {
      return NextResponse.json(
        { error: "In Person address and time range are required" },
        { status: 400 },
      );
    }

    // Construct location
    const location = [body.city.trim(), body.province.trim()]
      .filter(Boolean)
      .join(", ");

    // Update data
    const updateData = {
      title: body.title.trim(),
      company: body.company.trim(),
      location: location,
      province: body.province.trim(),
      salary: body.salary ? body.salary.replace(/,/g, "") : null,
      salaryPeriod: body.salaryPeriod || null,
      vacancies: body.vacancies ? Number(body.vacancies) : null,
      adDurationDays: parseInt(body.adDurationDays) || 90,
      startDate: body.startDate?.trim() || null,
      positionType: body.positionType?.trim() || null,
      experience: body.experience?.trim() || null,
      education: body.education?.trim() || null,
      travel: body.travel?.trim() || null,
      vacation: body.vacation?.trim() || null,
      nocCode: body.nocCode?.trim() || null,
      contactName: body.contactName?.trim() || null,
      contactType: body.contactType?.trim() || null,
      contactCompany: body.companyName?.trim() || null,
      applyByEmail: byEmail,
      applicationEmail: byEmail ? body.howToApply.email.trim() : null,
      applyByMail: byMail,
      mailingAddress: byMail ? body.howToApply.mailingAddress.trim() : null,
      applyByPhone: byPhone,
      applicationPhone: byPhone ? body.howToApply.phone.trim() : null,
      applyInPerson: inPerson,
      inPersonAddress: inPerson ? body.howToApply.inPersonAddress.trim() : null,
      inPersonFromTime: inPerson
        ? body.howToApply.inPersonFromTime.trim()
        : null,
      inPersonToTime: inPerson ? body.howToApply.inPersonToTime.trim() : null,
      employmentType: body.employmentType,
      category: body.category,
      description: body.descriptionHtml,
      requirements: body.requirementsHtml?.trim() || null,
      website: body.website?.trim() || null,
      remote: body.remote || false,
      updatedAt: new Date(),
    };

    // Update job
    const result = await jobs.updateOne(
      { id: existingJob.id },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 },
    );
  }
}

// DELETE - Close job (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const jobs = await collection("jobs");
    const employers = await collection("employers");
    const { id } = await params;

    // Find job
    let existingJob = await jobs.findOne({ id: id });
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check authorization
    const employer = await employers.findOne({ userId: user.id });
    if (!employer || existingJob.employerId !== employer.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete - change status to 'closed'
    await jobs.updateOne(
      { id: existingJob.id },
      { $set: { status: "closed", updatedAt: new Date() } },
    );

    return NextResponse.json({
      success: true,
      message: "Job closed successfully",
    });
  } catch (error) {
    console.error("Error closing job:", error);
    return NextResponse.json({ error: "Failed to close job" }, { status: 500 });
  }
}
