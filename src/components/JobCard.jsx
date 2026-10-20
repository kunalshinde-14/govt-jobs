import { useState, useEffect } from "react";
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
import { formatCompactDate, getJobCountdown } from "../utils/jobHelpers";

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
  const [now, setNow] = useState(() => Date.now());

  const lastDate = job?.lastDate;
  const status = job?.status;

  // Real-time 1-second interval timer for active countdowns
  useEffect(() => {
    const initialCountdown = getJobCountdown(lastDate, status, Date.now());
    if (!initialCountdown || initialCountdown.status === "closed") {
      return;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastDate, status]);

  if (!job) return null;

  // Real-time Asia/Kolkata countdown and expired check
  const countdown = getJobCountdown(job, job?.status, now);
  const isClosed =
    countdown?.status === "closed" ||
    job?.status === "expired" ||
    job?.status === "archived";
  const formattedDate = formatCompactDate(job?.lastDate);

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
    if (isClosed) return;
    if (job?.applyLink) {
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      onClick={() => navigate(`/job/${job._id}`)}
      className="bg-white border border-[#E4EAF3] hover:border-[#B8C4D4] rounded-2xl p-5 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
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
        {/* TOP ROW: Department & Save Interaction */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23334D] bg-[#EAF2FF] border border-[#D7DFEB] px-2.5 py-1 rounded-lg">
              <Building2 size={13} className="text-[#F28C28]" />
              <span className="truncate max-w-[180px] sm:max-w-[240px]">
                {job.department}
              </span>
            </span>

            {isClosed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#66758A] bg-[#F0F4FA] border border-[#D7DFEB] px-2 py-0.5 rounded-full">
                <span>Closed</span>
              </span>
            ) : countdown?.isUrgent ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E84D62] bg-[#FDF0F2] border border-[#FAC7CF] px-2 py-0.5 rounded-full">
                <Clock size={11} />
                <span>Closing Soon</span>
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
            className="p-1.5 rounded-xl text-[#66758A] hover:text-[#E84D62] hover:bg-[#FDF0F2] transition-all focus:outline-none"
            style={{
              transform: animating ? "scale(1.25)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          >
            <Heart
              size={18}
              fill={isSaved ? "#E84D62" : "none"}
              color={isSaved ? "#E84D62" : "#96A4B7"}
            />
          </button>
        </div>

        {/* JOB TITLE */}
        <h3 className="font-bold text-[#17243A] text-base sm:text-lg leading-snug group-hover:text-[#F28C28] transition-colors mb-3 line-clamp-2">
          {job.title}
        </h3>

        {/* METADATA CHIPS */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <span className="text-xs font-semibold text-[#23334D] bg-[#F7F8FC] border border-[#E4EAF3] px-2.5 py-0.5 rounded-lg">
            {job.qualification}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#66758A] bg-[#F7F8FC] border border-[#E4EAF3] px-2.5 py-0.5 rounded-lg">
            <MapPin size={12} className="text-[#66758A]" />
            <span>{job.state}</span>
          </span>
          {job.vacancies > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#159B82] bg-[#E8F7F4] border border-[#B7E8DF] px-2.5 py-0.5 rounded-lg">
              <Users size={12} className="text-[#159B82]" />
              <span>{job.vacancies} vacancies</span>
            </span>
          )}
        </div>

        {/* SALARY / STIPEND */}
        {job.salary && (
          <div className="flex items-center gap-1.5 text-xs text-[#17243A] font-semibold mb-3">
            <Banknote size={14} className="text-[#F28C28] shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}

        {/* ELIGIBILITY SUMMARY IN SOFT TINTED PANEL */}
        {job.eligibilityNotes && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#EAF2FF] border border-[#D7DFEB] text-xs text-[#23334D] flex items-start gap-2 shadow-subtle">
            <Info size={14} className="text-[#F28C28] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#17243A] mr-1">Eligibility:</span>
              <span>{job.eligibilityNotes}</span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Deadline & Action Area */}
      <div className="pt-3 border-t border-[#E4EAF3] flex items-center justify-between gap-2 mt-2">
        {/* Left: Compact Deadline + Real-Time Countdown Badge */}
        <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 text-xs text-[#66758A] shrink-0">
            <Calendar
              size={13}
              className={
                isClosed
                  ? "text-[#8C9BAE]"
                  : countdown?.isUrgent
                  ? "text-[#E84D62]"
                  : "text-[#66758A]"
              }
            />
            <span
              className={
                isClosed
                  ? "line-through text-[#8C9BAE]"
                  : countdown?.isUrgent
                  ? "font-semibold text-[#E84D62]"
                  : "text-[#344663] font-medium"
              }
            >
              {formattedDate || "Refer Notification"}
            </span>
          </div>

          {countdown && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums shrink-0 ${
                isClosed
                  ? "bg-[#F0F4FA] text-[#66758A] border border-[#D7DFEB]"
                  : countdown.isUrgent
                  ? "bg-[#FDF0F2] text-[#E84D62] border border-[#FAC7CF]"
                  : "bg-[#F7F8FC] text-[#66758A] border border-[#E4EAF3]"
              }`}
              aria-label={
                isClosed
                  ? "Application deadline passed"
                  : `Time remaining: ${countdown.text}`
              }
            >
              {countdown.text}
            </span>
          )}
        </div>

        {/* Right: View Details + Prominent Saffron Apply */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#66758A] group-hover:text-[#17243A] transition-colors inline-flex items-center gap-0.5">
            <span>Details</span>
            <ArrowRight size={13} />
          </span>

          {isClosed ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0F4FA] text-[#8C9BAE] border border-[#E4EAF3] text-xs font-semibold cursor-not-allowed shrink-0"
              aria-label={`Applications closed for ${job.title}`}
              title="Applications are closed for this vacancy"
            >
              <span>Closed</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyClick}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#F28C28] hover:bg-[#E07D1B] text-white text-xs font-semibold transition-colors shadow-subtle shrink-0"
              aria-label={`Apply directly for ${job.title}`}
            >
              <span>Apply</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
