import { useNavigate } from "react-router-dom";
import { Bookmark, ArrowRight, LogIn, Sparkles } from "lucide-react";
import JobCard from "../components/JobCard";

export default function SavedJobs({
  jobs = [],
  isLoggedIn,
  setShowLogin,
  savedJobs = [],
  setSavedJobs,
}) {
  const navigate = useNavigate();

  // Filter full job objects matching saved IDs
  const savedJobsList = jobs.filter((job) => savedJobs.includes(job?._id));

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 sm:p-10 shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-[#FFF8ED] border border-[#FDE0B2] text-[#F28C00] flex items-center justify-center mx-auto mb-4">
            <Bookmark size={22} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202521] mb-2">
            Access Your Saved Jobs
          </h2>
          <p className="text-sm text-[#737873] mb-6 leading-relaxed max-w-md mx-auto">
            Log in to view your bookmarked government opportunities, track approaching deadlines, and apply without losing track.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#202521] hover:bg-[#3D443F] text-white text-sm font-semibold transition shadow-subtle"
          >
            <LogIn size={16} />
            <span>Sign In to Continue</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-[#E8E5DE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#FFF8ED] text-[#F28C00]">
              <Bookmark size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
              Your Bookmarks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202521] tracking-tight">
            Saved Vacancies
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#737873]">
          <span className="font-semibold text-[#202521] bg-white border border-[#E8E5DE] px-2.5 py-1 rounded-md shadow-subtle">
            {savedJobsList.length}
          </span>
          <span>{savedJobsList.length === 1 ? "job saved" : "jobs saved"}</span>
        </div>
      </div>

      {savedJobsList.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-10 sm:p-16 text-center max-w-xl mx-auto shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#E8E5DE] flex items-center justify-center mx-auto mb-4 text-[#737873]">
            <Bookmark size={22} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#202521] mb-2">
            No saved jobs yet
          </h2>
          <p className="text-xs sm:text-sm text-[#737873] mb-6 max-w-md mx-auto leading-relaxed">
            Click the heart icon on any recruitment card to bookmark opportunities you want to revisit or apply for later.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F28C00] hover:bg-[#D97706] text-white text-sm font-semibold transition shadow-subtle"
          >
            <Sparkles size={16} />
            <span>Browse Active Jobs</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        /* SAVED JOBS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedJobsList.map((job) => (
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