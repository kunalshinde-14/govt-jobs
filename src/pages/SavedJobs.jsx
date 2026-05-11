import { useEffect, useState } from "react";
import axios from "axios";

import JobCard from "../components/JobCard";

export default function SavedJobs({
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchSavedJobs = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/users/saved-jobs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setJobs(res.data);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    if (isLoggedIn) {

      fetchSavedJobs();

    }

  }, [isLoggedIn]);



  if (!isLoggedIn) {

    return (
      <div className="text-center py-20">

        <h2 className="text-2xl font-semibold mb-4">
          Login Required
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

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Saved Jobs
        </h1>

        <span className="text-stone-500">
          {jobs.length} saved
        </span>

      </div>

      {loading ? (

        <div className="text-center py-20">
          Loading...
        </div>

      ) : jobs.length === 0 ? (

        <div className="text-center py-20 text-stone-500">
          No saved jobs yet
        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {jobs.map((job) => (

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