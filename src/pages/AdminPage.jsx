import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../utils/api";
import { isJobActive } from "../utils/jobHelpers";

export default function AdminPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    qualification: "",
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
      console.log(error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        handleLogout();
      }
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lastDate") {
      setFormData((prev) => {
        const next = { ...prev, lastDate: value };
        // If extending deadline on an expired job (and not archived), reactivate to active
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
        alert("Job updated");
      } else {
        await axios.post(`${BASE_URL}/api/jobs`, payload, authHeader());
        alert("Job added");
      }
      setFormData({ title: "", department: "", qualification: "", state: "", salary: "", vacancies: "", lastDate: "", applyLink: "", status: "active" });
      setEditingId(null);
      fetchJobs();
    } catch (error) {
      console.log(error);
      alert("Operation failed — check your admin token or input fields");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/jobs/${id}`, authHeader());
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setFormData({
      title: job.title, department: job.department, qualification: job.qualification,
      state: job.state, salary: job.salary, vacancies: job.vacancies,
      lastDate: job.lastDate, applyLink: job.applyLink,
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
    <div className="max-w-6xl mx-auto px-4 py-12">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="border border-stone-300 text-stone-700 px-4 py-2 rounded-xl text-sm hover:bg-stone-100 transition"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border rounded-2xl p-6 mb-12">

        <input type="text" name="title" placeholder="Job Title"
          value={formData.title} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <input type="text" name="department" placeholder="Department"
          value={formData.department} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <select name="qualification" value={formData.qualification}
          onChange={handleChange} className="w-full border rounded-xl px-4 py-3" required>
          <option value="">Select Qualification</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
          <option value="Graduate">Graduate</option>
        </select>

        <input type="text" name="state" placeholder="State (e.g. Maharashtra / All India)"
          value={formData.state} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <input type="text" name="salary" placeholder="Salary (e.g. ₹18,000 - ₹56,900)"
          value={formData.salary} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <input type="number" name="vacancies" placeholder="Vacancies"
          value={formData.vacancies} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <input type="date" name="lastDate" value={formData.lastDate}
          onChange={handleChange} className="w-full border rounded-xl px-4 py-3" required />

        <input type="url" name="applyLink" placeholder="Apply Link (https://...)"
          value={formData.applyLink} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <select
          name="status"
          value={formData.status || "active"}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="active">Status: Active</option>
          <option value="expired">Status: Expired</option>
          <option value="archived">Status: Archived</option>
        </select>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-3 rounded-xl">
            {loading ? "Saving..." : editingId ? "Update Job" : "Add Job"}
          </button>
          {editingId && (
            <button type="button"
              onClick={() => { setEditingId(null); setFormData({ title: "", department: "", qualification: "", state: "", salary: "", vacancies: "", lastDate: "", applyLink: "", status: "active" }); }}
              className="px-6 bg-stone-100 rounded-xl">
              Cancel
            </button>
          )}
        </div>

      </form>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold">Manage Jobs ({jobs.length})</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterTab === "all" ? "bg-black text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterTab === "active" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("expired")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterTab === "expired" ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              Expired ({expiredCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("archived")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterTab === "archived" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              Archived ({archivedCount})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {displayedJobs.map((job) => {
            const active = isJobActive(job);
            return (
              <div key={job._id} className="bg-white border rounded-2xl p-5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    {active ? (
                      <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {job.status === "archived" ? "Archived" : "Expired"}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-sm">{job.department} · {job.state} · Last date: {job.lastDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(job)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm">Edit</button>
                  <button onClick={() => handleDelete(job._id)} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}