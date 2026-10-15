import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, Home, LogOut, Shield, User, Menu, X, LogIn } from "lucide-react";

export default function Navbar({ savedJobs = [], onOpenLogin }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let user = null;
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) user = JSON.parse(rawUser);
  } catch {
    user = null;
  }

  const isAdmin = !!localStorage.getItem("adminToken");

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

  const isHome = location.pathname === "/";
  const isSaved = location.pathname === "/saved";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F3] border-b border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] sm:h-[76px] md:h-20 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center shrink-0 transition-opacity hover:opacity-95"
          aria-label="JanSetu - Home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src="/logo.png"
            alt="JanSetu"
            className="h-10 sm:h-11 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-all ${
              isHome
                ? "bg-[#F5F2EA] text-[#202521] font-semibold border border-[#E8E5DE] shadow-subtle"
                : "text-[#737873] hover:text-[#202521] hover:bg-[#F5F2EA]/60 font-medium"
            }`}
          >
            <Home size={16} className={isHome ? "text-[#F28C00]" : "text-[#737873]"} />
            <span>Home</span>
          </Link>

          <Link
            to="/saved"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-all ${
              isSaved
                ? "bg-[#F5F2EA] text-[#202521] font-semibold border border-[#E8E5DE] shadow-subtle"
                : "text-[#737873] hover:text-[#202521] hover:bg-[#F5F2EA]/60 font-medium"
            }`}
          >
            <Bookmark size={16} className={isSaved ? "text-[#F28C00]" : "text-[#737873]"} />
            <span>Saved Jobs</span>
            {savedJobs.length > 0 && (
              <span className="ml-0.5 px-2 py-0.5 text-xs font-bold rounded-full bg-[#F28C00] text-white leading-none">
                {savedJobs.length}
              </span>
            )}
          </Link>
        </nav>

        {/* DESKTOP AUTHENTICATION & ADMIN CONTROLS */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-1.5 pr-1 border-r border-[#E8E5DE]">
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isAdminPage
                    ? "bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-300"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                }`}
              >
                <Shield size={13} />
                <span>Admin</span>
              </Link>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-2 py-1 text-xs text-rose-600 hover:text-rose-800 hover:underline transition"
                title="Exit administrative mode"
              >
                Exit
              </button>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#E8E5DE] text-xs font-semibold text-[#202521] shadow-subtle">
                <User size={14} className="text-[#F28C00]" />
                <span className="max-w-[130px] truncate">{user?.name || "User"}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#737873] hover:text-[#202521] hover:bg-white border border-[#E8E5DE] transition-colors"
                title="Log out of account"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#202521] text-white hover:bg-[#3D443F] focus-visible:ring-2 focus-visible:ring-[#F28C00] focus-visible:outline-none transition-colors shadow-subtle"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* MOBILE CONTROLS BAR */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/saved"
            className="p-2 rounded-lg text-[#202521] hover:bg-[#E8E5DE]/50 relative"
            aria-label={`Saved jobs (${savedJobs.length})`}
          >
            <Bookmark size={21} className={isSaved ? "text-[#F28C00]" : "text-[#202521]"} />
            {savedJobs.length > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-[#F28C00] text-white flex items-center justify-center leading-none">
                {savedJobs.length}
              </span>
            )}
          </Link>

          {!user && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#202521] text-white hover:bg-[#3D443F] shadow-subtle"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#202521] hover:bg-[#E8E5DE]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C00]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E5DE] bg-[#FAF8F3] px-4 sm:px-6 py-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-sm transition-colors ${
              isHome
                ? "bg-[#F5F2EA] text-[#202521] font-semibold border border-[#E8E5DE]"
                : "text-[#737873] hover:text-[#202521] font-medium"
            }`}
          >
            <Home size={18} className={isHome ? "text-[#F28C00]" : "text-[#737873]"} />
            <span>Home</span>
          </Link>

          <Link
            to="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm transition-colors ${
              isSaved
                ? "bg-[#F5F2EA] text-[#202521] font-semibold border border-[#E8E5DE]"
                : "text-[#737873] hover:text-[#202521] font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark size={18} className={isSaved ? "text-[#F28C00]" : "text-[#737873]"} />
              <span>Saved Jobs</span>
            </div>
            {savedJobs.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#F28C00] text-white">
                {savedJobs.length}
              </span>
            )}
          </Link>

          {isAdmin && (
            <div className="pt-2 border-t border-[#E8E5DE] flex items-center justify-between">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-rose-700 font-semibold px-3 py-2"
              >
                <Shield size={16} />
                <span>Admin Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="text-xs text-rose-600 px-3 py-2 underline"
              >
                Exit Admin
              </button>
            </div>
          )}

          {user && (
            <div className="pt-2 border-t border-[#E8E5DE] flex items-center justify-between px-3.5 py-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#202521]">
                <User size={16} className="text-[#F28C00]" />
                <span className="truncate max-w-[180px]">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-[#737873] hover:text-[#202521] border border-[#E8E5DE] rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}