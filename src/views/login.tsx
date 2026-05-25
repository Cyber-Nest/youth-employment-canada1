import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate, useLocation } from '@/router';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginWithIdentifier } from '@/lib/auth/auth-client';

/* ── Animation ─────────────────────────────────────────────────────── */

/* ── Logo mark ──────────────────────────────────────────────────────── */
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

/* ── Validation ─────────────────────────────────────────────────────── */
function validate(identifier: string, password: string) {
  const errs: { identifier?: string; password?: string } = {};
  if (!identifier.trim()) errs.identifier = 'Email or username is required.';
  else if (identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    errs.identifier = 'Enter a valid email address or username.';
  }
  if (!password) errs.password = 'Password is required.';
  else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
  return errs;
}

/* ── Field error ────────────────────────────────────────────────────── */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
      <AlertCircle size={12} className="flex-shrink-0" />
      {msg}
    </p>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(identifier, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError('');
    try {
      const result = await loginWithIdentifier(identifier, password);
      if (result.error) {
        setServerError(result.error.message || 'Invalid email, username, or password.');
      } else {
        const user = result.data?.user;
        if (user?.accountType === 'employer') {
          navigate('/dashboard', { replace: true });
        } else if (from === '/dashboard') {
          navigate('/', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Login form ────────────────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Login — Youth Employment Canada</title>
        <meta
          name="description"
          content="Log in to your Youth Employment Canada account to manage your job applications or employer dashboard."
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
          <div className="text-center mb-8">
            <LogoMark />
            <h1
              className="text-3xl font-bold text-[#1C1C1C]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Welcome Back
            </h1>
            <p className="text-[#6B3A2A]/65 mt-2 text-sm">
              Sign in to your Youth Employment Canada account
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 border border-[#C8782A]/10 shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Server error */}
              {serverError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {serverError}
                </div>
              )}
              {/* Email or username */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-identifier" className="text-[#6B3A2A] font-medium text-sm">
                  Email Address or Username
                </Label>
                <Input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
                  }}
                  placeholder="Email or username"
                  className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 ${errors.identifier ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
                />
                <FieldError msg={errors.identifier} />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-[#6B3A2A] font-medium text-sm">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-[#C8782A] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Your password"
                    className={`border-[#C8782A]/20 focus-visible:ring-[#C8782A]/30 pr-10 ${errors.password ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
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
                <FieldError msg={errors.password} />
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-[#C8782A]"
                />
                <span className="text-sm text-[#6B3A2A]/70">Keep me signed in</span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-[#C8782A] hover:bg-[#B06820] text-white font-semibold w-full mt-1 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <LogIn size={15} />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-[#6B3A2A]/60 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#C8782A] font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          {/* Quick register links */}
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Link to="/register?type=employer">
              <Button
                variant="outline"
                className="w-full border-[#6B3A2A]/25 text-[#6B3A2A] hover:bg-[#6B3A2A]/5 hover:border-[#6B3A2A]/50 text-sm font-medium"
              >
                Employer Sign Up
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-[#6B3A2A]/40 mt-5 leading-relaxed">
            By signing in you agree to Youth Employment Canada's{' '}
            <a href="/terms-of-use" className="hover:text-[#C8782A] underline underline-offset-2">Terms of Use</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="hover:text-[#C8782A] underline underline-offset-2">Privacy Policy</a>.
          </p>
        </motion.div>
      </section>
    </>
  );
}
