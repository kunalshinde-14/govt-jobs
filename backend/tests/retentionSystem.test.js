const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Job = require("../models/Job");
const userRoutes = require("../routes/userRoutes");
const { evaluateJobMatch } = require("../utils/matchingService");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-32-chars-long!!";

describe("JanSetu Retention System — Personalized Matching & User Retention", () => {
  describe("Personalized Matching Service (evaluateJobMatch)", () => {
    it("returns broad discovery match when user has not set any preferences", () => {
      const job = {
        title: "SBI PO 2026",
        department: "Banking",
        qualification: "Graduate",
        state: "All India",
      };
      const result = evaluateJobMatch(job, {});

      assert.equal(result.isMatch, true);
      assert.equal(result.matchType, "broad_discovery");
      assert.ok(result.disclaimer.includes("Review the official"));
    });

    it("matches qualification directly with transparent reason", () => {
      const job = {
        title: "Assistant Audit Officer",
        department: "SSC",
        qualification: "Graduate",
        state: "Delhi",
      };
      const result = evaluateJobMatch(job, {
        qualification: ["Graduate"],
        sectors: [],
        states: [],
      });

      assert.equal(result.isMatch, true);
      assert.ok(result.matchReasons.some((r) => r.includes("Matches your qualification (Graduate)")));
    });

    it("allows Graduate users to qualify for 10th or 12th entry-level postings", () => {
      const job = {
        title: "Railway Trackman",
        department: "Railway",
        qualification: "10th",
        state: "Maharashtra",
      };
      const result = evaluateJobMatch(job, {
        qualification: ["Graduate"],
        sectors: [],
        states: [],
      });

      assert.equal(result.isMatch, true);
      assert.ok(result.matchReasons.some((r) => r.includes("Open to your education level")));
    });

    it("matches sector by keyword mapping (e.g. NICL/SBI -> Banking)", () => {
      const job = {
        title: "Administrative Officer Scale I",
        department: "National Insurance (NICL)",
        qualification: "Graduate",
        state: "All India",
      };
      const result = evaluateJobMatch(job, {
        qualification: [],
        sectors: ["Banking"],
        states: [],
      });

      assert.equal(result.isMatch, true);
      assert.ok(result.matchReasons.some((r) => r.includes("Matches your selected sector (Banking)")));
    });

    it("matches user state or recognizes All India national opportunities", () => {
      const stateJob = {
        title: "MPSC Talathi",
        department: "State PSC",
        qualification: "Graduate",
        state: "Maharashtra",
      };
      const allIndiaJob = {
        title: "Coast Guard Navik",
        department: "Defence",
        qualification: "12th",
        state: "All India",
      };

      const pref = { qualification: [], sectors: [], states: ["Maharashtra"] };

      const matchState = evaluateJobMatch(stateJob, pref);
      assert.equal(matchState.isMatch, true);
      assert.ok(matchState.matchReasons.some((r) => r.includes("In your preferred state (Maharashtra)")));

      const matchAllIndia = evaluateJobMatch(allIndiaJob, pref);
      assert.equal(matchAllIndia.isMatch, true);
      assert.ok(matchAllIndia.matchReasons.some((r) => r.includes("All-India national opening")));
    });

    it("assigns confirmed_criteria when all declared user preferences are satisfied", () => {
      const job = {
        title: "SBI PO 2026",
        department: "State Bank of India (Banking)",
        qualification: "Graduate",
        state: "All India",
      };
      const result = evaluateJobMatch(job, {
        qualification: ["Graduate"],
        sectors: ["Banking"],
        states: ["Maharashtra"],
      });

      assert.equal(result.isMatch, true);
      assert.equal(result.matchType, "confirmed_criteria");
      assert.equal(result.matchReasons.length, 3);
    });

    it("includes unambiguous non-guarantee disclaimer to prevent misrepresentation", () => {
      const job = { title: "Job", department: "Dept", qualification: "10th", state: "Delhi" };
      const result = evaluateJobMatch(job, { qualification: ["10th"] });
      assert.ok(result.disclaimer.includes("does not guarantee eligibility"));
    });
  });

  describe("User Preferences API & Input Validation", () => {
    let originalFindById;

    beforeEach(() => {
      originalFindById = User.findById;
    });

    afterEach(() => {
      User.findById = originalFindById;
    });

    it("rejects disallowed qualifications with 400", async () => {
      let saved = false;
      User.findById = () => ({
        _id: "user123",
        preferences: { qualification: [] },
        save: async () => { saved = true; },
      });

      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/preferences" && l.route.methods.put
      );
      assert.ok(routeLayer, "PUT /preferences route must exist");

      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = {
        userId: "user123",
        body: { qualification: ["PhD", "Graduate"] },
      };
      let statusSent = null;
      let jsonSent = null;
      const res = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      await handler(req, res);
      assert.equal(statusSent, 400);
      assert.ok(jsonSent.message.includes("Invalid qualification"));
      assert.equal(saved, false);
    });

    it("accepts valid preferences and updates user", async () => {
      let saved = false;
      const mockUser = {
        _id: "user123",
        preferences: { qualification: [], sectors: [], states: [], notifications: {} },
        save: async () => { saved = true; },
      };
      User.findById = () => mockUser;

      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/preferences" && l.route.methods.put
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = {
        userId: "user123",
        body: {
          qualification: ["Graduate", "12th"],
          sectors: ["Banking", "Defence"],
          states: ["Maharashtra"],
          notifications: { frequency: "weekly", emailAlerts: true },
        },
      };
      let jsonSent = null;
      const res = {
        json: (j) => { jsonSent = j; },
      };

      await handler(req, res);
      assert.equal(saved, true);
      assert.deepEqual(mockUser.preferences.qualification, ["Graduate", "12th"]);
      assert.deepEqual(mockUser.preferences.sectors, ["Banking", "Defence"]);
      assert.equal(mockUser.preferences.notifications.frequency, "weekly");
    });
  });

  describe("Session Visit Recording & Since Your Last Visit", () => {
    let originalFindById;
    let originalJobFind;

    beforeEach(() => {
      originalFindById = User.findById;
      originalJobFind = Job.find;
    });

    afterEach(() => {
      User.findById = originalFindById;
      Job.find = originalJobFind;
    });

    it("records session visit by advancing previousVisitedAt and lastVisitedAt", async () => {
      const initialLastVisit = new Date("2026-10-15T10:00:00Z");
      const mockUser = {
        _id: "user123",
        lastVisitedAt: initialLastVisit,
        previousVisitedAt: null,
        save: async () => {},
      };
      User.findById = () => mockUser;

      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/visit" && l.route.methods.post
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = { userId: "user123" };
      let jsonSent = null;
      const res = { json: (j) => { jsonSent = j; } };

      await handler(req, res);
      assert.equal(mockUser.previousVisitedAt, initialLastVisit);
      assert.ok(mockUser.lastVisitedAt > initialLastVisit);
      assert.equal(jsonSent.message, "Visit recorded");
    });

    it("filters out previously seen jobs so they are not surfaced repeatedly as new", async () => {
      const mockUser = {
        _id: "user123",
        previousVisitedAt: new Date("2026-10-01T00:00:00Z"),
        seenJobs: [{ jobId: "seenJob999", seenAt: new Date() }],
        preferences: { qualification: ["Graduate"], sectors: [], states: [] },
      };
      User.findById = () => mockUser;

      const activeJobs = [
        {
          _id: "seenJob999",
          title: "Already Seen Vacancy",
          department: "Banking",
          qualification: "Graduate",
          state: "All India",
          lastDate: "2026-12-31",
          status: "active",
          createdAt: new Date("2026-10-10"),
        },
        {
          _id: "newJob100",
          title: "Genuinely New Vacancy",
          department: "Banking",
          qualification: "Graduate",
          state: "All India",
          lastDate: "2026-12-31",
          status: "active",
          createdAt: new Date("2026-10-12"),
        },
      ];

      Job.find = () => ({
        sort: () => Promise.resolve(activeJobs),
      });

      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/since-last-visit" && l.route.methods.get
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = { userId: "user123" };
      let jsonSent = null;
      const res = { json: (j) => { jsonSent = j; } };

      await handler(req, res);
      assert.equal(jsonSent.totalCount, 1);
      assert.equal(jsonSent.opportunities[0].job._id, "newJob100");
      assert.equal(jsonSent.isCaughtUp, false);
    });

    it("returns an honest caught-up state when all matching opportunities have been seen", async () => {
      const mockUser = {
        _id: "user123",
        previousVisitedAt: new Date("2026-10-01T00:00:00Z"),
        seenJobs: [{ jobId: "seenJob1", seenAt: new Date() }],
        preferences: { qualification: ["Graduate"], sectors: [], states: [] },
      };
      User.findById = () => mockUser;

      const activeJobs = [
        {
          _id: "seenJob1",
          title: "Only Job Available",
          department: "Banking",
          qualification: "Graduate",
          state: "All India",
          lastDate: "2026-12-31",
          status: "active",
          createdAt: new Date("2026-10-05"),
        },
      ];

      Job.find = () => ({
        sort: () => Promise.resolve(activeJobs),
      });

      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/since-last-visit" && l.route.methods.get
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = { userId: "user123" };
      let jsonSent = null;
      const res = { json: (j) => { jsonSent = j; } };

      await handler(req, res);
      assert.equal(jsonSent.totalCount, 0);
      assert.equal(jsonSent.isCaughtUp, true);
    });
  });

  describe("Deadline Radar (Approaching Saved Deadlines)", () => {
    let originalFindById;

    beforeEach(() => {
      originalFindById = User.findById;
    });

    afterEach(() => {
      User.findById = originalFindById;
    });

    it("categorizes active saved jobs by deadline urgency and excludes expired jobs", async () => {
      const today = new Date();
      const in2Days = new Date(today);
      in2Days.setDate(today.getDate() + 2);
      const in5Days = new Date(today);
      in5Days.setDate(today.getDate() + 5);
      const in20Days = new Date(today);
      in20Days.setDate(today.getDate() + 20);

      const toStr = (d) => d.toISOString().split("T")[0];

      const savedJobs = [
        {
          _id: "jobUrgent",
          title: "Urgent Deadline Job",
          lastDate: toStr(in2Days),
          status: "active",
        },
        {
          _id: "jobWeek",
          title: "Closing This Week Job",
          lastDate: toStr(in5Days),
          status: "active",
        },
        {
          _id: "jobUpcoming",
          title: "Upcoming Job",
          lastDate: toStr(in20Days),
          status: "active",
        },
        {
          _id: "jobExpired",
          title: "Already Expired Job",
          lastDate: "2025-01-01",
          status: "expired",
        },
      ];

      User.findById = () => ({
        populate: () => Promise.resolve({ savedJobs }),
      });

      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/deadline-radar" && l.route.methods.get
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = { userId: "user123" };
      let jsonSent = null;
      const res = { json: (j) => { jsonSent = j; } };

      await handler(req, res);
      assert.equal(jsonSent.urgent.length, 1);
      assert.equal(jsonSent.urgent[0].job._id, "jobUrgent");
      assert.equal(jsonSent.closingThisWeek.length, 1);
      assert.equal(jsonSent.closingThisWeek[0].job._id, "jobWeek");
      assert.equal(jsonSent.upcoming.length, 1);
      assert.equal(jsonSent.upcoming[0].job._id, "jobUpcoming");
      // Expired job must not be in any list
      assert.equal(jsonSent.totalActiveSaved, 3);
    });
  });

  describe("Application Tracker Progress Lifecycle", () => {
    let originalFindById;
    let originalJobFindById;

    beforeEach(() => {
      originalFindById = User.findById;
      originalJobFindById = Job.findById;
    });

    afterEach(() => {
      User.findById = originalFindById;
      Job.findById = originalJobFindById;
    });

    it("updates application status across lifecycle stages and auto-saves job", async () => {
      const mockUser = {
        _id: "user123",
        savedJobs: [],
        applications: [],
        save: async () => {},
      };
      User.findById = () => mockUser;
      Job.findById = () => Promise.resolve({ _id: "job456", title: "IBPS Clerk" });

      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/applications/:jobId" && l.route.methods.put
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = {
        userId: "user123",
        params: { jobId: "job456" },
        body: { status: "Applied", notes: "Registration ID: IBPS-2026-9921" },
      };
      let jsonSent = null;
      const res = { json: (j) => { jsonSent = j; } };

      await handler(req, res);

      assert.equal(mockUser.applications.length, 1);
      assert.equal(mockUser.applications[0].status, "Applied");
      assert.equal(mockUser.applications[0].notes, "Registration ID: IBPS-2026-9921");
      // Auto-saved to savedJobs
      assert.ok(mockUser.savedJobs.includes("job456"));
      assert.equal(jsonSent.message, "Application status updated");
    });

    it("rejects invalid status lifecycle values with 400", async () => {
      const routeLayer = userRoutes.stack.find(
        (l) => l.route && l.route.path === "/applications/:jobId" && l.route.methods.put
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;

      const req = {
        userId: "user123",
        params: { jobId: "job456" },
        body: { status: "Guaranteed Hired" },
      };
      let statusSent = null;
      let jsonSent = null;
      const res = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      await handler(req, res);
      assert.equal(statusSent, 400);
      assert.ok(jsonSent.message.includes("Invalid status"));
    });
  });
});

