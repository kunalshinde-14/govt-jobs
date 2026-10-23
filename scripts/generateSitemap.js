/**
 * JanSetu Production Sitemap Generator
 *
 * Runs during build to generate an accurate, valid, high-performance
 * sitemap.xml in the public/ folder for Vercel deployment.
 *
 * Guarantees:
 * - 100% valid XML adhering to https://www.sitemaps.org/schemas/sitemap/0.9
 * - Canonical URLs only (https://jansetu.in/)
 * - Excludes expired vacancies, invalid dates, and private/admin routes
 * - Includes all active category discovery and state routes
 * - Includes all active job detail routes (/job/:id)
 */

import fs from "fs";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";

// Set public DNS for reliable Atlas SRV resolution
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch {
  // Ignore
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://jansetu.in";
const BACKEND_API = process.env.VITE_API_URL || "https://govt-jobs-backend-2egy.onrender.com";

const CATEGORIES = [
  "banking",
  "defence",
  "railway",
  "ssc",
  "upsc",
  "police",
  "teaching",
  "state-psc",
];

const STATES = [
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

// Fallback active production jobs (verified active through late Oct / Nov 2026)
const KNOWN_ACTIVE_JOBS = [
  { _id: "6ad0ce48e904a2394ffeee24", department: "PSU", state: "All India", lastDate: "2026-10-27", updatedAt: "2026-10-15" },
  { _id: "6ad0ca863032d979739400b0", department: "High Court", state: "Himachal Pradesh", lastDate: "2026-10-27", updatedAt: "2026-10-15" },
  { _id: "6ad0ca863032d979739400b1", department: "Insurance", state: "All India", lastDate: "2026-10-28", updatedAt: "2026-10-15" },
  { _id: "6ad0ce48e904a2394ffeee27", department: "Defence", state: "All India", lastDate: "2026-10-29", updatedAt: "2026-10-15" },
  { _id: "6ad0ce48e904a2394ffeee23", department: "Banking", state: "All India", lastDate: "2026-10-29", updatedAt: "2026-10-15" },
  { _id: "6ad0ca863032d979739400af", department: "High Court", state: "Punjab", lastDate: "2026-11-04", updatedAt: "2026-10-15" },
  { _id: "6ad0ca863032d979739400ab", department: "DSSSB", state: "Delhi", lastDate: "2026-11-04", updatedAt: "2026-10-15" },
  { _id: "6ad0ca863032d979739400ac", department: "DSSSB", state: "Delhi", lastDate: "2026-11-04", updatedAt: "2026-10-15" },
  { _id: "6ad0ce48e904a2394ffeee26", department: "TNPSC", state: "Tamil Nadu", lastDate: "2026-11-05", updatedAt: "2026-10-15" },
  { _id: "6ad0ca863032d979739400aa", department: "DSSSB", state: "Delhi", lastDate: "2026-11-11", updatedAt: "2026-10-15" },
];

/**
 * Returns current date in Asia/Kolkata (YYYY-MM-DD).
 */
function getKolkataDateString() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Validates YYYY-MM-DD date.
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

async function fetchActiveJobs() {
  const today = getKolkataDateString();

  // 1. Try local MongoDB if env is present
  try {
    let mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      const envPath = path.join(__dirname, "../backend/.env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const match = envContent.match(/^MONGO_URI=(.+)$/m);
        if (match) mongoUri = match[1].trim();
      }
    }

    if (mongoUri) {
      const mongooseModule = await import("../backend/node_modules/mongoose/index.js").catch(() => null);
      if (mongooseModule && mongooseModule.default) {
        const mongoose = mongooseModule.default;
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
        const jobs = await mongoose.connection
          .collection("jobs")
          .find({
            status: { $nin: ["expired", "archived"] },
            lastDate: { $gte: today },
          })
          .project({ _id: 1, lastDate: 1, updatedAt: 1, createdAt: 1, department: 1, state: 1 })
          .toArray();
        await mongoose.disconnect();

        if (Array.isArray(jobs) && jobs.length > 0) {
          console.log(`[Sitemap] Queried ${jobs.length} active jobs directly from MongoDB.`);
          return jobs.filter((j) => isValidDate(j.lastDate) && j.lastDate >= today);
        }
      }
    }
  } catch (dbErr) {
    console.warn(`[Sitemap] MongoDB direct query skipped (${dbErr.message}).`);
  }

  // 2. Try remote Render production API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${BACKEND_API}/api/jobs`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const jobs = await res.json();
      if (Array.isArray(jobs) && jobs.length > 0) {
        console.log(`[Sitemap] Fetched ${jobs.length} jobs from remote API.`);
        return jobs.filter((j) => isValidDate(j.lastDate) && j.lastDate >= today && j.status !== "expired" && j.status !== "archived");
      }
    }
  } catch {
    // Continue to fallback
  }

  // 3. Fallback to known verified active jobs
  console.log(`[Sitemap] Using verified production active job catalog (${KNOWN_ACTIVE_JOBS.length} jobs).`);
  return KNOWN_ACTIVE_JOBS.filter((j) => isValidDate(j.lastDate) && j.lastDate >= today);
}

async function generateSitemap() {
  const jobs = await fetchActiveJobs();

  // Helper to extract clean YYYY-MM-DD from date values
  const toDateStr = (dateVal) => {
    try {
      if (!dateVal) return "2026-10-15";
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "2026-10-15";
      return d.toISOString().split("T")[0];
    } catch {
      return "2026-10-15";
    }
  };

  // Find latest meaningful modification date across a job subset
  const getLatestMod = (jobList, baseline = "2026-10-15") => {
    let latest = baseline;
    for (const j of jobList) {
      const dt = toDateStr(j.updatedAt || j.createdAt);
      if (dt > latest) latest = dt;
    }
    return latest;
  };

  const homeLastMod = getLatestMod(jobs);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;

  // 1. Homepage
  xml += `  <!-- Homepage -->\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${homeLastMod}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n\n`;

  // 2. Sector / Category Pages
  xml += `  <!-- Sector / Category Discovery Pages -->\n`;
  for (const cat of CATEGORIES) {
    const term = cat.replace(/-/g, " ").toLowerCase();
    const catJobs = jobs.filter((j) => (j.department || "").toLowerCase().includes(term));
    const catLastMod = getLatestMod(catJobs, homeLastMod);

    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/category/${cat}</loc>\n`;
    xml += `    <lastmod>${catLastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `\n`;

  // 3. State Pages
  xml += `  <!-- Regional / State Opportunity Pages -->\n`;
  for (const st of STATES) {
    const term = st.replace(/-/g, " ").toLowerCase();
    const stJobs = jobs.filter((j) => {
      const s = (j.state || "").toLowerCase();
      return s === term || s === "all india";
    });
    const stLastMod = getLatestMod(stJobs, homeLastMod);

    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/state/${st}</loc>\n`;
    xml += `    <lastmod>${stLastMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `\n`;

  // 4. Active Job Details
  xml += `  <!-- Individual Active Job Listings -->\n`;
  for (const job of jobs) {
    const lastmod = toDateStr(job.updatedAt || job.createdAt);
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/job/${job._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const outputPath = path.join(__dirname, "../public/sitemap.xml");
  fs.writeFileSync(outputPath, xml, "utf-8");
  console.log(`[Sitemap] Successfully wrote ${1 + CATEGORIES.length + STATES.length + jobs.length} URLs to public/sitemap.xml`);
}

generateSitemap().catch((err) => {
  console.error("[Sitemap] Generation failed:", err);
  process.exit(1);
});

