import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, SearchX } from "lucide-react";
import JobCard from "../components/JobCard";
import { isJobActive } from "../utils/jobHelpers";

export default function StatePage({
  jobs = [],
  isLoggedIn,
  setShowLogin,
  savedJobs = [],
  setSavedJobs,
}) {
  const { state } = useParams();
  const navigate = useNavigate();

  const formattedState = state
    ?.split("-")
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    ?.join(" ");

  const stateJobs = jobs.filter((job) => {
    if (!job || !isJobActive(job)) return false;
    const jobState = (job.state || "").toLowerCase();
    const currentState = (formattedState || "").toLowerCase();
    return jobState === currentState || jobState === "all india";
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
              <MapPin size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
              Regional Opportunities
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202521] tracking-tight">
            Government Jobs in {formattedState}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#737873]">
          <span className="font-semibold text-[#202521] bg-white border border-[#E8E5DE] px-2.5 py-1 rounded-md shadow-subtle">
            {stateJobs.length}
          </span>
          <span>{stateJobs.length === 1 ? "vacancy available" : "vacancies available"}</span>
        </div>
      </div>

      {/* RESULTS GRID OR EMPTY STATE */}
      {stateJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stateJobs.map((job) => (
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
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-10 sm:p-16 text-center max-w-xl mx-auto shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#E8E5DE] flex items-center justify-center mx-auto mb-4 text-[#737873]">
            <SearchX size={24} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#202521] mb-2">
            No active jobs in {formattedState}
          </h2>
          <p className="text-xs sm:text-sm text-[#737873] mb-6 max-w-md mx-auto leading-relaxed">
            There are currently no active state-specific vacancies listed for {formattedState}.
            Explore All India listings or other states.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202521] hover:bg-[#3D443F] text-white text-sm font-semibold transition shadow-subtle"
          >
            <span>Explore All Vacancies</span>
          </Link>
        </div>
      )}
    </div>
  );
}