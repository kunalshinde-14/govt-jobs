import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSavedJobs,
  saveJob,
  removeJob,
} from "../utils/storage";

export default function JobCard({
  job,
  isLoggedIn,
  setShowLogin,
}) {
  const navigate = useNavigate();

  const [saved, setSaved] = useState(
    getSavedJobs().includes(job.id)
  );
  const [animate, setAnimate] = useState(false);

  const handleSave = (e) => {
    e.stopPropagation(); // prevent navigation

    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    if (saved) {
      removeJob(job.id);
    } else {
      saveJob(job.id);
    }

    setSaved(!saved);

    // animation trigger
    setAnimate(true);
    setTimeout(() => setAnimate(false), 400);
  };

  // 🔥 FIXED urgency logic
  const today = new Date();
  const lastDate = new Date(job.lastDate);

  let daysLeft = Math.ceil(
    (lastDate - today) / (1000 * 60 * 60 * 24)
  );

  daysLeft = Math.max(0, Math.min(30, daysLeft));

  const progress = Math.min(
    100,
    Math.max(5, ((30 - daysLeft) / 30) * 100)
  );

  let color = "bg-green-500";
  if (daysLeft < 14) color = "bg-amber-500";
  if (daysLeft < 7) color = "bg-red-500";

  return (
    <div
      onClick={() => navigate(`/job/${job.id}`)}
      className="border rounded-xl p-5 cursor-pointer hover:bg-stone-50 active:scale-[0.98]"
    >
      <div className="flex justify-between items-start relative">
        <h3 className="font-semibold">{job.title}</h3>

        {/* ❤️ HEART */}
        <div className="relative">
          {animate && (
            <>
              <span className="absolute inset-0 flex items-center justify-center animate-ping text-red-400 text-xl">
                ❤️
              </span>
              <span className="absolute -top-2 -left-2 text-yellow-400 animate-bounce text-xs">✨</span>
              <span className="absolute -top-2 -right-2 text-yellow-400 animate-bounce text-xs">✨</span>
              <span className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce text-xs">✨</span>
              <span className="absolute -bottom-2 -right-2 text-yellow-400 animate-bounce text-xs">✨</span>
            </>
          )}

          <button
            onClick={handleSave}
            className={`text-xl transition-transform duration-300 ${
              animate ? "scale-125" : "scale-100"
            } ${saved ? "text-red-500" : "text-gray-400"}`}
          >
            {saved ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-1">
        {job.department}
      </p>

      <div className="flex gap-2 mt-2 text-xs">
        <span className="bg-stone-100 px-2 py-1 rounded-full">
          {job.qualification}
        </span>
        <span className="bg-stone-100 px-2 py-1 rounded-full">
          {job.state}
        </span>
      </div>

      <p className="text-sm mt-3">
        Last Date: {job.lastDate}
      </p>

      {/* 🔥 URGENCY PROGRESS BAR */}
      <div className="h-1 mt-4 rounded-full bg-stone-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}