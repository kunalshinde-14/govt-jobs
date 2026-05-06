import { useEffect, useState } from "react";
import { jobs } from "../data/jobs";
import { useNavigate } from "react-router-dom";

const categories = [
  "SSC",
  "Railway",
  "Banking",
  "UPSC",
  "Defence",
  "State PSC",
];

export default function Categories() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 🔥 shimmer loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getCount = (cat) =>
    jobs.filter((job) => job.department === cat).length;

  const max = Math.max(...categories.map(getCount), 1);

  return (
    <div className="px-4 md:px-6 py-12 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Browse by Category
        </h2>
      </div>

      {/* 🔥 SHIMMER LOADING */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border rounded-xl p-5 bg-white"
            >

              {/* title */}
              <div className="h-5 shimmer rounded w-2/3 mb-4"></div>

              {/* count */}
              <div className="h-4 shimmer rounded w-1/3 mb-4"></div>

              {/* progress */}
              <div className="h-1 shimmer rounded-full"></div>

            </div>
          ))}

        </div>
      ) : (
        /* ✅ REAL CATEGORIES */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

          {categories.map((cat) => {
            const count = getCount(cat);
            const width = (count / max) * 100;

            return (
              <div
                key={cat}
                onClick={() =>
                  navigate(`/category/${cat.toLowerCase()}`)
                }
                className="border rounded-xl p-5 bg-white cursor-pointer hover:bg-stone-50 active:scale-[0.98] transition"
              >

                <p className="font-medium">
                  {cat}
                </p>

                <p className="text-sm text-stone-500 mt-1">
                  {count} jobs
                </p>

                {/* 🔥 PROGRESS BAR */}
                <div className="h-1 mt-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600"
                    style={{ width: `${width}%` }}
                  />
                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}