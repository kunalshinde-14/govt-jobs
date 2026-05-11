const express = require("express");

const router = express.Router();

const Job = require("../models/Job");



// ✅ GET ALL JOBS
router.get("/", async (req, res) => {

  try {

    const jobs = await Job.find()
      .sort({ createdAt: -1 });

    res.json(jobs);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});



// ✅ ADD NEW JOB
router.post("/", async (req, res) => {

  try {

    const {
      title,
      department,
      qualification,
      state,
      salary,
      vacancies,
      lastDate,
      applyLink,
    } = req.body;



    const newJob = new Job({

      title,
      department,
      qualification,
      state,
      salary,
      vacancies,
      lastDate,
      applyLink,

    });



    const savedJob =
      await newJob.save();

    res.status(201).json(savedJob);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});



// ✅ DELETE JOB
router.delete("/:id", async (req, res) => {

  try {

    await Job.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Job deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});



module.exports = router;