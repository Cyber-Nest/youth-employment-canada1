import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useSearchParams } from '@/router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Eye, EyeOff, CheckCircle,
  AlertCircle, ChevronRight, ArrowLeft, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp, registerEmployer } from '@/lib/auth/auth-client';

/* ── Types ──────────────────────────────────────────────────────────── */
type AccountType = 'employer';

interface FormData {
  type: AccountType;
  // Step 2 — personal / org
  firstName: string;
  lastName: string;
  businessName: string;
  province: string;
  phoneNumber: string;
  // Step 3 — credentials
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

type StepErrors = Partial<Record<keyof FormData, string>>;

/* ── Constants ──────────────────────────────────────────────────────── */
const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland & Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Québec',
  'Saskatchewan', 'Yukon',
];

const STEP_LABELS = ['Account Type', 'Your Details', 'Create Account'];

/* ── Helpers ────────────────────────────────────────────────────────── */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
      <AlertCircle size={12} className="flex-shrink-0" />
      {msg}
    </p>
  );
}

function LogoMark() {
  return (
    <Link to="/" className="inline-flex items-center group mb-6">
      <span
        className="flex flex-col leading-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        <span className="font-bold text-2xl tracking-tight text-[#6B3A2A] group-hover:text-[#C8782A] transition-colors duration-200 leading-none">Youth Employment</span>
        <span className="text-[10px] font-semibold tracking-[0.25em] text-[#C8782A] uppercase mt-0.5">Canada</span>
      </span>
    </Link>
  );
}

/* ── Step indicator ─────────────────────────────────────────────────── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                done
                  ? 'bg-[#7A9E7E] text-white'
                  : active
                  ? 'bg-[#C8782A] text-white shadow-md'
                  : 'bg-[#C8782A]/10 text-[#6B3A2A]/40'
              }`}
            >
              {done ? <CheckCircle size={14} /> : step}
            </div>
            {i < total - 1 && (
              <div
                className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
                  done ? 'bg-[#7A9E7E]' : 'bg-[#C8782A]/15'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Slide animation ────────────────────────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  }),
};

/* ── Validation per step ────────────────────────────────────────────── */
function validateStep2(data: FormData): StepErrors {
  const errs: StepErrors = {};
  if (!data.firstName.trim()) errs.firstName = 'First name is required.';
  if (!data.lastName.trim()) errs.lastName = 'Last name is required.';
  if (data.type === 'employer') {
    if (!data.businessName.trim()) errs.businessName = 'Business name is required.';
    if (!data.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required.';
  }
  if (!data.province) errs.province = 'Please select your province or territory.';
  return errs;
}

function validateStep3(data: FormData): StepErrors {
  const errs: StepErrors = {};
  if (!data.email) errs.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errs.email = 'Enter a valid email address.';
  if (data.type === 'employer' && !data.username.trim())
    errs.username = 'Username is required for employer accounts.';
  if (!data.password) errs.password = 'Password is required.';
  else if (data.password.length < 8)
    errs.password = 'Password must be at least 8 characters.';
  else if (!/[a-z]/.test(data.password))
    errs.password = 'Password must include at least one lowercase letter.';
  else if (!/[A-Z]/.test(data.password))
    errs.password = 'Password must include at least one uppercase letter.';
  else if (!/[0-9]/.test(data.password))
    errs.password = 'Password must include at least one number.';
  if (!data.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
  else if (data.password !== data.confirmPassword)
    errs.confirmPassword = 'Passwords do not match.';
  if (!data.agreeTerms) errs.agreeTerms = 'You must agree to the terms to continue.';
  return errs;
}

/* ── Password strength ──────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-[#7A9E7E]'];
  const textColors = ['', 'text-red-500', 'text-yellow-600', 'text-blue-600', 'text-[#7A9E7E]'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-[#C8782A]/10'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<StepErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ email?: string; businessName?: string } | null>(null);
  const [serverError, setServerError] = useState('');

  const [form, setForm] = useState<FormData>({
    type: 'employer',
    firstName: '',
    lastName: '',
    businessName: '',
    province: '',
    phoneNumber: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  /* Pre-select type from URL param */
  useEffect(() => {
    const t = searchParams.get('type');
    if (t === 'employer') {
      setForm((prev) => ({ ...prev, type: t }));
    }
  }, [searchParams]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const goNext = async () => {
    if (step === 1) {
      setDirection(1);
      setStep(2);
      return;
    }
    if (step === 2) {
      const errs = validateStep2(form);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setDirection(1);
      setStep(3);
      return;
    }
    if (step === 3) {
      const errs = validateStep3(form);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setLoading(true);
      setServerError('');
      try {
        if (form.type === 'employer') {
          const result = await registerEmployer({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            username: form.username,
            password: form.password,
            businessName: form.businessName,
            phoneNumber: form.phoneNumber,
            province: form.province,
          });

          if (result.error) {
            setServerError(result.error.message || 'Registration failed. Please try again.');
            setLoading(false);
            return;
          }

          // Show confirmation card instead of silently navigating or auto-logging in.
          // Store basic confirmation info if returned by the backend.
          setSuccessInfo({
            email: result.data?.user?.email ?? form.email,
            businessName: result.data?.employerProfile?.businessName ?? form.businessName,
          });
          setSubmitted(true);
          setLoading(false);
          return;
        }

        const result = await signUp.email({
          email: form.email,
          password: form.password,
          name: `${form.firstName} ${form.lastName}`.trim(),
        });
        if (result.error) {
          setServerError(result.error.message || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }
        setSubmitted(true);
      } catch {
        setServerError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
    setErrors({});
  };

  const isEmployer = form.type === 'employer';

  /* ── Success ─────────────────────────────────────────────────────── */
  if (submitted) {
    // Employer-specific success confirmation
    if (isEmployer) {
      return (
        <>
          <Helmet><title>Account Created Successfully — Youth Employment Canada</title></Helmet>
          <section className="bg-[#FAF5EE] min-h-[85vh] flex items-center justify-center py-16 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-md"
            >
              <div className="bg-white rounded-3xl p-10 border border-[#C8782A]/10 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-[#C8782A]/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={28} className="text-[#C8782A]" />
                </div>
                <h1
                  className="text-2xl font-bold text-[#1C1C1C] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Account Created Successfully!
                </h1>
                <p className="text-[#6B3A2A]/70 text-sm mb-2">
                  Thank you for registering with Youth Employment Canada. Your employer account has been created successfully.
                </p>
                <p className="text-[#1C1C1C]/85 text-sm mb-4">
                  You can now log in to your account and start posting jobs.
                </p>

                {/* Optional info */}
                {(successInfo?.businessName || successInfo?.email) && (
                  <div className="bg-[#FAF5EE] rounded-2xl p-4 mb-6 text-left">
                    {successInfo?.businessName && (
                      <p className="text-sm text-[#1C1C1C] mb-1"><strong>Employer:</strong> {successInfo.businessName}</p>
                    )}
                    {successInfo?.email && (
                      <p className="text-sm text-[#1C1C1C]"><strong>Email:</strong> {successInfo.email}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Link to="/login">
                    <Button className="w-full bg-[#C8782A] hover:bg-[#B06820] text-white font-semibold">
                      Login to Your Account
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" className="w-full border-[#C8782A]/25 text-[#6B3A2A] hover:bg-[#C8782A]/5 font-medium">
                      Go to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        </>
      );
    }

    // Default success (non-employer) — keep existing behaviour
    return (
      <>
        <Helmet><title>Account Created — Youth Employment Canada</title></Helmet>
        <section className="bg-[#FAF5EE] min-h-[85vh] flex items-center justify-center py-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-3xl p-10 border border-[#C8782A]/10 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-[#C8782A]/10 flex items-center justify-center mx-auto mb-5">
                <Sparkles size={28} className="text-[#C8782A]" />
              </div>
              <h1
                className="text-2xl font-bold text-[#1C1C1C] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Welcome to Youth Employment Canada!
              </h1>
              <p className="text-[#6B3A2A]/70 text-sm mb-1">
                Your {isEmployer ? 'employer' : 'job seeker'} account has been created for
              </p>
              <p className="text-[#C8782A] font-semibold mb-6">{form.email}</p>

              <div className="flex flex-col gap-3">
                <Link to={isEmployer ? '/post-a-job' : '/jobs'}>
                  <Button className="w-full bg-[#C8782A] hover:bg-[#B06820] text-white font-semibold">
                    {isEmployer ? 'Post Your First Job' : 'Browse Jobs'}
                    <ChevronRight size={15} className="ml-1" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-[#C8782A]/25 text-[#6B3A2A] hover:bg-[#C8782A]/5 font-medium">
                    Sign In to Your Account
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Create Account — Youth Employment Canada</title>
        <meta
          name="description"
          content="Create your free Youth Employment Canada account. Join young Canadians and inclusive employers building careers across Canada."
        />
      </Helmet>

      <section className="bg-[#FAF5EE] min-h-[85vh] flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-2">
            <LogoMark />
            <h1
              className="text-3xl font-bold text-[#1C1C1C]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Create Your Account
            </h1>
            <p className="text-[#6B3A2A]/65 mt-2 text-sm">
              Join Canada's youth employment platform — free to get started
            </p>
          </div>

          {/* Step indicator */}
          <div className="mt-7">
            <StepIndicator current={step} total={3} />
          </div>

          {/* Step label */}
          <p className="text-center text-xs font-semibold text-[#C8782A] uppercase tracking-widest mb-5">
            Step {step} of 3 — {STEP_LABELS[step - 1]}
          </p>

          {/* Animated step content */}
          <div className="bg-white rounded-3xl border border-[#C8782A]/10 shadow-sm overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-8"
              >
                {/* ── STEP 1: Account type ──────────────────────────── */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    <p className="text-sm text-[#6B3A2A]/70 leading-relaxed">
                      Are you looking for work, or are you an employer looking to hire Indigenous talent?
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => set('type', 'employer')}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                          form.type === 'employer'
                            ? 'border-[#6B3A2A] bg-[#6B3A2A]/5 shadow-sm'
                            : 'border-[#6B3A2A]/15 hover:border-[#6B3A2A]/35'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${form.type === 'employer' ? 'bg-[#6B3A2A]' : 'bg-[#6B3A2A]/10'}`}>
                          <Building2 size={20} className={form.type === 'employer' ? 'text-white' : 'text-[#6B3A2A]'} />
                        </div>
                        <div>
                          <p className={`font-bold text-base mb-0.5 ${form.type === 'employer' ? 'text-[#6B3A2A]' : 'text-[#1C1C1C]'}`}>
                            Employer
                          </p>
                          <p className="text-xs text-[#6B3A2A]/60 leading-relaxed">
                            I want to post jobs and connect with youth talent across Canada.
                          </p>
                        </div>
                        {form.type === 'employer' && (
                          <CheckCircle size={18} className="text-[#6B3A2A] flex-shrink-0 ml-auto" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Personal / org details ───────────────── */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="reg-first" className="text-[#6B3A2A] font-medium text-sm">
                          First Name <span className="text-[#C8782A]">*</span>
                        </Label>
                        <Input
                          id="reg-first"
                          value={form.firstName}
                          onChange={(e) => set('firstName', e.target.value)}
                          placeholder="First name"
                          className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 ${errors.firstName ? 'border-red-400' : ''}`}
                        />
                        <FieldError msg={errors.firstName} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="reg-last" className="text-[#6B3A2A] font-medium text-sm">
                          Last Name <span className="text-[#C8782A]">*</span>
                        </Label>
                        <Input
                          id="reg-last"
                          value={form.lastName}
                          onChange={(e) => set('lastName', e.target.value)}
                          placeholder="Last name"
                          className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 ${errors.lastName ? 'border-red-400' : ''}`}
                        />
                        <FieldError msg={errors.lastName} />
                      </div>
                    </div>

                    {/* Org name (employer only) */}
                    <AnimatePresence>
                      {isEmployer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col gap-4 overflow-hidden"
                        >
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reg-org" className="text-[#6B3A2A] font-medium text-sm">
                              Business Name <span className="text-[#C8782A]">*</span>
                            </Label>
                            <Input
                              id="reg-org"
                              value={form.businessName}
                              onChange={(e) => set('businessName', e.target.value)}
                              placeholder="Your business or company name"
                              className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 ${errors.businessName ? 'border-red-400' : ''}`}
                            />
                            <FieldError msg={errors.businessName} />
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="reg-phone" className="text-[#6B3A2A] font-medium text-sm">
                                Phone Number <span className="text-[#C8782A]">*</span>
                              </Label>
                              <Input
                                id="reg-phone"
                                value={form.phoneNumber}
                                onChange={(e) => set('phoneNumber', e.target.value)}
                                placeholder="Business phone number"
                                className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 ${errors.phoneNumber ? 'border-red-400' : ''}`}
                              />
                              <FieldError msg={errors.phoneNumber} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Province */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="reg-province" className="text-[#6B3A2A] font-medium text-sm">
                        Province / Territory <span className="text-[#C8782A]">*</span>
                      </Label>
                      <select
                        id="reg-province"
                        value={form.province}
                        onChange={(e) => set('province', e.target.value)}
                        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8782A]/30 ${errors.province ? 'border-red-400' : 'border-[#C8782A]/20'}`}
                      >
                        <option value="">Select province / territory</option>
                        {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <FieldError msg={errors.province} />
                    </div>

                    {/* Indigenous identity (job seeker only) */}
                    {!isEmployer && (
                      <div className="bg-[#FAF5EE] rounded-xl p-4 border border-[#C8782A]/10">
                        <p className="text-xs font-semibold text-[#6B3A2A]/60 uppercase tracking-wider mb-2">
                          Optional — Indigenous Identity
                        </p>
                        <p className="text-xs text-[#6B3A2A]/60 leading-relaxed mb-3">
                          Sharing your identity is entirely optional and helps us connect you with
                          relevant opportunities and community resources.
                        </p>
                        <div className="flex flex-col gap-2">
                          {['First Nations', 'Métis', 'Inuit', 'Prefer not to say'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                              <input type="radio" name="identity" value={opt} className="accent-[#C8782A]" />
                              <span className="text-sm text-[#6B3A2A]/75">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: Credentials ───────────────────────────── */}
                {step === 3 && (
                  <div className="flex flex-col gap-5">
                    {/* Server error */}
                    {serverError && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        <AlertCircle size={15} className="flex-shrink-0" />
                        {serverError}
                      </div>
                    )}
                    {isEmployer && (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="reg-username" className="text-[#6B3A2A] font-medium text-sm">
                          Username <span className="text-[#C8782A]">*</span>
                        </Label>
                        <Input
                          id="reg-username"
                          type="text"
                          autoComplete="username"
                          value={form.username}
                          onChange={(e) => set('username', e.target.value)}
                          placeholder="Choose a username"
                          className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 ${errors.username ? 'border-red-400' : ''}`}
                        />
                        <FieldError msg={errors.username} />
                      </div>
                    )}
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="reg-email" className="text-[#6B3A2A] font-medium text-sm">
                        Email Address <span className="text-[#C8782A]">*</span>
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="your@email.com"
                        className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 ${errors.email ? 'border-red-400' : ''}`}
                      />
                      <FieldError msg={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="reg-password" className="text-[#6B3A2A] font-medium text-sm">
                        Password <span className="text-[#C8782A]">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={form.password}
                          onChange={(e) => set('password', e.target.value)}
                          placeholder="Create a strong password"
                          className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B3A2A]/40 hover:text-[#C8782A] transition-colors"
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PasswordStrength password={form.password} />
                      <FieldError msg={errors.password} />
                    </div>

                    {/* Confirm password */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="reg-confirm" className="text-[#6B3A2A] font-medium text-sm">
                        Confirm Password <span className="text-[#C8782A]">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-confirm"
                          type={showConfirmPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={form.confirmPassword}
                          onChange={(e) => set('confirmPassword', e.target.value)}
                          placeholder="Repeat your password"
                          className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B3A2A]/40 hover:text-[#C8782A] transition-colors"
                          aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FieldError msg={errors.confirmPassword} />
                    </div>

                    {/* Terms */}
                    <div className="flex flex-col gap-1">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.agreeTerms}
                          onChange={(e) => set('agreeTerms', e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#C8782A] flex-shrink-0"
                        />
                        <span className="text-sm text-[#6B3A2A]/70 leading-relaxed">
                          I agree to Youth Employment Canada's{' '}
                          <a href="/terms-of-use" className="text-[#C8782A] hover:underline font-medium">Terms of Use</a>
                          {' '}and{' '}
                          <a href="/privacy-policy" className="text-[#C8782A] hover:underline font-medium">Privacy Policy</a>.
                        </span>
                      </label>
                      <FieldError msg={errors.agreeTerms} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className={`flex gap-3 px-8 pb-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="border-[#C8782A]/25 text-[#6B3A2A] hover:bg-[#C8782A]/5 font-medium"
                >
                  <ArrowLeft size={15} className="mr-1.5" /> Back
                </Button>
              )}
              <Button
                type="button"
                onClick={goNext}
                disabled={loading}
                className={`font-semibold px-8 text-white transition-all duration-200 ${
                  isEmployer
                    ? 'bg-[#6B3A2A] hover:bg-[#5A2F1F]'
                    : 'bg-[#C8782A] hover:bg-[#B06820]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating…
                  </span>
                ) : step === 3 ? (
                  <span className="flex items-center gap-1.5">
                    Create Account <CheckCircle size={15} />
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Continue <ChevronRight size={15} />
                  </span>
                )}
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-[#6B3A2A]/60 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C8782A] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </section>
    </>
  );
}
