const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { getKolkataDateString } = require("../utils/jobHelpers");

// 🔒 CRON SECRET MIDDLEWARE
// This endpoint can only be called by a trusted caller
// that supplies the correct x-cron-secret header.
// The value must match the CRON_SECRET environment variable.
const verifyCronSecret = (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is not configured, refuse all requests
  if (!cronSecret) {
    return res.status(503).json({
      success: false,
      error: "Cron secret not configured on server",
    });
  }

  const provided = req.headers["x-cron-secret"];

  if (!provided || provided !== cronSecret) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  next();
};

/**
 * Expired jobs handler — updates status to 'expired' instead of deleting.
 * Preserves archived status on jobs that are already archived.
 * Retains deleted: 0 for backward-compatible response parsing.
 */
const handleExpireJobs = async (req, res) => {
  try {
    const todayStr = getKolkataDateString();

    const result = await Job.updateMany(
      {
        lastDate: { $lt: todayStr },
        status: { $nin: ["expired", "archived"] },
      },
      {
        $set: { status: "expired" },
      }
    );

    res.json({
      success: true,
      archived: result.modifiedCount,
      deleted: 0, // Backward-compatible response field
      message: `Preserved and marked ${result.modifiedCount} jobs as expired`,
    });
  } catch (error) {
    console.error("Cron route error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

router.delete("/expired", verifyCronSecret, handleExpireJobs);
router.post("/expired", verifyCronSecret, handleExpireJobs);

module.exports = router;
