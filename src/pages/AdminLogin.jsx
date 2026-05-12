import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../utils/api";

export default function AdminPage() {

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    qualification: "",
    state: "",
    salary: "",
    vacancies: "",
    lastDate: "",
    applyLink: "",
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  // 🔒 ADMIN TOKEN HEADER
  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  // ✅ FETCH JOBS
  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/jobs`
      );
      setJobs(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 ADD / UPDATE JOB
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...formData,
        vacancies: Number(formData.vacancies),
      };

      if (editingId) {
        await axios.put(
          `${BASE_URL}/api/jobs/${editingId}`,
          payload,
          authHeader()
        );
        alert("Job updated");
      } else {
        await axios.post(
          `${BASE_URL}/api/jobs`,
          payload,
          authHeader()
        );
        alert("Job added");
      }

      setFormData({
        title: "",
        department: "",
        qualification: "",
        state: "",
        salary: "",
        vacancies: "",
        lastDate: "",
        applyLink: "",
      });

      setEditingId(null);
      fetchJobs();

    } catch (error) {
      console.log(error);
      alert("Operation failed — check your admin token");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE JOB
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await axios.delete(
        `${BASE_URL}/api/jobs/${id}`,
        authHeader()
      );
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  // 🔥 EDIT JOB
  const handleEdit = (job) => {
    setEditingId(job._id);
    setFormData({
      title: job.title,
      department: job.department,
      qualification: job.qualification,
      state: job.state,
      salary: job.salary,
      vacancies: job.vacancies,
      lastDate: job.lastDate,
      applyLink: job.applyLink,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
        >
          Logout
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white border rounded-2xl p-6 mb-12"
      >

        <input type="text" name="title" placeholder="Job Title"
          value={formData.title} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <input type="text" name="department" placeholder="Department"
          value={formData.department} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <select name="qualification" value={formData.qualification}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required>
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

        <input type="date" name="lastDate"
          value={formData.lastDate} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <input type="url" name="applyLink" placeholder="Apply Link (https://...)"
          value={formData.applyLink} onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3" required />

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-xl">
            {loading ? "Saving..." : editingId ? "Update Job" : "Add Job"}
          </button>

          {editingId && (
            <button type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({ title: "", department: "", qualification: "",
                  state: "", salary: "", vacancies: "", lastDate: "", applyLink: "" });
              }}
              className="px-6 bg-stone-100 rounded-xl">
              Cancel
            </button>
          )}
        </div>

      </form>

      {/* JOBS LIST */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">
          Manage Jobs ({jobs.length})
        </h2>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id}
              className="bg-white border rounded-2xl p-5 flex justify-between items-center">

              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-stone-500 text-sm">
                  {job.department} · {job.state} · Last date: {job.lastDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(job)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(job._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm">
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}