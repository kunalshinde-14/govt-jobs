import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { X, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import BASE_URL from "../utils/api";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function LoginModal({ onClose, onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleBtnRef = useRef(null);
  const [googleRendered, setGoogleRendered] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) {
        setError("Google authentication was cancelled or returned no credentials.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await axios.post(`${BASE_URL}/api/auth/google`, {
          credential: response.credential,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        onLogin();
      } catch (err) {
        if (!err.response) {
          setError(
            "Unable to connect to the authentication server. Please verify network connectivity."
          );
        } else {
          setError(
            err.response.data?.message ||
              "Google Sign-In failed. Please try again or sign in with your password."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [onLogin]
  );

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) {
        return false;
      }

      if (!clientId) {
        return false;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 340,
        });

        if (isMounted) setGoogleRendered(true);
        return true;
      } catch (err) {
        console.error("GIS render error:", err);
        return false;
      }
    };

    if (!renderGoogleButton()) {
      let attempts = 0;
      intervalId = setInterval(() => {
        attempts++;
        if (renderGoogleButton() || attempts > 20) {
          clearInterval(intervalId);
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [clientId, handleGoogleCredentialResponse]);

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

  const handleFallbackGoogleClick = () => {
    if (!clientId) {
      setError(
        "Google Sign-In is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your environment."
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError(
            "Could not display Google One Tap. Please ensure third-party cookies/popups are enabled."
          );
        }
      });
    } else {
      setError(
        "Google authentication services could not be reached. Please check your connection or sign in with email."
      );
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

        {/* GOOGLE SIGN-IN CONTAINER */}
        <div className="mb-4">
          <div className="w-full flex justify-center">
            {/* Target element for Google Identity Services official button */}
            <div
              ref={googleBtnRef}
              className={`w-full flex justify-center ${!googleRendered ? "hidden" : ""}`}
            />

            {/* Fallback button if Google GIS hasn't rendered iframe yet or client ID is missing */}
            {!googleRendered && (
              <button
                type="button"
                disabled={loading}
                onClick={handleFallbackGoogleClick}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8E5DE] bg-white hover:bg-[#FAF8F3] text-sm font-semibold text-[#202521] shadow-subtle flex items-center justify-center gap-3 transition-colors active:scale-[0.99] disabled:opacity-60"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* OR DIVIDER */}
        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#E8E5DE]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-[#737873] uppercase tracking-wider font-semibold">
            Or continue with email
          </span>
          <div className="flex-grow border-t border-[#E8E5DE]"></div>
        </div>

        {/* EMAIL & PASSWORD FORM */}
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
