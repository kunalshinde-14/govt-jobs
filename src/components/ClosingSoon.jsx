import { useEffect, useState } from "react";
import { jobs } from "../data/jobs";
import JobCard from "./JobCard";

export default function ClosingSoon({
  isLoggedIn,
  setShowLogin,
}) {
  const [loading, setLoading] = useState(true);

  // simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // sort by closest deadline
  const closingJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(a.lastDate) - new Date(b.lastDate)
    )
    .slice(0, 3);

  return (
    <div className="px-4 md:px-6 py-12 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Closing Soon
        </h2>
      </div>

      {/* 🔥 SKELETON */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-xl p-5"
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
        /* REAL CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {closingJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
            />
          ))}
        </div>
      )}
    </div>
  );
}