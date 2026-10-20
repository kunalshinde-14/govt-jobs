import { X, ExternalLink, Calendar, Banknote } from "lucide-react";

export default function JobDetail({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-[#17243A]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4EAF3] w-full max-w-xl rounded-3xl p-6 sm:p-8 relative shadow-floating">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-[#66758A] hover:text-[#17243A] hover:bg-[#EAF2FF] transition"
        >
          <X size={18} />
        </button>

        <span className="text-xs font-semibold text-[#23334D] bg-[#EAF2FF] border border-[#D7DFEB] px-3 py-1 rounded-xl">
          {job.department}
        </span>

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A] mt-3 mb-2">
          {job.title}
        </h2>

        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-[#F7F8FC] border border-[#E4EAF3] p-3.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-[#66758A] mb-1">
              <Calendar size={13} className="text-[#F28C28]" />
              <span>Last Date</span>
            </div>
            <p className="font-extrabold text-sm text-[#E84D62]">{job.lastDate}</p>
          </div>
          <div className="bg-[#F7F8FC] border border-[#E4EAF3] p-3.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-[#66758A] mb-1">
              <Banknote size={13} className="text-[#F28C28]" />
              <span>Salary</span>
            </div>
            <p className="font-extrabold text-sm text-[#17243A] truncate">{job.salary}</p>
          </div>
        </div>

        {job.eligibilityNotes && (
          <div className="mb-5 p-3 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] text-xs text-[#23334D]">
            <strong className="font-bold text-[#17243A]">Eligibility: </strong> {job.eligibilityNotes}
          </div>
        )}

        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#F28C28] hover:bg-[#E07D1B] text-white py-3 rounded-xl font-semibold text-sm transition shadow-subtle"
        >
          <span>Apply on Official Website</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
