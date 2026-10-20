import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, Home, LogOut, Shield, User, Menu, X, LogIn, Sliders } from "lucide-react";

export default function Navbar({ savedJobs = [], onOpenLogin, onOpenPreferences }) {
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E4EAF3] shadow-subtle transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] sm:h-[72px] md:h-[76px] flex items-center justify-between gap-4">
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
            className="h-9 sm:h-10 md:h-11 w-auto object-contain"
          />
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all ${
              isHome
                ? "bg-[#EAF2FF] text-[#17243A] font-semibold border border-[#D7DFEB] shadow-subtle"
                : "text-[#66758A] hover:text-[#17243A] hover:bg-[#EAF2FF]/50 font-medium"
            }`}
          >
            <Home size={16} className={isHome ? "text-[#F28C28]" : "text-[#66758A]"} />
            <span>Home</span>
          </Link>

          <Link
            to="/saved"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all ${
              isSaved
                ? "bg-[#EAF2FF] text-[#17243A] font-semibold border border-[#D7DFEB] shadow-subtle"
                : "text-[#66758A] hover:text-[#17243A] hover:bg-[#EAF2FF]/50 font-medium"
            }`}
          >
            <Bookmark size={16} className={isSaved ? "text-[#F28C28]" : "text-[#66758A]"} />
            <span>Saved Jobs</span>
            {savedJobs.length > 0 && (
              <span className="ml-0.5 px-2 py-0.5 text-xs font-bold rounded-full bg-[#F28C28] text-white leading-none">
                {savedJobs.length}
              </span>
            )}
          </Link>
        </nav>

        {/* DESKTOP AUTHENTICATION & ADMIN CONTROLS */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-1.5 pr-2 border-r border-[#E4EAF3]">
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
              <button
                type="button"
                onClick={onOpenPreferences}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#17243A] bg-[#EAF2FF] hover:bg-[#D7DFEB] border border-[#D7DFEB] transition-colors shadow-subtle"
                title="Edit your opportunity preferences"
              >
                <Sliders size={13} className="text-[#F28C28]" />
                <span>Preferences</span>
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E4EAF3] text-xs font-semibold text-[#17243A] shadow-subtle">
                <div className="w-5 h-5 rounded-full bg-[#EAF2FF] flex items-center justify-center text-[#F28C28]">
                  <User size={12} />
                </div>
                <span className="max-w-[120px] truncate">{user?.name || "User"}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#66758A] hover:text-[#17243A] hover:bg-[#F7F8FC] border border-[#E4EAF3] transition-colors"
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#17243A] text-white hover:bg-[#23334D] focus-visible:ring-2 focus-visible:ring-[#F28C28] focus-visible:outline-none transition-colors shadow-subtle"
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
            className="p-2 rounded-xl text-[#17243A] hover:bg-[#EAF2FF] relative"
            aria-label={`Saved jobs (${savedJobs.length})`}
          >
            <Bookmark size={20} className={isSaved ? "text-[#F28C28]" : "text-[#17243A]"} />
            {savedJobs.length > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-[#F28C28] text-white flex items-center justify-center leading-none">
                {savedJobs.length}
              </span>
            )}
          </Link>

          {!user && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#17243A] text-white hover:bg-[#23334D] shadow-subtle"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#17243A] hover:bg-[#EAF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C28]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4EAF3] bg-white px-4 sm:px-6 py-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm transition-colors ${
              isHome
                ? "bg-[#EAF2FF] text-[#17243A] font-semibold border border-[#D7DFEB]"
                : "text-[#66758A] hover:text-[#17243A] font-medium"
            }`}
          >
            <Home size={18} className={isHome ? "text-[#F28C28]" : "text-[#66758A]"} />
            <span>Home</span>
          </Link>

          <Link
            to="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-colors ${
              isSaved
                ? "bg-[#EAF2FF] text-[#17243A] font-semibold border border-[#D7DFEB]"
                : "text-[#66758A] hover:text-[#17243A] font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark size={18} className={isSaved ? "text-[#F28C28]" : "text-[#66758A]"} />
              <span>Saved Jobs</span>
            </div>
            {savedJobs.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#F28C28] text-white">
                {savedJobs.length}
              </span>
            )}
          </Link>

          {isAdmin && (
            <div className="pt-2 border-t border-[#E4EAF3] flex items-center justify-between">
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
            <>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPreferences();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#17243A] bg-[#EAF2FF] border border-[#D7DFEB]"
              >
                <Sliders size={16} className="text-[#F28C28]" />
                <span>My Opportunity Preferences</span>
              </button>

              <div className="pt-2 border-t border-[#E4EAF3] flex items-center justify-between px-3.5 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#17243A]">
                  <div className="w-5 h-5 rounded-full bg-[#EAF2FF] flex items-center justify-center text-[#F28C28]">
                    <User size={13} />
                  </div>
                  <span className="truncate max-w-[180px]">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-[#66758A] hover:text-[#17243A] border border-[#E4EAF3] rounded-lg px-2.5 py-1.5 bg-white font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
