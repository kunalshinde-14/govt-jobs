import { useState } from "react";
import axios from "axios";
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
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <button onClick={onClose} className="text-2xl text-stone-500">×</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignup && (
            <input type="text" placeholder="Name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none" required />
          )}

          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 outline-none" required />

          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 outline-none" required />

          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 text-white py-3 rounded-xl">
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
          </button>

        </form>

        <button onClick={() => setIsSignup(!isSignup)}
          className="mt-4 text-sm text-amber-600">
          {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
        </button>

      </div>
    </div>
  );
}