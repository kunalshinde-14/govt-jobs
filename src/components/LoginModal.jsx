import { useState } from "react";
import axios from "axios";

export default function LoginModal({
  onClose,
  onLogin,
}) {

  const [isSignup, setIsSignup] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // 🔥 HANDLE AUTH
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const url = isSignup
        ? "http://localhost:5000/api/auth/signup"
        : "http://localhost:5000/api/auth/login";

      const body = isSignup
        ? {
            name,
            email,
            password,
          }
        : {
            email,
            password,
          };

      const res = await axios.post(
        url,
        body
      );

      // 🔥 SAVE TOKEN
      localStorage.setItem(
        "token",
        res.data.token
      );

      // 🔥 SAVE USER
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      // 🔥 REAL LOGIN
      onLogin();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">

      <div className="bg-white rounded-2xl p-6 w-full max-w-md">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-semibold">

            {isSignup
              ? "Create Account"
              : "Welcome Back"}

          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-stone-500"
          >
            ×
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAME */}
          {isSignup && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3 outline-none"
              required
            />
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3 outline-none"
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3 outline-none"
            required
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-3 rounded-xl"
          >

            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}

          </button>

        </form>

        {/* TOGGLE */}
        <button
          onClick={() =>
            setIsSignup(!isSignup)
          }
          className="mt-4 text-sm text-amber-600"
        >

          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign up"}

        </button>

      </div>
    </div>
  );
}