const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const adminMiddleware = require("../middleware/adminMiddleware");


// ✅ GET ALL JOBS — public
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


// 🔒 ADD JOB — admin only
router.post(
  "/",
  adminMiddleware,
  async (req, res) => {

    try {

      const newJob = new Job(req.body);
      const savedJob = await newJob.save();
      res.status(201).json(savedJob);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  }
);


// 🔒 UPDATE JOB — admin only
router.put(
  "/:id",
  adminMiddleware,
  async (req, res) => {

    try {

      const updatedJob =
        await Job.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );

      res.json(updatedJob);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  }
);


// 🔒 DELETE JOB — admin only
router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {

    try {

      await Job.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message: "Job deleted successfully",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  }
);


module.exports = router;