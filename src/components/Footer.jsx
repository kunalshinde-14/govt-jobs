import { Link } from "react-router-dom";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E5DE] bg-white text-[#737873]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* BRAND COLUMN */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="JanSetu"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-[#737873] leading-relaxed max-w-md">
              JanSetu connects Indian aspirants with genuine, active public-sector employment opportunities. Every vacancy is verified against official government gazettes, notifications, and portals.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#3D443F] pt-2">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>100% Official Links</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <ExternalLink size={13} className="text-[#F28C00]" />
                <span>Zero Application Fees</span>
              </span>
            </div>
          </div>

          {/* POPULAR SECTORS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202521] mb-3">
              Explore Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/category/banking" className="hover:text-[#F28C00] transition">
                  Banking Recruitments
                </Link>
              </li>
              <li>
                <Link to="/category/defence" className="hover:text-[#F28C00] transition">
                  Defence & Armed Forces
                </Link>
              </li>
              <li>
                <Link to="/category/railway" className="hover:text-[#F28C00] transition">
                  Railway Jobs (RRB)
                </Link>
              </li>
              <li>
                <Link to="/category/ssc" className="hover:text-[#F28C00] transition">
                  SSC Staff Selection
                </Link>
              </li>
              <li>
                <Link to="/category/upsc" className="hover:text-[#F28C00] transition">
                  UPSC Civil Services
                </Link>
              </li>
            </ul>
          </div>

          {/* STATE PORTALS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202521] mb-3">
              State Openings
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/state/maharashtra" className="hover:text-[#F28C00] transition">
                  Maharashtra Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/bihar" className="hover:text-[#F28C00] transition">
                  Bihar Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/rajasthan" className="hover:text-[#F28C00] transition">
                  Rajasthan Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/uttar-pradesh" className="hover:text-[#F28C00] transition">
                  Uttar Pradesh Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/delhi" className="hover:text-[#F28C00] transition">
                  Delhi NCT Jobs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* DISCLAIMER & COPYRIGHT */}
        <div className="pt-6 border-t border-[#E8E5DE] text-xs text-[#737873] space-y-2">
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> JanSetu is an independent discovery platform. We do not represent any government ministry, commission, or recruiting agency. All application procedures and payments take place exclusively on official third-party government websites.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-[#9BA09B]">
            <p>© 2026 JanSetu. Dedicated to every Indian job aspirant.</p>
            <p className="flex items-center gap-1">
              Built with precision for India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}