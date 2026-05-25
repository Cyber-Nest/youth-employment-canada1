import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@/router';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Building2,
  CheckCircle,
  ArrowRight,
  Star,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};



// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: '3,200+', label: 'Jobs Posted' },
  { value: '1,150+', label: 'Employers' },
  { value: '18,000+', label: 'Youth Job Seekers' },
  { value: 'All', label: 'Provinces & Territories' },
];

// Featured jobs are loaded from the API (GET /api/jobs) — use client-side fetch to show latest real jobs
// See: server handler at src/server/api/jobs/GET.ts

const packages = [
  {
    name: 'Starter Posting',
    tagline: 'Launch your first youth opportunity',
    features: ['Single job listing', '30-day active posting', 'Targeted youth search visibility', 'Applicant email notifications'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Featured Opportunity',
    tagline: 'Stand out with a youth-focused listing',
    features: ['Highlighted placement', '60-day active posting', 'Priority search results', 'Featured badge on listing', 'Applicant management tools'],
    cta: 'Post Featured',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Employer Spotlight',
    tagline: 'Share your youth-friendly employer story',
    features: ['Company profile page', 'Multiple job listings', 'Logo & banner placement', 'Youth hiring statement', 'Priority support'],
    cta: 'Build Your Brand',
    highlight: false,
  },
  {
    name: 'Hiring Partnership',
    tagline: 'Support for sustained youth recruitment',
    features: ['Unlimited job postings', 'Dedicated account support', 'Applicant management tools', 'Monthly performance insights', 'Youth hiring resources'],
    cta: 'Contact Us',
    highlight: false,
  },
];

const testimonials = [
  {
    quote: 'Youth Employment Canada helped me find a role that matched my skills and values. The platform made it easy to connect with employers who support young Canadians.',
    name: 'Aaliyah M.',
    role: 'Student Intern',
    location: 'Ontario',
  },
  {
    quote: 'Our local team filled a youth position quickly and with confidence. The process was simple and the candidates were ready to contribute.',
    name: 'Daniel K.',
    role: 'Program Manager',
    location: 'British Columbia',
  },
  {
    quote: 'I found a flexible, meaningful job through Youth Employment Canada and felt supported every step of the way.',
    name: 'Mia R.',
    role: 'Customer Service Associate',
    location: 'Alberta',
  },
];

// ─── Decorative SVG ───────────────────────────────────────────────────────────

function OrganicShape({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1" opacity="0.12" />
      <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      <circle cx="200" cy="200" r="30" fill="currentColor" opacity="0.08" />
      <path d="M200 20 Q280 100 200 200 Q120 100 200 20Z" fill="currentColor" opacity="0.06" />
      <path d="M380 200 Q300 280 200 200 Q300 120 380 200Z" fill="currentColor" opacity="0.06" />
      <path d="M200 380 Q120 300 200 200 Q280 300 200 380Z" fill="currentColor" opacity="0.06" />
      <path d="M20 200 Q100 120 200 200 Q100 280 20 200Z" fill="currentColor" opacity="0.06" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([] as any[]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroLocation, setHeroLocation] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (!res.ok) {
          if (mounted) setJobs([]);
        } else {
          if (mounted) setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        }
      } catch (err) {
        if (mounted) setJobs([]);
      } finally {
        if (mounted) setJobsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Helmet>
        <title>Youth Employment Canada — Canada's Youth Employment Network</title>
        <meta
          name="description"
          content="Youth Employment Canada connects young Canadians with inclusive employers nationwide. Find jobs, post opportunities, and launch your next career." 
        />
      </Helmet>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center bg-[#F8FAFC]">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_25%),linear-gradient(180deg,_rgba(37,99,235,0.04),_rgba(248,250,252,0.0))]" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F172A]/8 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-[#2563EB] font-semibold text-sm uppercase tracking-widest mb-5"
            >
              Youth Employment Across Canada
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0F172A] leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Launch Your Next
              <br />
              <span className="text-[#2563EB]">Career with Confidence.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[#475569] leading-relaxed mb-10 max-w-xl"
            >
              Bringing young Canadians and inclusive employers together across every province and territory. Search jobs, connect with employers, and grow your career.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mb-8"
            >
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search size={18} className="text-[#2563EB] flex-shrink-0" />
                <Input
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Job title, keyword, or company"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-[#1C1C1C] placeholder:text-[#1C1C1C]/40"
                />
              </div>
              <div className="w-px bg-[#2563EB]/20 hidden sm:block" />
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin size={18} className="text-[#2563EB] flex-shrink-0" />
                <Input
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  placeholder="City, province, or territory"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-[#1C1C1C] placeholder:text-[#1C1C1C]/40"
                />
              </div>
              <Button
                type="button"
                className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-semibold px-6 rounded-xl shrink-0"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (heroSearch.trim()) params.set('search', heroSearch.trim());
                  if (heroLocation.trim()) params.set('location', heroLocation.trim());
                  navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
                }}
              >
                Search Jobs
              </Button>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/jobs">
                <Button
                  size="lg"
                  className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  Find Jobs
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/post-a-job">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white font-semibold px-8 transition-all duration-200 hover:-translate-y-0.5 bg-transparent"
                >
                  Post a Job
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Row — bottom of hero */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-left">
                <p className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {stat.value}
                </p>
                <p className="text-sm text-[#475569] mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 2. DUAL CTA SPLIT ───────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Job Seekers Card — larger */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(37,99,235,0.08)' }}
                className="lg:col-span-3 bg-[#2563EB] rounded-3xl p-10 lg:p-12 relative overflow-hidden cursor-pointer"
            >
              <OrganicShape className="absolute -right-16 -bottom-16 w-72 h-72 text-white pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
                  <Users size={14} className="text-white" />
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">For Job Seekers</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  I'm Looking for Work
                </h2>
                <p className="text-white/80 mb-8 leading-relaxed max-w-md">
                  Find paid opportunities, internships, and entry-level roles designed for young Canadians ready to grow their skills and build confidence.
                </p>
                <ul className="flex flex-col gap-3 mb-8">
                  {[
                    { text: 'Search jobs', desc: 'Browse current job opportunities across Canada and view employer-provided application instructions.' },
                    { text: 'Apply directly', desc: 'Apply outside our website using the email, phone, mail, or in-person method provided by the employer.' },
                    { text: 'Connect with employers', desc: 'Contact employers directly using the application method listed on each job posting.' },
                  ].map((item, idx) => (
                    <li key={item.text} className="flex items-start gap-3 text-white/90 text-sm">
                      <div className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{`0${idx + 1}`}</div>
                      <div>
                        <div className="font-semibold mb-1">{item.text}</div>
                        <p className="text-sm text-white/80 leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link to="/jobs">
                  <Button
                    size="lg"
                    className="bg-white text-[#2563EB] hover:bg-[#F8FAFC] font-semibold px-8 shadow-md"
                  >
                    Browse Jobs
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Employers Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.12 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(15,23,42,0.06)' }}
              className="lg:col-span-2 bg-[#0F172A] rounded-3xl p-10 lg:p-12 relative overflow-hidden cursor-pointer"
            >
              <OrganicShape className="absolute -right-16 -bottom-16 w-64 h-64 text-white pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
                  <Building2 size={14} className="text-white" />
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">For Employers</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  I'm Hiring Youth Talent
                </h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                  Reach motivated young Canadians who bring fresh energy, strong potential, and a desire to learn and grow.
                </p>
                <ul className="flex flex-col gap-3 mb-8">
                  {['Post jobs to a youth-focused audience', 'Manage applicants in one place', 'Boost visibility with featured listings', 'Access hiring support for young talent'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                      <CheckCircle size={16} className="text-white flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/post-a-job">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#2563EB] font-semibold px-8 transition-all duration-200"
                  >
                    Post a Job
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED JOBS ────────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-[#2563EB] font-semibold text-sm uppercase tracking-widest mb-3">
              Opportunities Await
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-bold text-[#1C1C1C]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Latest Opportunities
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {(!jobsLoading && jobs.length === 0) && (
              <div className="col-span-full text-center text-sm text-[#475569]">No jobs posted yet. Please check back soon.</div>
            )}
            {jobs.slice(0, 6).map((job) => (
              <motion.div
                key={(job.id || job.title) + (job.location || '')}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(107,58,42,0.12)' }}
                className="bg-white rounded-2xl p-6 border border-[#2563EB]/10 cursor-pointer transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-[#2563EB]" />
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB]`}>
                    {job.employmentType || job.type || 'Full-time'}
                  </span>
                </div>
                <h3 className="font-bold text-[#1C1C1C] text-lg mb-1 leading-snug">{job.title}</h3>
                <p className="text-[#2563EB] text-sm font-medium mb-2">{job.company}</p>
                <div className="flex items-center gap-1.5 text-[#1C1C1C]/50 text-sm mb-5">
                  <MapPin size={13} />
                  <span>{job.location}{job.province ? `, ${job.province}` : ''}</span>
                </div>
                <Link
                  to={`/jobs/${job.id || ''}`}
                  className="inline-flex items-center gap-1.5 text-[#2563EB] text-sm font-semibold hover:gap-2.5 transition-all duration-200"
                >
                  View Job <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link to="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white font-semibold px-10 transition-all duration-200"
              >
                View All Jobs
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-[#7A9E7E] font-semibold text-sm uppercase tracking-widest mb-3">
              How It Works
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-bold text-[#1C1C1C]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Simple. Respectful. Effective.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Job Seekers Steps */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="bg-[#F8FAFC] rounded-3xl p-8 lg:p-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 flex items-center justify-center">
                  <Users size={18} className="text-[#2563EB]" />
                </div>
                <h3 className="text-xl font-bold text-[#1C1C1C]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  For Job Seekers
                </h3>
              </div>
              <div className="flex flex-col gap-7">
                {[
                  { step: '01', title: 'Search jobs', desc: 'Browse current job opportunities across Canada and review the application instructions provided by each employer.' },
                  { step: '02', title: 'Apply directly', desc: 'Apply outside our website using the email, phone, mail, or in-person method provided by the employer.' },
                  { step: '03', title: 'Connect with employers', desc: 'Contact employers directly using the application method listed on each job posting.' },
                ].map((item) => (
                  <motion.div key={item.step} variants={fadeUp} className="flex gap-5">
                      <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1C1C1C] mb-1">{item.title}</h4>
                      <p className="text-sm text-[#475569]/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/jobs">
                  <Button className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-semibold">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Employers Steps */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="bg-[#F8FAFC] rounded-3xl p-8 lg:p-10 border border-[#E6EEF8]"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A]/5 flex items-center justify-center">
                  <Building2 size={18} className="text-[#0F172A]" />
                </div>
                <h3 className="text-xl font-bold text-[#1C1C1C]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  For Employers
                </h3>
              </div>
              <div className="flex flex-col gap-7">
                {[
                  { step: '01', title: 'Choose your package', desc: 'Select from flexible packages designed to fit your hiring needs — from a single posting to full monthly support.' },
                  { step: '02', title: 'Post your job listing', desc: 'Create a compelling listing that reaches thousands of qualified youth candidates across Canada.' },
                  { step: '03', title: 'Review applications and hire', desc: 'Manage applicants through your dashboard, connect with candidates, and build your inclusive team.' },
                ].map((item) => (
                  <motion.div key={item.step} variants={fadeUp} className="flex gap-5">
                      <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1C1C1C] mb-1">{item.title}</h4>
                      <p className="text-sm text-[#475569]/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/post-a-job">
                  <Button className="bg-[#0F172A] hover:bg-[#0b1220] text-white font-semibold">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. PACKAGES PREVIEW ─────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-[#2563EB] font-semibold text-sm uppercase tracking-widest mb-3">
              Employer Packages
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-bold text-[#1C1C1C]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Packages for Every Hiring Need
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#475569]/70 mt-4 max-w-xl mx-auto">
              Whether you're posting your first youth opportunity or building a long-term hiring strategy, we have a package for you.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start"
          >
            {packages.map((pkg) => (
              <motion.div
                key={pkg.name}
                variants={fadeUp}
                whileHover={{ y: -5, boxShadow: pkg.highlight ? '0 20px 50px rgba(37,99,235,0.12)' : '0 12px 30px rgba(15,23,42,0.06)' }}
                className={`rounded-2xl p-7 relative transition-shadow duration-200 ${
                  pkg.highlight
                    ? 'bg-[#2563EB] text-white ring-2 ring-[#2563EB] shadow-xl lg:-mt-4 lg:mb-4'
                    : 'bg-white border border-[#2563EB]/10'
                }`}
              >
                {pkg.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0F172A] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      {pkg.badge}
                    </span>
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl mb-5 flex items-center justify-center ${pkg.highlight ? 'bg-white/20' : 'bg-[#2563EB]/10'}`}>
                  <Star size={18} className={pkg.highlight ? 'text-white' : 'text-[#2563EB]'} />
                </div>
                <h3 className={`font-bold text-lg mb-1 ${pkg.highlight ? 'text-white' : 'text-[#1C1C1C]'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  {pkg.name}
                </h3>
                <p className={`text-sm mb-5 ${pkg.highlight ? 'text-white/75' : 'text-[#475569]/60'}`}>
                  {pkg.tagline}
                </p>
                <ul className="flex flex-col gap-2.5 mb-7">
                  {pkg.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${pkg.highlight ? 'text-white/90' : 'text-[#1C1C1C]/70'}`}>
                      <CheckCircle size={14} className={`flex-shrink-0 mt-0.5 ${pkg.highlight ? 'text-white' : 'text-[#7A9E7E]'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing">
                  <Button
                    className={`w-full font-semibold transition-all duration-200 ${
                      pkg.highlight
                        ? 'bg-white text-[#2563EB] hover:bg-[#F8FAFC]'
                        : 'bg-[#2563EB] hover:bg-[#1E3A8A] text-white'
                    }`}
                  >
                    {pkg.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white font-semibold px-10 transition-all duration-200"
              >
                View All Packages
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 6. WHY CYBERNEST ────────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] py-16 lg:py-24 relative overflow-hidden">
        <OrganicShape className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 text-[#2563EB] pointer-events-none" />
        <OrganicShape className="absolute -right-32 top-1/2 -translate-y-1/2 w-80 h-80 text-white pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-[#2563EB] font-semibold text-sm uppercase tracking-widest mb-3">
              Why Youth Employment Canada
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-bold text-[#FAF5EE]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Built for Young Talent Across Canada
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {[
              {
                num: '01',
                title: 'Dedicated Platform',
                desc: 'The only job board built for young Canadians and employers who want to hire the next generation of talent — not an afterthought, but a purpose-built community.',
              },
              {
                num: '02',
                title: 'Culturally Respectful',
                desc: 'Every feature is designed to support youth careers, education pathways, and meaningful early-stage work experiences from coast to coast.',
              },
              {
                num: '03',
                title: 'Canada-Wide Reach',
                desc: 'Connecting talent and opportunity from coast to coast to coast — in every province and territory, from urban centres to remote and northern communities.',
              },
            ].map((item) => (
              <motion.div
                key={item.num}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white/8 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
              >
                <p className="text-[#2563EB] text-5xl font-bold mb-5 opacity-60" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.num}
                </p>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.title}
                </h3>
                <p className="text-white/65 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-[#7A9E7E] font-semibold text-sm uppercase tracking-widest mb-3">
              Community Stories
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-bold text-[#1C1C1C]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Voices from Our Community
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                  key={t.name}
                  variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(15,23,42,0.04)' }}
                  className="bg-[#F8FAFC] rounded-2xl p-8 border border-[#2563EB]/10 transition-shadow duration-200"
                >
                  <Quote size={32} className="text-[#2563EB] mb-5 opacity-60" />
                  <p className="text-[#0F172A]/80 leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2563EB]/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#2563EB] font-bold text-sm">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] text-sm">{t.name}</p>
                      <p className="text-[#475569]/60 text-xs">{t.role} · {t.location}</p>
                    </div>
                  </div>
                </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 8. FINAL CTA BANNER ─────────────────────────────────────────────── */}
      <section className="bg-[#2563EB] py-16 lg:py-20 relative overflow-hidden">
        <OrganicShape className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 text-white pointer-events-none" />
        <OrganicShape className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 text-[#6B3A2A] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-bold text-white mb-5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to Take the Next Step?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you're searching for your next opportunity or hiring young talent — Youth Employment Canada is here to support your next move.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Link to="/jobs">
                <Button
                  size="lg"
                  className="bg-white text-[#2563EB] hover:bg-[#F8FAFC] font-semibold px-10 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  Find Jobs
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/post-a-job">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#2563EB] font-semibold px-10 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Post a Job
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/15 font-semibold px-8 transition-all duration-200"
                >
                  Contact Youth Employment Canada
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
