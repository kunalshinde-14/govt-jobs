import { useParams } from "react-router-dom";
import { jobs } from "../data/jobs";
import JobCard from "../components/JobCard";
import { useState } from "react";
import JobDetail from "../components/JobDetail";

export default function CategoryPage({
  isLoggedIn,
  setShowLogin,
}) {
  const { name } = useParams();
  const [selectedJob, setSelectedJob] = useState(null);

  const formatted = name.toLowerCase();

  const filteredJobs = jobs.filter(
    (job) => job.department.toLowerCase() === formatted
  );

  return (
    <div className="px-4 md:px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 capitalize">
        {name} Jobs
      </h1>

      {filteredJobs.length === 0 ? (
        <p className="text-gray-500">
          No jobs found
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={setSelectedJob}
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
            />
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDetail
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}