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
        <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#E8E5DE] flex items-center justify-center mx-auto mb-4 text-[#737873]">
          <Info size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#202521] mb-2">
          Recruitment Listing Not Found
        </h2>
        <p className="text-sm text-[#737873] mb-6">
          The requested job may have expired or the link is incorrect.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202521] text-white text-sm font-semibold hover:bg-[#3D443F] transition"
        >
          <ArrowLeft size={16} />
          <span>Browse Active Vacancies</span>
        </button>
      </div>
    );
  }

  // Calculate closing soon & days remaining
  const { isClosingSoon, daysRemaining } = (() => {
    if (!job?.lastDate) return { isClosingSoon: false, daysRemaining: null };
    const deadline = new Date(job.lastDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = deadline - now;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      isClosingSoon: days >= 0 && days <= 7,
      daysRemaining: days,
    };
  })();

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
    <div className="w-full pb-28 md:pb-16">
      {/* TOP NAVIGATION BREADCRUMB */}
      <div className="border-b border-[#E8E5DE] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 text-xs text-[#737873]">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 font-semibold text-[#202521] hover:text-[#F28C00] transition"
          >
            <ArrowLeft size={15} />
            <span>Back to listings</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 truncate">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="truncate max-w-[140px]">{job.department}</span>
            <span>/</span>
            <span className="text-[#202521] font-medium truncate max-w-[200px]">
              {job.title}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* HEADER HERO CARD */}
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 shadow-subtle">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#202521] bg-[#FAF8F3] border border-[#E8E5DE] px-3 py-1 rounded-md">
              <Building2 size={14} className="text-[#F28C00]" />
              <span>{job.department}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#737873] bg-[#FAF8F3] border border-[#E8E5DE] px-3 py-1 rounded-md">
              <MapPin size={13} />
              <span>{job.state}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D443F] bg-[#FAF8F3] border border-[#E8E5DE] px-3 py-1 rounded-md">
              <GraduationCap size={14} className="text-[#F28C00]" />
              <span>{job.qualification}</span>
            </span>

            {isClosingSoon && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                <Clock size={13} />
                <span>Closing in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#202521] tracking-tight leading-tight mb-4">
            {job.title}
          </h1>

          <p className="text-sm sm:text-base text-[#737873] leading-relaxed mb-6">
            Official recruitment notification released by{" "}
            <strong className="text-[#202521] font-semibold">{job.department}</strong>.
            Eligible candidates can review requirements and apply online before{" "}
            <strong className="text-[#202521] font-semibold">{job.lastDate}</strong>.
          </p>

          {/* KEY PARAMETERS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#E8E5DE]">
            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E5DE]">
              <div className="flex items-center gap-1.5 text-xs text-[#737873] mb-1">
                <Banknote size={14} className="text-[#F28C00]" />
                <span>Salary / Pay</span>
              </div>
              <div className="font-bold text-sm sm:text-base text-[#202521] truncate">
                {job.salary}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E5DE]">
              <div className="flex items-center gap-1.5 text-xs text-[#737873] mb-1">
                <Users size={14} className="text-[#F28C00]" />
                <span>Total Vacancies</span>
              </div>
              <div className="font-bold text-sm sm:text-base text-[#202521]">
                {job.vacancies > 0 ? `${job.vacancies} Posts` : "Refer Notification"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E5DE]">
              <div className="flex items-center gap-1.5 text-xs text-[#737873] mb-1">
                <Calendar size={14} className="text-[#F28C00]" />
                <span>Last Date</span>
              </div>
              <div className={`font-bold text-sm sm:text-base ${isClosingSoon ? "text-rose-600" : "text-[#202521]"}`}>
                {job.lastDate}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E5DE]">
              <div className="flex items-center gap-1.5 text-xs text-[#737873] mb-1">
                <MapPin size={14} className="text-[#F28C00]" />
                <span>Location</span>
              </div>
              <div className="font-bold text-sm sm:text-base text-[#202521] truncate">
                {job.state}
              </div>
            </div>
          </div>
        </div>

        {/* ELIGIBILITY & SPECIALIZATION DETAILS (If present) */}
        {job.eligibilityNotes && (
          <div className="bg-[#FFF8ED] border border-[#FDE0B2] rounded-2xl p-6 sm:p-7 shadow-subtle">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F28C00] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
                <Info size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#B45309] mb-1">
                  Mandatory Eligibility & Requirements
                </h2>
                <p className="text-sm text-[#202521] leading-relaxed font-medium">
                  {job.eligibilityNotes}
                </p>
                <p className="text-xs text-[#737873] mt-2">
                  * Verify full discipline breakdowns, category reservations, and relaxations in the official notification document.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT THIS RECRUITMENT */}
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 shadow-subtle">
          <h2 className="text-lg sm:text-xl font-bold text-[#202521] mb-4">
            Recruitment Overview
          </h2>
          <div className="space-y-3 text-sm text-[#3D443F] leading-relaxed">
            <p>
              The <strong>{job.department}</strong> has published an official recruitment drive for the post of <strong>{job.title}</strong> across <strong>{job.state}</strong>.
            </p>
            <p>
              Candidates possessing the minimum required educational qualification of <strong>{job.qualification}</strong>
              {job.eligibilityNotes ? ` (${job.eligibilityNotes})` : ""} are eligible to register. A total of <strong>{job.vacancies}</strong> vacancies have been notified.
            </p>
            <p>
              The remuneration for this post is stated as <strong>{job.salary}</strong>. Applications must be completed online before <strong>{job.lastDate}</strong>.
            </p>
          </div>
        </div>

        {/* OFFICIAL APPLICATION CALLOUT (DESKTOP) */}
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 shadow-subtle">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Direct Official Portal</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#202521]">
                Ready to submit your application?
              </h3>
              <p className="text-xs sm:text-sm text-[#737873] max-w-xl">
                Applications are processed entirely on the official recruitment website (<strong>{domain}</strong>). JanSetu never charges application fees or stores candidate documents.
              </p>
            </div>

            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F28C00] hover:bg-[#D97706] text-white text-base font-bold shadow-card transition-all active:scale-[0.98]"
            >
              <span>Apply on Official Website</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY APPLICATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F3]/95 backdrop-blur-md border-t border-[#E8E5DE] p-3 z-40 sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <div className="text-[11px] text-[#737873] font-medium">Last Date</div>
            <div className={`text-xs font-bold ${isClosingSoon ? "text-rose-600" : "text-[#202521]"}`}>
              {job.lastDate}
            </div>
          </div>

          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F28C00] hover:bg-[#D97706] text-white text-sm font-bold shadow-subtle active:scale-[0.98] transition"
          >
            <span>Apply Online</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}