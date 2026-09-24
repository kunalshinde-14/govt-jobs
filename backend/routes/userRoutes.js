const express = require("express");

const router = express.Router();

const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");


// 🔥 SAVE JOB
router.post(
  "/save-job/:jobId",
  authMiddleware,
  async (req, res) => {

    try {

      const user = await User.findById(req.userId);

      const jobId = req.params.jobId;

      // AVOID DUPLICATES
      if (!user.savedJobs.includes(jobId)) {
        user.savedJobs.push(jobId);
        await user.save();
      }

      res.json({ message: "Job saved" });

    } catch (error) {

      console.error("Save job error:", error);
      res.status(500).json({ message: "Internal server error" });

    }

  }
);


// 🔥 UNSAVE JOB
router.delete(
  "/save-job/:jobId",
  authMiddleware,
  async (req, res) => {

    try {

      const user = await User.findById(req.userId);

      const jobId = req.params.jobId;

      user.savedJobs = user.savedJobs.filter(
        (id) => id.toString() !== jobId
      );

      await user.save();

      res.json({ message: "Job removed" });

    } catch (error) {

      console.error("Unsave job error:", error);
      res.status(500).json({ message: "Internal server error" });

    }

  }
);


// 🔥 GET SAVED JOBS
router.get(
  "/saved-jobs",
  authMiddleware,
  async (req, res) => {

    try {

      const user = await User.findById(req.userId).populate("savedJobs");

      res.json(user.savedJobs);

    } catch (error) {

      console.error("Get saved jobs error:", error);
      res.status(500).json({ message: "Internal server error" });

    }

  }
);

module.exports = router;
