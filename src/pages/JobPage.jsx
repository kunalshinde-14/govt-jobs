import {
  useParams,
  useNavigate
} from "react-router-dom";

import { useEffect } from "react";

export default function JobPage({ jobs }) {

  const { id } = useParams();

  const navigate = useNavigate();

  // 🔥 FIX SCROLL TO TOP
  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

  // 🔥 FIND JOB USING _id
  const job = jobs.find(
    (j) => j._id === id
  );

  if (!job) {

    return (
      <div className="px-4 py-12 text-center">
        Job not found
      </div>
    );

  }

  return (
    <>
      {/* MAIN */}
      <div className="px-4 md:px-6 py-10 pb-28 max-w-4xl mx-auto">

        {/* 🔙 BACK */}
        <button
          onClick={() => navigate(-1)}
          className="text-base font-medium text-stone-700 hover:text-amber-600 mb-5 flex items-center gap-2 transition"
        >

          <span className="text-lg">
            ←
          </span>

          <span>
            Back
          </span>

        </button>

        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight">
          {job.title}
        </h1>

        {/* DEPARTMENT */}
        <p className="text-stone-500 mb-4">
          {job.department}
        </p>

        {/* TAGS */}
        <div className="flex gap-2 mb-6 text-sm flex-wrap">

          <span className="bg-stone-100 px-3 py-1 rounded-full">
            {job.qualification}
          </span>

          <span className="bg-stone-100 px-3 py-1 rounded-full">
            {job.state}
          </span>

        </div>

        {/* INFO CARD */}
        <div className="border rounded-xl p-6 mb-6 bg-white">

          <div className="flex justify-between mb-4">

            <span className="text-stone-500">
              Last Date
            </span>

            <span className="font-medium">
              {job.lastDate}
            </span>

          </div>

          <div className="flex justify-between mb-4">

            <span className="text-stone-500">
              Qualification
            </span>

            <span className="font-medium">
              {job.qualification}
            </span>

          </div>

          <div className="flex justify-between mb-4">

            <span className="text-stone-500">
              Vacancies
            </span>

            <span className="font-medium">
              {job.vacancies}
            </span>

          </div>

          <div className="flex justify-between mb-4">

            <span className="text-stone-500">
              Salary
            </span>

            <span className="font-medium">
              {job.salary}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-stone-500">
              Location
            </span>

            <span className="font-medium">
              {job.state}
            </span>

          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="border rounded-xl p-6 mb-6 bg-white">

          <h2 className="font-semibold mb-3 text-lg">
            Job Description
          </h2>

          <p className="text-sm text-stone-600 leading-relaxed">

            This recruitment is conducted by the official{" "}
            {job.department} department.

            Candidates meeting the eligibility criteria
            can apply before the deadline.

          </p>

        </div>

        {/* 💻 DESKTOP APPLY */}
        <div className="hidden md:block">

          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
          >

            <button className="w-full bg-amber-600 active:scale-[0.98] transition text-white py-3 rounded-xl text-lg">

              Apply Now

            </button>

          </a>

        </div>

      </div>

      {/* 📱 MOBILE APPLY */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.06)] p-3 md:hidden">

        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
        >

          <button className="w-full bg-amber-600 active:scale-[0.98] transition text-white py-3 rounded-xl text-lg">

            Apply Now

          </button>

        </a>

      </div>
    </>
  );
}