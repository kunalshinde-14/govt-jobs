import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  Briefcase,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";

export default function Hero({
  jobs = [],
  search = "",
  setSearch,
  filters,
  setFilters,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const query = (search || "").toLowerCase().trim();

  const suggestions = jobs.filter((job) =>
    job?.title?.toLowerCase().includes(query)
  );

  // Dynamic real stats calculated strictly from verified active jobs
  const totalJobs = jobs.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const closingThisWeek = jobs.filter((job) => {
    if (!job?.lastDate) return false;
    const deadline = new Date(job.lastDate);
    return deadline >= today && deadline <= oneWeekLater;
  }).length;

  const totalVacancies = jobs.reduce(
    (sum, job) => sum + (Number(job?.vacancies) || 0),
    0
  );

  const hasActiveFilters =
    filters.qualification.length > 0 || (filters.state && filters.state !== "");

  const handleClearSearch = () => {
    setSearch("");
    setShowDropdown(false);
  };

  const handleClearFilters = () => {
    setFilters({ qualification: [], state: "" });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    const listingsElement = document.getElementById("job-listings");
    if (listingsElement) {
      listingsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-8 pb-10 md:pt-14 md:pb-16 px-4 sm:px-6 bg-[#F7F8FC] border-b border-[#E4EAF3] overflow-hidden">
      {/* SUBTLE INDIAN GEOMETRIC LINEWORK BACKGROUND (Abstract architectural / rangoli motif) */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-40"
        aria-hidden="true"
      >
        <svg
          className="absolute -top-12 -left-12 w-96 h-96 text-[#B8C4D4]"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />
          <circle cx="200" cy="200" r="110" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
          <path d="M200 40 L200 360 M40 200 L360 200" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          <polygon points="200,80 320,200 200,320 80,200" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        </svg>
        <svg
          className="absolute -bottom-16 -right-16 w-96 h-96 text-[#B8C4D4]"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <polygon points="200,60 340,200 200,340 60,200" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          <path d="M100 100 L300 300 M300 100 L100 300" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* EDITORIAL RECRUITMENT BADGE */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2FF] border border-[#D7DFEB] text-[#23334D] text-xs font-semibold tracking-wide uppercase mb-4 shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-[#159B82] animate-pulse"></span>
          <span>Verified Government Recruitments</span>
        </div>

        {/* HEADLINE */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#17243A] tracking-tight leading-[1.18] mb-4">
          Your next opportunity{" "}
          <span className="relative inline-block text-[#F28C28]">
            starts here.
            <svg
              className="absolute -bottom-1 left-0 w-full h-2 text-[#FDD8B3] -z-10"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,15 Q50,2 100,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </span>
        </h1>

        {/* SUPPORTING TEXT */}
        <p className="text-sm sm:text-base md:text-lg text-[#66758A] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Explore verified government jobs across India, all in one place. Official notifications, transparent qualifications, and direct application links.
        </p>

        {/* LARGE ROUNDED SEARCH PANEL */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-2xl mx-auto mb-8"
        >
          <div className="relative flex items-center bg-white border border-[#E4EAF3] rounded-2xl shadow-card hover:border-[#B8C4D4] focus-within:border-[#F28C28] focus-within:ring-4 focus-within:ring-[#F28C28]/15 transition-all p-1.5 sm:p-2">
            <div className="pl-3.5 pr-2 text-[#66758A] pointer-events-none">
              <Search size={20} />
            </div>

            <input
              type="text"
              value={search || ""}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                setTimeout(() => setShowDropdown(false), 200);
              }}
              placeholder="Search by job title, department, or keyword..."
              aria-label="Search jobs"
              className="w-full py-2.5 sm:py-3 pr-2 bg-transparent text-sm md:text-base text-[#17243A] placeholder-[#66758A] focus:outline-none"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search input"
                className="p-1.5 mr-1 text-[#66758A] hover:text-[#17243A] hover:bg-[#EAF2FF] rounded-lg transition"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-[#F28C28] hover:bg-[#E07D1B] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-subtle shrink-0"
            >
              <Search size={15} className="hidden sm:inline" />
              <span>Search</span>
            </button>
          </div>

          {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
          {showDropdown && query && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E4EAF3] rounded-2xl shadow-floating z-40 text-left overflow-hidden max-h-72 overflow-y-auto">
              {suggestions.length > 0 ? (
                <div>
                  <div className="px-4 py-2 text-[11px] font-semibold text-[#66758A] uppercase tracking-wider bg-[#F7F8FC] border-b border-[#E4EAF3]">
                    Matching Opportunities ({suggestions.length})
                  </div>
                  {suggestions.slice(0, 6).map((job) => (
                    <button
                      key={job._id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(job.title);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-[#EAF2FF] text-left border-b border-[#E4EAF3]/70 last:border-b-0 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#17243A] group-hover:text-[#F28C28]">
                          {job.title}
                        </div>
                        <div className="text-xs text-[#66758A]">
                          {job.department} • {job.state}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#23334D] bg-[#EAF2FF] border border-[#D7DFEB] px-2.5 py-0.5 rounded-lg">
                        {job.qualification}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-xs text-[#66758A] text-center">
                  No matching recruitments found for &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          )}
        </form>

        {/* THREE FLOATING STATISTIC CARDS (REAL DATA CONNECTED) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto mb-8">
          {/* Active Vacancies */}
          <div className="bg-white border border-[#E4EAF3] rounded-2xl p-4 shadow-card hover:shadow-hover transition-all text-left flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-center justify-center text-[#17243A] shrink-0">
              <Briefcase size={22} className="text-[#F28C28]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#17243A] leading-tight">
                {totalJobs}
              </div>
              <div className="text-xs font-semibold text-[#66758A]">
                Active Vacancies
              </div>
            </div>
          </div>

          {/* Closing This Week */}
          <div className="bg-white border border-[#E4EAF3] rounded-2xl p-4 shadow-card hover:shadow-hover transition-all text-left flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FDF0F2] border border-[#FAC7CF] flex items-center justify-center text-[#E84D62] shrink-0">
              <Clock size={22} className="text-[#E84D62]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#E84D62] leading-tight">
                {closingThisWeek}
              </div>
              <div className="text-xs font-semibold text-[#66758A]">
                Closing This Week
              </div>
            </div>
          </div>

          {/* Total Opportunities */}
          <div className="bg-white border border-[#E4EAF3] rounded-2xl p-4 shadow-card hover:shadow-hover transition-all text-left flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E8F7F4] border border-[#B7E8DF] flex items-center justify-center text-[#159B82] shrink-0">
              <Users size={22} className="text-[#159B82]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#159B82] leading-tight">
                {totalVacancies > 0 ? totalVacancies.toLocaleString("en-IN") : "Verified"}
              </div>
              <div className="text-xs font-semibold text-[#66758A]">
                Total Opportunities
              </div>
            </div>
          </div>
        </div>

        {/* QUALIFICATION & STATE FILTERS DASHBOARD PANEL */}
        <div className="max-w-3xl mx-auto bg-white border border-[#E4EAF3] rounded-2xl p-4 sm:p-5 shadow-card text-left mb-8">
          <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#17243A] uppercase tracking-wider">
              <GraduationCap size={16} className="text-[#F28C28]" />
              <span>Filter by Qualification</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-[#F28C28] hover:text-[#E07D1B] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Qualification Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["10th", "12th", "Graduate"].map((item) => {
              const isSelected = filters.qualification.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => {
                      const exists = prev.qualification.includes(item);
                      return {
                        ...prev,
                        qualification: exists
                          ? prev.qualification.filter((q) => q !== item)
                          : [...prev.qualification, item],
                      };
                    })
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#F28C28] text-white border-[#F28C28] shadow-subtle"
                      : "bg-[#F7F8FC] text-[#23334D] border-[#E4EAF3] hover:border-[#B8C4D4] hover:bg-[#EAF2FF]"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span>{item} Pass</span>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>

          {/* State Exploration Chips */}
          <div className="pt-3 border-t border-[#E4EAF3]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#17243A] uppercase tracking-wider mb-2.5">
              <MapPin size={14} className="text-[#F28C28]" />
              <span>Explore by State</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "Maharashtra", slug: "maharashtra" },
                { name: "Bihar", slug: "bihar" },
                { name: "Rajasthan", slug: "rajasthan" },
                { name: "Uttar Pradesh", slug: "uttar-pradesh" },
                { name: "Punjab", slug: "punjab" },
                { name: "Delhi", slug: "delhi" },
                { name: "Tamil Nadu", slug: "tamil-nadu" },
              ].map((state) => (
                <Link
                  key={state.slug}
                  to={`/state/${state.slug}`}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-[#66758A] bg-[#F7F8FC] border border-[#E4EAF3] hover:text-[#17243A] hover:border-[#B8C4D4] hover:bg-[#EAF2FF] transition-colors"
                >
                  {state.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* TRUST STRIP (RESTRAINED METRICS) */}
        <div className="pt-4 border-t border-[#E4EAF3]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-[#23334D] bg-white border border-[#E4EAF3] rounded-xl shadow-subtle">
              <ExternalLink size={14} className="text-[#F28C28] shrink-0" />
              <span>Official Links Only</span>
            </div>

            <div className="flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-[#23334D] bg-white border border-[#E4EAF3] rounded-xl shadow-subtle">
              <ShieldCheck size={14} className="text-[#159B82] shrink-0" />
              <span>No Expired Listings</span>
            </div>

            <div className="flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-[#23334D] bg-white border border-[#E4EAF3] rounded-xl shadow-subtle">
              <FileCheck size={14} className="text-[#F28C28] shrink-0" />
              <span>No Forms Hosted</span>
            </div>

            <div className="flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-[#23334D] bg-white border border-[#E4EAF3] rounded-xl shadow-subtle">
              <CheckCircle2 size={14} className="text-[#159B82] shrink-0" />
              <span>100% Free Portal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
