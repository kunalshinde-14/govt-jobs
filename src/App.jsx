import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ClosingSoon from "./components/ClosingSoon";
import LatestJobs from "./components/LatestJobs";
import Categories from "./components/Categories";

import LoginModal from "./components/LoginModal";

import SavedJobs from "./pages/SavedJobs";
import CategoryPage from "./pages/CategoryPage";
import JobPage from "./pages/JobPage";

function App() {
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    qualification: [],
    state: "",
  });

  // 🔐 Persist login
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [showLogin, setShowLogin] = useState(false);

  return (
    <div>
      <Navbar />

      <Routes>

        {/* 🏠 HOME */}
        <Route
          path="/"
          element={
            <div className="space-y-8">

              <Hero
                search={search}
                setSearch={setSearch}
                filters={filters}
                setFilters={setFilters}
              />

              <ClosingSoon
                isLoggedIn={isLoggedIn}
                setShowLogin={setShowLogin}
              />

              <LatestJobs
                search={search}
                filters={filters}
                isLoggedIn={isLoggedIn}
                setShowLogin={setShowLogin}
              />

              <Categories />

            </div>
          }
        />

        {/* 💾 SAVED */}
        <Route
          path="/saved"
          element={
            <SavedJobs
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
            />
          }
        />

        {/* 📂 CATEGORY */}
        <Route
          path="/category/:name"
          element={
            <CategoryPage
              isLoggedIn={isLoggedIn}
              setShowLogin={setShowLogin}
            />
          }
        />

        {/* 📄 JOB PAGE */}
        <Route
          path="/job/:id"
          element={<JobPage />}
        />

      </Routes>

      {/* 🔐 LOGIN MODAL */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={() => {
            localStorage.setItem("isLoggedIn", "true");
            setIsLoggedIn(true);
            setShowLogin(false);
          }}
        />
      )}
    </div>
  );
}

export default App;