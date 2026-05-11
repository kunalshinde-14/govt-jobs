import JobCard from "./JobCard";

export default function LatestJobs({
  jobs,
  loading,
  search,
  filters,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  // 🔥 GET CLOSING SOON IDS to exclude them
  const closingSoonIds = [...jobs]
    .sort((a, b) => new Date(a.lastDate) - new Date(b.lastDate))
    .slice(0, 3)
    .map((job) => job._id);

  // 🔍 FILTER — exclude closing soon + apply search/filters
  const filteredJobs = jobs.filter((job) => {

    if (closingSoonIds.includes(job._id)) return false;

    const matchesSearch =
      search === "" ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase());

    const matchesQualification =
      filters.qualification.length === 0 ||
      filters.qualification.includes(job.qualification);

    const matchesState =
      filters.state === "" ||
      job.state === filters.state;

    return matchesSearch && matchesQualification && matchesState;
  });

  return (
    <div className="px-4 md:px-6 py-12 max-w-6xl mx-auto">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Latest Jobs</h2>
        <span className="text-sm text-stone-500">
          {filteredJobs.length} jobs found
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-xl p-5 bg-white">
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
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isLoggedIn={isLoggedIn}
                setShowLogin={setShowLogin}
                savedJobs={savedJobs}
                setSavedJobs={setSavedJobs}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-stone-500 py-10">
              No jobs found
            </div>
          )}
        </div>
      )}

    </div>
  );
}