import JobCard from "./JobCard";
import { isJobActive } from "../utils/jobHelpers";
import { Sparkles, SearchX } from "lucide-react";

export default function LatestJobs({
  jobs = [],
  loading,
  search = "",
  filters = { qualification: [], state: "" },
  isLoggedIn,
  setShowLogin,
  savedJobs = [],
  setSavedJobs,
}) {
  // Get closing soon IDs to avoid immediate visual duplication with ClosingSoon section
  const closingSoonIds = [...jobs]
    .filter((job) => isJobActive(job))
    .sort((a, b) => new Date(a.lastDate) - new Date(b.lastDate))
    .slice(0, 3)
    .map((job) => job._id);

  const cleanSearch = (search || "").toLowerCase().trim();

  // Filter jobs by active status, search keyword, and qualification/state filters
  const filteredJobs = jobs.filter((job) => {
    if (!job || !isJobActive(job)) return false;

    // Skip jobs displayed in the closing soon priority section if not actively searching
    if (!cleanSearch && filters.qualification.length === 0 && !filters.state) {
      if (closingSoonIds.includes(job._id)) return false;
    }

    const matchesSearch =
      cleanSearch === "" ||
      job.title?.toLowerCase().includes(cleanSearch) ||
      job.department?.toLowerCase().includes(cleanSearch) ||
      job.state?.toLowerCase().includes(cleanSearch);

    const matchesQualification =
      filters.qualification.length === 0 ||
      filters.qualification.some(
        (q) => q.toLowerCase() === (job.qualification || "").toLowerCase()
      );

    const matchesState =
      !filters.state ||
      filters.state === "" ||
      (job.state || "").toLowerCase() === filters.state.toLowerCase();

    return matchesSearch && matchesQualification && matchesState;
  });

  const hasFilterActive =
    cleanSearch !== "" ||
    filters.qualification.length > 0 ||
    Boolean(filters.state);

  return (
    <section id="job-listings" className="px-4 sm:px-6 py-8 md:py-12 max-w-7xl mx-auto w-full">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 border-b border-[#E8E5DE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#FFF8ED] text-[#F28C00]">
              <Sparkles size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
              Live Opportunities
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202521] tracking-tight">
            Latest Government Jobs
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#737873]">
          <span className="font-semibold text-[#202521] bg-white border border-[#E8E5DE] px-2.5 py-1 rounded-md shadow-subtle">
            {filteredJobs.length}
          </span>
          <span>
            {filteredJobs.length === 1 ? "opening found" : "openings found"}
          </span>
        </div>
      </div>

      {/* SKELETON LOADING STATE */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E8E5DE] rounded-xl p-5 shadow-card"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 w-24 shimmer rounded-md"></div>
                <div className="h-5 w-5 shimmer rounded-full"></div>
              </div>
              <div className="h-6 w-3/4 shimmer rounded-md mb-3"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-5 w-16 shimmer rounded"></div>
                <div className="h-5 w-20 shimmer rounded"></div>
              </div>
              <div className="h-4 w-1/2 shimmer rounded mb-4"></div>
              <div className="pt-3 border-t border-[#E8E5DE] flex justify-between items-center">
                <div className="h-4 w-28 shimmer rounded"></div>
                <div className="h-7 w-16 shimmer rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
              savedJobs={savedJobs}
              setSavedJobs={setSavedJobs}
            />
          ))}
        </div>
      ) : (
        /* REFINED EMPTY STATE */
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#E8E5DE] flex items-center justify-center mx-auto mb-4 text-[#737873]">
            <SearchX size={24} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#202521] mb-1.5">
            No matching vacancies found
          </h3>
          <p className="text-xs sm:text-sm text-[#737873] mb-6 max-w-md mx-auto leading-relaxed">
            We couldn’t find any active listings matching your current criteria.
            Try adjusting your search terms or clearing applied filters.
          </p>
          {hasFilterActive && (
            <div className="inline-flex">
              <span className="text-xs text-[#737873]">
                Try searching for general keywords like &ldquo;Bank&rdquo;, &ldquo;Police&rdquo;, or &ldquo;Clerk&rdquo;.
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}