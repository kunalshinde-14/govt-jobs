import { useState } from "react";
import axios from "axios";

export default function AdminPage() {

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

  const [loading, setLoading] =
    useState(false);




  // 🔥 HANDLE INPUT
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };




  // 🔥 SUBMIT JOB
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      // ✅ SEND DATA
      await axios.post(
        "https://govt-jobs-backend-2egy.onrender.com/api/jobs",
        {
          ...formData,

          // ✅ IMPORTANT
          vacancies: Number(
            formData.vacancies
          ),
        }
      );



      alert(
        "Job added successfully"
      );



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

    } catch (error) {

      console.log(error);

      alert("Failed to add job");

    } finally {

      setLoading(false);

    }

  };




  return (

    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8">
        Admin Panel
      </h1>



      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white border rounded-2xl p-6"
      >

        {/* TITLE */}
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* DEPARTMENT */}
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* QUALIFICATION */}
        <input
          type="text"
          name="qualification"
          placeholder="Qualification"
          value={formData.qualification}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* STATE */}
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* SALARY */}
        <input
          type="text"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* VACANCIES */}
        <input
          type="number"
          name="vacancies"
          placeholder="Vacancies"
          value={formData.vacancies}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* LAST DATE */}
        <input
          type="date"
          name="lastDate"
          value={formData.lastDate}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />



        {/* APPLY LINK */}
        <input
          type="text"
          name="applyLink"
          placeholder="Apply Link"
          value={formData.applyLink}
          onChange={handleChange}
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
            ? "Adding..."
            : "Add Job"}

        </button>

      </form>

    </div>

  );
}