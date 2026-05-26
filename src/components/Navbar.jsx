import { Link, useLocation } from "react-router-dom";

export default function Navbar({ savedJobs }) {

  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = localStorage.getItem("adminToken");

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("savedJobs");
    window.location.href = "/";
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="text-xl font-bold text-amber-600 shrink-0">
          GovtJobs
        </Link>

        {/* NAV — no wrap, all on one line */}
        <div className="flex items-center gap-3 text-sm">

          <Link to="/"
            className={`shrink-0 ${location.pathname === "/" ? "font-semibold text-black" : "text-stone-500"}`}>
            Home
          </Link>

          <Link to="/saved"
            className={`shrink-0 whitespace-nowrap ${location.pathname === "/saved" ? "font-semibold text-black" : "text-stone-500"}`}>
            Saved ({savedJobs.length})
          </Link>

          {isAdmin && (
            <button onClick={handleAdminLogout}
              className="shrink-0 hidden md:block bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs">
              Admin
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2">
              <div className="shrink-0 hidden md:block bg-stone-100 px-3 py-1.5 rounded-xl text-sm">
                {user?.name}
              </div>
              <button onClick={handleLogout}
                className="shrink-0 bg-black text-white px-3 py-1.5 rounded-xl text-xs whitespace-nowrap">
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}