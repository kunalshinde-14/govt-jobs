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

function App() {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ qualification: [], state: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(false);

  // ✅ SINGLE source of truth for saved jobs
  const [savedJobs, setSavedJobs] = useState([]);

  // ✅ FETCH SAVED JOBS — from backend if logged in, else empty
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "https://govt-jobs-backend-2egy.onrender.com/api/users/saved-jobs",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const ids = res.data.map((job) => job._id);
        setSavedJobs(ids);

      } catch (error) {
        console.log(error);
      }
    };

    fetchSavedJobs();
  }, [isLoggedIn]); // re-fetch when user logs in

  // 🔥 FETCH JOBS
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("https://govt-jobs-backend-2egy.onrender.com/api/jobs");
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

      <Navbar savedJobs={savedJobs} />

      <Routes>

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

        <Route
          path="/category/:name"
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
          path="/job/:id"
          element={<JobPage jobs={jobs} />}
        />

      </Routes>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={() => {
            setIsLoggedIn(true);
            setShowLogin(false);
          }}
        />
      )}

      <Footer />

    </div>
  );
}

export default App;