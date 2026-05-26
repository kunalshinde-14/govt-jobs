const cron = require("node-cron");
const Job = require("../models/Job");

const startDeleteExpiredJobs = () => {

  // Runs every day at 12:00 AM
  cron.schedule("0 0 * * *", async () => {

    try {

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const result = await Job.deleteMany({
        lastDate: {
          $lt: today.toISOString().split("T")[0],
        },
      });

      console.log(
        `🗑 Deleted ${result.deletedCount} expired jobs`
      );

    } catch (error) {

      console.log(
        "Cron Error:",
        error
      );

    }

  });

};

module.exports =
  startDeleteExpiredJobs;