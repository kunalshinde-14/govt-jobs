import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Users,
  Banknote,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Info,
  Clock,
} from "lucide-react";
import { formatCompactDate, getJobCountdown } from "../utils/jobHelpers";

export default function JobPage({ jobs = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Scroll to top upon mounting
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Find job from array
  const job = jobs.find((j) => j._id === id);

  // SEO document title
  useEffect(() => {
    if (job) {
      document.title = `${job.title} — Official Recruitment | JanSetu`;
    } else {
      document.title = "Job Details | JanSetu";
    }
  }, [job]);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-center justify-center mx-auto mb-4 text-[#66758A]">
          <Info size={24} className="text-[#F28C28]" />
        </div>
        <h2 className="text-xl font-bold text-[#17243A] mb-2">
          Recruitment Listing Not Found
        </h2>
        <p className="text-sm text-[#66758A] mb-6">
          The requested job may have expired or the link is incorrect.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#17243A] text-white text-sm font-semibold hover:bg-[#23334D] transition"
        >
          <ArrowLeft size={16} />
          <span>Browse Active Vacancies</span>
        </button>
      </div>
    );
  }

  // Countdown & formatted date
  const countdown = getJobCountdown(job, job?.status);
  const isClosed =
    countdown?.status === "closed" ||
    job?.status === "expired" ||
    job?.status === "archived";
  const formattedDate = formatCompactDate(job?.lastDate);
  const isClosingSoon = Boolean(countdown && countdown.isUrgent && !isClosed);

  // Extract hostname safely from apply link
  const domain = (() => {
    try {
      const parsed = new URL(job.applyLink);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "Official Website";
    }
  })();

  return (
    <div className="w-full pb-28 md:pb-16 bg-[#F7F8FC]">
      {/* TOP NAVIGATION BREADCRUMB */}
      <div className="border-b border-[#E4EAF3] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 text-xs text-[#66758A]">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 font-semibold text-[#17243A] hover:text-[#F28C28] transition"
          >
            <ArrowLeft size={15} />
            <span>Back to listings</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 truncate">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="truncate max-w-[140px]">{job.department}</span>
            <span>/</span>
            <span className="text-[#17243A] font-semibold truncate max-w-[200px]">
              {job.title}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* HEADER HERO CARD */}
        <div className="bg-white border border-[#E4EAF3] rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23334D] bg-[#EAF2FF] border border-[#D7DFEB] px-3 py-1 rounded-xl">
              <Building2 size={14} className="text-[#F28C28]" />
              <span>{job.department}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#66758A] bg-[#F7F8FC] border border-[#E4EAF3] px-3 py-1 rounded-xl">
              <MapPin size={13} />
              <span>{job.state}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#23334D] bg-[#F7F8FC] border border-[#E4EAF3] px-3 py-1 rounded-xl">
              <GraduationCap size={14} className="text-[#F28C28]" />
              <span>{job.qualification}</span>
            </span>

            {isClosed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#66758A] bg-[#F0F4FA] border border-[#D7DFEB] px-3 py-1 rounded-full">
                <span>Applications Closed</span>
              </span>
            ) : isClosingSoon ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E84D62] bg-[#FDF0F2] border border-[#FAC7CF] px-3 py-1 rounded-full">
                <Clock size={13} />
                <span>Closing Soon: {countdown.text}</span>
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#17243A] tracking-tight leading-tight mb-4">
            {job.title}
          </h1>

          <p className="text-sm sm:text-base text-[#66758A] leading-relaxed mb-6">
            Official recruitment notification released by{" "}
            <strong className="text-[#17243A] font-semibold">{job.department}</strong>.
            Eligible candidates can review requirements and apply online before{" "}
            <strong className="text-[#17243A] font-semibold">{formattedDate}</strong>.
          </p>

          {/* KEY PARAMETERS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#E4EAF3]">
            <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#E4EAF3]">
              <div className="flex items-center gap-1.5 text-xs text-[#66758A] mb-1">
                <Banknote size={14} className="text-[#F28C28]" />
                <span>Salary / Pay</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base text-[#17243A] truncate">
                {job.salary}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#E4EAF3]">
              <div className="flex items-center gap-1.5 text-xs text-[#66758A] mb-1">
                <Users size={14} className="text-[#159B82]" />
                <span>Total Vacancies</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base text-[#17243A]">
                {job.vacancies > 0 ? `${job.vacancies} Posts` : "Refer Notification"}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#E4EAF3]">
              <div className="flex items-center gap-1.5 text-xs text-[#66758A] mb-1">
                <Calendar
                  size={14}
                  className={
                    isClosed
                      ? "text-[#8C9BAE]"
                      : isClosingSoon
                      ? "text-[#E84D62]"
                      : "text-[#F28C28]"
                  }
                />
                <span>Last Date</span>
              </div>
              <div
                className={`font-extrabold text-sm sm:text-base ${
                  isClosed
                    ? "line-through text-[#8C9BAE]"
                    : isClosingSoon
                    ? "text-[#E84D62]"
                    : "text-[#17243A]"
                }`}
              >
                {formattedDate}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#E4EAF3]">
              <div className="flex items-center gap-1.5 text-xs text-[#66758A] mb-1">
                <MapPin size={14} className="text-[#F28C28]" />
                <span>Location</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base text-[#17243A] truncate">
                {job.state}
              </div>
            </div>
          </div>
        </div>

        {/* ELIGIBILITY & SPECIALIZATION DETAILS (If present) */}
        {job.eligibilityNotes && (
          <div className="bg-[#EAF2FF] border border-[#D7DFEB] rounded-3xl p-6 sm:p-7 shadow-card">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F28C28] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
                <Info size={19} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#17243A] mb-1">
                  Mandatory Eligibility & Requirements
                </h2>
                <p className="text-sm text-[#23334D] leading-relaxed font-medium">
                  {job.eligibilityNotes}
                </p>
                <p className="text-xs text-[#66758A] mt-2">
                  * Verify full discipline breakdowns, category reservations, and relaxations in the official notification document.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT THIS RECRUITMENT */}
        <div className="bg-white border border-[#E4EAF3] rounded-3xl p-6 sm:p-8 shadow-card">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#17243A] mb-4">
            Recruitment Overview
          </h2>
          <div className="space-y-3 text-sm text-[#344663] leading-relaxed">
            <p>
              The <strong className="text-[#17243A]">{job.department}</strong> has published an official recruitment drive for the post of <strong className="text-[#17243A]">{job.title}</strong> across <strong className="text-[#17243A]">{job.state}</strong>.
            </p>
            <p>
              Candidates possessing the minimum required educational qualification of <strong className="text-[#17243A]">{job.qualification}</strong>
              {job.eligibilityNotes ? ` (${job.eligibilityNotes})` : ""} are eligible to register. A total of <strong className="text-[#17243A]">{job.vacancies}</strong> vacancies have been notified.
            </p>
            <p>
              The remuneration for this post is stated as <strong className="text-[#17243A]">{job.salary}</strong>. Applications must be completed online before <strong className="text-[#17243A]">{formattedDate}</strong>.
            </p>
          </div>
        </div>

        {/* OFFICIAL APPLICATION CALLOUT (DESKTOP) */}
        <div className="bg-white border border-[#E4EAF3] rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#159B82] bg-[#E8F7F4] border border-[#B7E8DF] px-3 py-1 rounded-xl">
                <ShieldCheck size={14} className="text-[#159B82]" />
                <span>Direct Official Portal</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#17243A]">
                {isClosed ? "Applications Closed" : "Ready to submit your application?"}
              </h3>
              <p className="text-xs sm:text-sm text-[#66758A] max-w-xl">
                {isClosed
                  ? "The application window for this recruitment has officially closed. Check active listings on JanSetu for new opportunities."
                  : `Applications are processed entirely on the official recruitment website (${domain}). JanSetu never charges application fees or stores candidate documents.`}
              </p>
            </div>

            {isClosed ? (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F0F4FA] text-[#8C9BAE] border border-[#E4EAF3] text-base font-bold cursor-not-allowed"
              >
                <span>Applications Closed</span>
              </button>
            ) : (
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F28C28] hover:bg-[#E07D1B] text-white text-base font-bold shadow-card transition-all active:scale-[0.98]"
              >
                <span>Apply on Official Website</span>
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE STICKY APPLICATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E4EAF3] p-3 z-40 sm:hidden shadow-floating">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <div className="text-[11px] text-[#66758A] font-medium">Last Date</div>
            <div
              className={`text-xs font-bold ${
                isClosed
                  ? "line-through text-[#8C9BAE]"
                  : isClosingSoon
                  ? "text-[#E84D62]"
                  : "text-[#17243A]"
              }`}
            >
              {formattedDate}
            </div>
          </div>

          {isClosed ? (
            <button
              type="button"
              disabled
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F0F4FA] text-[#8C9BAE] border border-[#E4EAF3] text-sm font-bold cursor-not-allowed"
            >
              <span>Closed</span>
            </button>
          ) : (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07D1B] text-white text-sm font-bold shadow-subtle active:scale-[0.98] transition"
            >
              <span>Apply Online</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
