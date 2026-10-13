const cron = require("node-cron");
const Job = require("../models/Job");
const { getKolkataDateString } = require("../utils/jobHelpers");

/**
 * Scheduled task to mark expired jobs as 'expired'
 * PRESERVES historical records — NEVER permanently deletes documents.
 * Respects 'archived' status: archived jobs remain archived.
 */
const startDeleteExpiredJobs = () => {
  // Runs every day at 12:00 AM IST (Asia/Kolkata)
  cron.schedule(
    "0 0 * * *",
    async () => {
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

        console.log(
          `[Cron] Preserved & marked ${result.modifiedCount} expired jobs (0 deleted)`
        );
      } catch (error) {
        console.error("Cron Error:", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = startDeleteExpiredJobs;