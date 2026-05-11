import { Link, useLocation } from "react-router-dom";

export default function Navbar({ savedJobs }) {

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="border-b bg-white sticky top-0 z-50">

      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold text-amber-600"
        >
          GovtJobs
        </Link>

        {/* NAV */}
        <div className="flex items-center gap-6">

          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "font-semibold text-black"
                : "text-stone-500"
            }
          >
            Home
          </Link>

          {/* SAVED */}
          <Link
            to="/saved"
            className={
              location.pathname === "/saved"
                ? "font-semibold text-black"
                : "text-stone-500"
            }
          >
            Saved ({savedJobs.length})
          </Link>

          {/* USER */}
          {user && (
            <div className="bg-stone-100 px-4 py-2 rounded-xl text-sm">
              {user.name}
            </div>
          )}

        </div>

      </div>

    </nav>
  );
}