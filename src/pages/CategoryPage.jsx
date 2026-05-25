import { useParams } from "react-router-dom";

import JobCard from "../components/JobCard";

export default function CategoryPage({
  jobs,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  const { category } =
    useParams();




  // ✅ SAFE CATEGORY NAME
  const displayName = category
    ?.split(" ")
    ?.filter(Boolean)
    ?.map(

      (word) =>

        word?.charAt(0)?.toUpperCase() +
        word?.slice(1)

    )
    ?.join(" ");




  // ✅ FILTER JOBS
  const filteredJobs =
    jobs.filter(

      (job) =>

        job &&
        job.department &&
        job.department
          .toLowerCase()
          .includes(
            category?.toLowerCase()
          )

    );




  return (

    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-4xl font-bold mb-3">

          {displayName} Jobs

        </h1>

        <p className="text-stone-500">

          {filteredJobs.length} jobs found

        </p>

      </div>




      {/* EMPTY */}
      {filteredJobs.length === 0 ? (

        <div className="bg-white border rounded-2xl p-10 text-center">

          <p className="text-stone-500">

            No jobs found in this category.

          </p>

        </div>

      ) : (

        /* JOBS GRID */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

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