import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Shield,
  LogOut,
  PlusCircle,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import BASE_URL from "../utils/api";
import { isJobActive } from "../utils/jobHelpers";

export default function AdminPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    qualification: "",
    eligibilityNotes: "",
    state: "",
    salary: "",
    vacancies: "",
    lastDate: "",
    applyLink: "",
    status: "active",
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterTab, setFilterTab] = useState("all");

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/admin/all`, authHeader());
      setJobs(res.data);
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${BASE_URL}/api/jobs/admin/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((res) => {
        if (isMounted) setJobs(res.data);
      })
      .catch((error) => {
        console.error(error);
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          localStorage.removeItem("adminToken");
          navigate("/admin-login");
        }
      });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lastDate") {
      setFormData((prev) => {
        const next = { ...prev, lastDate: value };
        if (prev.status === "expired" && isJobActive({ ...next, status: "active" })) {
          next.status = "active";
        }
        return next;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData, vacancies: Number(formData.vacancies) };
      if (editingId) {
        await axios.put(`${BASE_URL}/api/jobs/${editingId}`, payload, authHeader());
        alert("Job vacancy updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/jobs`, payload, authHeader());
        alert("New job vacancy added successfully");
      }
      setFormData({
        title: "",
        department: "",
        qualification: "",
        eligibilityNotes: "",
        state: "",
        salary: "",
        vacancies: "",
        lastDate: "",
        applyLink: "",
        status: "active",
      });
      setEditingId(null);
      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Operation failed — please check authorization token or required fields");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this vacancy?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/jobs/${id}`, authHeader());
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete operation failed");
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setFormData({
      title: job.title,
      department: job.department,
      qualification: job.qualification,
      eligibilityNotes: job.eligibilityNotes || "",
      state: job.state,
      salary: job.salary,
      vacancies: job.vacancies,
      lastDate: job.lastDate,
      applyLink: job.applyLink,
      status: job.status || (isJobActive(job) ? "active" : "expired"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCount = jobs.filter((job) => isJobActive(job)).length;
  const archivedCount = jobs.filter((job) => job.status === "archived").length;
  const expiredCount = jobs.length - activeCount - archivedCount;

  const displayedJobs = jobs.filter((job) => {
    if (filterTab === "active") return isJobActive(job);
    if (filterTab === "archived") return job.status === "archived";
    if (filterTab === "expired") return !isJobActive(job) && job.status !== "archived";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
      {/* ADMIN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#E8E5DE] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202521] tracking-tight">
              JanSetu Administration
            </h1>
            <p className="text-xs text-[#737873]">
              Manage live vacancies, eligibility notes, deadlines, and archival status
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
        >
          <LogOut size={14} />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* FORM CARD */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 shadow-card mb-12">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle size={18} className="text-[#F28C00]" />
          <h2 className="text-lg font-bold text-[#202521]">
            {editingId ? "Update Job Posting" : "Publish New Job Posting"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. UCO Bank Apprentice 2026"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Department / Authority *
              </label>
              <input
                type="text"
                name="department"
                placeholder="e.g. Banking / Defence / Railway / State PSC"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Minimum Qualification *
              </label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
                required
              >
                <option value="">Select Qualification</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                State / Location *
              </label>
              <input
                type="text"
                name="state"
                placeholder="e.g. All India / Maharashtra / Delhi"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Vacancies Count *
              </label>
              <input
                type="number"
                name="vacancies"
                placeholder="Positive integer"
                value={formData.vacancies}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
                required
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202521] mb-1.5">
              Eligibility Notes (Optional — mandatory trade, subjects, GATE, experience, age limit)
            </label>
            <input
              type="text"
              name="eligibilityNotes"
              placeholder="e.g. BE/BTech in CS/IT with 2 yrs industrial experience; age 20-28 yrs"
              value={formData.eligibilityNotes}
              onChange={handleChange}
              maxLength={500}
              className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Salary / Stipend *
              </label>
              <input
                type="text"
                name="salary"
                placeholder="e.g. ₹56,100 - ₹1,77,500"
                value={formData.salary}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Last Application Date *
              </label>
              <input
                type="date"
                name="lastDate"
                value={formData.lastDate}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202521] mb-1.5">
                Posting Status *
              </label>
              <select
                name="status"
                value={formData.status || "active"}
                onChange={handleChange}
                className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
              >
                <option value="active">Active (Visible)</option>
                <option value="expired">Expired (Hidden from public)</option>
                <option value="archived">Archived (Internal records)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202521] mb-1.5">
              Official Application URL (HTTPS Only) *
            </label>
            <input
              type="url"
              name="applyLink"
              placeholder="https://..."
              value={formData.applyLink}
              onChange={handleChange}
              className="w-full bg-[#FAF8F3] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-sm text-[#202521] focus:border-[#F28C00] focus:ring-2 focus:ring-[#F28C00]/20 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#F28C00] hover:bg-[#D97706] disabled:bg-[#F28C00]/60 text-white font-semibold text-sm transition shadow-subtle flex items-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              <span>{loading ? "Processing..." : editingId ? "Update Posting" : "Publish Vacancy"}</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    title: "",
                    department: "",
                    qualification: "",
                    eligibilityNotes: "",
                    state: "",
                    salary: "",
                    vacancies: "",
                    lastDate: "",
                    applyLink: "",
                    status: "active",
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#E8E5DE] text-[#3D443F] font-medium text-sm border border-[#E8E5DE] transition"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* JOBS LIST MANAGEMENT */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-[#202521]">
            Managed Vacancies ({jobs.length})
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: `All (${jobs.length})` },
              { id: "active", label: `Active (${activeCount})` },
              { id: "expired", label: `Expired (${expiredCount})` },
              { id: "archived", label: `Archived (${archivedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterTab === tab.id
                    ? "bg-[#202521] text-white shadow-subtle"
                    : "bg-white text-[#737873] border border-[#E8E5DE] hover:bg-[#FAF8F3]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {displayedJobs.map((job) => {
            const active = isJobActive(job);
            return (
              <div
                key={job._id}
                className="bg-white border border-[#E8E5DE] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle hover:border-[#737873]/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[#202521] text-base">
                      {job.title}
                    </h3>
                    {active ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#737873] bg-[#FAF8F3] border border-[#E8E5DE] px-2 py-0.5 rounded-full">
                        {job.status === "archived" ? "Archived" : "Expired"}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#737873]">
                    {job.department} • {job.state} • Deadline: {job.lastDate} • {job.vacancies} Posts
                  </p>

                  {job.eligibilityNotes && (
                    <p className="text-xs text-[#B45309] bg-[#FFF8ED] border border-[#FDE0B2] px-2.5 py-1 rounded-md inline-block mt-1 font-medium">
                      Notes: {job.eligibilityNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(job)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#E8E5DE] hover:border-[#F28C00] hover:text-[#F28C00] text-xs font-semibold text-[#202521] transition"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(job._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-semibold text-rose-700 transition"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}