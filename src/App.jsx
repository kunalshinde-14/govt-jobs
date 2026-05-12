import BASE_URL from "./utils/api";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { useEffect, useState } from "react";
import axios from "axios";

import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ClosingSoon from "./components/ClosingSoon";
import LatestJobs from "./components/LatestJobs";
import Categories from "./components/Categories";
import Footer from "./components/Footer";

import LoginModal from "./components/LoginModal";

import SavedJobs from "./pages/SavedJobs";
import CategoryPage from "./pages/CategoryPage";
import JobPage from "./pages/JobPage";
import AdminPage from "./pages/AdminPage";
import AdminLogin from "./pages/AdminLogin";

function App() {

  // 🔥 ALL JOBS
  const [jobs, setJobs] =
    useState([]);

  // 🔥 LOADING
  const [loading, setLoading] =
    useState(true);

  // 🔍 SEARCH
  const [search, setSearch] =
    useState("");

  // 🔍 FILTERS
  const [filters, setFilters] =
    useState({
      qualification: [],
      state: "",
    });

  // 🔐 LOGIN
  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!localStorage.getItem("token")
    );

  // 🔐 LOGIN MODAL
  const [showLogin, setShowLogin] =
    useState(false);

  // ❤️ SAVED JOB IDS
  const [savedJobs, setSavedJobs] =
    useState([]);




  // ✅ FETCH SAVED JOBS
  useEffect(() => {

    const fetchSavedJobs = async () => {

      try {

        const token =
          localStorage.getItem("token");

        // USER NOT LOGGED IN
        if (!token) {

          setSavedJobs([]);

          return;

        }

        const res = await axios.get(
          `${BASE_URL}/api/users/saved-jobs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ ONLY STORE IDS
        const ids =
          res.data.map(
            (job) => job._id
          );

        setSavedJobs(ids);

      } catch (error) {

        console.log(error);

      }

    };

    fetchSavedJobs();

  }, [isLoggedIn]);




  // ✅ FETCH ALL JOBS
  useEffect(() => {

    const fetchJobs = async () => {

      try {

        const res = await axios.get(
          `${BASE_URL}/api/jobs`
        );

        setJobs(res.data);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchJobs();

  }, []);




  return (

    <div className="min-h-screen bg-[#fffbf5]">

      {/* NAVBAR */}
      <Navbar savedJobs={savedJobs} />



      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={

            <div className="space-y-8">

              <Hero
                jobs={jobs}
                search={search}
                setSearch={setSearch}
                filters={filters}
                setFilters={setFilters}
              />

              <ClosingSoon
                jobs={jobs}
                loading={loading}
                isLoggedIn={isLoggedIn}
                setShowLogin={setShowLogin}
                savedJobs={savedJobs}
                setSavedJobs={setSavedJobs}
              />

              <LatestJobs
                jobs={jobs}
                loading={loading}
                search={search}
                filters={filters}
                isLoggedIn={isLoggedIn}
                setShowLogin={setShowLogin}
                savedJobs={savedJobs}
                setSavedJobs={setSavedJobs}
              />

              <Categories
                jobs={jobs}
                loading={loading}
              />

            </div>

          }
        />



        {/* SAVED JOBS */}
        <Route
          path="/saved"
          element={
            <SavedJobs
              jobs={jobs}
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
              savedJobs={savedJobs}
              setSavedJobs={setSavedJobs}
            />
          }
        />



        {/* CATEGORY PAGE */}
        <Route
          path="/category/:category"
          element={
            <CategoryPage
              jobs={jobs}
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
              savedJobs={savedJobs}
              setSavedJobs={setSavedJobs}
            />
          }
        />
      <Route
  path="/admin-login"
  element={<AdminLogin />}
/>


        {/* ADMIN PAGE */}
        <Route
  path="/admin"
  element={
    <AdminProtectedRoute>
      <AdminPage />
    </AdminProtectedRoute>
  }
/>



        {/* JOB PAGE */}
        <Route
          path="/job/:id"
          element={
            <JobPage jobs={jobs} />
          }
        />

      </Routes>



      {/* LOGIN MODAL */}
      {showLogin && (

        <LoginModal
          onClose={() =>
            setShowLogin(false)
          }
          onLogin={() => {

            setIsLoggedIn(true);

            setShowLogin(false);

          }}
        />

      )}



      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default App;