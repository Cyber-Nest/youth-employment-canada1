import { useState, useMemo, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useSearchParams } from '@/router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Clock, DollarSign, Building2,
  SlidersHorizontal, X, ChevronRight, Wifi, Leaf,
  ChevronLeft, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ALL_CATEGORIES, ALL_PROVINCES, ALL_TYPES,
  filterJobs, postedLabel,
  type JobFilters, type Job,
} from '@/lib/jobs-data';

/* ── Constants ──────────────────────────────────────────────────────── */
const PAGE_SIZE = 8;

/* ── Animations ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ── Job card ───────────────────────────────────────────────────────── */
function JobCard({ job }: { job: Job }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/jobs/${job.id}`}
        className="group block bg-white rounded-2xl border border-[#2563EB]/10 hover:border-[#2563EB]/35 hover:shadow-md transition-all duration-200 p-5"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Company icon */}
          <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-[#2563EB]" />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 justify-end">
            {job.featured && (
              <span className="text-xs bg-[#2563EB] text-white px-2.5 py-0.5 rounded-full font-semibold">
                Featured
              </span>
            )}
            {job.remote && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#2563EB]/10 text-[#2563EB] px-2.5 py-0.5 rounded-full font-medium">
                <Wifi size={10} /> Remote
              </span>
            )}
            {job.indigenous && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#7A9E7E]/15 text-[#4a7a4e] px-2.5 py-0.5 rounded-full font-medium">
                <Leaf size={10} /> Diverse Employer
              </span>
            )}
          </div>
        </div>

        {/* Title + company */}
        <h3 className="font-bold text-[#1C1C1C] text-base leading-snug mb-0.5 group-hover:text-[#2563EB] transition-colors duration-200">
          {job.title}
        </h3>
        <p className="text-sm text-[#2563EB] font-semibold mb-3">{job.company}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]/65">
            <MapPin size={11} className="text-[#2563EB]" />
            {job.location}, {job.province}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]/65">
            <Clock size={11} className="text-[#2563EB]" />
            {job.employmentType}
          </span>
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]/65">
              <DollarSign size={11} className="text-[#2563EB]" />
              {job.salary}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2563EB]/8">
          <span className="text-xs text-[#475569]/45">{postedLabel(job.postedDaysAgo)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] group-hover:gap-2 transition-all duration-200">
            View Job <ChevronRight size={13} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Filter pill ────────────────────────────────────────────────────── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-[#2563EB]/10 text-[#0F172A] border border-[#2563EB]/20 rounded-full px-3 py-1 font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-[#2563EB] hover:text-[#1E3A8A] transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={11} />
      </button>
    </span>
  );
}

/* ── Select field ───────────────────────────────────────────────────── */
function FilterSelect({
  id, label, value, onChange, options, placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-[#475569]/60 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#2563EB]/20 bg-white px-3 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 pr-8"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569]/40 pointer-events-none" />
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({
    query: '',
    location: '',
    province: '',
    category: '',
    type: '',
    remote: false,
    indigenous: false,
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchParam = searchParams.get('search')?.trim() ?? '';
    const locationParam = searchParams.get('location')?.trim() ?? '';
    const matchedProvince = ALL_PROVINCES.find((province) => province.toLowerCase() === locationParam.toLowerCase());
    setFilters((prev) => ({
      ...prev,
      query: searchParam,
      province: matchedProvince ? matchedProvince : '',
      location: matchedProvince ? '' : locationParam,
    }));
  }, [searchParams]);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      setFetchError('');
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        if (!response.ok) {
          const message = data?.error
            ? `${data.error}${data?.sqlMessage ? `: ${data.sqlMessage}` : ''}`
            : `Unable to load jobs (${response.status}).`;
          throw new Error(message);
        }
        if (!Array.isArray(data.jobs)) {
          throw new Error('Unexpected jobs response from server.');
        }
        setJobs(data.jobs);
      } catch (error) {
        setFetchError(error instanceof Error ? error.message : 'Unable to load jobs.');
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const set = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearAll = () => {
    setFilters({ query: '', location: '', province: '', category: '', type: '', remote: false, indigenous: false });
    setPage(1);
  };

  const filtered = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const featured = useMemo(() => jobs.filter((j) => j.featured), [jobs]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilterCount = [
    filters.province, filters.category, filters.type,
    filters.remote ? 'remote' : '',
    filters.indigenous ? 'indigenous' : '',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || filters.query;

  return (
    <>
      <Helmet>
        <title>Browse Jobs — Youth Employment Canada</title>
        <meta
          name="description"
          content="Browse hundreds of job opportunities for youth job seekers across Canada. Filter by province, category, employment type, and more."
        />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] py-14 lg:py-20 relative overflow-hidden">
        <div
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-[380px] h-[380px] text-[#2563EB] pointer-events-none opacity-20"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" />
            <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <circle cx="200" cy="200" r="60" fill="currentColor" opacity="0.15" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <p className="text-[#2563EB] font-semibold text-sm uppercase tracking-widest mb-3">
              Job Board
            </p>
            <h1
              className="text-5xl lg:text-6xl font-bold text-[#0F172A] mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Find Your Next Opportunity
            </h1>
            <p className="text-[#475569]/70 text-lg leading-relaxed mb-8">
              Explore jobs from employers and organizations across every province and territory in Canada.
            </p>

            {/* Search bar */}
            <div className="flex gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]/40" />
                <Input
                  type="search"
                  value={filters.query}
                  onChange={(e) => set('query', e.target.value)}
                  placeholder="Job title, company, or keyword…"
                  className="pl-10 border-[#2563EB]/20 focus-visible:ring-[#2563EB]/30 bg-white h-12 text-sm"
                />
              </div>
              <Button
                type="button"
                className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-semibold h-12 px-6 shadow-sm"
              >
                Search
              </Button>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-wrap gap-6 mt-10"
          >
            {[
              { value: `${jobs.length}`, label: 'Active Listings' },
              { value: `${jobs.filter((j) => j.indigenous).length}`, label: 'Employers' },
              { value: `${jobs.filter((j) => j.remote).length}`, label: 'Remote Roles' },
              { value: `${new Set(jobs.map((j) => j.province)).size}`, label: 'Provinces & Territories' },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span
                  className="text-2xl font-bold text-[#2563EB]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {value}
                </span>
                <span className="text-sm text-[#475569]/60">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────── */}
      <section className="bg-white py-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

            {/* ── Sidebar filters (desktop) ──────────────────────── */}
            <aside className="hidden lg:flex flex-col gap-5 sticky top-24">
              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#2563EB]/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1C1C1C] text-sm">Filter Jobs</h2>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs text-[#C8782A] hover:underline font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <FilterSelect
                    id="filter-province"
                    label="Province / Territory"
                    value={filters.province}
                    onChange={(v) => set('province', v)}
                    options={ALL_PROVINCES}
                    placeholder="All provinces"
                  />
                  <FilterSelect
                    id="filter-category"
                    label="Category"
                    value={filters.category}
                    onChange={(v) => set('category', v)}
                    options={ALL_CATEGORIES}
                    placeholder="All categories"
                  />
                  <FilterSelect
                    id="filter-type"
                    label="Employment Type"
                    value={filters.type}
                    onChange={(v) => set('type', v)}
                    options={ALL_TYPES}
                    placeholder="All types"
                  />

                  <div className="flex flex-col gap-2.5 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.remote}
                        onChange={(e) => set('remote', e.target.checked)}
                        className="w-4 h-4 accent-[#2563EB]"
                      />
                      <span className="text-sm text-[#475569]/75 font-medium">Remote / Hybrid only</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.indigenous}
                        onChange={(e) => set('indigenous', e.target.checked)}
                        className="w-4 h-4 accent-[#7A9E7E]"
                      />
                      <span className="text-sm text-[#6B3A2A]/75 font-medium">Employers only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Post a job CTA */}
              <div className="bg-[#0F172A] rounded-2xl p-5 text-white">
                <h3
                  className="font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Hiring Young Talent?
                </h3>
                <p className="text-white/70 text-xs leading-relaxed mb-4">
                  Post your job and reach thousands of qualified Youth across Canada.
                </p>
                <Link to="/post-a-job">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#0F172A] w-full text-sm font-semibold"
                  >
                    Post a Job
                  </Button>
                </Link>
              </div>
            </aside>

            {/* ── Job listings ──────────────────────────────────────── */}
            <div>
              {/* Mobile filter toggle */}
              <div className="flex items-center justify-between mb-5 lg:hidden">
                <p className="text-sm text-[#475569]/60">
                  <span className="font-bold text-[#1C1C1C]">{filtered.length}</span> jobs found
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters((v) => !v)}
                  className="border-[#2563EB]/25 text-[#475569] hover:bg-[#2563EB]/5 gap-2"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#2563EB] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* Mobile filter panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mb-5 lg:hidden"
                  >
                    <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#2563EB]/10 flex flex-col gap-4">
                      <FilterSelect
                        id="m-filter-province"
                        label="Province / Territory"
                        value={filters.province}
                        onChange={(v) => set('province', v)}
                        options={ALL_PROVINCES}
                        placeholder="All provinces"
                      />
                      <FilterSelect
                        id="m-filter-category"
                        label="Category"
                        value={filters.category}
                        onChange={(v) => set('category', v)}
                        options={ALL_CATEGORIES}
                        placeholder="All categories"
                      />
                      <FilterSelect
                        id="m-filter-type"
                        label="Employment Type"
                        value={filters.type}
                        onChange={(v) => set('type', v)}
                        options={ALL_TYPES}
                        placeholder="All types"
                      />
                      <div className="flex flex-col gap-2.5">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={filters.remote} onChange={(e) => set('remote', e.target.checked)} className="w-4 h-4 accent-[#2563EB]" />
                          <span className="text-sm text-[#475569]/75 font-medium">Remote / Hybrid only</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={filters.indigenous} onChange={(e) => set('indigenous', e.target.checked)} className="w-4 h-4 accent-[#7A9E7E]" />
                          <span className="text-sm text-[#6B3A2A]/75 font-medium">Employers only</span>
                        </label>
                      </div>
                      {hasActiveFilters && (
                        <button type="button" onClick={clearAll} className="text-xs text-[#C8782A] hover:underline font-medium text-left">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results header + active filter pills */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <p className="hidden lg:block text-sm text-[#6B3A2A]/60">
                  <span className="font-bold text-[#1C1C1C]">{filtered.length}</span> job{filtered.length !== 1 ? 's' : ''} found
                </p>
                {filters.province && <FilterPill label={filters.province} onRemove={() => set('province', '')} />}
                {filters.category && <FilterPill label={filters.category} onRemove={() => set('category', '')} />}
                {filters.type && <FilterPill label={filters.type} onRemove={() => set('type', '')} />}
                {filters.remote && <FilterPill label="Remote" onRemove={() => set('remote', false)} />}
                {filters.indigenous && <FilterPill label="Employers" onRemove={() => set('indigenous', false)} />}
              </div>

              {/* Featured strip (only on first page with no active filters) */}
              {page === 1 && !hasActiveFilters && (
                <div className="mb-8">
                  <p className="text-xs font-semibold text-[#6B3A2A]/50 uppercase tracking-wider mb-3">
                    Featured Listings
                  </p>
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                    {featured.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </motion.div>
                  <div className="my-8 border-t border-[#C8782A]/10" />
                  <p className="text-xs font-semibold text-[#6B3A2A]/50 uppercase tracking-wider mb-3">
                    All Listings
                  </p>
                </div>
              )}

              {/* Job grid */}
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#C8782A]/10 flex items-center justify-center mb-4">
                    <div className="h-8 w-8 rounded-full border-4 border-[#C8782A]/40 border-t-[#C8782A] animate-spin" />
                  </div>
                  <p className="text-[#6B3A2A]/60 text-sm">Loading jobs…</p>
                </motion.div>
              ) : fetchError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#C8782A]/10 flex items-center justify-center mb-4">
                    <Search size={24} className="text-[#C8782A]/50" />
                  </div>
                  <h3
                    className="text-xl font-bold text-[#1C1C1C] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Unable to load jobs
                  </h3>
                  <p className="text-[#6B3A2A]/60 text-sm mb-5 max-w-xs">
                    {fetchError}
                  </p>
                </motion.div>
              ) : paginated.length > 0 ? (
                <motion.div
                  key={`${page}-${JSON.stringify(filters)}`}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {paginated.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#C8782A]/10 flex items-center justify-center mb-4">
                    <Search size={24} className="text-[#C8782A]/50" />
                  </div>
                  <h3
                    className="text-xl font-bold text-[#1C1C1C] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found'}
                  </h3>
                  <p className="text-[#6B3A2A]/60 text-sm mb-5 max-w-xs">
                    {jobs.length === 0
                      ? 'Please check back soon.'
                      : 'Try adjusting your search terms or removing some filters.'}
                  </p>
                  {jobs.length !== 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearAll}
                      className="border-[#C8782A]/30 text-[#6B3A2A] hover:bg-[#C8782A]/5"
                    >
                      Clear all filters
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="border-[#C8782A]/25 text-[#6B3A2A] hover:bg-[#C8782A]/5 disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        page === i + 1
                          ? 'bg-[#C8782A] text-white shadow-sm'
                          : 'text-[#6B3A2A]/70 hover:bg-[#C8782A]/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="border-[#C8782A]/25 text-[#6B3A2A] hover:bg-[#C8782A]/5 disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
