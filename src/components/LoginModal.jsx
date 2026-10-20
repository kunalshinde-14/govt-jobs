import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { X, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import BASE_URL from "../utils/api";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
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
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
        });

        if (isMounted) {
          setGoogleRendered(true);
        }
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
      className="fixed inset-0 bg-[#17243A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#E4EAF3] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-floating relative">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-[#66758A] hover:text-[#17243A] hover:bg-[#EAF2FF] transition"
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] text-[#F28C28] flex items-center justify-center mb-3.5 shadow-subtle">
            <Lock size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A]">
            {isSignup ? "Create JanSetu Account" : "Welcome Back"}
          </h2>
          <p className="text-xs sm:text-sm text-[#66758A] mt-1">
            {isSignup
              ? "Bookmark vacancies and track approaching application deadlines."
              : "Sign in to access your saved job listings."}
          </p>
        </div>

        {/* ERROR NOTICE */}
        {error && (
          <div className="bg-[#FDF0F2] border border-[#FAC7CF] text-[#E84D62] text-xs p-3.5 rounded-2xl mb-4 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
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
                className="w-full py-2.5 px-4 rounded-xl border border-[#E4EAF3] bg-white hover:bg-[#F7F8FC] text-sm font-semibold text-[#17243A] shadow-subtle flex items-center justify-center gap-3 transition-colors active:scale-[0.99] disabled:opacity-60"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* OR DIVIDER */}
        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#E4EAF3]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-[#66758A] uppercase tracking-wider font-bold">
            Or continue with email
          </span>
          <div className="flex-grow border-t border-[#E4EAF3]"></div>
        </div>

        {/* EMAIL & PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66758A]">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E4EAF3] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17243A] placeholder-[#66758A] focus:bg-white focus:border-[#F28C28] focus:ring-4 focus:ring-[#F28C28]/15 focus:outline-none transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17243A] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66758A]">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F8FC] border border-[#E4EAF3] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17243A] placeholder-[#66758A] focus:bg-white focus:border-[#F28C28] focus:ring-4 focus:ring-[#F28C28]/15 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17243A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66758A]">
                <Lock size={16} />
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F8FC] border border-[#E4EAF3] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17243A] placeholder-[#66758A] focus:bg-white focus:border-[#F28C28] focus:ring-4 focus:ring-[#F28C28]/15 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F28C28] hover:bg-[#E07D1B] disabled:bg-[#F28C28]/70 text-white font-semibold py-3 rounded-xl text-sm transition shadow-subtle flex items-center justify-center gap-2 mt-2"
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
        <div className="mt-5 text-center pt-4 border-t border-[#E4EAF3]">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="text-xs text-[#66758A] hover:text-[#17243A]"
          >
            {isSignup ? (
              <span>
                Already have an account?{" "}
                <strong className="text-[#F28C28] font-semibold hover:underline">
                  Sign In
                </strong>
              </span>
            ) : (
              <span>
                Don&apos;t have an account yet?{" "}
                <strong className="text-[#F28C28] font-semibold hover:underline">
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
