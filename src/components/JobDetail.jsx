export default function JobDetail({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
        <p className="text-gray-500 mb-4">{job.department}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Last Date</p>
            <p className="font-semibold text-red-500">{job.lastDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Salary</p>
            <p className="font-semibold">{job.salary}</p>
          </div>
        </div>

        <button className="w-full bg-amber-600 text-white py-3 rounded-lg">
          Apply Now
        </button>
      </div>
    </div>
  );
}