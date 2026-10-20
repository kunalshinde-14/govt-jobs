import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bookmark,
  ArrowRight,
  LogIn,
  Sparkles,
  Clock,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  Edit3,
  Save,
  Building2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import JobCard from "../components/JobCard";
import BASE_URL from "../utils/api";
import { formatCompactDate } from "../utils/jobHelpers";

const STAGES = ["Interested", "Preparing", "Applied", "Exam/Result"];

export default function SavedJobs({
  jobs = [],
  isLoggedIn,
  setShowLogin,
  savedJobs = [],
  setSavedJobs,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved"); // 'saved' or 'tracker'
  const [applications, setApplications] = useState([]);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [radar, setRadar] = useState({ urgent: [], closingThisWeek: [], upcoming: [] });
  const [loadingRadar, setLoadingRadar] = useState(false);

  // Filter full job objects matching saved IDs
  const savedJobsList = jobs.filter((job) => savedJobs.includes(job?._id));

  // Fetch Deadline Radar & Applications
  useEffect(() => {
    if (!isLoggedIn) return;
    let isMounted = true;

    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        if (isMounted) setLoadingRadar(true);
        const [radarRes, appRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/users/deadline-radar`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/users/applications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (isMounted) {
          setRadar(radarRes.data || { urgent: [], closingThisWeek: [], upcoming: [] });
          setApplications(appRes.data || []);
        }
      } catch (err) {
        console.error("Fetch retention data error:", err);
      } finally {
        if (isMounted) setLoadingRadar(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // Update application stage or notes
  const updateApplication = async (jobId, status, notes) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/users/applications/${jobId}`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.application;
      setApplications((prev) => {
        const idx = prev.findIndex((a) => (a.jobId?._id || a.jobId) === jobId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return [...prev, updated];
      });

      setEditingNotesId(null);
    } catch (err) {
      console.error("Update application error:", err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white border border-[#E4EAF3] rounded-3xl p-8 sm:p-12 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] text-[#F28C28] flex items-center justify-center mx-auto mb-4 shadow-subtle">
            <Bookmark size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A] mb-2">
            Access Your Saved Jobs
          </h2>
          <p className="text-sm text-[#66758A] mb-6 leading-relaxed max-w-md mx-auto">
            Log in to view your bookmarked government opportunities, monitor your Deadline Radar, and track candidate application progress.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#17243A] hover:bg-[#23334D] text-white text-sm font-semibold transition shadow-subtle focus-visible:ring-2 focus-visible:ring-[#F28C28]"
          >
            <LogIn size={16} />
            <span>Sign In to Continue</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
      {/* HEADER & VIEW TABS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#E4EAF3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-[#EAF2FF] text-[#17243A] border border-[#D7DFEB]">
              <Bookmark size={15} className="text-[#F28C28]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#23334D]">
              Candidate Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243A] tracking-tight">
            Saved Vacancies & Tracker
          </h1>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 bg-[#F7F8FC] p-1.5 rounded-2xl border border-[#E4EAF3]">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "saved"
                ? "bg-white text-[#17243A] shadow-subtle border border-[#E4EAF3]"
                : "text-[#66758A] hover:text-[#17243A]"
            }`}
          >
            <Bookmark size={14} className={activeTab === "saved" ? "text-[#F28C28]" : ""} />
            <span>Saved & Radar ({savedJobsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tracker")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "tracker"
                ? "bg-white text-[#17243A] shadow-subtle border border-[#E4EAF3]"
                : "text-[#66758A] hover:text-[#17243A]"
            }`}
          >
            <ListTodo size={14} className={activeTab === "tracker" ? "text-[#F28C28]" : ""} />
            <span>Application Tracker ({applications.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "saved" ? (
        <>
          {/* DEADLINE RADAR WIDGET (ONLY SHOWN IF USER HAS SAVED JOBS) */}
          {savedJobsList.length > 0 && !loadingRadar && (
            <div className="mb-8 p-5 bg-white border border-[#E4EAF3] rounded-3xl shadow-card">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF0F2] border border-[#FAC7CF] flex items-center justify-center text-[#E84D62]">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#17243A]">
                      Deadline Radar for Saved Vacancies
                    </h2>
                    <p className="text-[11px] text-[#66758A]">
                      Prioritized by verified official application closing dates
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Urgent (<= 3 days) */}
                <div className="p-3.5 rounded-2xl bg-[#FDF0F2] border border-[#FAC7CF]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#E84D62] flex items-center gap-1">
                      <AlertTriangle size={13} />
                      <span>Urgent (≤ 3 Days)</span>
                    </span>
                    <span className="text-xs font-extrabold text-[#E84D62] bg-white px-2 py-0.5 rounded-full border border-[#FAC7CF]">
                      {radar.urgent.length}
                    </span>
                  </div>
                  {radar.urgent.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {radar.urgent.slice(0, 2).map((item) => (
                        <div
                          key={item.job._id}
                          onClick={() => navigate(`/job/${item.job._id}`)}
                          className="text-xs font-semibold text-[#17243A] hover:text-[#E84D62] cursor-pointer truncate"
                        >
                          • {item.job.title} ({item.daysRemaining}d left)
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#66758A]">No urgent deadlines closing soon.</p>
                  )}
                </div>

                {/* Closing This Week (4-7 days) */}
                <div className="p-3.5 rounded-2xl bg-[#FFF7ED] border border-[#FDD8B3]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#C4650E] flex items-center gap-1">
                      <Clock size={13} />
                      <span>Closing This Week</span>
                    </span>
                    <span className="text-xs font-extrabold text-[#C4650E] bg-white px-2 py-0.5 rounded-full border border-[#FDD8B3]">
                      {radar.closingThisWeek.length}
                    </span>
                  </div>
                  {radar.closingThisWeek.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {radar.closingThisWeek.slice(0, 2).map((item) => (
                        <div
                          key={item.job._id}
                          onClick={() => navigate(`/job/${item.job._id}`)}
                          className="text-xs font-semibold text-[#17243A] hover:text-[#C4650E] cursor-pointer truncate"
                        >
                          • {item.job.title} ({item.daysRemaining}d left)
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#66758A]">No deadlines expiring this week.</p>
                  )}
                </div>

                {/* Upcoming (> 7 days) */}
                <div className="p-3.5 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#23334D] flex items-center gap-1">
                      <Calendar size={13} className="text-[#F28C28]" />
                      <span>Upcoming Deadlines</span>
                    </span>
                    <span className="text-xs font-extrabold text-[#23334D] bg-white px-2 py-0.5 rounded-full border border-[#D7DFEB]">
                      {radar.upcoming.length}
                    </span>
                  </div>
                  {radar.upcoming.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {radar.upcoming.slice(0, 2).map((item) => (
                        <div
                          key={item.job._id}
                          onClick={() => navigate(`/job/${item.job._id}`)}
                          className="text-xs font-semibold text-[#17243A] hover:text-[#F28C28] cursor-pointer truncate"
                        >
                          • {item.job.title} ({formatCompactDate(item.job.lastDate)})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#66758A]">All saved deadlines tracked.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {savedJobsList.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white border border-[#E4EAF3] rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto shadow-card">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-center justify-center mx-auto mb-4 text-[#66758A]">
                <Bookmark size={24} className="text-[#F28C28]" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#17243A] mb-2">
                No saved jobs yet
              </h2>
              <p className="text-xs sm:text-sm text-[#66758A] mb-6 max-w-md mx-auto leading-relaxed">
                Click the heart icon on any recruitment card to bookmark opportunities you want to track on your Deadline Radar.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07D1B] text-white text-sm font-semibold transition shadow-subtle"
              >
                <Sparkles size={16} />
                <span>Browse Active Jobs</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* SAVED JOBS GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedJobsList.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  isLoggedIn={isLoggedIn}
                  setShowLogin={setShowLogin}
                  savedJobs={savedJobs}
                  setSavedJobs={setSavedJobs}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* APPLICATION TRACKER VIEW */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-start gap-2.5 text-xs text-[#23334D]">
            <CheckCircle2 size={16} className="text-[#159B82] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Candidate Progress Lifecycle:</span> Update each opportunity as you prepare, submit, and attend examinations. JanSetu preserves your notes and registration details securely.
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white border border-[#E4EAF3] rounded-3xl p-10 text-center max-w-xl mx-auto shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] flex items-center justify-center mx-auto mb-3 text-[#17243A]">
                <ListTodo size={20} className="text-[#F28C28]" />
              </div>
              <h3 className="text-base font-bold text-[#17243A] mb-1">
                No applications tracked yet
              </h3>
              <p className="text-xs text-[#66758A] mb-4">
                Bookmark a vacancy to begin tracking preparation notes and application stages.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className="px-4 py-2 rounded-xl bg-[#17243A] text-white text-xs font-semibold hover:bg-[#23334D]"
              >
                View Saved Opportunities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const job = app.jobId;
                if (!job) return null;
                const isEditing = editingNotesId === job._id;

                return (
                  <div
                    key={app._id || job._id}
                    className="bg-white border border-[#E4EAF3] rounded-3xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#23334D] bg-[#EAF2FF] border border-[#D7DFEB] px-2.5 py-0.5 rounded-lg">
                          <Building2 size={12} className="text-[#F28C28]" />
                          <span>{job.department}</span>
                        </span>
                        <span className="text-xs text-[#66758A]">
                          Deadline: {job.lastDate}
                        </span>
                      </div>

                      <h3
                        onClick={() => navigate(`/job/${job._id}`)}
                        className="text-base sm:text-lg font-bold text-[#17243A] hover:text-[#F28C28] cursor-pointer transition"
                      >
                        {job.title}
                      </h3>

                      {/* CANDIDATE NOTES */}
                      {isEditing ? (
                        <div className="pt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Add registration number, exam date, or notes..."
                            className="w-full max-w-md bg-[#F7F8FC] border border-[#E4EAF3] rounded-xl px-3 py-1.5 text-xs text-[#17243A] focus:bg-white focus:border-[#F28C28] focus:outline-none"
                            maxLength={500}
                          />
                          <button
                            type="button"
                            onClick={() => updateApplication(job._id, app.status, notesDraft)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#159B82] text-white text-xs font-semibold hover:bg-[#11826D] shadow-subtle"
                          >
                            <Save size={12} />
                            <span>Save</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs text-[#66758A]">
                            {app.notes ? (
                              <strong className="text-[#23334D] font-medium bg-[#F7F8FC] border border-[#E4EAF3] px-2.5 py-1 rounded-lg">
                                Notes: {app.notes}
                              </strong>
                            ) : (
                              <span className="italic">No personal notes added</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNotesId(job._id);
                              setNotesDraft(app.notes || "");
                            }}
                            className="p-1 rounded-lg text-[#66758A] hover:text-[#17243A] hover:bg-[#EAF2FF]"
                            title="Edit notes"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* STAGE SELECTOR BUTTONS */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#F7F8FC] p-1 rounded-2xl border border-[#E4EAF3]">
                        {STAGES.map((stage) => {
                          const isCurrent = app.status === stage;
                          return (
                            <button
                              key={stage}
                              type="button"
                              onClick={() => updateApplication(job._id, stage, app.notes)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                isCurrent
                                  ? "bg-[#17243A] text-white shadow-subtle"
                                  : "text-[#66758A] hover:text-[#17243A] hover:bg-white"
                              }`}
                            >
                              {stage}
                            </button>
                          );
                        })}
                      </div>

                      {job.applyLink && (
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-[#E4EAF3] bg-white hover:bg-[#EAF2FF] text-[#17243A] text-xs font-semibold transition"
                          title="Open official portal"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
