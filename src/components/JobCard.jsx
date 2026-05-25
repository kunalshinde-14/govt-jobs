import { Heart } from "lucide-react";
import BASE_URL from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function JobCard({
  job,
  isLoggedIn,
  setShowLogin,
  savedJobs,
  setSavedJobs,
}) {

  const navigate = useNavigate();
  const isSaved = savedJobs.includes(job._id);

  // ✅ LOCAL STATE for instant animation
  const [animating, setAnimating] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    // ✅ OPTIMISTIC UPDATE — instant UI change
    if (isSaved) {
      setSavedJobs(savedJobs.filter((id) => id !== job._id));
    } else {
      setSavedJobs([...savedJobs, job._id]);
      // 💥 POP ANIMATION
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }

    // 🔄 SYNC WITH BACKEND in background
    try {
      const token = localStorage.getItem("token");

      if (isSaved) {
        await axios.delete(
          `${BASE_URL}/api/users/save-job/${job._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${BASE_URL}/api/users/save-job/${job._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      // ROLLBACK if API fails
      if (isSaved) {
        setSavedJobs([...savedJobs, job._id]);
      } else {
        setSavedJobs(savedJobs.filter((id) => id !== job._id));
      }
      console.log(error);
    }
  };

  return (
    <div
      onClick={() => navigate(`/job/${job._id}`)}
      className="border rounded-2xl p-5 hover:shadow-lg transition cursor-pointer bg-white"
    >

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <p className="text-stone-500 text-sm">{job.department}</p>
        </div>

        <button
          onClick={handleSave}
          className="cursor-pointer"
          style={{
            transform: animating ? "scale(1.4)" : "scale(1)",
            transition: "transform 0.2s ease",
          }}
        >
          <Heart
            size={22}
            fill={isSaved ? "#ef4444" : "none"}
            color={isSaved ? "#ef4444" : "#a8a29e"}
          />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <span className="bg-stone-100 px-3 py-1 rounded-full text-sm">
          {job.qualification}
        </span>
        <span className="bg-stone-100 px-3 py-1 rounded-full text-sm">
          {job.state}
        </span>
      </div>

      <p className="text-sm mb-2">💰 {job.salary}</p>
      <p className="text-sm mb-4">🪑 {job.vacancies} vacancies</p>

      <div className="flex justify-between items-center">
        <p className="text-red-500 text-sm font-medium">
          Last Date: {job.lastDate}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(job.applyLink, "_blank");
          }}
          className="bg-black text-white px-4 py-2 rounded-xl text-sm"
        >
          Apply
        </button>
      </div>

    </div>
  );
}