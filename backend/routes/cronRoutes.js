const express = require("express");

const router = express.Router();

const Job = require("../models/Job");

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


router.delete("/expired", verifyCronSecret, async (req, res) => {

  try {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const result =
      await Job.deleteMany({

        lastDate: {
          $lt: today
            .toISOString()
            .split("T")[0],
        },

      });

    res.json({
      success: true,
      deleted: result.deletedCount,
    });

  } catch (error) {

    console.error("Cron route error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });

  }

});

module.exports = router;
