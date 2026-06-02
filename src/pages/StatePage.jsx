import { useParams } from "react-router-dom";
import JobCard from "../components/JobCard";

export default function StatePage({
  jobs,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  const { state } = useParams();

  const formattedState =
    state
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

  const stateJobs = jobs.filter((job) => {

  const jobState =
    job.state?.toLowerCase();

  const currentState =
    formattedState.toLowerCase();

  return (
    jobState === currentState ||
    jobState === "all india"
  );

});

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="mb-8">

        <h1 className="text-3xl font-bold mb-2">
          Government Jobs in {formattedState}
        </h1>

        <p className="text-stone-500">
          {stateJobs.length} jobs available
        </p>

      </div>

      {stateJobs.length > 0 ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

          {stateJobs.map((job) => (

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

      ) : (

        <div className="text-center py-20">

          <h2 className="text-xl font-semibold mb-2">
            No jobs found
          </h2>

          <p className="text-stone-500">
            No active jobs currently available
            in {formattedState}
          </p>

        </div>

      )}

    </div>
  );
}   