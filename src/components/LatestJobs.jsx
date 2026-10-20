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
    <section id="job-listings" className="px-4 sm:px-6 py-6 md:py-10 max-w-7xl mx-auto w-full">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 border-b border-[#E4EAF3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-[#EAF2FF] text-[#17243A] border border-[#D7DFEB]">
              <Sparkles size={15} className="text-[#F28C28]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#23334D]">
              Live Opportunities
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A] tracking-tight">
            Latest Government Jobs
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#66758A]">
          <span className="font-bold text-[#17243A] bg-white border border-[#E4EAF3] px-3 py-1 rounded-xl shadow-subtle">
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
              className="bg-white border border-[#E4EAF3] rounded-2xl p-5 shadow-card"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 w-24 shimmer rounded-lg"></div>
                <div className="h-5 w-5 shimmer rounded-full"></div>
              </div>
              <div className="h-6 w-3/4 shimmer rounded-lg mb-3"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-5 w-16 shimmer rounded-lg"></div>
                <div className="h-5 w-20 shimmer rounded-lg"></div>
              </div>
              <div className="h-4 w-1/2 shimmer rounded-lg mb-4"></div>
              <div className="pt-3 border-t border-[#E4EAF3] flex justify-between items-center">
                <div className="h-4 w-28 shimmer rounded-lg"></div>
                <div className="h-7 w-16 shimmer rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        /* EMPTY SEARCH / FILTER STATE */
        <div className="bg-white border border-[#E4EAF3] rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-center justify-center mx-auto mb-4 text-[#17243A]">
            <SearchX size={22} className="text-[#F28C28]" />
          </div>
          <h3 className="text-lg font-bold text-[#17243A] mb-1.5">
            No matching government jobs
          </h3>
          <p className="text-xs sm:text-sm text-[#66758A] mb-5 leading-relaxed">
            {hasFilterActive
              ? "We couldn't find any active vacancies matching your current filter criteria."
              : "There are currently no active vacancies in this view."}
          </p>
        </div>
      ) : (
        /* JOB GRID */
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
      )}
    </section>
  );
}
