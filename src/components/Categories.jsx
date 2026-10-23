import { Link } from "react-router-dom";
import {
  Layers,
  Building,
  Train,
  Landmark,
  Award,
  Shield,
  Briefcase,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const CATEGORY_CONFIG = [
  { name: "Banking", slug: "banking", icon: Landmark },
  { name: "Defence", slug: "defence", icon: Shield },
  { name: "Railway", slug: "railway", icon: Train },
  { name: "SSC", slug: "ssc", icon: Building },
  { name: "UPSC", slug: "upsc", icon: Award },
  { name: "Police", slug: "police", icon: Shield },
  { name: "Teaching", slug: "teaching", icon: GraduationCap },
  { name: "State PSC", slug: "state-psc", icon: Briefcase },
];

export default function Categories({ jobs = [], loading }) {
  // Count jobs for each category (case-insensitive substring)
  const getCount = (catSlug) => {
    const term = catSlug.replace(/-/g, " ").toLowerCase();
    return jobs.filter((job) => {
      const dept = (job?.department || "").toLowerCase();
      return dept.includes(term);
    }).length;
  };

  const counts = CATEGORY_CONFIG.map((c) => getCount(c.slug));
  const max = Math.max(...counts, 1);

  return (
    <section className="px-4 sm:px-6 py-6 md:py-10 max-w-7xl mx-auto w-full">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 border-b border-[#E4EAF3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-[#EAF2FF] text-[#17243A] border border-[#D7DFEB]">
              <Layers size={15} className="text-[#F28C28]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#23334D]">
              Sectors & Departments
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A] tracking-tight">
            Browse by Sector
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#66758A]">
          Explore vacancies curated by major governmental departments and examination boards.
        </p>
      </div>

      {/* SKELETON LOADING */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E4EAF3] rounded-2xl p-4 shadow-subtle"
            >
              <div className="h-9 w-9 shimmer rounded-xl mb-3"></div>
              <div className="h-5 w-24 shimmer rounded-lg mb-2"></div>
              <div className="h-3 w-16 shimmer rounded-lg mb-3"></div>
              <div className="h-1.5 shimmer rounded-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORY_CONFIG.map((cat) => {
            const count = getCount(cat.slug);
            const Icon = cat.icon;
            const percentage = Math.min(100, Math.max(10, (count / max) * 100));

            return (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="bg-white border border-[#E4EAF3] hover:border-[#B8C4D4] rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-hover hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                aria-label={`Explore ${cat.name} vacancies`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-center justify-center text-[#17243A] group-hover:text-[#F28C28] group-hover:bg-[#FFF7ED] group-hover:border-[#FDD8B3] transition-colors">
                      <Icon size={19} />
                    </div>
                    <span className="text-xs font-semibold text-[#66758A] bg-[#F7F8FC] border border-[#E4EAF3] px-2 py-0.5 rounded-lg group-hover:text-[#17243A]">
                      {count} {count === 1 ? "opening" : "openings"}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#17243A] text-sm sm:text-base group-hover:text-[#F28C28] transition-colors mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#66758A]">
                    Verified Public Openings
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E4EAF3]">
                  {/* Subtle Relative Opportunity Level */}
                  <div className="w-full bg-[#EAF2FF] h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-[#F28C28] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#66758A] group-hover:text-[#17243A]">
                    <span>Explore Sector</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
