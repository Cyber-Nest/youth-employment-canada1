import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from '@/router';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { fetchAuthMe, logout } from '@/lib/auth/auth-client';

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

interface DashboardData {
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    username?: string;
    accountType?: string;
    employerProfile?: EmployerProfile | null;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchAuthMe()
      .then((result) => {
        if (!isMounted) return;
        if (result.error) {
          setError(result.error.message || 'Unable to load account details.');
          return;
        }
        if (!result.data?.user) {
          setError('Unable to load account details.');
          return;
        }
        setData({ user: result.data.user });
      })
      .catch(() => setError('Unable to load account details.'))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      const result = await logout();
      if (result.error) {
        setError(result.error.message || 'Logout failed.');
        setLogoutLoading(false);
        return;
      }
      window.location.href = '/login';
    } catch {
      setError('Logout failed. Please try again.');
      setLogoutLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-[#FAF5EE] min-h-[85vh] flex items-center justify-center py-16 px-4">
        <Spinner className="text-[#6B3A2A]" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FAF5EE] min-h-[85vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-10 border border-[#C8782A]/10 shadow-sm max-w-xl text-center">
          <h1 className="text-2xl font-bold text-[#1C1C1C] mb-3">Employer Dashboard</h1>
          <p className="text-[#6B3A2A]/75 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#C8782A] hover:bg-[#B06820] text-white">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  const user = data?.user;
  const profile = user?.employerProfile;

  return (
    <section className="bg-[#FAF5EE] min-h-[85vh] py-16 px-4">
      <Helmet>
        <title>Employer Dashboard — Youth Employment Canada</title>
      </Helmet>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#C8782A] font-semibold mb-2">Employer Dashboard</p>
            <h1 className="text-3xl font-bold text-[#1C1C1C]">Welcome back, {user?.firstName ?? user?.name ?? 'Employer'}</h1>
            <p className="text-sm text-[#6B3A2A]/80 mt-2">Manage your account, job credits, and employer profile from one place.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/post-a-job">
              <Button className="bg-[#6B3A2A] hover:bg-[#5A6E56] text-white font-semibold">Post a Job</Button>
            </Link>
            <Button onClick={handleLogout} disabled={logoutLoading} className="bg-[#C8782A] hover:bg-[#B06820] text-white">{logoutLoading ? 'Logging out…' : 'Logout'}</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Left column */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-[#C8782A]/10 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1C1C1C]">Ready to hire?</h3>
              <p className="text-sm text-[#6B3A2A]/75 mt-2">Create a new job posting and reach youth job seekers across Canada.</p>
              <div className="mt-4">
                <Link to="/post-a-job">
                  <Button className="w-full bg-[#C8782A] hover:bg-[#B06820] text-white font-semibold">Create Job Posting</Button>
                </Link>
                {profile?.jobCredits === 0 && (
                  <p className="text-xs text-[#6B3A2A]/60 mt-2">You currently have 0 job credits. Package/payment controls will be added later.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-[#C8782A]/10 p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.35em] text-[#6B3A2A]/60 font-semibold mb-2">Company</p>
                <h2 className="text-2xl font-semibold text-[#1C1C1C]">{profile?.businessName ?? user?.name ?? 'Employer'}</h2>
                <p className="text-sm text-[#6B3A2A]/75 mt-3">Username: <span className="font-medium text-[#1C1C1C]">{user?.username}</span></p>
                <p className="text-sm text-[#6B3A2A]/75">Email: <span className="font-medium text-[#1C1C1C]">{user?.email}</span></p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FAF5EE] p-5 border border-[#C8782A]/10">
                  <p className="text-xs text-[#6B3A2A]/75 uppercase tracking-[0.25em] mb-2">Package</p>
                  <p className="text-lg font-semibold text-[#1C1C1C]">{profile?.packageName ?? 'Free Trial'}</p>
                </div>
                <div className="rounded-2xl bg-[#FAF5EE] p-5 border border-[#C8782A]/10">
                  <p className="text-xs text-[#6B3A2A]/75 uppercase tracking-[0.25em] mb-2">Status</p>
                  <p className="text-lg font-semibold text-[#1C1C1C]">{profile?.packageStatus ?? 'Active'}</p>
                </div>
                {/* <div className="rounded-2xl bg-[#FAF5EE] p-5 border border-[#C8782A]/10">
                  <p className="text-xs text-[#6B3A2A]/75 uppercase tracking-[0.25em] mb-2">Remaining Job Credits</p>
                  <p className="text-lg font-semibold text-[#1C1C1C]">{profile?.jobCredits ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-[#FAF5EE] p-5 border border-[#C8782A]/10">
                  <p className="text-xs text-[#6B3A2A]/75 uppercase tracking-[0.25em] mb-2">Jobs Posted</p>
                  <p className="text-lg font-semibold text-[#1C1C1C]">{profile?.jobsPosted ?? 0}</p>
                </div> */}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="rounded-3xl bg-white border border-[#C8782A]/10 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1C1C1C] mb-4">Package details</h2>
            <div className="space-y-4 text-sm text-[#6B3A2A]/80">
              <div>
                <p className="font-semibold text-[#1C1C1C]">Expiry window</p>
                <p>{profile?.jobPostExpiryDays ?? 180} days</p>
              </div>
              <div>
                <p className="font-semibold text-[#1C1C1C]">Credit validity</p>
                <p>{profile?.creditValidity ?? 'Credit Never Expire'}</p>
              </div>
              <div>
                <p className="font-semibold text-[#1C1C1C]">Province</p>
                <p>{profile?.province ?? 'Not set'}</p>
              </div>
              <div>
                <p className="font-semibold text-[#1C1C1C]">Phone number</p>
                <p>{profile?.phoneNumber ?? 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
