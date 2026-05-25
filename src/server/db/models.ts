export type AccountType = 'jobseeker' | 'employer';
export type EmployerPackageStatus = 'Active' | 'Inactive' | 'Expired';
export type JobStatus = 'draft' | 'active' | 'closed' | 'expired';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Casual' | 'Seasonal';

export type UserDoc = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  accountType: AccountType;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountDoc = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionDoc = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EmployerDoc = {
  id: string;
  userId: string;
  orgName: string;
  phoneNumber?: string | null;
  website?: string | null;
  province?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EmployerPackageDoc = {
  id: string;
  employerId: string;
  name: string;
  jobCredits: number;
  jobsPosted: number;
  jobPostExpiryDays: number;
  creditValidity: string;
  status: EmployerPackageStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type JobDoc = {
  id: string;
  jobUniqueId: string;
  employerId: string;
  title: string;
  company: string;
  location: string;
  province: string;
  salary?: string | null;
  salaryPeriod?: string | null;
  adDurationDays: number;
  startDate?: string | null;
  positionType?: string | null;
  experience?: string | null;
  education?: string | null;
  travel?: string | null;
  vacation?: string | null;
  jobPostingDate?: string | null;
  nocCode?: string | null;
  contactName?: string | null;
  contactType?: string | null;
  contactCompany?: string | null;
  applyByEmail: boolean;
  applicationEmail?: string | null;
  applyByMail: boolean;
  mailingAddress?: string | null;
  applyByPhone: boolean;
  applicationPhone?: string | null;
  applyInPerson: boolean;
  inPersonAddress?: string | null;
  inPersonFromTime?: string | null;
  inPersonToTime?: string | null;
  employmentType: EmploymentType;
  category: string;
  description: string;
  requirements?: string | null;
  status: JobStatus;
  indigenousPreference: boolean;
  postedAt: Date;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ContactInquiryDoc = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  inquiryType: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ApplicationDoc = {
  id: string;
  jobId: string;
  userId: string;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
};
