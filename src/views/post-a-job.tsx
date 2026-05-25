import { useState, useCallback } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { Link } from "@/router";
import { motion } from "motion/react";
import {
  CheckCircle,
  ChevronRight,
  Send,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/RichTextEditor";
import JobPostingPreview, {
  type JobPostingData,
} from "@/components/JobPostingPreview";

/* ── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Casual / Seasonal",
  "Volunteer",
];

const jobCategories = [
  "Administration & Office",
  "Arts, Culture & Heritage",
  "Community & Social Services",
  "Construction & Trades",
  "Education & Training",
  "Environment & Natural Resources",
  "Finance & Accounting",
  "Government & Public Administration",
  "Health & Medical",
  "Hospitality & Tourism",
  "Information Technology",
  "Legal & Justice",
  "Management & Executive",
  "Marketing & Communications",
  "Natural Resources & Forestry",
  "Nursing & Allied Health",
  "Oil, Gas & Mining",
  "Other",
  "Restaurant and Food Service",
  "Sales & Customer Service",
  "Science & Research",
  "Security & Law Enforcement",
  "Transportation & Logistics",
];

const positionTypes = [
  "Full-Time Permanent",
  "Full-Time Temporary",
  "Part-Time Permanent",
  "Part-Time Temporary",
];

const travelOptions = ["None", "Occasionally", "Frequently", "Required"];

const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland & Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Québec",
  "Saskatchewan",
  "Yukon",
];

/* ── Tip box ────────────────────────────────────────────────────────── */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
      <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-blue-800 leading-relaxed">{children}</p>
    </div>
  );
}

/* ── Section heading ────────────────────────────────────────────────── */
function SectionHeading({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{step}</span>
      </div>
      <h2
        className="text-xl font-bold text-gray-900"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function PostAJobPage() {
  /* Form state */
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [category, setCategory] = useState("");
  const [salary, setSalary] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState("");
  const [adDurationDays, setAdDurationDays] = useState("90");
  const [startDate, setStartDate] = useState("");
  const [positionType, setPositionType] = useState("Full-Time Permanent");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [travel, setTravel] = useState("None");
  const [vacation, setVacation] = useState("");
  const [jobPostingDate, setJobPostingDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [nocCode, setNocCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactType, setContactType] = useState("Employer");
  const [companyName, setCompanyName] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [inPersonAddress, setInPersonAddress] = useState("");
  const [inPersonFromTime, setInPersonFromTime] = useState("");
  const [inPersonToTime, setInPersonToTime] = useState("");
  const [byEmail, setByEmail] = useState(false);
  const [byMail, setByMail] = useState(false);
  const [byPhone, setByPhone] = useState(false);
  const [inPerson, setInPerson] = useState(false);
  const [website, setWebsite] = useState("");
  const [descHtml, setDescHtml] = useState("");
  const [reqHtml, setReqHtml] = useState("");
  const [indigenous] = useState(false);
  const [remote, setRemote] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedJob, setSubmittedJob] = useState<null | {
    id: string;
    jobUniqueId: string;
    title: string;
    company: string;
    postedAt?: string;
  }>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const formattedSalary = salary
    ? `${salary}${salaryPeriod ? ` / ${salaryPeriod}` : ""}`
    : "";
  const location = [city, province].filter(Boolean).join(", ");

const previewData: JobPostingData = {
  title,
  company,
  location,
  employmentType,
  salary: formattedSalary,
  descriptionHtml: descHtml,
  requirementsHtml: reqHtml,
  indigenous,
  remote,
  packageName: "",
  featured: false,
  category,
  startDate,
  positionType,
  experience,
  education,
  travel,
  vacation,
  nocCode,
  howToApply: {
    byEmail,
    email: byEmail ? applicationEmail : null,
    byMail,
    mailingAddress: byMail ? mailingAddress : null,
    byPhone,
    phone: byPhone ? phone : null,
    inPerson,
    inPersonAddress: inPerson ? inPersonAddress : null,
    inPersonFromTime: inPerson ? inPersonFromTime : null,
    inPersonToTime: inPerson ? inPersonToTime : null,
  },
};

  const handleDescHtml = useCallback((html: string) => setDescHtml(html), []);
  const handleReqHtml = useCallback((html: string) => setReqHtml(html), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setLoading(true);

    const emailValue = applicationEmail.trim();
    const mailingValue = mailingAddress.trim();
    const phoneValue = phone.trim();
    const inPersonAddressValue = inPersonAddress.trim();
    const inPersonFromValue = inPersonFromTime.trim();
    const inPersonToValue = inPersonToTime.trim();
    const postingDateValue = jobPostingDate.trim();

    if (!postingDateValue) {
      setServerError("Job posting date is required.");
      setLoading(false);
      return;
    }
    if (Number.isNaN(Date.parse(postingDateValue))) {
      setServerError("Enter a valid posting date.");
      setLoading(false);
      return;
    }
    if (!byEmail && !byMail && !byPhone && !inPerson) {
      setServerError("Select at least one application method.");
      setLoading(false);
      return;
    }
    if (byEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setServerError("Please enter a valid application email.");
      setLoading(false);
      return;
    }
    if (byMail && !mailingValue) {
      setServerError("Please enter the mailing address.");
      setLoading(false);
      return;
    }
    if (byPhone && !phoneValue) {
      setServerError("Please enter the phone number.");
      setLoading(false);
      return;
    }
    if (
      inPerson &&
      (!inPersonAddressValue || !inPersonFromValue || !inPersonToValue)
    ) {
      setServerError("Please enter in-person address and time range.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          city,
          province,
          employmentType,
          salary,
          salaryPeriod,
          adDurationDays,
          category,
          startDate: startDate.trim() || null,
          positionType: positionType.trim() || null,
          experience: experience.trim() || null,
          education: education.trim() || null,
          travel: travel.trim() || null,
          vacation: vacation.trim() || null,
          jobPostingDate: postingDateValue,
          nocCode: nocCode.trim() || null,
          contactName: contactName.trim() || null,
          contactType: contactType.trim() || null,
          companyName: companyName.trim() || null,
          descriptionHtml: descHtml,
          requirementsHtml: reqHtml,
          indigenousOwned: indigenous,
          website,
          howToApply: {
            byEmail,
            email: byEmail ? emailValue : null,
            byMail,
            mailingAddress: byMail ? mailingValue : null,
            byPhone,
            phone: byPhone ? phoneValue : null,
            inPerson,
            inPersonAddress: inPerson ? inPersonAddressValue : null,
            inPersonFromTime: inPerson ? inPersonFromValue : null,
            inPersonToTime: inPerson ? inPersonToValue : null,
          },
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        job?: {
          id: string;
          jobUniqueId: string;
          title: string;
          company: string;
          postedAt?: string;
        };
      };
      if (!res.ok) {
        setServerError(
          data.error || "Failed to submit job posting. Please try again.",
        );
        return;
      }
      setSubmittedJob(data.job ?? null);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ─────────────────────────────────────────────── */
  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Job Submitted — Youth Employment Canada</title>
        </Helmet>
        <section className="bg-blue-50 min-h-[70vh] flex items-center justify-center py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full bg-white rounded-3xl p-10 border border-blue-200 text-center shadow-lg"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-blue-600" />
            </div>
            <h1
              className="text-3xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Posting Submitted!
            </h1>
            <p className="text-gray-600 leading-relaxed mb-2">
              Thank you,{" "}
              <strong>
                {(submittedJob?.company ?? company) || "your organization"}
              </strong>
              .
            </p>
            <p className="text-gray-600 leading-relaxed mb-2">
              Your job posting for{" "}
              <strong>{(submittedJob?.title ?? title) || "the role"}</strong>{" "}
              has been published.
            </p>
            {submittedJob?.jobUniqueId && (
              <p className="text-gray-500 text-sm mb-2">
                <strong>Job ID:</strong> {submittedJob.jobUniqueId}
              </p>
            )}
            {submittedJob?.postedAt && (
              <p className="text-gray-500 text-sm mb-6">
                Posted on {new Date(submittedJob.postedAt).toLocaleDateString()}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {submittedJob?.id ? (
                <Link to={`/jobs/${submittedJob.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8">
                    View Job
                  </Button>
                </Link>
              ) : (
                <Link to="/employers">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8">
                    Employer Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedJob(null);
                  setServerError("");
                  setCategory("");
                  setTitle("");
                  setCompany("");
                  setCity("");
                  setProvince("");
                  setDescHtml("");
                  setReqHtml("");
                }}
              >
                Post Another Job
              </Button>
            </div>
          </motion.div>
        </section>
      </>
    );
  }

  /* ── Main form ─────────────────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Post a Job — Youth Employment Canada</title>
        <meta
          name="description"
          content="Post a job on Youth Employment Canada and connect with skilled youth job seekers across Canada. Choose your package and fill in your job details."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-blue-50 py-14 lg:py-20 relative overflow-hidden">
        <div
          className="absolute -right-24 top-1/2 -translate-y-1/2 w-[420px] h-[420px] text-blue-200 pointer-events-none opacity-30"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="200"
              cy="200"
              r="180"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.4"
            />
            <circle
              cx="200"
              cy="200"
              r="120"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx="200"
              cy="200"
              r="60"
              fill="currentColor"
              opacity="0.1"
            />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2 text-sm text-gray-500 mb-4"
            >
              <Link
                to="/employers"
                className="hover:text-blue-600 transition-colors"
              >
                Employers
              </Link>
              <ChevronRight size={14} />
              <span className="text-blue-600 font-medium">Post a Job</span>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3"
            >
              Employers
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Post a Job
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-gray-600 text-lg max-w-xl leading-relaxed"
            >
              Reach thousands of qualified Youth across Canada. Fill in your
              details and watch your listing come to life in the preview.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="bg-white py-10 lg:py-14 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ── LEFT: Form ──────────────────────────────────────────── */}
            <motion.form
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-8"
            >
              {/* Step 1 — Job Details */}
              <div className="bg-white rounded-3xl p-7 lg:p-9 border border-blue-100">
                <SectionHeading step={1} title="Job Details" />
                <div className="mb-4">
                  <p className="text-xs text-gray-400">
                    Unique Job ID:{" "}
                    <span className="font-medium">
                      System generated after submission
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="job-title"
                      className="text-gray-700 font-medium text-sm"
                    >
                      Job Title <span className="text-blue-600">*</span>
                    </Label>
                    <Input
                      id="job-title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Community Health Worker"
                      className="border-blue-200 focus-visible:ring-blue-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="company"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Company / Organization{" "}
                        <span className="text-blue-600">*</span>
                      </Label>
                      <Input
                        id="company"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Your organization name"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="website"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Website (optional)
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourorganization.ca"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="city"
                        className="text-gray-700 font-medium text-sm"
                      >
                        City / Community{" "}
                        <span className="text-blue-600">*</span>
                      </Label>
                      <Input
                        id="city"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Edmonton"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="province"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Province / Territory{" "}
                        <span className="text-blue-600">*</span>
                      </Label>
                      <select
                        id="province"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="">Select province / territory</option>
                        {provinces.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="emp-type"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Employment Type <span className="text-blue-600">*</span>
                      </Label>
                      <select
                        id="emp-type"
                        required
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="">Select type</option>
                        {employmentTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="salary"
                          className="text-gray-700 font-medium text-sm"
                        >
                          Salary (CAD)
                        </Label>
                        <Input
                          id="salary"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          placeholder="e.g. 55,000"
                          className="border-blue-200 focus-visible:ring-blue-300"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="salary-period"
                          className="text-gray-700 font-medium text-sm"
                        >
                          Per
                        </Label>
                        <select
                          id="salary-period"
                          value={salaryPeriod}
                          onChange={(e) => setSalaryPeriod(e.target.value)}
                          className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="">Select period</option>
                          <option value="Year">Year</option>
                          <option value="Month">Month</option>
                          <option value="Hour">Hour</option>
                          <option value="Day">Day</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="ad-duration-days"
                      className="text-gray-700 font-medium text-sm"
                    >
                      How many days will this ad run?{" "}
                      <span className="text-blue-600">*</span>
                    </Label>
                    <select
                      id="ad-duration-days"
                      required
                      value={adDurationDays}
                      onChange={(e) => setAdDurationDays(e.target.value)}
                      className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Select duration</option>
                      <option value="90">90 days</option>
                      <option value="120">120 days</option>
                      <option value="150">150 days</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="category"
                      className="text-gray-700 font-medium text-sm"
                    >
                      Job Category <span className="text-blue-600">*</span>
                    </Label>
                    <select
                      id="category"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Select a category</option>
                      {jobCategories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <Switch
                        checked={remote}
                        onCheckedChange={setRemote}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Remote / Hybrid available
                      </span>
                    </label>
                    {/* <label className="flex items-center gap-3 cursor-pointer select-none">
                      <Switch
                        checked={indigenous}
                        onCheckedChange={setIndigenous}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Indigenous-owned organization
                      </span>
                    </label> */}
                  </div>
                </div>
              </div>

              {/* Step 2 — Job Criteria */}
              <div className="bg-white rounded-3xl p-7 lg:p-9 border border-blue-100">
                <SectionHeading step={2} title="Job Criteria" />
                <div className="flex flex-col gap-5">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Add important details such as start date, experience,
                    education, travel expectations, and posting date.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="start-date"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="e.g. Immediate, June 2026"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="position-type"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Position Type
                      </Label>
                      <select
                        id="position-type"
                        value={positionType}
                        onChange={(e) => setPositionType(e.target.value)}
                        className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        {positionTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="experience"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Experience
                      </Label>
                      <Input
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 2+ years in similar role"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="education"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Education
                      </Label>
                      <Input
                        id="education"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. Diploma, degree, certification"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="travel"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Travel Expectations
                      </Label>
                      <select
                        id="travel"
                        value={travel}
                        onChange={(e) => setTravel(e.target.value)}
                        className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        {travelOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="vacation"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Vacation
                      </Label>
                      <Input
                        id="vacation"
                        value={vacation}
                        onChange={(e) => setVacation(e.target.value)}
                        placeholder="e.g. 2 weeks, 4 weeks"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="job-posting-date"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Job Posting Date{" "}
                        <span className="text-blue-600">*</span>
                      </Label>
                      <Input
                        id="job-posting-date"
                        type="date"
                        required
                        value={jobPostingDate}
                        onChange={(e) => setJobPostingDate(e.target.value)}
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="noc-code"
                        className="text-gray-700 font-medium text-sm"
                      >
                        NOC Code
                      </Label>
                      <Input
                        id="noc-code"
                        value={nocCode}
                        onChange={(e) => setNocCode(e.target.value)}
                        placeholder="e.g. 32100"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 — Description */}
              <div className="bg-white rounded-3xl p-7 lg:p-9 border border-blue-100">
                <SectionHeading step={3} title="Job Description" />
                <div className="flex flex-col gap-5">
                  <Tip>
                    Use plain, welcoming language. Describe the role, team, and
                    what makes your organization a great place to work. Avoid
                    jargon and list only truly essential requirements to
                    encourage more applicants.
                  </Tip>
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-700 font-medium text-sm">
                      About the Role <span className="text-blue-600">*</span>
                    </Label>
                    <RichTextEditor
                      placeholder="Describe the role, responsibilities, and what makes your organization a great place to work…"
                      onHtmlChange={handleDescHtml}
                      minHeight={180}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-700 font-medium text-sm">
                      Qualifications &amp; Requirements
                    </Label>
                    <RichTextEditor
                      placeholder="List required skills, education, experience, and any preferred qualifications…"
                      onHtmlChange={handleReqHtml}
                      minHeight={140}
                    />
                  </div>
                </div>
              </div>

              {/* Step 4 — Application Instructions */}
              <div className="bg-white rounded-3xl p-7 lg:p-9 border border-blue-100">
                <SectionHeading step={4} title="Application Instructions" />
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Select one or more application methods. The selected
                      instructions will be shown to job seekers on the job
                      detail page.
                    </p>
                    <div className="grid gap-3">
                      <label
                        className={`rounded-3xl border p-4 cursor-pointer transition-all duration-200 ${byEmail ? "border-blue-400 bg-blue-50" : "border-blue-200 bg-white hover:border-blue-300"}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={byEmail}
                            onChange={(e) => setByEmail(e.target.checked)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className="font-semibold text-gray-900">
                            By E-mail
                          </span>
                        </div>
                        {byEmail && (
                          <div className="mt-4">
                            <Label
                              htmlFor="application-email"
                              className="text-gray-700 font-medium text-sm"
                            >
                              Application Email{" "}
                              <span className="text-blue-600">*</span>
                            </Label>
                            <Input
                              id="application-email"
                              type="email"
                              value={applicationEmail}
                              onChange={(e) =>
                                setApplicationEmail(e.target.value)
                              }
                              placeholder="e.g. hr@company.ca"
                              className="border-blue-200 focus-visible:ring-blue-300"
                            />
                          </div>
                        )}
                      </label>

                      <label
                        className={`rounded-3xl border p-4 cursor-pointer transition-all duration-200 ${byMail ? "border-blue-400 bg-blue-50" : "border-blue-200 bg-white hover:border-blue-300"}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={byMail}
                            onChange={(e) => setByMail(e.target.checked)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className="font-semibold text-gray-900">
                            By Mail
                          </span>
                        </div>
                        {byMail && (
                          <div className="mt-4">
                            <Label
                              htmlFor="mailing-address"
                              className="text-gray-700 font-medium text-sm"
                            >
                              Mailing Address{" "}
                              <span className="text-blue-600">*</span>
                            </Label>
                            <Input
                              id="mailing-address"
                              value={mailingAddress}
                              onChange={(e) =>
                                setMailingAddress(e.target.value)
                              }
                              placeholder="e.g. 123 Main Street, Calgary, AB T1A 1A1"
                              className="border-blue-200 focus-visible:ring-blue-300"
                            />
                          </div>
                        )}
                      </label>

                      <label
                        className={`rounded-3xl border p-4 cursor-pointer transition-all duration-200 ${byPhone ? "border-blue-400 bg-blue-50" : "border-blue-200 bg-white hover:border-blue-300"}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={byPhone}
                            onChange={(e) => setByPhone(e.target.checked)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className="font-semibold text-gray-900">
                            By Phone
                          </span>
                        </div>
                        {byPhone && (
                          <div className="mt-4">
                            <Label
                              htmlFor="phone-number"
                              className="text-gray-700 font-medium text-sm"
                            >
                              Phone Number{" "}
                              <span className="text-blue-600">*</span>
                            </Label>
                            <Input
                              id="phone-number"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="e.g. 403-555-1234"
                              className="border-blue-200 focus-visible:ring-blue-300"
                            />
                          </div>
                        )}
                      </label>

                      <label
                        className={`rounded-3xl border p-4 cursor-pointer transition-all duration-200 ${inPerson ? "border-blue-400 bg-blue-50" : "border-blue-200 bg-white hover:border-blue-300"}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={inPerson}
                            onChange={(e) => setInPerson(e.target.checked)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className="font-semibold text-gray-900">
                            In Person
                          </span>
                        </div>
                        {inPerson && (
                          <div className="mt-4 grid gap-5">
                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="in-person-address"
                                className="text-gray-700 font-medium text-sm"
                              >
                                In Person Address{" "}
                                <span className="text-blue-600">*</span>
                              </Label>
                              <Input
                                id="in-person-address"
                                value={inPersonAddress}
                                onChange={(e) =>
                                  setInPersonAddress(e.target.value)
                                }
                                placeholder="e.g. 123 Main Street, Calgary, AB T1A 1A1"
                                className="border-blue-200 focus-visible:ring-blue-300"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="flex flex-col gap-2">
                                <Label
                                  htmlFor="in-person-from"
                                  className="text-gray-700 font-medium text-sm"
                                >
                                  Time From{" "}
                                  <span className="text-blue-600">*</span>
                                </Label>
                                <Input
                                  id="in-person-from"
                                  value={inPersonFromTime}
                                  onChange={(e) =>
                                    setInPersonFromTime(e.target.value)
                                  }
                                  placeholder="e.g. 9:00 AM"
                                  className="border-blue-200 focus-visible:ring-blue-300"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label
                                  htmlFor="in-person-to"
                                  className="text-gray-700 font-medium text-sm"
                                >
                                  Time To{" "}
                                  <span className="text-blue-600">*</span>
                                </Label>
                                <Input
                                  id="in-person-to"
                                  value={inPersonToTime}
                                  onChange={(e) =>
                                    setInPersonToTime(e.target.value)
                                  }
                                  placeholder="e.g. 5:00 PM"
                                  className="border-blue-200 focus-visible:ring-blue-300"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 — Contact Information */}
              <div className="bg-white rounded-3xl p-7 lg:p-9 border border-blue-100">
                <SectionHeading step={5} title="Contact Information" />
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="contact-name"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Contact Name
                      </Label>
                      <Input
                        id="contact-name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="border-blue-200 focus-visible:ring-blue-300"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="contact-type"
                        className="text-gray-700 font-medium text-sm"
                      >
                        Contact Type
                      </Label>
                      <select
                        id="contact-type"
                        value={contactType}
                        onChange={(e) => setContactType(e.target.value)}
                        className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        <option>Employer</option>
                        <option>HR</option>
                        <option>Recruiter</option>
                        <option>Hiring Manager</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="contact-company"
                      className="text-gray-700 font-medium text-sm"
                    >
                      Company
                    </Label>
                    <Input
                      id="contact-company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Company or contact organization"
                      className="border-blue-200 focus-visible:ring-blue-300"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-4">
                {serverError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    {serverError}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Submitting…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Job Posting <Send size={15} />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.form>

            {/* ── RIGHT: Preview Sidebar ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col gap-5 xl:sticky xl:top-24"
            >
              <JobPostingPreview data={previewData} />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
