const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getKolkataDateString,
  isValidDateString,
  isJobActive,
} = require("../utils/jobHelpers");


// ✅ GET ACTIVE JOBS — public
// Strictly excludes expired and archived jobs; rejects missing, malformed, or impossible calendar dates.
router.get("/", async (req, res) => {
  try {
    const today = getKolkataDateString();

    const query = {
      // Must not be expired or archived (allows 'active' or legacy records where status is null/undefined)
      status: { $nin: ["expired", "archived"] },
      // Fast index query for YYYY-MM-DD pattern today or later
      lastDate: {
        $regex: /^\d{4}-\d{2}-\d{2}$/,
        $gte: today,
      },
    };

    const jobs = await Job.find(query).sort({ lastDate: 1, createdAt: -1 });

    // Safe calendar-validity check so impossible dates (e.g. 2026-02-31) never appear publicly
    const validActiveJobs = jobs.filter(
      (job) => isValidDateString(job.lastDate) && isJobActive(job, today)
    );

    res.json(validActiveJobs);
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// 🔒 GET ALL JOBS FOR ADMIN — admin only
// Dedicated endpoint requiring verifyAdmin middleware.
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const jobs = await Job.find(query).sort({ lastDate: 1, createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Admin get jobs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// 🔒 GET SINGLE JOB FOR ADMIN (including historical/archived) — admin only
router.get("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Job not found" });
    }
    console.error("Admin get job by id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// 🗺️ XML SITEMAP FOR SEARCH ENGINES — public
// Dynamically generates an XML sitemap of all currently active vacancies
router.get("/sitemap.xml", async (req, res) => {
  try {
    const today = getKolkataDateString();
    const jobs = await Job.find({
      status: { $nin: ["expired", "archived"] },
      lastDate: { $regex: /^\d{4}-\d{2}-\d{2}$/, $gte: today },
    })
      .select("_id updatedAt lastDate createdAt")
      .lean();

    const validJobs = jobs.filter(
      (job) => isValidDateString(job.lastDate) && isJobActive(job, today)
    );

    const baseUrl = process.env.FRONTEND_URL || "https://jansetu.in";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static core pages
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Category pages
    const categories = [
      "banking",
      "defence",
      "railway",
      "ssc",
      "upsc",
      "police",
      "teaching",
      "state-psc",
    ];
    for (const cat of categories) {
      xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // State pages
    const states = [
      "all-india",
      "delhi",
      "maharashtra",
      "uttar-pradesh",
      "bihar",
      "rajasthan",
      "madhya-pradesh",
      "karnataka",
      "tamil-nadu",
      "west-bengal",
      "gujarat",
      "haryana",
      "punjab",
    ];
    for (const st of states) {
      xml += `  <url>\n    <loc>${baseUrl}/state/${st}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Dynamic active jobs
    for (const job of validJobs) {
      const lastmod = job.updatedAt
        ? new Date(job.updatedAt).toISOString().split("T")[0]
        : today;
      xml += `  <url>\n    <loc>${baseUrl}/job/${job._id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
});


// ✅ GET SINGLE ACTIVE JOB BY ID — public
// Returns 404 unless the job has a valid calendar date in YYYY-MM-DD format,
// a deadline today or later in Asia/Kolkata, and a status other than expired or archived.
// Historical jobs are never exposed through this route.
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const today = getKolkataDateString();
    if (!isJobActive(job, today)) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Job not found" });
    }
    console.error("Get job by id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// 🔒 ADD JOB — admin only
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const jobData = { ...req.body };

    if (!jobData.lastDate || !isValidDateString(jobData.lastDate)) {
      return res.status(400).json({
        message: "Invalid lastDate format. Must be a valid YYYY-MM-DD date.",
      });
    }

    const today = getKolkataDateString();
    if (!jobData.status) {
      jobData.status = jobData.lastDate >= today ? "active" : "expired";
    }

    const newJob = new Job(jobData);
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
    const existingJob = await Job.findById(req.params.id);
    if (!existingJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    const updateData = { ...req.body };
    const today = getKolkataDateString();

    if (updateData.lastDate && !isValidDateString(updateData.lastDate)) {
      return res.status(400).json({
        message: "Invalid lastDate format. Must be a valid YYYY-MM-DD date.",
      });
    }

    const targetDate = updateData.lastDate || existingJob.lastDate;

    // Reactivation / status rules:
    // 1. If administrator explicitly sent a status, honor it.
    // 2. If status was NOT sent:
    //    - If job was 'archived', it MUST remain 'archived'.
    //    - If job was 'expired' and deadline is now extended to today or later, reset status to 'active'.
    if (!updateData.status) {
      if (existingJob.status === "archived") {
        updateData.status = "archived";
      } else if (
        existingJob.status === "expired" &&
        isValidDateString(targetDate) &&
        targetDate >= today
      ) {
        updateData.status = "active";
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
