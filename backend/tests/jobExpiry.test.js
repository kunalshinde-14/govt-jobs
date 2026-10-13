const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const {
  DATE_REGEX,
  isValidDateString,
  getKolkataDateString,
  isJobExpired,
  isJobActive,
  isClosingSoon,
} = require("../utils/jobHelpers");

const verifyAdmin = require("../middleware/verifyAdmin");

describe("Job Expiry, Date & Access Rules (Asia/Kolkata)", () => {
  const REF_DATE = "2026-10-15"; // Simulated Kolkata reference date

  describe("isValidDateString()", () => {
    it("accepts valid YYYY-MM-DD calendar dates", () => {
      assert.equal(isValidDateString("2026-10-15"), true);
      assert.equal(isValidDateString("2024-02-29"), true); // Leap year 2024
      assert.equal(isValidDateString("2026-12-31"), true);
    });

    it("rejects non-existent calendar dates", () => {
      assert.equal(isValidDateString("2025-02-29"), false); // 2025 is not a leap year
      assert.equal(isValidDateString("2026-04-31"), false); // April has 30 days
      assert.equal(isValidDateString("2026-02-30"), false);
      assert.equal(isValidDateString("2026-13-01"), false); // Month 13
      assert.equal(isValidDateString("2026-00-10"), false);
    });

    it("rejects malformed formats and non-strings", () => {
      assert.equal(isValidDateString("15-10-2026"), false);
      assert.equal(isValidDateString("2026/10/15"), false);
      assert.equal(isValidDateString("2026-10"), false);
      assert.equal(isValidDateString("tomorrow"), false);
      assert.equal(isValidDateString(""), false);
      assert.equal(isValidDateString(null), false);
      assert.equal(isValidDateString(undefined), false);
      assert.equal(isValidDateString(123456789), false);
    });
  });

  describe("getKolkataDateString()", () => {
    it("returns YYYY-MM-DD in Asia/Kolkata timezone", () => {
      // 2026-10-13T20:00:00Z in UTC is 2026-10-14 01:30:00 IST in Kolkata (+05:30)
      const lateUtc = new Date("2026-10-13T20:00:00Z");
      assert.equal(getKolkataDateString(lateUtc), "2026-10-14");

      // 2026-10-13T02:00:00Z in UTC is 2026-10-13 07:30:00 IST in Kolkata
      const earlyUtc = new Date("2026-10-13T02:00:00Z");
      assert.equal(getKolkataDateString(earlyUtc), "2026-10-13");
    });

    it("returns empty string for invalid dates", () => {
      assert.equal(getKolkataDateString("invalid"), "");
      assert.equal(getKolkataDateString(new Date("invalid")), "");
    });
  });

  describe("isJobExpired()", () => {
    it("returns false for future deadlines", () => {
      assert.equal(isJobExpired("2026-10-20", REF_DATE), false);
    });

    it("returns false when deadline is today (active through end of day)", () => {
      assert.equal(isJobExpired("2026-10-15", REF_DATE), false);
    });

    it("returns true for yesterday and older deadlines", () => {
      assert.equal(isJobExpired("2026-10-14", REF_DATE), true);
      assert.equal(isJobExpired("2026-06-01", REF_DATE), true);
    });

    it("returns true for missing or malformed deadlines", () => {
      assert.equal(isJobExpired(null, REF_DATE), true);
      assert.equal(isJobExpired(undefined, REF_DATE), true);
      assert.equal(isJobExpired("", REF_DATE), true);
      assert.equal(isJobExpired("2026-02-30", REF_DATE), true);
      assert.equal(isJobExpired("invalid-date", REF_DATE), true);
    });
  });

  describe("isJobActive()", () => {
    it("returns true for active jobs with valid future deadline", () => {
      const job = { title: "Active Job", lastDate: "2026-10-25", status: "active" };
      assert.equal(isJobActive(job, REF_DATE), true);
    });

    it("returns true for legacy records missing status with valid future deadline", () => {
      const legacyJob = { title: "Legacy Job", lastDate: "2026-10-25" };
      assert.equal(isJobActive(legacyJob, REF_DATE), true);
    });

    it("returns false for jobs with past deadlines", () => {
      const expiredJob = { title: "Old Job", lastDate: "2026-10-10", status: "active" };
      assert.equal(isJobActive(expiredJob, REF_DATE), false);
    });

    it("returns false for jobs explicitly marked status: 'expired'", () => {
      const job = { title: "Expired Job", lastDate: "2026-12-31", status: "expired" };
      assert.equal(isJobActive(job, REF_DATE), false);
    });

    it("returns false for jobs explicitly marked status: 'archived'", () => {
      const job = { title: "Archived Job", lastDate: "2026-12-31", status: "archived" };
      assert.equal(isJobActive(job, REF_DATE), false);
    });

    it("returns false for missing, invalid, or impossible calendar dates", () => {
      assert.equal(isJobActive({ title: "No Date", status: "active" }, REF_DATE), false);
      assert.equal(isJobActive({ title: "Bad Date", lastDate: "2026-02-30", status: "active" }, REF_DATE), false);
      assert.equal(isJobActive({ title: "April 31", lastDate: "2026-04-31", status: "active" }, REF_DATE), false);
      assert.equal(isJobActive({ title: "Random string", lastDate: "abc", status: "active" }, REF_DATE), false);
    });

    it("returns false for null, undefined, or non-object inputs", () => {
      assert.equal(isJobActive(null, REF_DATE), false);
      assert.equal(isJobActive(undefined, REF_DATE), false);
      assert.equal(isJobActive("job", REF_DATE), false);
    });
  });

  describe("Reactivation & Deadline Extension Logic", () => {
    it("resets status to 'active' when extending an expired job deadline", () => {
      const existingJob = { status: "expired", lastDate: "2026-10-10" };
      const newDeadline = "2026-10-30"; // extended to future
      const today = REF_DATE;

      let updateStatus = undefined; // not explicitly provided
      if (existingJob.status === "archived") {
        updateStatus = "archived";
      } else if (
        existingJob.status === "expired" &&
        isValidDateString(newDeadline) &&
        newDeadline >= today
      ) {
        updateStatus = "active";
      }

      assert.equal(updateStatus, "active");
    });

    it("MUST keep archived jobs as 'archived' when extending deadline without explicit reactivation", () => {
      const existingJob = { status: "archived", lastDate: "2026-10-10" };
      const newDeadline = "2026-10-30"; // extended to future
      const today = REF_DATE;

      let updateStatus = undefined;
      if (existingJob.status === "archived") {
        updateStatus = "archived";
      } else if (
        existingJob.status === "expired" &&
        isValidDateString(newDeadline) &&
        newDeadline >= today
      ) {
        updateStatus = "active";
      }

      assert.equal(updateStatus, "archived");
    });
  });

  describe("Public vs Admin Query Rules", () => {
    it("public query matches active & legacy jobs while rejecting expired & archived", () => {
      const today = REF_DATE;
      const publicQueryMatcher = (job) => {
        // Simulates: status: { $nin: ["expired", "archived"] }, lastDate: { $regex: /^\d{4}-\d{2}-\d{2}$/, $gte: today }
        if (["expired", "archived"].includes(job.status)) return false;
        if (!isValidDateString(job.lastDate)) return false;
        return job.lastDate >= today;
      };

      // 1. Active with future deadline -> matched
      assert.equal(publicQueryMatcher({ status: "active", lastDate: "2026-10-20" }), true);

      // 2. Legacy (no status field) with future deadline -> matched
      assert.equal(publicQueryMatcher({ lastDate: "2026-10-20" }), true);

      // 3. Expired status with future deadline -> rejected
      assert.equal(publicQueryMatcher({ status: "expired", lastDate: "2026-10-20" }), false);

      // 4. Archived status with future deadline -> rejected
      assert.equal(publicQueryMatcher({ status: "archived", lastDate: "2026-10-20" }), false);

      // 5. Active status with past deadline -> rejected
      assert.equal(publicQueryMatcher({ status: "active", lastDate: "2026-10-10" }), false);

      // 6. Active status with invalid date -> rejected
      assert.equal(publicQueryMatcher({ status: "active", lastDate: "2026-02-30" }), false);
      assert.equal(publicQueryMatcher({ status: "active", lastDate: "malformed" }), false);
    });
  });

  describe("verifyAdmin Middleware Authorization", () => {
    process.env.ADMIN_JWT_SECRET = "test_admin_secret_minimum_32_characters_12345";

    it("rejects requests without Authorization header (401 No token)", () => {
      const req = { headers: {} };
      let statusSent = null;
      let jsonSent = null;
      const res = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };
      let nextCalled = false;

      verifyAdmin(req, res, () => { nextCalled = true; });

      assert.equal(statusSent, 401);
      assert.equal(jsonSent.message, "No token");
      assert.equal(nextCalled, false);
    });

    it("rejects requests with forged/invalid token (401 Invalid token)", () => {
      const req = { headers: { authorization: "Bearer invalid.jwt.token" } };
      let statusSent = null;
      let jsonSent = null;
      const res = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };
      let nextCalled = false;

      verifyAdmin(req, res, () => { nextCalled = true; });

      assert.equal(statusSent, 401);
      assert.equal(jsonSent.message, "Invalid token");
      assert.equal(nextCalled, false);
    });

    it("rejects tokens where admin flag is false (403 Not admin)", () => {
      const nonAdminToken = jwt.sign(
        { admin: false },
        process.env.ADMIN_JWT_SECRET,
        { expiresIn: "1h" }
      );
      const req = { headers: { authorization: `Bearer ${nonAdminToken}` } };
      let statusSent = null;
      let jsonSent = null;
      const res = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };
      let nextCalled = false;

      verifyAdmin(req, res, () => { nextCalled = true; });

      assert.equal(statusSent, 403);
      assert.equal(jsonSent.message, "Not admin");
      assert.equal(nextCalled, false);
    });

    it("accepts requests with valid admin token and calls next()", () => {
      const validToken = jwt.sign(
        { admin: true },
        process.env.ADMIN_JWT_SECRET,
        { expiresIn: "1h" }
      );
      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = { status: () => res, json: () => {} };
      let nextCalled = false;

      verifyAdmin(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
    });
  });

  describe("Public GET /:id Route Rules", () => {
    const today = REF_DATE;

    // Helper that executes the GET /:id evaluation logic
    const evaluatePublicGetById = (job) => {
      if (!job) return { status: 404, message: "Job not found" };
      if (!isJobActive(job, today)) {
        return { status: 404, message: "Job not found" };
      }
      return { status: 200, data: job };
    };

    it("returns 200 for active job with valid future deadline", () => {
      const job = { _id: "1", title: "Active", status: "active", lastDate: "2026-10-25" };
      const res = evaluatePublicGetById(job);
      assert.equal(res.status, 200);
      assert.equal(res.data.title, "Active");
    });

    it("returns 200 for legacy job (missing status) with valid future deadline", () => {
      const legacyJob = { _id: "2", title: "Legacy", lastDate: "2026-10-25" };
      const res = evaluatePublicGetById(legacyJob);
      assert.equal(res.status, 200);
    });

    it("returns 404 for expired job (never exposes historical jobs)", () => {
      const expiredJob = { _id: "3", title: "Expired", status: "expired", lastDate: "2026-10-25" };
      const res = evaluatePublicGetById(expiredJob);
      assert.equal(res.status, 404);
    });

    it("returns 404 for archived job", () => {
      const archivedJob = { _id: "4", title: "Archived", status: "archived", lastDate: "2026-10-25" };
      const res = evaluatePublicGetById(archivedJob);
      assert.equal(res.status, 404);
    });

    it("returns 404 for past deadline", () => {
      const pastJob = { _id: "5", title: "Past Deadline", status: "active", lastDate: "2026-10-10" };
      const res = evaluatePublicGetById(pastJob);
      assert.equal(res.status, 404);
    });

    it("returns 404 for impossible calendar dates like 2026-02-31", () => {
      const badJob = { _id: "6", title: "Feb 31 Job", status: "active", lastDate: "2026-02-31" };
      const res = evaluatePublicGetById(badJob);
      assert.equal(res.status, 404);
    });

    it("returns 404 for null / non-existent job", () => {
      const res = evaluatePublicGetById(null);
      assert.equal(res.status, 404);
    });
  });

  describe("Public GET / Calendar Validity Filtering", () => {
    it("safely excludes impossible dates matching YYYY-MM-DD regex while preserving legacy records", () => {
      const today = REF_DATE;

      // Mock database results matching index regex: lastDate: { $regex: /^\d{4}-\d{2}-\d{2}$/, $gte: today }
      const mockDbResults = [
        { _id: "1", title: "Valid Active", status: "active", lastDate: "2026-10-20" },
        { _id: "2", title: "Valid Legacy (No Status)", lastDate: "2026-10-22" },
        { _id: "3", title: "Impossible Feb 31", status: "active", lastDate: "2026-02-31" },
        { _id: "4", title: "Impossible April 31", status: "active", lastDate: "2026-04-31" },
        { _id: "5", title: "Impossible Month 13", status: "active", lastDate: "2026-13-01" },
        { _id: "6", title: "Archived in Db", status: "archived", lastDate: "2026-10-25" },
      ];

      // Route filter logic:
      const filtered = mockDbResults.filter(
        (job) => isValidDateString(job.lastDate) && isJobActive(job, today)
      );

      assert.equal(filtered.length, 2);
      assert.deepEqual(
        filtered.map((j) => j._id),
        ["1", "2"]
      );
      assert.equal(filtered.some((j) => j.lastDate === "2026-02-31"), false);
      assert.equal(filtered.some((j) => j.lastDate === "2026-04-31"), false);
      assert.equal(filtered.some((j) => j.lastDate === "2026-13-01"), false);
      assert.equal(filtered.some((j) => j.status === "archived"), false);
    });
  });
});
