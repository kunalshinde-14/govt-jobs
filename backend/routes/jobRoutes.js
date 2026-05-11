const express = require("express");
const router = express.Router();

const Job = require("../models/Job");

// GET ALL JOBS
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;