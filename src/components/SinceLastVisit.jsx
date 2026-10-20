import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  CheckCircle,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  Sliders,
  Check,
  ChevronRight,
  Info,
} from "lucide-react";
import BASE_URL from "../utils/api";
import { formatCompactDate } from "../utils/jobHelpers";

export default function SinceLastVisit({
  isLoggedIn,
  onOpenPreferences,
}) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCaughtUp, setIsCaughtUp] = useState(false);
  const [sinceDate, setSinceDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (isMounted) setLoading(true);

        // 1. Record session visit
        await axios.post(
          `${BASE_URL}/api/users/visit`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 2. Fetch new matching opportunities
        const res = await axios.get(`${BASE_URL}/api/users/since-last-visit`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setOpportunities(res.data?.opportunities || []);
          setIsCaughtUp(Boolean(res.data?.isCaughtUp));
          setSinceDate(res.data?.sinceDate ? new Date(res.data.sinceDate) : null);
        }
      } catch (err) {
        console.error("Since last visit error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // Mark one or more jobs as seen so they are not surfaced repeatedly
  const markAsSeen = async (jobIds) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `${BASE_URL}/api/users/mark-seen`,
        { jobIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOpportunities((prev) =>
        prev.filter((item) => !jobIds.includes(item.job._id))
      );
      if (opportunities.length <= jobIds.length) {
        setIsCaughtUp(true);
      }
    } catch (err) {
      console.error("Mark seen error:", err);
    }
  };

  const handleCardClick = (jobId) => {
    markAsSeen([jobId]);
    navigate(`/job/${jobId}`);
  };

  if (!isLoggedIn) {
    return null;
  }

  // Format date helper
  const formattedSinceDate = sinceDate
    ? sinceDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "your last visit";

  return (
    <section className="px-4 sm:px-6 py-6 md:py-8 max-w-7xl mx-auto w-full">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 border-b border-[#E4EAF3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-[#EAF2FF] text-[#17243A] border border-[#D7DFEB]">
              <Sparkles size={15} className="text-[#F28C28]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#23334D]">
              Personalized Radar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A] tracking-tight">
            Since Your Last Visit
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {opportunities.length > 0 && (
            <button
              type="button"
              onClick={() => markAsSeen(opportunities.map((o) => o.job._id))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E4EAF3] hover:border-[#159B82] hover:text-[#159B82] text-xs font-semibold text-[#66758A] transition shadow-subtle"
            >
              <Check size={13} />
              <span>Mark all as seen</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPreferences}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#D7DFEB] border border-[#D7DFEB] text-xs font-semibold text-[#17243A] transition shadow-subtle"
          >
            <Sliders size={13} className="text-[#F28C28]" />
            <span>Edit Matching Criteria</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E4EAF3] rounded-2xl p-5 shadow-card"
            >
              <div className="h-5 w-28 shimmer rounded-lg mb-3"></div>
              <div className="h-6 w-3/4 shimmer rounded-lg mb-3"></div>
              <div className="h-4 w-1/2 shimmer rounded-lg mb-4"></div>
              <div className="h-8 w-full shimmer rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : isCaughtUp || opportunities.length === 0 ? (
        /* HONEST CAUGHT-UP STATE */
        <div className="bg-white border border-[#E4EAF3] rounded-3xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F7F4] border border-[#B7E8DF] text-[#159B82] flex items-center justify-center mx-auto mb-3.5 shadow-subtle">
            <CheckCircle size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#17243A] mb-1">
            You&apos;re completely caught up!
          </h3>
          <p className="text-xs sm:text-sm text-[#66758A] mb-4 max-w-md mx-auto leading-relaxed">
            No new government vacancies matching your preferences have been posted since{" "}
            <strong className="text-[#17243A]">{formattedSinceDate}</strong>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenPreferences}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#F28C28] hover:text-[#E07D1B] hover:underline"
            >
              <span>Update your preferences</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        /* NEW MATCHING OPPORTUNITIES FEED */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map(({ job, matchReasons, matchType, disclaimer }) => {
            return (
              <div
                key={job._id}
                onClick={() => handleCardClick(job._id)}
                className="bg-white border border-[#E4EAF3] hover:border-[#F28C28] rounded-2xl p-5 shadow-card hover:shadow-hover transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* MATCH HEADER & BADGE */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23334D] bg-[#EAF2FF] border border-[#D7DFEB] px-2.5 py-1 rounded-lg">
                      <Building2 size={13} className="text-[#F28C28]" />
                      <span className="truncate max-w-[150px]">{job.department}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159B82] bg-[#E8F7F4] border border-[#B7E8DF] px-2.5 py-0.5 rounded-full">
                      <Sparkles size={11} />
                      <span>
                        {matchType === "confirmed_criteria"
                          ? "Confirmed Match"
                          : "New Matching Post"}
                      </span>
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="font-bold text-[#17243A] text-base group-hover:text-[#F28C28] transition-colors mb-2.5 line-clamp-2">
                    {job.title}
                  </h3>

                  {/* METADATA */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs font-semibold text-[#23334D] bg-[#F7F8FC] border border-[#E4EAF3] px-2 py-0.5 rounded-lg">
                      {job.qualification}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#66758A] bg-[#F7F8FC] border border-[#E4EAF3] px-2 py-0.5 rounded-lg">
                      <MapPin size={11} />
                      <span>{job.state}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#66758A] bg-[#F7F8FC] border border-[#E4EAF3] px-2 py-0.5 rounded-lg">
                      <Clock size={11} className="text-[#F28C28]" />
                      <span>Last Date: {formatCompactDate(job.lastDate)}</span>
                    </span>
                  </div>

                  {/* TRANSPARENT MATCH EXPLANATIONS */}
                  {matchReasons && matchReasons.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {matchReasons.slice(0, 2).map((reason, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs font-medium text-[#23334D]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#159B82] shrink-0"></span>
                          <span className="truncate">{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NON-GUARANTEED ELIGIBILITY DISCLAIMER */}
                  <div className="flex items-start gap-1.5 text-[11px] text-[#66758A] bg-[#F7F8FC] border border-[#E4EAF3] p-2 rounded-xl mb-3">
                    <Info size={12} className="text-[#F28C28] shrink-0 mt-0.5" />
                    <span className="leading-tight line-clamp-1">{disclaimer}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-3 border-t border-[#E4EAF3] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsSeen([job._id]);
                    }}
                    className="text-xs font-semibold text-[#66758A] hover:text-[#17243A] hover:underline"
                  >
                    Dismiss from New
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#66758A] group-hover:text-[#17243A] transition inline-flex items-center gap-0.5">
                      <span>View Details</span>
                      <ChevronRight size={13} />
                    </span>

                    {job.applyLink && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsSeen([job._id]);
                          window.open(job.applyLink, "_blank", "noopener,noreferrer");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F28C28] hover:bg-[#E07D1B] text-white text-xs font-semibold transition shadow-subtle"
                      >
                        <span>Apply</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
