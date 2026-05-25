import { useState } from "react";

export default function Hero({
  jobs,
  search,
  setSearch,
  filters,
  setFilters,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const query = (search || "").toLowerCase().trim();

  const suggestions = jobs.filter((job) =>
    job.title.toLowerCase().includes(query)
  );

  // ✅ REAL STATS from actual jobs data
  const totalJobs = jobs.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const closingThisWeek = jobs.filter((job) => {
    const deadline = new Date(job.lastDate);
    return deadline >= today && deadline <= oneWeekLater;
  }).length;

  return (
    <div
      className="text-center py-20 px-4 relative"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #fef3c7 0%, #fffbeb 40%, #ffffff 70%)",
      }}
    >
      <h1 className="text-2xl md:text-4xl font-semibold mb-6 max-w-3xl mx-auto">
        Your government job shouldn't be this hard to find
      </h1>

      {/* SEARCH */}
      <div className="relative max-w-xl mx-auto">
        <input
          type="text"
          value={search || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Search jobs..."
          className="w-full px-5 py-4 border rounded-xl bg-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
        />

        {showDropdown && query && (
          <div className="absolute w-full bg-white border mt-2 rounded-xl z-50">
            {suggestions.slice(0, 5).map((job) => (
              <div
                key={job._id}
                onMouseDown={() => {
                  setSearch(job.title);
                  setShowDropdown(false);
                }}
                className="px-4 py-3 hover:bg-stone-100 cursor-pointer text-left"
              >
                {job.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ REAL STATS */}
      <div className="flex justify-center gap-4 mt-6 text-center">
        <div className="bg-white border border-stone-200 rounded-xl px-5 py-3">
          <div className="text-xl font-semibold text-emerald-600">
            {totalJobs}
          </div>
          <div className="text-xs text-stone-400">Active jobs</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl px-5 py-3">
          <div className="text-xl font-semibold text-red-500">
            {closingThisWeek}
          </div>
          <div className="text-xs text-stone-400">Closing this week</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        {["10th", "12th", "Graduate"].map((item) => (
          <button
            key={item}
            onClick={() =>
              setFilters((prev) => {
                const exists = prev.qualification.includes(item);
                return {
                  ...prev,
                  qualification: exists
                    ? prev.qualification.filter((q) => q !== item)
                    : [...prev.qualification, item],
                };
              })
            }
            className={`px-4 py-2 border rounded-full ${
              filters.qualification.includes(item)
                ? "bg-amber-600 text-white"
                : "bg-white"
            }`}
          >
            {item}
          </button>
        ))}

        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              state: prev.state === "Maharashtra" ? "" : "Maharashtra",
            }))
          }
          className={`px-4 py-2 border rounded-full ${
            filters.state === "Maharashtra"
              ? "bg-amber-600 text-white"
              : "bg-white"
          }`}
        >
          Maharashtra
        </button>
      </div>

      {/* TRUST BAR */}
      <div className="border-t border-stone-100 bg-stone-50 py-2 flex flex-wrap justify-center gap-6 mt-8">
        {[
          "✓ Official links only",
          "✓ Zero expired listings",
          "✓ No forms hosted",
          "✓ Always free",
        ].map((t) => (
          <span key={t} className="text-xs text-stone-500">{t}</span>
        ))}
      </div>
    </div>
  );
}