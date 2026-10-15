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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#202521] hover:text-[#F28C00] transition"
        >
          <ArrowLeft size={15} />
          <span>Back to All Jobs</span>
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-[#E8E5DE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#FFF8ED] text-[#F28C00]">
              <Layers size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
              Sector Discovery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202521] tracking-tight">
            {displayName} Recruitments
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#737873]">
          <span className="font-semibold text-[#202521] bg-white border border-[#E8E5DE] px-2.5 py-1 rounded-md shadow-subtle">
            {filteredJobs.length}
          </span>
          <span>{filteredJobs.length === 1 ? "opening available" : "openings available"}</span>
        </div>
      </div>

      {/* RESULTS GRID OR EMPTY STATE */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-10 sm:p-16 text-center max-w-xl mx-auto shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#E8E5DE] flex items-center justify-center mx-auto mb-4 text-[#737873]">
            <SearchX size={24} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#202521] mb-2">
            No active {displayName} jobs
          </h2>
          <p className="text-xs sm:text-sm text-[#737873] mb-6 max-w-md mx-auto leading-relaxed">
            There are currently no active vacancies listed under {displayName}. Check back soon or explore other departments.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202521] hover:bg-[#3D443F] text-white text-sm font-semibold transition shadow-subtle"
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