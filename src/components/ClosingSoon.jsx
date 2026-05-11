import JobCard from "./JobCard";

export default function ClosingSoon({
  jobs,
  loading,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  // 🔥 GET SAVED JOB IDS
  const savedIds =
    new Set(savedJobs);

  // 🔥 REMOVE DUPLICATES FROM LATEST
  const closingJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(a.lastDate) -
        new Date(b.lastDate)
    )
    .filter(
      (job, index, self) =>
        index ===
        self.findIndex(
          (j) => j._id === job._id
        )
    )
    .slice(0, 3);

  return (
    <div className="px-4 md:px-6 py-12 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-semibold">
          Closing Soon
        </h2>

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

          {[1, 2, 3].map((i) => (

            <div
              key={i}
              className="border rounded-xl p-5 bg-white"
            >

              <div className="h-5 shimmer rounded w-3/4 mb-4"></div>

              <div className="h-4 shimmer rounded w-1/2 mb-4"></div>

              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 shimmer rounded-full"></div>
                <div className="h-6 w-20 shimmer rounded-full"></div>
              </div>

              <div className="h-4 shimmer rounded w-1/3 mb-4"></div>

              <div className="h-1 shimmer rounded-full"></div>

            </div>

          ))}

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

          {closingJobs.map((job) => (

            <JobCard
              key={`closing-${job._id}`}
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