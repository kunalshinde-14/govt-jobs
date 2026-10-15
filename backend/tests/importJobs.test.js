const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

const {
  validateJobRecord,
  normalizeKey,
  processJobRecords,
  runImporter,
} = require("../scripts/importJobs");

describe("Bulk Job Importer Validation & Processing", () => {
  const REF_DATE = "2026-10-15"; // Simulated Asia/Kolkata reference date

  const validSample = {
    title: "SSC CGL 2026",
    department: "SSC",
    qualification: "Graduate",
    state: "All India",
    salary: "₹47,600 - ₹1,51,100",
    vacancies: 12256,
    lastDate: "2026-11-20",
    applyLink: "https://ssc.gov.in/apply",
  };

  describe("validateJobRecord()", () => {
    it("accepts a completely valid record and sets status to active", () => {
      const res = validateJobRecord(validSample, REF_DATE);
      assert.equal(res.isValid, true);
      assert.equal(res.errors.length, 0);
      assert.equal(res.sanitized.title, "SSC CGL 2026");
      assert.equal(res.sanitized.status, "active");
      assert.equal(res.sanitized.vacancies, 12256);
    });

    it("accepts case-insensitive allowed qualifications and normalizes them", () => {
      const res10th = validateJobRecord({ ...validSample, qualification: "10th" }, REF_DATE);
      const res12th = validateJobRecord({ ...validSample, qualification: "12th" }, REF_DATE);
      const resGrad = validateJobRecord({ ...validSample, qualification: "graduate" }, REF_DATE);

      assert.equal(res10th.isValid, true);
      assert.equal(res10th.sanitized.qualification, "10th");
      assert.equal(res12th.isValid, true);
      assert.equal(res12th.sanitized.qualification, "12th");
      assert.equal(resGrad.isValid, true);
      assert.equal(resGrad.sanitized.qualification, "Graduate");
    });

    it("rejects disallowed qualification values", () => {
      const res = validateJobRecord({ ...validSample, qualification: "PhD" }, REF_DATE);
      assert.equal(res.isValid, false);
      assert.match(res.errors[0], /Field 'qualification' must be one of/);
    });

    it("validates vacancies as a positive integer", () => {
      const resZero = validateJobRecord({ ...validSample, vacancies: 0 }, REF_DATE);
      const resNegative = validateJobRecord({ ...validSample, vacancies: -5 }, REF_DATE);
      const resFloat = validateJobRecord({ ...validSample, vacancies: 12.5 }, REF_DATE);
      const resString = validateJobRecord({ ...validSample, vacancies: "ten" }, REF_DATE);
      const resValidStr = validateJobRecord({ ...validSample, vacancies: "100" }, REF_DATE);

      assert.equal(resZero.isValid, false);
      assert.equal(resNegative.isValid, false);
      assert.equal(resFloat.isValid, false);
      assert.equal(resString.isValid, false);
      assert.equal(resValidStr.isValid, true);
      assert.equal(resValidStr.sanitized.vacancies, 100);
    });

    it("rejects expired deadlines earlier than today in Asia/Kolkata", () => {
      const res = validateJobRecord({ ...validSample, lastDate: "2026-10-10" }, REF_DATE);
      assert.equal(res.isValid, false);
      assert.match(res.errors[0], /has already passed in Asia\/Kolkata/);
    });

    it("accepts deadline if it is today in Asia/Kolkata", () => {
      const res = validateJobRecord({ ...validSample, lastDate: "2026-10-15" }, REF_DATE);
      assert.equal(res.isValid, true);
    });

    it("rejects impossible calendar dates like 2026-02-31 and malformed dates", () => {
      const resFeb31 = validateJobRecord({ ...validSample, lastDate: "2026-02-31" }, REF_DATE);
      const resApril31 = validateJobRecord({ ...validSample, lastDate: "2026-04-31" }, REF_DATE);
      const resMalformed = validateJobRecord({ ...validSample, lastDate: "20-11-2026" }, REF_DATE);

      assert.equal(resFeb31.isValid, false);
      assert.equal(resApril31.isValid, false);
      assert.equal(resMalformed.isValid, false);
      assert.match(resFeb31.errors[0], /valid calendar date in YYYY-MM-DD/);
    });

    it("rejects non-HTTPS and malformed URLs", () => {
      const resHttp = validateJobRecord({ ...validSample, applyLink: "http://ssc.gov.in" }, REF_DATE);
      const resNotUrl = validateJobRecord({ ...validSample, applyLink: "not-a-url" }, REF_DATE);
      const resEmpty = validateJobRecord({ ...validSample, applyLink: "" }, REF_DATE);

      assert.equal(resHttp.isValid, false);
      assert.match(resHttp.errors[0], /must use the HTTPS protocol/);

      assert.equal(resNotUrl.isValid, false);
      assert.match(resNotUrl.errors[0], /is not a valid URL/);

      assert.equal(resEmpty.isValid, false);
    });

    it("rejects records with missing required string fields", () => {
      assert.equal(validateJobRecord({ ...validSample, title: "   " }, REF_DATE).isValid, false);
      assert.equal(validateJobRecord({ ...validSample, department: "" }, REF_DATE).isValid, false);
      assert.equal(validateJobRecord({ ...validSample, state: " " }, REF_DATE).isValid, false);
      assert.equal(validateJobRecord({ ...validSample, salary: "" }, REF_DATE).isValid, false);
    });

    it("handles optional eligibilityNotes properly (preserves valid, defaults empty, rejects >500 chars)", () => {
      // 1. Valid string is trimmed and preserved
      const resWithNotes = validateJobRecord(
        { ...validSample, eligibilityNotes: "  10+2 with Maths & Physics  " },
        REF_DATE
      );
      assert.equal(resWithNotes.isValid, true);
      assert.equal(resWithNotes.sanitized.eligibilityNotes, "10+2 with Maths & Physics");

      // 2. Omitted defaults to empty string
      const resWithout = validateJobRecord(validSample, REF_DATE);
      assert.equal(resWithout.isValid, true);
      assert.equal(resWithout.sanitized.eligibilityNotes, "");

      // 3. Null or undefined defaults to empty string
      const resNull = validateJobRecord({ ...validSample, eligibilityNotes: null }, REF_DATE);
      assert.equal(resNull.isValid, true);
      assert.equal(resNull.sanitized.eligibilityNotes, "");

      // 4. Non-string is rejected
      const resNumber = validateJobRecord({ ...validSample, eligibilityNotes: 123 }, REF_DATE);
      assert.equal(resNumber.isValid, false);
      assert.match(resNumber.errors[0], /must be a string if provided/);

      // 5. Exceeding 500 characters is rejected
      const longNotes = "a".repeat(501);
      const resTooLong = validateJobRecord({ ...validSample, eligibilityNotes: longNotes }, REF_DATE);
      assert.equal(resTooLong.isValid, false);
      assert.match(resTooLong.errors[0], /must not exceed 500 characters/);
    });
  });

  describe("normalizeKey()", () => {
    it("normalizes case and spacing for composite comparison", () => {
      const key1 = normalizeKey("  SSC  CGL 2026 ", " SSC ", "2026-11-20");
      const key2 = normalizeKey("ssc cgl 2026", "ssc", "2026-11-20");
      assert.equal(key1, key2);
      assert.equal(key1, "ssc cgl 2026|ssc|2026-11-20");
    });
  });

  describe("processJobRecords() Deduplication & Categorization", () => {
    it("detects and skips duplicate records within the input file", () => {
      const records = [
        { ...validSample, title: "Job A" },
        { ...validSample, title: "Job A" }, // duplicate of first
        { ...validSample, title: "Job B" },
      ];

      const report = processJobRecords(records, new Set(), REF_DATE);
      assert.equal(report.total, 3);
      assert.equal(report.validCount, 3);
      assert.equal(report.fileDuplicateCount, 1);
      assert.equal(report.insertableCount, 2);
      assert.equal(report.insertable.length, 2);
      assert.equal(report.duplicates[0].reason, "Duplicate within input file");
    });

    it("detects and skips duplicates already present in MongoDB", () => {
      const dbKey = normalizeKey("Job Existing", "SSC", "2026-11-20");
      const existingDbKeys = new Set([dbKey]);

      const records = [
        { ...validSample, title: "Job Existing" }, // exists in DB
        { ...validSample, title: "Job New" },
      ];

      const report = processJobRecords(records, existingDbKeys, REF_DATE);
      assert.equal(report.total, 2);
      assert.equal(report.dbDuplicateCount, 1);
      assert.equal(report.insertableCount, 1);
      assert.equal(report.insertable[0].title, "Job New");
      assert.equal(report.duplicates[0].reason, "Already exists in database");
    });

    it("correctly partitions mixed records (valid, invalid, duplicates)", () => {
      const existingDbKeys = new Set([normalizeKey("In DB", "SSC", "2026-11-20")]);

      const records = [
        { ...validSample, title: "Brand New" }, // Insertable
        { ...validSample, title: "In DB" }, // DB duplicate
        { ...validSample, title: "Brand New" }, // File duplicate
        { ...validSample, title: "Expired Job", lastDate: "2026-10-01" }, // Invalid
        { ...validSample, vacancies: -10 }, // Invalid
      ];

      const report = processJobRecords(records, existingDbKeys, REF_DATE);
      assert.equal(report.total, 5);
      assert.equal(report.validCount, 3);
      assert.equal(report.invalidCount, 2);
      assert.equal(report.dbDuplicateCount, 1);
      assert.equal(report.fileDuplicateCount, 1);
      assert.equal(report.insertableCount, 1);
      assert.equal(report.insertable[0].title, "Brand New");
    });
  });

  describe("runImporter() Dry Run Safety", () => {
    it("executes dry run safely without performing database writes or requiring connection", async () => {
      // Create temporary input file
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "import-test-"));
      const tempFile = path.join(tempDir, "test-jobs.json");

      const testJobs = [
        validSample,
        { ...validSample, title: "Another Job" },
      ];

      fs.writeFileSync(tempFile, JSON.stringify(testJobs, null, 2), "utf-8");

      try {
        const result = await runImporter({
          filePath: tempFile,
          apply: false, // Dry run
          referenceDate: REF_DATE,
        });

        assert.equal(result.isApply, false);
        assert.equal(result.insertedIds.length, 0);
        assert.equal(result.report.total, 2);
        assert.equal(result.report.insertableCount, 2);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});

