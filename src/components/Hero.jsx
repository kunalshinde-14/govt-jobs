import { useState } from "react";

export default function Hero({
  jobs,
  search,
  setSearch,
  filters,
  setFilters,
}) {

  const [showDropdown, setShowDropdown] =
    useState(false);

  const query =
    (search || "")
      .toLowerCase()
      .trim();

  const suggestions =
    jobs.filter((job) =>
      job.title
        .toLowerCase()
        .includes(query)
    );



  // ✅ REAL STATS
  const totalJobs =
    jobs.length;

  const today =
    new Date();

  today.setHours(0, 0, 0, 0);

  const oneWeekLater =
    new Date(today);

  oneWeekLater.setDate(
    today.getDate() + 7
  );

  const closingThisWeek =
    jobs.filter((job) => {

      const deadline =
        new Date(job.lastDate);

      return (
        deadline >= today &&
        deadline <= oneWeekLater
      );

    }).length;



  return (

    <div
      className="text-center py-20 px-4 relative"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #fef3c7 0%, #fffbeb 40%, #ffffff 70%)",
      }}
    >

      {/* HEADING */}
      <h1 className="text-2xl md:text-4xl font-semibold mb-6 max-w-3xl mx-auto">

        Find Official Government Jobs Across India
        
      </h1>

      <p className="text-lg md:text-xl text-stone-500 mt-4 mb-6">
                 SSC • Banking • Railway • Defence • PSU • State Government
      </p>

      {/* SEARCH */}
      <div className="relative max-w-xl mx-auto">

        <input
          type="text"
          value={search || ""}
          onChange={(e) => {

            setSearch(
              e.target.value
            );

            setShowDropdown(true);

          }}
          onFocus={() =>
            setShowDropdown(true)
          }
          onBlur={() =>
            setTimeout(
              () =>
                setShowDropdown(false),
              150
            )
          }
          placeholder="Search jobs..."
          className="w-full px-5 py-4 border rounded-xl bg-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
        />

        <p className="text-sm text-stone-500 mt-3">
    Updated daily • Official links only • No registration required
  </p>

        {/* SUGGESTIONS */}
        {showDropdown &&
          query && (

          <div className="absolute w-full bg-white border mt-2 rounded-xl z-50 shadow-lg">

            {suggestions
              .slice(0, 5)
              .map((job) => (

                <div
                  key={job._id}
                  onMouseDown={() => {

                    setSearch(
                      job.title
                    );

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



      {/* STATS */}
      <div className="flex justify-center gap-4 mt-6 text-center flex-wrap">

        <div className="bg-white border border-stone-200 rounded-xl px-5 py-3 shadow-sm">

          <div className="text-xl font-semibold text-emerald-600">

            {totalJobs}

          </div>

          <div className="text-xs text-stone-400">

            Active jobs

          </div>

        </div>



        <div className="bg-white border border-stone-200 rounded-xl px-5 py-3 shadow-sm">

          <div className="text-xl font-semibold text-red-500">

            {closingThisWeek}

          </div>

          <div className="text-xs text-stone-400">

            Closing this week

          </div>

        </div>

      </div>



      {/* FILTERS */}
      <div className="flex justify-center gap-3 mt-6 flex-wrap">

        {[
          "10th",
          "12th",
          "Graduate",
        ].map((item) => (

          <button
            key={item}
            onClick={() =>
              setFilters((prev) => {

                const exists =
                  prev.qualification.includes(item);

                return {
                  ...prev,

                  qualification: exists
                    ? prev.qualification.filter(
                        (q) =>
                          q !== item
                      )
                    : [
                        ...prev.qualification,
                        item,
                      ],
                };

              })
            }
            className={`px-4 py-2 border rounded-full transition ${
              filters.qualification.includes(item)
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white hover:bg-stone-50"
            }`}
          >

            {item}

          </button>

        ))}



        {/* STATE FILTER */}
        <button
          onClick={() =>
            setFilters((prev) => ({

              ...prev,

              state:
                prev.state ===
                "Maharashtra"
                  ? ""
                  : "Maharashtra",

            }))
          }
          className={`px-4 py-2 border rounded-full transition ${
            filters.state ===
            "Maharashtra"
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-white hover:bg-stone-50"
          }`}
        >

          Maharashtra

        </button>

      </div>



      {/* TRUST BAR */}
      <div className="mt-10">

        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">

          {[
            "✅ Official Links Only",
            "🚫 No Expired Listings",
            "🔒 No Forms Hosted",
            "💯 Always Free",
          ].map((t) => (

            <div
              key={t}
              className="bg-white border border-stone-200 px-4 py-2 rounded-full text-sm text-stone-700 shadow-sm"
            >

              {t}

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}