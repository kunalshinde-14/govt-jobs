const express = require("express");

const router = express.Router();

const Job = require("../models/Job");

router.get("/expired", async (req, res) => {

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

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});

module.exports = router;