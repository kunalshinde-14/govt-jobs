import { useParams } from "react-router-dom";
import JobCard from "../components/JobCard";

export default function CategoryPage({
  jobs,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  const { category } = useParams();

  // ✅ SAFE GUARD
  if (!category) return null;

  const filteredJobs = jobs.filter(
    (job) => job.department.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold capitalize">{category} Jobs</h1>
        <span className="text-stone-500">{filteredJobs.length} jobs</span>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center text-stone-500 py-20">
          No jobs found in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
              savedJobs={savedJobs}
              setSavedJobs={setSavedJobs}
            />
          ))}
        </div>
      )}

    </div>
  );
}