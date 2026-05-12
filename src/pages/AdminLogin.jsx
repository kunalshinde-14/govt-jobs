import { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

export default function AdminLogin() {

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();




  // 🔥 LOGIN
  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      // ✅ BACKEND LOGIN
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        {
          password,
        }
      );



      // ✅ STORE JWT
      localStorage.setItem(
        "adminToken",
        res.data.token
      );



      // ✅ ADMIN ACCESS
      localStorage.setItem(
        "isAdmin",
        "true"
      );



      // ✅ REDIRECT
      navigate("/admin");

    } catch (error) {

      alert("Wrong password");

      console.log(error);

    } finally {

      setLoading(false);

    }

  };




  return (

    <div className="min-h-screen flex items-center justify-center bg-[#fffbf5] px-4">

      <form
        onSubmit={handleLogin}
        className="bg-white border rounded-2xl p-8 w-full max-w-md"
      >

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6 text-center">
          Admin Login
        </h1>



        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full border rounded-xl px-4 py-3 mb-5"
          required
        />



        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >

          {loading
            ? "Logging in..."
            : "Login"}

        </button>

      </form>

    </div>

  );
}