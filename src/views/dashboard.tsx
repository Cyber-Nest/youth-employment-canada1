"use client";

import { useEffect, useState } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { Link } from "@/router";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Trash2,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Building2,
  Package,
  TrendingUp,
  ChevronRight,
  RotateCcw,
  PauseCircle,
} from "lucide-react";

// ============ SKELETON COMPONENTS (Mobile Optimized) ============
const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 rounded ${className}`}
  />
);

const DashboardSkeleton = () => (
  <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-8 px-4 sm:py-12">
    <div className="mx-auto max-w-7xl">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
          <Skeleton className="h-3 w-56 sm:h-4 sm:w-80" />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Skeleton className="h-9 w-28 sm:h-10 sm:w-32 rounded-lg" />
          <Skeleton className="h-9 w-20 sm:h-10 sm:w-24 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column Skeleton */}
        <div className="flex-1 space-y-5 sm:space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl sm:h-36" />
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <Skeleton className="h-6 w-32 sm:h-7 sm:w-40" />
              <Skeleton className="h-5 w-16 sm:h-6 sm:w-20 rounded-full" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-40 sm:h-6 sm:w-48" />
                      <Skeleton className="h-3 w-28 sm:h-4 sm:w-32" />
                      <Skeleton className="h-3 w-36 sm:h-4 sm:w-40" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-7 w-14 sm:h-8 sm:w-16 rounded-md" />
                      <Skeleton className="h-7 w-14 sm:h-8 sm:w-16 rounded-md" />
                      <Skeleton className="h-7 w-14 sm:h-8 sm:w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:w-96 space-y-5 sm:space-y-6">
          <Skeleton className="h-56 w-full rounded-2xl sm:h-64" />
          <Skeleton className="h-64 w-full rounded-2xl sm:h-72" />
          <Skeleton className="h-40 w-full rounded-2xl sm:h-44" />
        </div>
      </div>
    </div>
  </div>
);

// ============ TYPES ============
interface EmployerProfile {
  businessName: string;
  phoneNumber?: string;
  province?: string;
  packageName: string;
  packageStatus: string;
  jobCredits: number;
  jobsPosted: number;
  jobPostExpiryDays: number;
  creditValidity: string;
}

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  username?: string;
  accountType?: string;
  employerProfile?: EmployerProfile | null;
}

interface Job {
  id: string;
  jobUniqueId: string;
  title: string;
  company: string;
  location: string;
  province: string;
  employmentType: string;
  category: string;
  status: "active" | "draft" | "closed" | "expired";

  jobPostingDate: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  salary?: string;
  salaryPeriod?: string;
}

// Status Badge Component - Improved
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Active",
    },
    draft: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-400",
      label: "Draft",
    },
    closed: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      dot: "bg-rose-500",
      label: "Closed",
    },
    expired: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Expired",
    },
  };
  const style = config[status] || config.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

// ============ HELPERS ============
const formatDate = (dateString?: string, locale: string = "en-CA") => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "America/Edmonton",
  });
};

const formatSalary = (salary?: string, period?: string) => {
  if (!salary) return null;
  return `$${parseInt(salary).toLocaleString()}${period ? ` / ${period}` : ""}`;
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");
  // const [logoutLoading, setLogoutLoading] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setError("Unable to load account details.");
        }
      } catch {
        setError("Unable to load account details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs/my-jobs", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to close this job posting?")) return;
    setDeletingJobId(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setJobs(jobs.filter((job) => job.id !== jobId));
      } else {
        alert(data.error || "Failed to close job");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleJobStatus = async (jobId: string, currentStatus: string) => {
    try {
      setStatusUpdatingId(jobId);

      const nextStatus = currentStatus === "active" ? "closed" : "active";

      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update job");
      }

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: nextStatus,
              }
            : job,
        ),
      );
    } catch (error) {
      console.error(error);

      alert("Failed to update job status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <section className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Dashboard
          </h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  const profile = user?.employerProfile;
  const activeJobsCount = jobs.filter((j) => j.status === "active").length;
  const closedJobsCount = jobs.filter((j) => j.status === "closed").length;

  return (
    <>
      <Helmet>
        <title>Employer Dashboard | Youth Employment Canada</title>
      </Helmet>

      <section className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-6 sm:py-12 px-4">
        <div className="mx-auto max-w-7xl">
          {/* ============ HEADER ============ */}
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
            <div>
              {/* <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full" />
                <span className="uppercase tracking-wider text-xs font-semibold">
                  Employer Dashboard
                </span>
              </div> */}
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Welcome back,{" "}
                {user?.firstName || user?.name?.split(" ")[0] || "Employer"} 👋
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Manage your job postings and track your hiring success
              </p>
            </div>
            {/* <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/post-a-job">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all rounded-xl">
                  <Plus size={16} className="mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">Post Job</span>
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                disabled={logoutLoading}
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                {logoutLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <LogOut size={16} className="mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </>
                )}
              </Button>
            </div> */}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* ============ LEFT COLUMN - JOBS ============ */}
            <div className="flex-1 space-y-5 sm:space-y-6">
              {/* Quick Action Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative">
                  <h3 className="text-lg sm:text-xl font-bold mb-1">
                    Ready to hire?
                  </h3>
                  <p className="text-blue-100 text-sm sm:text-base mb-4">
                    Post a job and reach qualified youth across Canada.
                  </p>
                  <Link to="/post-a-job">
                    <Button className="bg-white text-blue-700 hover:bg-blue-200 font-semibold rounded-xl shadow-md">
                      <Plus size={16} className="mr-2" />
                      Create New Job Posting
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Recent Jobs Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Recent Jobs
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                      Your latest job postings
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                    {jobs.length} Total
                  </span>
                </div>

                {jobsLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="border border-gray-100 rounded-xl p-4"
                      >
                        <div className="animate-pulse">
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-2 flex-1">
                              <div className="h-5 w-40 bg-gray-200 rounded" />
                              <div className="h-3 w-28 bg-gray-200 rounded" />
                            </div>
                            <div className="flex gap-2">
                              <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                              <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                              <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                            <div className="h-3 w-20 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Briefcase size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">
                      No job postings yet
                    </p>
                    <p className="text-sm text-gray-400 mb-5">
                      Your posted jobs will appear here
                    </p>
                    <Link to="/post-a-job">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                        <Plus size={16} className="mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.slice(0, 10).map((job) => (
                      <div
                        key={job.id}
                        className="group bg-white border border-gray-100 hover:border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md overflow-hidden"
                      >
                        {/* Card Content */}
                        <div className="p-4">
                          {/* Header Row - Title & Status & Actions */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                {job.title}
                              </h3>
                              <StatusBadge status={job.status} />
                            </div>

                            {/* Action Buttons - Desktop */}
                            <div className="hidden sm:flex items-center gap-1">
                              <Link to={`/edit-job/${job.id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit size={14} className="mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Link to={`/jobs/${job.id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                  <Eye size={14} className="mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={deletingJobId === job.id}
                              >
                                {deletingJobId === job.id ? (
                                  <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full" />
                                ) : (
                                  <>
                                    <Trash2 size={14} className="mr-1" />
                                    Delete
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-8 px-3 rounded-lg transition-colors ${
                                  job.status === "active"
                                    ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                                    : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                                }`}
                                onClick={() =>
                                  handleJobStatus(job.id, job.status)
                                }
                                disabled={statusUpdatingId === job.id}
                              >
                                {statusUpdatingId === job.id ? (
                                  <div
                                    className={`animate-spin h-3 w-3 border-2 border-t-transparent rounded-full ${
                                      job.status === "active"
                                        ? "border-red-600"
                                        : "border-green-600"
                                    }`}
                                  />
                                ) : (
                                  <>
                                    {job.status === "active" ? (
                                      <>
                                        <PauseCircle
                                          size={14}
                                          className="mr-1"
                                        />{" "}
                                        Close
                                      </>
                                    ) : (
                                      <>
                                        <RotateCcw size={14} className="mr-1" />{" "}
                                        Reopen
                                      </>
                                    )}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Company & Location Row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                <Building2
                                  size={10}
                                  className="text-gray-500"
                                />
                              </div>
                              <span className="text-sm text-gray-600">
                                {job.company}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                <MapPin size={10} className="text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-500">
                                {job.location?.split(",")[0] || job.province}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                <Calendar size={10} className="text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(job.jobPostingDate)}{" "}
                              </span>
                            </div>
                          </div>

                          {/* Salary & Expiry Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-50">
                            {formatSalary(job.salary, job.salaryPeriod) ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  {formatSalary(job.salary, job.salaryPeriod)}
                                </span>
                              </div>
                            ) : (
                              <div />
                            )}
                            {job.expiresAt && (
                              <div className="flex items-center gap-1">
                                <Clock size={10} className="text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  Expires {formatDate(job.expiresAt)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons - Mobile Only */}
                          <div className="flex items-center gap-2 mt-3 pt-2 sm:hidden">
                            <Link to={`/edit-job/${job.id}`} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-9 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg text-xs"
                              >
                                <Edit size={12} className="mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Link
                              to={`/jobs/${job.id}`}
                              target="_blank"
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-9 text-green-600 border-green-200 hover:bg-green-50 rounded-lg text-xs"
                              >
                                <Eye size={12} className="mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 text-red-600 border-red-200 hover:bg-red-50 rounded-lg text-xs"
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={deletingJobId === job.id}
                            >
                              {deletingJobId === job.id ? (
                                <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full" />
                              ) : (
                                <>
                                  <Trash2 size={12} className="mr-1" />
                                  Close
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {jobs.length > 5 && !jobsLoading && jobs.length > 0 && (
                  <div className="mt-5 pt-2 text-center border-t border-gray-100">
                    <Link to="/employer/jobs">
                      <Button
                        variant="link"
                        className="text-blue-600 text-sm font-medium"
                      >
                        View all {jobs.length} jobs
                        <ChevronRight size={14} className="ml-1 inline" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ============ RIGHT COLUMN - STATS & PROFILE ============ */}
            <div className="lg:w-96 space-y-5 sm:space-y-6">
              {/* Stats Cards Row (Mobile: 2 columns) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp size={16} className="text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {activeJobsCount}
                  </p>
                  <p className="text-xs text-gray-500">Active Jobs</p>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Briefcase size={16} className="text-gray-600" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {closedJobsCount}
                  </p>
                  <p className="text-xs text-gray-500">Closed Jobs</p>
                </div>
                {/* <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign size={16} className="text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {profile?.jobCredits ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Credits Left</p>
                </div> */}
                {/* <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users size={16} className="text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {jobs.length}
                  </p>
                  <p className="text-xs text-gray-500">Total Jobs</p>
                </div> */}
              </div>

              {/* Company Profile Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <Building2 size={16} className="text-blue-600 sm:text-lg" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Company Profile
                  </h3>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {profile?.businessName || user?.name || "Employer"}
                </h2>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-700 truncate max-w-[180px]">
                      {user?.email}
                    </span>
                  </div>
                  {profile?.phoneNumber && (
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-700">
                        {profile.phoneNumber}
                      </span>
                    </div>
                  )}
                  {profile?.province && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium text-gray-700">
                        {profile.province}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Package Details Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg text-white">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Package size={16} className="sm:text-lg" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">
                    Current Package
                  </h3>
                </div>
                <p className="text-xl sm:text-2xl font-bold mb-3">
                  {profile?.packageName || "Free Trial"}
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-white/20">
                    <span className="text-blue-100">Status</span>
                    <span className="font-semibold px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {profile?.packageStatus || "Active"}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center py-1 border-b border-white/20">
                    <span className="text-blue-100">Credits Left</span>
                    <span className="font-bold text-lg">
                      {profile?.jobCredits ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-blue-100">Ad Duration</span>
                    <span className="font-semibold">
                      {profile?.jobPostExpiryDays ?? 180} days
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
