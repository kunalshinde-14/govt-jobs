/**
 * Safe Bulk Job Importer for JanSetu
 *
 * Reads job records from a JSON file (default: backend/data/jobs.json),
 * performs rigorous schema and business validation, detects duplicates
 * against the input file and existing MongoDB records, and inserts only
 * genuinely new, active vacancies.
 *
 * SAFETY:
 * - Defaults to a DRY RUN. Pass --apply to perform database writes.
 * - NEVER deletes, drops, or modifies existing documents.
 * - Never prints secrets or database connection strings.
 */

const fs = require("fs");
const path = require("path");
const dns = require("dns");
const dotenv = require("dotenv");
dotenv.config();

const {
  isValidDateString,
  getKolkataDateString,
} = require("../utils/jobHelpers");

const ALLOWED_QUALIFICATIONS = ["10th", "12th", "Graduate"];

/**
 * Normalizes a string for duplicate-key comparison (lowercase, trimmed, collapsed whitespace).
 *
 * @param {string} str
 * @returns {string}
 */
function normalizeString(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Generates a normalized composite key from title, department, and deadline date.
 *
 * @param {string} title
 * @param {string} department
 * @param {string} lastDate
 * @returns {string}
 */
function normalizeKey(title, department, lastDate) {
  return `${normalizeString(title)}|${normalizeString(department)}|${String(lastDate || "").trim()}`;
}

/**
 * Validates a single job record.
 *
 * @param {object} record
 * @param {string|Date} [referenceDate] - reference date for checking active status (defaults to current Kolkata date)
 * @returns {{ isValid: boolean, errors: string[], sanitized: object | null }}
 */
function validateJobRecord(record, referenceDate) {
  const errors = [];

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return {
      isValid: false,
      errors: ["Record must be a valid JSON object"],
      sanitized: null,
    };
  }

  // 1. Title
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!title) {
    errors.push("Field 'title' is required and must be a non-empty string");
  }

  // 2. Department
  const department = typeof record.department === "string" ? record.department.trim() : "";
  if (!department) {
    errors.push("Field 'department' is required and must be a non-empty string");
  }

  // 3. Qualification
  const qualificationRaw = typeof record.qualification === "string" ? record.qualification.trim() : "";
  const matchedQual = ALLOWED_QUALIFICATIONS.find(
    (q) => q.toLowerCase() === qualificationRaw.toLowerCase()
  );
  if (!matchedQual) {
    errors.push(
      `Field 'qualification' must be one of: ${ALLOWED_QUALIFICATIONS.join(", ")} (received: "${qualificationRaw}")`
    );
  }

  // 4. State
  const state = typeof record.state === "string" ? record.state.trim() : "";
  if (!state) {
    errors.push("Field 'state' is required and must be a non-empty string");
  }

  // 5. Salary
  const salary = typeof record.salary === "string" ? record.salary.trim() : "";
  if (!salary) {
    errors.push("Field 'salary' is required and must be a non-empty string");
  }

  // 6. Vacancies (positive integer)
  const vacanciesNum = Number(record.vacancies);
  if (!Number.isInteger(vacanciesNum) || vacanciesNum <= 0) {
    errors.push("Field 'vacancies' must be a positive integer greater than 0");
  }

  // 7. Last Date (valid calendar date, not expired in Asia/Kolkata)
  const lastDate = typeof record.lastDate === "string" ? record.lastDate.trim() : "";
  if (!isValidDateString(lastDate)) {
    errors.push("Field 'lastDate' must be a valid calendar date in YYYY-MM-DD format");
  } else {
    const todayKolkata = getKolkataDateString(referenceDate);
    if (lastDate < todayKolkata) {
      errors.push(`Field 'lastDate' (${lastDate}) has already passed in Asia/Kolkata (today: ${todayKolkata})`);
    }
  }

  // 8. Apply Link (valid HTTPS URL)
  const applyLink = typeof record.applyLink === "string" ? record.applyLink.trim() : "";
  if (!applyLink) {
    errors.push("Field 'applyLink' is required and must be a valid HTTPS URL");
  } else {
    try {
      const parsedUrl = new URL(applyLink);
      if (parsedUrl.protocol !== "https:") {
        errors.push("Field 'applyLink' must use the HTTPS protocol (https://)");
      }
    } catch {
      errors.push("Field 'applyLink' is not a valid URL");
    }
  }

  // 9. Optional Eligibility Notes (string, max 500 chars)
  let eligibilityNotes = "";
  if (record.eligibilityNotes !== undefined && record.eligibilityNotes !== null) {
    if (typeof record.eligibilityNotes !== "string") {
      errors.push("Field 'eligibilityNotes' must be a string if provided");
    } else {
      eligibilityNotes = record.eligibilityNotes.trim();
      if (eligibilityNotes.length > 500) {
        errors.push("Field 'eligibilityNotes' must not exceed 500 characters");
      }
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      title,
      department,
      qualification: matchedQual,
      eligibilityNotes,
      state,
      salary,
      vacancies: vacanciesNum,
      lastDate,
      applyLink,
      status: "active",
    },
  };
}

/**
 * Processes an array of raw records, validating them and detecting duplicates
 * against the input file itself and an optional set of existing database keys.
 *
 * @param {Array} records
 * @param {Set<string>} [existingDbKeys=new Set()]
 * @param {string|Date} [referenceDate]
 * @returns {object} Summary report and sanitized insertable items
 */
function processJobRecords(records, existingDbKeys = new Set(), referenceDate) {
  if (!Array.isArray(records)) {
    throw new Error("Input records must be an array");
  }

  const results = {
    total: records.length,
    validCount: 0,
    invalidCount: 0,
    fileDuplicateCount: 0,
    dbDuplicateCount: 0,
    insertableCount: 0,
    invalidRecords: [],
    duplicates: [],
    insertable: [],
  };

  const fileSeenKeys = new Set();

  records.forEach((record, index) => {
    const validation = validateJobRecord(record, referenceDate);

    if (!validation.isValid) {
      results.invalidCount++;
      results.invalidRecords.push({
        index,
        errors: validation.errors,
      });
      return;
    }

    results.validCount++;
    const sanitized = validation.sanitized;
    const key = normalizeKey(sanitized.title, sanitized.department, sanitized.lastDate);

    // Duplicate check within input file
    if (fileSeenKeys.has(key)) {
      results.fileDuplicateCount++;
      results.duplicates.push({
        index,
        title: sanitized.title,
        reason: "Duplicate within input file",
      });
      return;
    }

    // Duplicate check against existing database records
    if (existingDbKeys.has(key)) {
      results.dbDuplicateCount++;
      results.duplicates.push({
        index,
        title: sanitized.title,
        reason: "Already exists in database",
      });
      return;
    }

    fileSeenKeys.add(key);
    results.insertable.push(sanitized);
  });

  results.insertableCount = results.insertable.length;
  return results;
}

/**
 * Main importer orchestrator.
 *
 * @param {object} [options={}]
 * @param {string} [options.filePath] - path to jobs.json
 * @param {boolean} [options.apply] - if true, executes writes to MongoDB
 * @param {string|Date} [options.referenceDate] - reference date for testing
 * @returns {Promise<object>}
 */
async function runImporter(options = {}) {
  const filePath = options.filePath || path.join(__dirname, "../data/jobs.json");
  const isApply = options.apply !== undefined ? options.apply : process.argv.includes("--apply");
  const referenceDate = options.referenceDate;

  console.log("==================================================");
  console.log("           JanSetu Bulk Job Importer              ");
  console.log("==================================================");
  console.log(`Mode:       ${isApply ? ">>> LIVE WRITE (--apply) <<<" : "DRY RUN (preview only)"}`);
  console.log(`Input File: ${filePath}`);
  console.log("--------------------------------------------------");

  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file does not exist: ${filePath}`);
  }

  let rawContent;
  try {
    rawContent = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read input file: ${err.message}`);
  }

  let records;
  try {
    records = JSON.parse(rawContent);
  } catch (err) {
    throw new Error(`Invalid JSON format in input file: ${err.message}`);
  }

  if (!Array.isArray(records)) {
    throw new Error("Input JSON must contain an array of job objects");
  }

  let existingDbKeys = new Set();
  let mongoose = null;
  let JobModel = null;

  if (isApply) {
    // Only connect when live applying
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    mongoose = require("mongoose");
    JobModel = require("../models/Job");

    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    console.log("Checking existing jobs for duplicate detection...");
    const existingJobs = await JobModel.find({}, "title department lastDate");
    existingJobs.forEach((job) => {
      existingDbKeys.add(normalizeKey(job.title, job.department, job.lastDate));
    });
    console.log(`Found ${existingDbKeys.size} existing unique records in database.`);
  }

  const report = processJobRecords(records, existingDbKeys, referenceDate);

  console.log("--------------------------------------------------");
  console.log("Execution Summary:");
  console.log(`  Total records processed:   ${report.total}`);
  console.log(`  Valid records:             ${report.validCount}`);
  console.log(`  Invalid records:           ${report.invalidCount}`);
  console.log(`  File duplicates skipped:   ${report.fileDuplicateCount}`);
  console.log(`  Db duplicates skipped:     ${report.dbDuplicateCount}`);
  console.log(`  Genuinely new/insertable:  ${report.insertableCount}`);
  console.log("--------------------------------------------------");

  if (report.invalidRecords.length > 0) {
    console.log(`⚠️  ${report.invalidRecords.length} Invalid Record(s) Found:`);
    report.invalidRecords.forEach((item) => {
      console.log(`  - Record #${item.index}: ${item.errors.join("; ")}`);
    });
    console.log("--------------------------------------------------");
  }

  if (report.duplicates.length > 0) {
    console.log(`ℹ️  ${report.duplicates.length} Duplicate(s) Skipped:`);
    report.duplicates.forEach((item) => {
      console.log(`  - Record #${item.index} ("${item.title}"): ${item.reason}`);
    });
    console.log("--------------------------------------------------");
  }

  let insertedIds = [];

  if (isApply) {
    if (report.insertable.length > 0) {
      console.log(`Inserting ${report.insertable.length} jobs into database...`);
      const inserted = await JobModel.insertMany(report.insertable, { ordered: false });
      insertedIds = inserted.map((j) => j._id.toString());
      console.log(`✅ Successfully inserted ${insertedIds.length} new jobs!`);
      console.log(`Inserted IDs: ${insertedIds.join(", ")}`);
    } else {
      console.log("ℹ️ No insertable jobs to write to the database.");
    }

    if (mongoose) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
    }
  } else {
    console.log("ℹ️  Dry run complete. No database writes were performed.");
    console.log("    To write genuinely new records to MongoDB, re-run with: npm run import:jobs -- --apply");
  }

  console.log("==================================================");

  return {
    report,
    insertedIds,
    isApply,
  };
}

// Direct CLI invocation
if (require.main === module) {
  runImporter()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`❌ Importer error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = {
  ALLOWED_QUALIFICATIONS,
  normalizeString,
  normalizeKey,
  validateJobRecord,
  processJobRecords,
  runImporter,
};

