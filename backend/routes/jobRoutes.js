const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const verifyAdmin = require("../middleware/verifyAdmin");


// ✅ GET ALL JOBS — public
router.get("/", async (req, res) => {

  try {

    const jobs = await Job.find();
    res.json(jobs);

  } catch (error) {

    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Internal server error" });

  }

});


// 🔒 ADD JOB — admin only
router.post("/", verifyAdmin, async (req, res) => {

  try {

    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);

  } catch (error) {

    console.error("Add job error:", error);
    res.status(500).json({ message: "Internal server error" });

  }

});


// 🔒 UPDATE JOB — admin only
router.put("/:id", verifyAdmin, async (req, res) => {

  try {

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedJob);

  } catch (error) {

    console.error("Update job error:", error);
    res.status(500).json({ message: "Internal server error" });

  }

});


// 🔒 DELETE JOB — admin only
router.delete("/:id", verifyAdmin, async (req, res) => {

  try {

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully" });

  } catch (error) {

    console.error("Delete job error:", error);
    res.status(500).json({ message: "Internal server error" });

  }

});


module.exports = router;
