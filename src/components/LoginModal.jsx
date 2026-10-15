import { useState } from "react";
import axios from "axios";
import { X, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import BASE_URL from "../utils/api";

export default function LoginModal({ onClose, onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isSignup
        ? `${BASE_URL}/api/auth/signup`
        : `${BASE_URL}/api/auth/login`;

      const body = isSignup
        ? { name, email, password }
        : { email, password };

      const res = await axios.post(url, body);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      onLogin();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#202521]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FAF8F3] border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-hover relative">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737873] hover:text-[#202521] hover:bg-[#E8E5DE]/40 transition"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF8ED] border border-[#FDE0B2] text-[#F28C00] flex items-center justify-center mb-3">
            <Lock size={18} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202521]">
            {isSignup ? "Create JanSetu Account" : "Welcome Back"}
          </h2>
          <p className="text-xs sm:text-sm text-[#737873] mt-1">
            {isSignup
              ? "Bookmark vacancies and track approaching application deadlines."
              : "Sign in to access your saved job listings."}
          </p>
        </div>

        {/* ERROR NOTICE */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737873]">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#202521] placeholder-[#737873] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#202521] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737873]">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#202521] placeholder-[#737873] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202521] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737873]">
                <Lock size={16} />
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#202521] placeholder-[#737873] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F28C00] hover:bg-[#D97706] disabled:bg-[#F28C00]/70 text-white font-semibold py-3 rounded-xl text-sm transition shadow-subtle flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>
              {loading
                ? "Verifying..."
                : isSignup
                ? "Create Account"
                : "Sign In"}
            </span>
          </button>
        </form>

        {/* TOGGLE */}
        <div className="mt-5 text-center pt-4 border-t border-[#E8E5DE]">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="text-xs text-[#737873] hover:text-[#202521]"
          >
            {isSignup ? (
              <span>
                Already have an account?{" "}
                <strong className="text-[#F28C00] font-semibold hover:underline">
                  Sign In
                </strong>
              </span>
            ) : (
              <span>
                Don&apos;t have an account yet?{" "}
                <strong className="text-[#F28C00] font-semibold hover:underline">
                  Create one free
                </strong>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}