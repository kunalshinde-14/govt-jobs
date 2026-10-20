import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Layers, SearchX } from "lucide-react";
import JobCard from "../components/JobCard";
import { isJobActive } from "../utils/jobHelpers";

export default function CategoryPage({
  jobs = [],
  isLoggedIn,
  setShowLogin,
  savedJobs = [],
  setSavedJobs,
}) {
  const { category } = useParams();
  const navigate = useNavigate();

  // Format clean display name
  const displayName = category
    ?.split(" ")
    ?.filter(Boolean)
    ?.map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1))
    ?.join(" ");

  // Filter jobs by category and active status
  const filteredJobs = jobs.filter((job) => {
    if (!job || !isJobActive(job)) return false;
    return job.department?.toLowerCase().includes(category?.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
      {/* BREADCRUMB */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#17243A] hover:text-[#F28C28] transition"
        >
          <ArrowLeft size={15} />
          <span>Back to All Jobs</span>
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-[#E4EAF3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-[#EAF2FF] text-[#17243A] border border-[#D7DFEB]">
              <Layers size={15} className="text-[#F28C28]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#23334D]">
              Sector Discovery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243A] tracking-tight">
            {displayName} Recruitments
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#66758A]">
          <span className="font-bold text-[#17243A] bg-white border border-[#E4EAF3] px-3 py-1 rounded-xl shadow-subtle">
            {filteredJobs.length}
          </span>
          <span>{filteredJobs.length === 1 ? "opening available" : "openings available"}</span>
        </div>
      </div>

      {/* RESULTS GRID OR EMPTY STATE */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-[#E4EAF3] rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-center justify-center mx-auto mb-4 text-[#66758A]">
            <SearchX size={24} className="text-[#F28C28]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#17243A] mb-2">
            No active {displayName} jobs
          </h2>
          <p className="text-xs sm:text-sm text-[#66758A] mb-6 max-w-md mx-auto leading-relaxed">
            There are currently no active vacancies listed under {displayName}. Check back soon or explore other departments.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07D1B] text-white text-sm font-semibold transition shadow-subtle"
          >
            <span>Explore Other Categories</span>
          </Link>
        </div>
      ) : (
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
    </div>
  );
}
