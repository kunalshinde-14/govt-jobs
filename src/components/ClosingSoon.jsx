import JobCard from "./JobCard";
import { isJobActive } from "../utils/jobHelpers";
import { Clock } from "lucide-react";

export default function ClosingSoon({
  jobs = [],
  loading,
  isLoggedIn,
  setShowLogin,
  savedJobs = [],
  setSavedJobs,
}) {
  // Filter active jobs only (never show expired listings)
  const activeJobs = jobs.filter((job) => isJobActive(job));

  // Sort by deadline ascending and deduplicate by _id
  const closingJobs = [...activeJobs]
    .sort((a, b) => new Date(a.lastDate) - new Date(b.lastDate))
    .filter(
      (job, index, self) => index === self.findIndex((j) => j._id === job._id)
    )
    .slice(0, 6);

  if (!loading && closingJobs.length === 0) {
    return null;
  }

  return (
    <section className="px-4 sm:px-6 py-6 md:py-8 max-w-7xl mx-auto w-full">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 border-b border-[#E4EAF3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-[#FDF0F2] text-[#E84D62] border border-[#FAC7CF]">
              <Clock size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E84D62]">
              Urgent Deadlines
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A] tracking-tight">
            Closing Soon
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#66758A]">
          Act promptly before official recruitment portals close applications.
        </p>
      </div>

      {/* SKELETON LOADING STATE */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {closingJobs.map((job) => (
            <JobCard
              key={`closing-${job._id}`}
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
