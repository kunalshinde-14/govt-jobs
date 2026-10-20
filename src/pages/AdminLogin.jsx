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
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66758A] hover:text-[#17243A] transition mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to JanSetu Portal</span>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-3.5 shadow-subtle">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#17243A] tracking-tight">
            Admin Authentication
          </h1>
          <p className="text-xs text-[#66758A] mt-1">
            Restricted access for JanSetu platform management
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white border border-[#E4EAF3] rounded-3xl p-6 sm:p-8 shadow-card"
        >
          {error && (
            <div className="bg-[#FDF0F2] border border-[#FAC7CF] text-[#E84D62] text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2 font-medium">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-xs font-bold text-[#17243A] mb-1.5">
              Admin Security Key / Password
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
            className="w-full bg-[#17243A] hover:bg-[#23334D] disabled:bg-[#66758A] text-white font-semibold py-3 rounded-xl text-sm transition shadow-subtle flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#F28C28]"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>{loading ? "Authenticating..." : "Authorize Access"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
