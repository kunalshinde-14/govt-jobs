import { jobs } from "../data/jobs";
import { getSavedJobs } from "../utils/storage";
import JobCard from "../components/JobCard";
import { useState } from "react";
import JobDetail from "../components/JobDetail";

export default function SavedJobs({
  isLoggedIn,
  setShowLogin,
}) {
  const [selectedJob, setSelectedJob] = useState(null);

  const savedIds = getSavedJobs();

  const savedJobs = jobs.filter((job) =>
    savedIds.includes(job.id)
  );

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Saved Jobs
      </h1>

      {savedJobs.length === 0 ? (
        <p className="text-gray-500">
          No saved jobs yet
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={setSelectedJob}
              isLoggedIn={isLoggedIn}        // ✅ FIXED
              setShowLogin={setShowLogin}    // ✅ FIXED
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedJob && (
        <JobDetail
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}