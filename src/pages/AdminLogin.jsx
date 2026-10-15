import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Shield, Lock, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import BASE_URL from "../utils/api";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/admin/login`, { password });

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("isAdmin", "true");
      navigate("/admin");
    } catch (err) {
      setError("Invalid administrative password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737873] hover:text-[#202521] transition mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to JanSetu Portal</span>
          </button>

          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-3 shadow-subtle">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#202521] tracking-tight">
            Admin Authentication
          </h1>
          <p className="text-xs text-[#737873] mt-1">
            Restricted access for JanSetu platform management
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 shadow-card"
        >
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#202521] mb-1.5">
              Admin Security Key / Password
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
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#202521] placeholder-[#737873] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#202521] hover:bg-[#3D443F] disabled:bg-[#737873] text-white font-semibold py-3 rounded-xl text-sm transition shadow-subtle flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>{loading ? "Authenticating..." : "Authorize Access"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}