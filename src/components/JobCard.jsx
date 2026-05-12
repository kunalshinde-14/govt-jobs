import { Heart } from "lucide-react";
import BASE_URL from "../utils/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function JobCard({
  job,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  const navigate = useNavigate();

  // ✅ ONLY FROM GLOBAL STATE
  const isSaved =
    savedJobs.includes(job._id);

  // ❤️ SAVE / UNSAVE
  const handleSave = async (e) => {

    e.stopPropagation();

    if (!isLoggedIn) {

      setShowLogin(true);

      return;

    }

    try {

      const token =
        localStorage.getItem("token");



      // 🔥 UNSAVE
      if (isSaved) {

        await axios.delete(
          `${BASE_URL}/api/users/save-job/${job._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updated =
          savedJobs.filter(
            (id) => id !== job._id
          );

        setSavedJobs(updated);

      }



      // 🔥 SAVE
      else {

        await axios.post(
          `${BASE_URL}/api/users/save-job/${job._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSavedJobs([
          ...savedJobs,
          job._id,
        ]);

      }

    } catch (error) {

      console.log(error);

    }

  };



  return (
    <div
      onClick={() =>
        navigate(`/job/${job._id}`)
      }
      className="border rounded-2xl p-5 hover:shadow-lg transition cursor-pointer bg-white"
    >

      {/* TOP */}
      <div className="flex justify-between items-start mb-4">

        <div>

          <h3 className="font-semibold text-lg">
            {job.title}
          </h3>

          <p className="text-stone-500 text-sm">
            {job.department}
          </p>

        </div>

        {/* ❤️ HEART */}
        <button
          onClick={handleSave}
          className="cursor-pointer"
        >

          <Heart
          size={22}
          fill={isSaved ? "#ef4444" : "none"}
          color={isSaved ? "#ef4444" : "#a8a29e"}
          />

        </button>

      </div>

      {/* TAGS */}
      <div className="flex gap-2 flex-wrap mb-4">

        <span className="bg-stone-100 px-3 py-1 rounded-full text-sm">
          {job.qualification}
        </span>

        <span className="bg-stone-100 px-3 py-1 rounded-full text-sm">
          {job.state}
        </span>

      </div>

      {/* SALARY */}
      <p className="text-sm mb-2">
        💰 {job.salary}
      </p>

      {/* VACANCIES */}
      <p className="text-sm mb-4">
        🪑 {job.vacancies} vacancies
      </p>

      {/* BOTTOM */}
      <div className="flex justify-between items-center">

        <p className="text-red-500 text-sm font-medium">
          Last Date: {job.lastDate}
        </p>

        <button
          onClick={(e) => {

            e.stopPropagation();

            window.open(
              job.applyLink,
              "_blank"
            );

          }}
          className="bg-black text-white px-4 py-2 rounded-xl text-sm"
        >
          Apply
        </button>

      </div>

    </div>
  );
}