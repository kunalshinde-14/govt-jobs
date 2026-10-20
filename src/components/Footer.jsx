import { Link } from "react-router-dom";
import { ShieldCheck, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E4EAF3] bg-white text-[#66758A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* BRAND & MISSION COLUMN */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <img
                src="/logo.png"
                alt="JanSetu"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-[#66758A] leading-relaxed max-w-md">
              JanSetu connects Indian aspirants with genuine, active public-sector employment opportunities. Every vacancy is strictly verified against official government gazettes, notifications, and portals.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#23334D] pt-2">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck size={15} className="text-[#159B82]" />
                <span>100% Official Portal Links</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ExternalLink size={14} className="text-[#F28C28]" />
                <span>Zero Application Markups</span>
              </span>
            </div>
          </div>

          {/* POPULAR SECTORS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17243A] mb-3.5">
              Explore Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/category/banking" className="hover:text-[#F28C28] transition-colors">
                  Banking Recruitments
                </Link>
              </li>
              <li>
                <Link to="/category/defence" className="hover:text-[#F28C28] transition-colors">
                  Defence & Armed Forces
                </Link>
              </li>
              <li>
                <Link to="/category/railway" className="hover:text-[#F28C28] transition-colors">
                  Railway Jobs (RRB)
                </Link>
              </li>
              <li>
                <Link to="/category/ssc" className="hover:text-[#F28C28] transition-colors">
                  SSC Staff Selection
                </Link>
              </li>
              <li>
                <Link to="/category/upsc" className="hover:text-[#F28C28] transition-colors">
                  UPSC Civil Services
                </Link>
              </li>
            </ul>
          </div>

          {/* REGIONAL / STATE OPENINGS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17243A] mb-3.5">
              State Openings
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/state/maharashtra" className="hover:text-[#F28C28] transition-colors">
                  Maharashtra Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/bihar" className="hover:text-[#F28C28] transition-colors">
                  Bihar Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/rajasthan" className="hover:text-[#F28C28] transition-colors">
                  Rajasthan Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/uttar-pradesh" className="hover:text-[#F28C28] transition-colors">
                  Uttar Pradesh Jobs
                </Link>
              </li>
              <li>
                <Link to="/state/delhi" className="hover:text-[#F28C28] transition-colors">
                  Delhi NCT Jobs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* OFFICIAL DISCLAIMER STRIP */}
        <div className="pt-6 border-t border-[#E4EAF3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66758A]">
          <p className="text-center sm:text-left leading-relaxed max-w-xl">
            <span className="font-semibold text-[#17243A]">Official Disclaimer:</span> JanSetu is an independent job discovery aggregator and is not affiliated with any government ministry or agency. Always refer to official government notifications and candidate portals before submitting applications.
          </p>

          <div className="flex items-center gap-1 shrink-0 font-medium text-[#23334D]">
            <span>Crafted for Bharat with</span>
            <Heart size={13} className="text-[#E84D62] fill-[#E84D62] inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
