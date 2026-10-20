const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/authMiddleware");
const { evaluateJobMatch } = require("../utils/matchingService");
const {
  getKolkataDateString,
  isValidDateString,
  isJobActive,
} = require("../utils/jobHelpers");

const ALLOWED_QUALIFICATIONS = ["10th", "12th", "Graduate"];
const ALLOWED_STATUSES = ["Interested", "Preparing", "Applied", "Exam/Result"];

// ─────────────────────────────────────────────
// PREFERENCES
// ─────────────────────────────────────────────

// 🔍 GET USER PREFERENCES
router.get("/preferences", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "preferences lastVisitedAt previousVisitedAt"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      preferences: user.preferences || {
        qualification: [],
        sectors: [],
        states: [],
        notifications: { frequency: "daily", emailAlerts: false },
      },
      lastVisitedAt: user.lastVisitedAt,
      previousVisitedAt: user.previousVisitedAt,
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✏️ UPDATE USER PREFERENCES
router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const { qualification, sectors, states, notifications } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Qualification validation
    if (qualification !== undefined) {
      if (!Array.isArray(qualification)) {
        return res.status(400).json({ message: "Qualifications must be an array" });
      }
      const invalidQual = qualification.find((q) => !ALLOWED_QUALIFICATIONS.includes(q));
      if (invalidQual) {
        return res.status(400).json({
          message: `Invalid qualification: '${invalidQual}'. Allowed: ${ALLOWED_QUALIFICATIONS.join(", ")}`,
        });
      }
      user.preferences.qualification = qualification;
    }

    // Sectors validation
    if (sectors !== undefined) {
      if (!Array.isArray(sectors)) {
        return res.status(400).json({ message: "Sectors must be an array" });
      }
      user.preferences.sectors = sectors.filter(
        (s) => typeof s === "string" && s.trim()
      ).map((s) => s.trim());
    }

    // States validation
    if (states !== undefined) {
      if (!Array.isArray(states)) {
        return res.status(400).json({ message: "States must be an array" });
      }
      user.preferences.states = states.filter(
        (s) => typeof s === "string" && s.trim()
      ).map((s) => s.trim());
    }

    // Notifications validation
    if (notifications !== undefined) {
      if (typeof notifications !== "object" || notifications === null) {
        return res.status(400).json({ message: "Notifications must be an object" });
      }
      if (notifications.frequency !== undefined) {
        if (!["daily", "weekly", "none"].includes(notifications.frequency)) {
          return res.status(400).json({ message: "Invalid notification frequency" });
        }
        user.preferences.notifications.frequency = notifications.frequency;
      }
      if (notifications.emailAlerts !== undefined) {
        user.preferences.notifications.emailAlerts = Boolean(notifications.emailAlerts);
      }
    }

    await user.save();

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// VISIT & SESSION TRACKING
// ─────────────────────────────────────────────

// 🕒 RECORD USER SESSION VISIT
router.post("/visit", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    // Store prior session timestamp as previousVisitedAt
    user.previousVisitedAt = user.lastVisitedAt || user.createdAt || now;
    user.lastVisitedAt = now;

    await user.save();

    res.json({
      message: "Visit recorded",
      lastVisitedAt: user.lastVisitedAt,
      previousVisitedAt: user.previousVisitedAt,
    });
  } catch (error) {
    console.error("Record visit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// "SINCE YOUR LAST VISIT" PERSONALIZED FEED
// ─────────────────────────────────────────────

// 🎯 GET NEW MATCHING VACANCIES SINCE LAST VISIT
router.get("/since-last-visit", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = getKolkataDateString();

    // Determine baseline cutoff timestamp for "since last visit"
    let cutoff = user.previousVisitedAt;
    if (!cutoff) {
      // For first-time visits, check opportunities from the past 7 days
      cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Set of IDs already marked as seen by this user
    const seenIds = new Set(
      (user.seenJobs || []).map((s) => s.jobId.toString())
    );

    // Query active unexpired jobs
    const activeJobs = await Job.find({
      status: { $nin: ["expired", "archived"] },
      lastDate: { $gte: today },
    }).sort({ createdAt: -1 });

    const validActiveJobs = activeJobs.filter(
      (job) => isValidDateString(job.lastDate) && isJobActive(job, today)
    );

    // Filter to jobs that are:
    // 1. Not already seen
    // 2. Created or updated on/after the user's cutoff timestamp
    // 3. Match the user's preferences
    const candidateJobs = validActiveJobs.filter((job) => {
      const jobIdStr = job._id.toString();
      if (seenIds.has(jobIdStr)) return false;

      const jobTime = job.createdAt || job.updatedAt;
      return jobTime ? new Date(jobTime) >= cutoff : true;
    });

    const preferences = user.preferences || {};

    const matchingOpportunities = [];

    for (const job of candidateJobs) {
      const evaluation = evaluateJobMatch(job, preferences);
      if (evaluation.isMatch) {
        matchingOpportunities.push({
          job,
          score: evaluation.score,
          matchReasons: evaluation.matchReasons,
          matchType: evaluation.matchType,
          disclaimer: evaluation.disclaimer,
        });
      }
    }

    // Sort matching opportunities by score descending, then deadline ascending
    matchingOpportunities.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.job.lastDate) - new Date(b.job.lastDate);
    });

    const isCaughtUp = matchingOpportunities.length === 0;

    res.json({
      opportunities: matchingOpportunities,
      totalCount: matchingOpportunities.length,
      sinceDate: cutoff.toISOString(),
      isCaughtUp,
      disclaimer:
        "Opportunities matched against your declared preferences. Please verify all eligibility criteria in the official notification.",
    });
  } catch (error) {
    console.error("Since last visit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 👁️ MARK VACANCIES AS SEEN
router.post("/mark-seen", authMiddleware, async (req, res) => {
  try {
    const { jobIds } = req.body;
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ message: "jobIds must be a non-empty array" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingSeen = new Set((user.seenJobs || []).map((s) => s.jobId.toString()));
    const now = new Date();

    for (const id of jobIds) {
      const idStr = String(id);
      if (!existingSeen.has(idStr)) {
        user.seenJobs.push({ jobId: idStr, seenAt: now });
        existingSeen.add(idStr);
      }
    }

    // Keep seenJobs capped at the 500 most recent records
    if (user.seenJobs.length > 500) {
      user.seenJobs = user.seenJobs.slice(-500);
    }

    await user.save();

    res.json({
      message: "Opportunities marked as seen",
      totalSeenCount: user.seenJobs.length,
    });
  } catch (error) {
    console.error("Mark seen error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// DEADLINE RADAR (FOR SAVED JOBS)
// ─────────────────────────────────────────────

// ⏰ GET DEADLINE RADAR
router.get("/deadline-radar", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("savedJobs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const todayStr = getKolkataDateString();
    const todayDate = new Date(`${todayStr}T00:00:00Z`);

    // Only active saved jobs with valid future deadlines
    const activeSavedJobs = (user.savedJobs || []).filter(
      (job) => job && isJobActive(job, todayStr)
    );

    const urgent = [];
    const closingThisWeek = [];
    const upcoming = [];

    for (const job of activeSavedJobs) {
      const deadlineDate = new Date(`${job.lastDate}T00:00:00Z`);
      const diffMs = deadlineDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const entry = {
        job,
        daysRemaining: diffDays,
        lastDate: job.lastDate,
      };

      if (diffDays >= 0 && diffDays <= 3) {
        entry.urgencyLevel = "urgent";
        urgent.push(entry);
      } else if (diffDays >= 4 && diffDays <= 7) {
        entry.urgencyLevel = "closing_this_week";
        closingThisWeek.push(entry);
      } else if (diffDays > 7) {
        entry.urgencyLevel = "upcoming";
        upcoming.push(entry);
      }
    }

    // Sort ascending by days remaining
    urgent.sort((a, b) => a.daysRemaining - b.daysRemaining);
    closingThisWeek.sort((a, b) => a.daysRemaining - b.daysRemaining);
    upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.json({
      urgent,
      closingThisWeek,
      upcoming,
      totalActiveSaved: activeSavedJobs.length,
    });
  } catch (error) {
    console.error("Deadline radar error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// APPLICATION TRACKER
// ─────────────────────────────────────────────

// 📋 GET APPLICATION TRACKER PROGRESS
router.get("/applications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("applications.jobId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out applications where the job was deleted
    const validApplications = (user.applications || []).filter(
      (app) => app && app.jobId
    );

    res.json(validApplications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 📋 UPDATE APPLICATION STATUS & NOTES
router.put("/applications/:jobId", authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, notes } = req.body;

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status '${status}'. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let appEntry = user.applications.find(
      (a) => a.jobId.toString() === jobId
    );

    const now = new Date();

    if (appEntry) {
      if (status) appEntry.status = status;
      if (notes !== undefined) appEntry.notes = String(notes).trim().slice(0, 500);
      appEntry.updatedAt = now;
    } else {
      appEntry = {
        jobId,
        status: status || "Interested",
        notes: notes ? String(notes).trim().slice(0, 500) : "",
        updatedAt: now,
      };
      user.applications.push(appEntry);
    }

    // Automatically ensure this job is in savedJobs as well
    if (!user.savedJobs.some((id) => id.toString() === jobId)) {
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.json({
      message: "Application status updated",
      application: appEntry,
    });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// SAVED JOBS (EXISTING FUNCTIONALITY PRESERVED)
// ─────────────────────────────────────────────

// 🔥 SAVE JOB
router.post("/save-job/:jobId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const jobId = req.params.jobId;

    // AVOID DUPLICATES
    if (!user.savedJobs.some((id) => id.toString() === jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }

    res.json({ message: "Job saved" });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔥 UNSAVE JOB
router.delete("/save-job/:jobId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
});

// 🔥 GET SAVED JOBS
router.get("/saved-jobs", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("savedJobs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.savedJobs);
  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
