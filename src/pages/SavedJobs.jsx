import { useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard";

export default function SavedJobs({
  jobs,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  const navigate = useNavigate();

  // GET FULL JOB OBJECTS FOR SAVED IDS
  const savedJobsList = jobs.filter((job) =>
    savedJobs.includes(job._id)
  );

  if (!isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Login to view saved jobs
        </h2>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Saved Jobs
        </h2>
        <span className="text-sm text-stone-500">
          {savedJobsList.length} saved
        </span>
      </div>

      {savedJobsList.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <p className="text-lg mb-4">No saved jobs yet</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded-xl text-sm"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {savedJobsList.map((job) => (
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