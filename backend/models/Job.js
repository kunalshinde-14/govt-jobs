const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(

  {
    title: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    salary: {
      type: String,
      required: true,
    },

    vacancies: {
      type: Number,
      required: true,
    },

    lastDate: {
      type: String,
      required: true,
    },

    applyLink: {
      type: String,
      required: true,
    },
  },

  // ✅ IMPORTANT
  {
    timestamps: true,
  }

);

module.exports =
  mongoose.model(
    "Job",
    jobSchema
  );