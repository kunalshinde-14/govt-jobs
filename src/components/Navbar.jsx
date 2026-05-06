import { Link, useLocation } from "react-router-dom";
import { getSavedJobs } from "../utils/storage";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setSavedCount(getSavedJobs().length);

    // update when storage changes
    const interval = setInterval(() => {
      setSavedCount(getSavedJobs().length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const linkStyle = (path) =>
    `transition ${
      location.pathname === path
        ? "text-amber-600 font-medium"
        : "text-gray-700 hover:text-amber-600"
    }`;

  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-xl font-semibold text-amber-600">
          GovtJobs
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6 text-sm">

          <Link to="/" className={linkStyle("/")}>
            Home
          </Link>

          <Link to="/saved" className={linkStyle("/saved")}>
            Saved
            {savedCount > 0 && (
              <span className="ml-2 text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">
                {savedCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}