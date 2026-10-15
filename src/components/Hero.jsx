import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  Briefcase,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileX2,
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

  // Dynamic real stats calculated from verified jobs
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
    // Smooth scroll to listings if available
    const listingsElement = document.getElementById("job-listings");
    if (listingsElement) {
      listingsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-8 pb-10 md:pt-12 md:pb-14 px-4 sm:px-6 bg-[#FAF8F3] border-b border-[#E8E5DE]">
      <div className="max-w-4xl mx-auto text-center">
        {/* EDITORIAL BADGE */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8ED] border border-[#FDE0B2] text-[#B45309] text-xs font-semibold tracking-wide uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F28C00]"></span>
          Verified Government Recruitments
        </div>

        {/* HEADLINE */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202521] tracking-tight leading-[1.15] mb-4">
          Your next government job{" "}
          <span className="relative inline-block text-[#F28C00]">
            starts here.
            <svg
              className="absolute -bottom-1 left-0 w-full h-2 text-[#FDE0B2] -z-10"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,15 Q50,0 100,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </span>
        </h1>

        {/* SUPPORTING TEXT */}
        <p className="text-sm sm:text-base md:text-lg text-[#737873] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Discover verified government opportunities across India. Check eligibility, track official deadlines, and apply directly through authorized recruitment portals.
        </p>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-2xl mx-auto mb-5"
        >
          <div className="relative flex items-center bg-white border border-[#E8E5DE] rounded-xl shadow-subtle hover:border-[#737873]/50 focus-within:border-[#F28C00] focus-within:ring-2 focus-within:ring-[#F28C00]/20 transition-all">
            <div className="pl-4 pr-2 text-[#737873] pointer-events-none">
              <Search size={18} />
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
              className="w-full py-3.5 pr-2 bg-transparent text-sm md:text-base text-[#202521] placeholder-[#737873] focus:outline-none"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search input"
                className="p-1.5 mr-1 text-[#737873] hover:text-[#202521] hover:bg-[#E8E5DE]/40 rounded-md transition"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              className="mr-2 px-4 py-2 rounded-lg bg-[#F28C00] hover:bg-[#D97706] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-subtle shrink-0"
            >
              <Search size={14} className="hidden sm:inline" />
              <span>Search</span>
            </button>
          </div>

          {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
          {showDropdown && query && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E8E5DE] rounded-xl shadow-card z-40 text-left overflow-hidden max-h-72 overflow-y-auto">
              {suggestions.length > 0 ? (
                <div>
                  <div className="px-3.5 py-2 text-[11px] font-semibold text-[#737873] uppercase tracking-wider bg-[#FAF8F3] border-b border-[#E8E5DE]">
                    Matching Opportunities
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
                      className="w-full px-4 py-2.5 hover:bg-[#FFF8ED] text-left border-b border-[#E8E5DE]/60 last:border-b-0 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#202521] group-hover:text-[#F28C00]">
                          {job.title}
                        </div>
                        <div className="text-xs text-[#737873]">
                          {job.department} • {job.state}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#737873] bg-[#F5F2EA] px-2 py-0.5 rounded">
                        {job.qualification}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-[#737873] text-center">
                  No matching jobs found for &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          )}
        </form>

        {/* LIVE REAL-TIME STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-8">
          <div className="bg-white border border-[#E8E5DE] rounded-xl p-3 shadow-subtle text-center">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Briefcase size={14} className="text-[#F28C00]" />
              <span className="text-lg md:text-xl font-bold text-[#202521]">
                {totalJobs}
              </span>
            </div>
            <div className="text-xs text-[#737873] font-medium">
              Active Vacancies
            </div>
          </div>

          <div className="bg-white border border-[#E8E5DE] rounded-xl p-3 shadow-subtle text-center">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Clock size={14} className="text-rose-600" />
              <span className="text-lg md:text-xl font-bold text-rose-600">
                {closingThisWeek}
              </span>
            </div>
            <div className="text-xs text-[#737873] font-medium">
              Closing This Week
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white border border-[#E8E5DE] rounded-xl p-3 shadow-subtle text-center">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Users size={14} className="text-emerald-700" />
              <span className="text-lg md:text-xl font-bold text-emerald-700">
                {totalVacancies > 0 ? totalVacancies.toLocaleString("en-IN") : "—"}
              </span>
            </div>
            <div className="text-xs text-[#737873] font-medium">
              Total Posts
            </div>
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="max-w-3xl mx-auto bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 shadow-subtle text-left mb-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#202521] uppercase tracking-wider">
              <GraduationCap size={15} className="text-[#F28C00]" />
              <span>Filter by Qualification</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-[#F28C00] hover:text-[#D97706] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Qualification Chips */}
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#F28C00] text-white border-[#F28C00] shadow-subtle font-semibold"
                      : "bg-[#FAF8F3] text-[#3D443F] border-[#E8E5DE] hover:border-[#737873] hover:bg-white"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span>{item} Pass</span>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>

          {/* State Navigation / Filter */}
          <div className="pt-3 border-t border-[#E8E5DE]/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#202521] uppercase tracking-wider mb-2.5">
              <MapPin size={14} className="text-[#F28C00]" />
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
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-[#737873] bg-[#FAF8F3] border border-[#E8E5DE] hover:text-[#202521] hover:border-[#737873] hover:bg-white transition-colors"
                >
                  {state.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* TRUST STRIP */}
        <div className="border-t border-[#E8E5DE] pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-[#3D443F] bg-white border border-[#E8E5DE] rounded-lg">
              <ExternalLink size={14} className="text-[#F28C00] shrink-0" />
              <span>Official Links Only</span>
            </div>

            <div className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-[#3D443F] bg-white border border-[#E8E5DE] rounded-lg">
              <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
              <span>No Expired Listings</span>
            </div>

            <div className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-[#3D443F] bg-white border border-[#E8E5DE] rounded-lg">
              <FileX2 size={14} className="text-[#F28C00] shrink-0" />
              <span>No Forms Hosted</span>
            </div>

            <div className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-[#3D443F] bg-white border border-[#E8E5DE] rounded-lg">
              <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
              <span>100% Free Portal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}