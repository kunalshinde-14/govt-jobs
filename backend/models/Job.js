const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  department: String,
  qualification: String,
  state: String,
  salary: String,
  vacancies: Number,
  lastDate: String,
  applyLink: String,
});

module.exports = mongoose.model("Job", jobSchema);