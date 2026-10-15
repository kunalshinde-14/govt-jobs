import { X, ExternalLink, Calendar, Banknote } from "lucide-react";

export default function JobDetail({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-[#202521]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#FAF8F3] border border-[#E8E5DE] w-full max-w-xl rounded-2xl p-6 sm:p-7 relative shadow-hover">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737873] hover:text-[#202521] hover:bg-[#E8E5DE]/40 transition"
        >
          <X size={18} />
        </button>

        <span className="text-xs font-semibold text-[#737873] bg-white border border-[#E8E5DE] px-2.5 py-1 rounded-md">
          {job.department}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-[#202521] mt-3 mb-2">
          {job.title}
        </h2>

        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-white border border-[#E8E5DE] p-3 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#737873] mb-1">
              <Calendar size={13} className="text-[#F28C00]" />
              <span>Last Date</span>
            </div>
            <p className="font-bold text-sm text-rose-600">{job.lastDate}</p>
          </div>
          <div className="bg-white border border-[#E8E5DE] p-3 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#737873] mb-1">
              <Banknote size={13} className="text-[#F28C00]" />
              <span>Salary</span>
            </div>
            <p className="font-bold text-sm text-[#202521] truncate">{job.salary}</p>
          </div>
        </div>

        {job.eligibilityNotes && (
          <div className="mb-5 p-3 rounded-xl bg-[#FFF8ED] border border-[#FDE0B2] text-xs text-[#B45309]">
            <strong>Eligibility: </strong> {job.eligibilityNotes}
          </div>
        )}

        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#F28C00] hover:bg-[#D97706] text-white py-3 rounded-xl font-semibold text-sm transition shadow-subtle"
        >
          <span>Apply on Official Website</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}