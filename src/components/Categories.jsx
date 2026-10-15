import { useNavigate } from "react-router-dom";
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
  { name: "State PSC", slug: "state psc", icon: Briefcase },
];

export default function Categories({ jobs = [], loading }) {
  const navigate = useNavigate();

  // Count jobs for each category (case-insensitive substring)
  const getCount = (catSlug) => {
    return jobs.filter((job) => {
      const dept = (job?.department || "").toLowerCase();
      return dept.includes(catSlug.toLowerCase());
    }).length;
  };

  const counts = CATEGORY_CONFIG.map((c) => getCount(c.slug));
  const max = Math.max(...counts, 1);

  return (
    <section className="px-4 sm:px-6 py-8 md:py-12 max-w-7xl mx-auto w-full">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 border-b border-[#E8E5DE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#FFF8ED] text-[#F28C00]">
              <Layers size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
              Sectors & Departments
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202521] tracking-tight">
            Browse by Sector
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#737873]">
          Quickly discover opportunities matching your target domain.
        </p>
      </div>

      {/* SKELETON LOADING */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E8E5DE] rounded-xl p-4 shadow-subtle"
            >
              <div className="h-8 w-8 shimmer rounded-lg mb-3"></div>
              <div className="h-5 w-24 shimmer rounded mb-2"></div>
              <div className="h-3 w-16 shimmer rounded mb-3"></div>
              <div className="h-1 shimmer rounded-full"></div>
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
              <div
                key={cat.slug}
                onClick={() => navigate(`/category/${encodeURIComponent(cat.slug)}`)}
                className="bg-white border border-[#E8E5DE] hover:border-[#F28C00]/50 rounded-xl p-4 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/category/${encodeURIComponent(cat.slug)}`);
                  }
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF8F3] border border-[#E8E5DE] flex items-center justify-center text-[#737873] group-hover:text-[#F28C00] group-hover:bg-[#FFF8ED] transition-colors">
                      <Icon size={18} />
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-[#9BA09B] opacity-0 group-hover:opacity-100 group-hover:text-[#F28C00] -translate-x-1 group-hover:translate-x-0 transition-all"
                    />
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#202521] group-hover:text-[#F28C00] transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#737873] mt-0.5">
                    {count} {count === 1 ? "vacancy" : "vacancies"}
                  </p>
                </div>

                {/* CAPACITY / PROPORTION BAR */}
                <div className="mt-3 pt-2">
                  <div className="h-1 bg-[#FAF8F3] border border-[#E8E5DE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F28C00] rounded-full transition-all duration-300"
                      style={{ width: `${count > 0 ? percentage : 4}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}