import { useEffect, useState } from "react";

import axios from "axios";

import BASE_URL from "../utils/api";

export default function AdminPage() {

  // 🔥 FORM STATE
  const [formData, setFormData] =
    useState({
      title: "",
      department: "",
      qualification: "",
      state: "",
      salary: "",
      vacancies: "",
      lastDate: "",
      applyLink: "",
    });



  // 🔥 ALL JOBS
  const [jobs, setJobs] =
    useState([]);




  // 🔥 LOADING
  const [loading, setLoading] =
    useState(false);




  // 🔥 EDIT MODE
  const [editingId, setEditingId] =
    useState(null);




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




  // ✅ LOAD JOBS
  useEffect(() => {

    fetchJobs();

  }, []);




  // 🔥 HANDLE INPUT
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });

  };




  // 🔥 ADD / UPDATE JOB
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const payload = {

        ...formData,

        vacancies: Number(
          formData.vacancies
        ),

      };



      // ✅ UPDATE
      if (editingId) {

        await axios.put(

          `${BASE_URL}/api/jobs/${editingId}`,

          payload,

          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }

        );



        alert("Job updated");

      }



      // ✅ ADD
      else {

        await axios.post(

          `${BASE_URL}/api/jobs`,

          payload,

          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }

        );



        alert("Job added");

      }



      // ✅ RESET FORM
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

      alert("Operation failed");

    } finally {

      setLoading(false);

    }

  };




  // 🔥 DELETE JOB
  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this job?"
      );

    if (!confirmDelete)
      return;

    try {

      await axios.delete(

        `${BASE_URL}/api/jobs/${id}`,

        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }

      );



      // ✅ REMOVE FROM UI
      setJobs(

        jobs.filter(
          (job) =>
            job._id !== id
        )

      );

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
      department:
        job.department,
      qualification:
        job.qualification,
      state: job.state,
      salary: job.salary,
      vacancies:
        job.vacancies,
      lastDate:
        job.lastDate,
      applyLink:
        job.applyLink,

    });



    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };




  return (

    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8">

        Admin Panel

      </h1>




      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white border rounded-2xl p-6 mb-12"
      >

        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        <input
          type="text"
          name="qualification"
          placeholder="Qualification"
          value={formData.qualification}
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        <input
          type="text"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        <input
          type="number"
          name="vacancies"
          placeholder="Vacancies"
          value={
            formData.vacancies
          }
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        <input
          type="date"
          name="lastDate"
          value={
            formData.lastDate
          }
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        <input
          type="text"
          name="applyLink"
          placeholder="Apply Link"
          value={
            formData.applyLink
          }
          onChange={
            handleChange
          }
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >

          {loading

            ? "Saving..."

            : editingId

            ? "Update Job"

            : "Add Job"}

        </button>

      </form>





      {/* JOBS LIST */}
      <div>

        <h2 className="text-2xl font-semibold mb-6">

          Manage Jobs

        </h2>



        <div className="space-y-4">

          {jobs.map((job) => (

            <div
              key={job._id}
              className="bg-white border rounded-2xl p-5 flex justify-between items-center"
            >

              <div>

                <h3 className="font-semibold text-lg">

                  {job.title}

                </h3>

                <p className="text-stone-500 text-sm">

                  {job.department}

                </p>

              </div>



              <div className="flex items-center">

                {/* EDIT */}
                <button
                  onClick={() =>
                    handleEdit(job)
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl mr-3"
                >
                  Edit
                </button>



                {/* DELETE */}
                <button
                  onClick={() =>
                    handleDelete(
                      job._id
                    )
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-xl"
                >
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