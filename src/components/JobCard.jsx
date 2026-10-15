import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  Building2,
  ExternalLink,
  ArrowRight,
  Info,
  Clock,
  Banknote,
} from "lucide-react";
import BASE_URL from "../utils/api";

export default function JobCard({
  job,
  isLoggedIn,
  setShowLogin,
  savedJobs = [],
  setSavedJobs,
}) {
  const navigate = useNavigate();
  const isSaved = savedJobs.includes(job?._id);
  const [animating, setAnimating] = useState(false);

  if (!job) return null;

  // Closing soon logic (within 7 days)
  const isClosingSoon = (() => {
    if (!job?.lastDate) return false;
    const deadline = new Date(job.lastDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  })();

  const handleSave = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      if (setShowLogin) setShowLogin(true);
      return;
    }

    // Optimistic update
    if (isSaved) {
      setSavedJobs(savedJobs.filter((id) => id !== job._id));
    } else {
      setSavedJobs([...savedJobs, job._id]);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 250);
    }

    // Sync with backend
    try {
      const token = localStorage.getItem("token");
      if (isSaved) {
        await axios.delete(`${BASE_URL}/api/users/save-job/${job._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          `${BASE_URL}/api/users/save-job/${job._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      // Rollback on error
      if (isSaved) {
        setSavedJobs([...savedJobs, job._id]);
      } else {
        setSavedJobs(savedJobs.filter((id) => id !== job._id));
      }
      console.error("Save job toggle failed:", error);
    }
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (job?.applyLink) {
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      onClick={() => navigate(`/job/${job._id}`)}
      className="bg-white border border-[#E8E5DE] hover:border-[#F28C00]/50 rounded-xl p-5 shadow-card hover:shadow-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/job/${job._id}`);
        }
      }}
      aria-label={`View details for ${job.title}`}
    >
      <div>
        {/* TOP ROW: Department & Closing Soon Indicator & Save Button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#737873] bg-[#FAF8F3] border border-[#E8E5DE] px-2.5 py-1 rounded-md">
              <Building2 size={13} className="text-[#F28C00]" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">
                {job.department}
              </span>
            </span>

            {isClosingSoon && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                <Clock size={11} />
                <span>Closing Soon</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
            className="p-1.5 rounded-lg text-[#737873] hover:text-rose-500 hover:bg-[#FAF8F3] transition-all focus:outline-none"
            style={{
              transform: animating ? "scale(1.3)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          >
            <Heart
              size={19}
              fill={isSaved ? "#ef4444" : "none"}
              color={isSaved ? "#ef4444" : "#9BA09B"}
            />
          </button>
        </div>

        {/* JOB TITLE */}
        <h3 className="font-bold text-[#202521] text-base sm:text-lg leading-snug group-hover:text-[#F28C00] transition-colors mb-3 line-clamp-2">
          {job.title}
        </h3>

        {/* METADATA CHIPS */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <span className="text-xs font-medium text-[#3D443F] bg-[#FAF8F3] border border-[#E8E5DE] px-2 py-0.5 rounded">
            {job.qualification}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#737873] bg-[#FAF8F3] border border-[#E8E5DE] px-2 py-0.5 rounded">
            <MapPin size={12} className="text-[#737873]" />
            <span>{job.state}</span>
          </span>
          {job.vacancies > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#737873] bg-[#FAF8F3] border border-[#E8E5DE] px-2 py-0.5 rounded">
              <Users size={12} className="text-[#737873]" />
              <span>{job.vacancies} posts</span>
            </span>
          )}
        </div>

        {/* SALARY / STIPEND */}
        {job.salary && (
          <div className="flex items-center gap-1.5 text-xs text-[#202521] font-semibold mb-3">
            <Banknote size={14} className="text-[#F28C00] shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}

        {/* ACCESSIBLE ELIGIBILITY NOTES (Always visible, not hidden behind hover) */}
        {job.eligibilityNotes && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#FFF8ED] border border-[#FDE0B2] text-xs text-[#B45309] flex items-start gap-2">
            <Info size={14} className="text-[#F28C00] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold mr-1">Eligibility:</span>
              <span>{job.eligibilityNotes}</span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Deadline & Action Buttons */}
      <div className="pt-3 border-t border-[#E8E5DE] flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1 text-xs text-[#737873]">
          <Calendar size={13} className={isClosingSoon ? "text-rose-600" : "text-[#737873]"} />
          <span className={isClosingSoon ? "font-bold text-rose-600" : ""}>
            Last Date: {job.lastDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#737873] group-hover:text-[#F28C00] transition-colors inline-flex items-center gap-0.5">
            <span>Details</span>
            <ArrowRight size={13} />
          </span>

          <button
            type="button"
            onClick={handleApplyClick}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202521] hover:bg-[#F28C00] text-white text-xs font-semibold transition-colors shadow-subtle shrink-0"
            aria-label={`Apply directly for ${job.title}`}
          >
            <span>Apply</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}