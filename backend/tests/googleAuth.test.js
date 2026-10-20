const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const authRoutes = require("../routes/authRoutes");
const User = require("../models/User");

// Ensure environment variables exist for test run
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-32-chars-long!!";
process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "test-admin-jwt-secret-key-32-chars!!";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id.apps.googleusercontent.com";

describe("Google Authentication & User Account Security", () => {
  let originalFindOne;
  let originalCreate;

  beforeEach(() => {
    originalFindOne = User.findOne;
    originalCreate = User.create;
  });

  afterEach(() => {
    User.findOne = originalFindOne;
    User.create = originalCreate;
    authRoutes._setGoogleClientForTesting(null);
  });

  describe("Google ID Token Verification & Input Validation", () => {
    it("rejects non-string or missing credential with 400", async () => {
      const mockReq = { body: {} };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      // Find the /google route handler
      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google" && layer.route.methods.post
      );
      assert.ok(googleRoute, "POST /google route must exist");

      // Execute route handler (last handler in stack)
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 400);
      assert.equal(jsonSent.message, "Google ID credential is required");
    });

    it("rejects invalid, forged, or expired token with 401 without leaking secrets", async () => {
      // Mock Google OAuth client that rejects verification
      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => {
          throw new Error("Token used too early or expired");
        },
      });

      const mockReq = { body: { credential: "invalid.forged.jwt" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 401);
      assert.equal(jsonSent.message, "Invalid or expired Google credential");
    });

    it("rejects Google payload missing sub or email with 400", async () => {
      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => ({
          getPayload: () => ({ email_verified: true }), // Missing sub and email
        }),
      });

      const mockReq = { body: { credential: "valid.structure.token" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 400);
      assert.equal(jsonSent.message, "Invalid Google token payload");
    });

    it("rejects unverified Google email with 400 to prevent pre-account takeover", async () => {
      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => ({
          getPayload: () => ({
            sub: "google-uid-unverified",
            email: "victim@example.com",
            email_verified: false, // NOT verified
            name: "Unverified Attacker",
          }),
        }),
      });

      const mockReq = { body: { credential: "unverified.email.token" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 400);
      assert.equal(jsonSent.message, "Google email is not verified");
    });
  });

  describe("New User Registration via Google Sign-In", () => {
    it("creates a new user with sub identifier, emits valid user JWT, and returns user object", async () => {
      let createdUserData = null;

      // Mock database: no existing user by googleId or email
      User.findOne = async () => null;
      User.create = async (data) => {
        createdUserData = data;
        return {
          _id: "mongo_new_user_id_123",
          name: data.name,
          email: data.email,
          googleId: data.googleId,
          savedJobs: [],
        };
      };

      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => ({
          getPayload: () => ({
            sub: "google_sub_10928374",
            email: "NewAspirant@JanSetu.in",
            email_verified: true,
            name: "New Aspirant",
          }),
        }),
      });

      const mockReq = { body: { credential: "valid.google.token" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 200);
      assert.ok(jsonSent.token, "Must return JWT token");
      assert.equal(jsonSent.user.id, "mongo_new_user_id_123");
      assert.equal(jsonSent.user.email, "newaspirant@jansetu.in");
      assert.equal(jsonSent.user.name, "New Aspirant");

      // Verify created DB data
      assert.equal(createdUserData.googleId, "google_sub_10928374");
      assert.equal(createdUserData.email, "newaspirant@jansetu.in");
      assert.equal(createdUserData.password, undefined, "Google users must not have plain/fake passwords");

      // Verify JWT claims: signed with JWT_SECRET, contains user id, does NOT grant admin
      const decoded = jwt.verify(jsonSent.token, process.env.JWT_SECRET);
      assert.equal(decoded.id, "mongo_new_user_id_123");
      assert.equal(decoded.admin, undefined, "User JWT must never grant admin rights");
    });
  });

  describe("Existing User Login & Stable Identifier (`sub`) Lookup", () => {
    it("finds existing user by googleId, does not create duplicates, and issues session JWT", async () => {
      let createCalled = false;
      User.create = async () => { createCalled = true; };

      const existingGoogleUser = {
        _id: "existing_user_id_999",
        name: "Existing Candidate",
        email: "candidate@jansetu.in",
        googleId: "google_sub_existing_555",
        savedJobs: ["job_1", "job_2"],
        save: async () => {},
      };

      // Mock findOne: returns user when queried by googleId
      User.findOne = async (query) => {
        if (query.googleId === "google_sub_existing_555") {
          return existingGoogleUser;
        }
        return null;
      };

      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => ({
          getPayload: () => ({
            sub: "google_sub_existing_555",
            email: "candidate@jansetu.in",
            email_verified: true,
            name: "Existing Candidate",
          }),
        }),
      });

      const mockReq = { body: { credential: "valid.google.token" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 200);
      assert.equal(createCalled, false, "Must not create a new user for existing Google user");
      assert.equal(jsonSent.user.id, "existing_user_id_999");
      assert.equal(jsonSent.user.email, "candidate@jansetu.in");

      const decoded = jwt.verify(jsonSent.token, process.env.JWT_SECRET);
      assert.equal(decoded.id, "existing_user_id_999");
    });
  });

  describe("Safe Account Linking vs Duplicate / Conflict Prevention", () => {
    it("safely links Google ID to existing unlinked account when email is verified", async () => {
      let saved = false;
      const existingPasswordUser = {
        _id: "password_user_id_444",
        name: "Password User",
        email: "verified@example.com",
        password: "$2a$10$hashedpasswordhere",
        googleId: undefined, // Not yet linked
        savedJobs: ["saved_job_alpha"],
        save: async () => { saved = true; },
      };

      // First query { googleId }: not found
      // Second query { email }: finds existing password user
      User.findOne = async (query) => {
        if (query.googleId) return null;
        if (query.email === "verified@example.com") return existingPasswordUser;
        return null;
      };

      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => ({
          getPayload: () => ({
            sub: "new_sub_for_existing_email_777",
            email: "verified@example.com",
            email_verified: true,
            name: "Password User",
          }),
        }),
      });

      const mockReq = { body: { credential: "token.for.existing.email" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 200);
      assert.equal(saved, true, "Must save linked googleId on existing account");
      assert.equal(existingPasswordUser.googleId, "new_sub_for_existing_email_777");
      assert.equal(jsonSent.user.id, "password_user_id_444");
    });

    it("rejects with 409 Conflict if email is already linked to a DIFFERENT Google account", async () => {
      const alreadyLinkedUser = {
        _id: "linked_user_id_888",
        email: "shared@example.com",
        googleId: "original_sub_111", // Already linked to sub 111
      };

      User.findOne = async (query) => {
        if (query.googleId === "different_sub_222") return null;
        if (query.email === "shared@example.com") return alreadyLinkedUser;
        return null;
      };

      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => ({
          getPayload: () => ({
            sub: "different_sub_222", // Different Google sub!
            email: "shared@example.com",
            email_verified: true,
          }),
        }),
      });

      const mockReq = { body: { credential: "mismatched.sub.token" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 409);
      assert.match(jsonSent.message, /already associated with another Google account/);
    });
  });

  describe("Password Login Handling for Google-Only Accounts", () => {
    it("returns clean error message when attempting password login on Google-registered user", async () => {
      const googleOnlyUser = {
        _id: "google_only_123",
        email: "googleuser@example.com",
        googleId: "sub_123",
        password: null, // No password set
      };

      User.findOne = async () => googleOnlyUser;

      const mockReq = {
        body: { email: "googleuser@example.com", password: "AnyPassword123" },
      };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const loginRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/login"
      );
      const handler = loginRoute.route.stack[loginRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      assert.equal(statusSent, 400);
      assert.match(jsonSent.message, /registered with Google/i);
    });
  });

  describe("Administrative Privilege Isolation & Protected Routes", () => {
    it("never grants administrator privileges through Google sign-in", async () => {
      User.findOne = async () => null;
      User.create = async (data) => ({
        _id: "google_user_no_admin",
        name: data.name,
        email: data.email,
        googleId: data.googleId,
      });

      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async () => ({
          getPayload: () => ({
            sub: "sub_privilege_check",
            email: "regular@user.com",
            email_verified: true,
            name: "Regular User",
          }),
        }),
      });

      const mockReq = { body: { credential: "token" } };
      let statusSent = null;
      let jsonSent = null;
      const mockRes = {
        status: (s) => {
          statusSent = s;
          return { json: (j) => { jsonSent = j; } };
        },
      };

      const googleRoute = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google"
      );
      const handler = googleRoute.route.stack[googleRoute.route.stack.length - 1].handle;
      await handler(mockReq, mockRes);

      const userToken = jsonSent.token;

      // 1. Check token does not have admin claim
      const decoded = jwt.decode(userToken);
      assert.equal(decoded.admin, undefined);

      // 2. Check verifyAdmin middleware REJECTS this token
      const adminReq = { headers: { authorization: `Bearer ${userToken}` } };
      let adminStatus = null;
      let adminJson = null;
      let nextCalled = false;
      const adminRes = {
        status: (s) => {
          adminStatus = s;
          return { json: (j) => { adminJson = j; } };
        },
      };

      verifyAdmin(adminReq, adminRes, () => { nextCalled = true; });

      assert.equal(nextCalled, false, "Google user token must NEVER pass verifyAdmin");
      assert.ok(adminStatus === 401 || adminStatus === 403);
    });

    it("allows Google user token to access user-protected routes via authMiddleware", () => {
      const googleUserToken = jwt.sign(
        { id: "google_user_789" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userReq = { headers: { authorization: `Bearer ${googleUserToken}` } };
      const userRes = { status: () => userRes, json: () => {} };
      let nextCalled = false;

      authMiddleware(userReq, userRes, () => { nextCalled = true; });

      assert.equal(nextCalled, true, "authMiddleware must accept valid user token");
      assert.equal(userReq.userId, "google_user_789");
    });
  });

  describe("Client ID Configuration & Environment Resolution", () => {
    it("falls back to VITE_GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID is not set", async () => {
      const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
      const originalViteClientId = process.env.VITE_GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;
      process.env.VITE_GOOGLE_CLIENT_ID = "fallback-client-id.apps.googleusercontent.com";

      let capturedAudience = null;
      authRoutes._setGoogleClientForTesting({
        verifyIdToken: async ({ audience }) => {
          capturedAudience = audience;
          return {
            getPayload: () => ({ sub: "123", email: "test@example.com", email_verified: true }),
          };
        },
      });

      const payload = await authRoutes._verifyGoogleIdToken("some-id-token");
      assert.equal(payload.sub, "123");
      assert.equal(capturedAudience, "fallback-client-id.apps.googleusercontent.com");

      // Restore
      if (originalGoogleClientId) process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
      else delete process.env.GOOGLE_CLIENT_ID;
      if (originalViteClientId) process.env.VITE_GOOGLE_CLIENT_ID = originalViteClientId;
      else delete process.env.VITE_GOOGLE_CLIENT_ID;
    });

    it("throws NOT_CONFIGURED when neither GOOGLE_CLIENT_ID nor VITE_GOOGLE_CLIENT_ID is set", async () => {
      const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
      const originalViteClientId = process.env.VITE_GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.VITE_GOOGLE_CLIENT_ID;
      authRoutes._setGoogleClientForTesting(null);

      await assert.rejects(
        async () => {
          await authRoutes._verifyGoogleIdToken("some-id-token");
        },
        (err) => err.code === "NOT_CONFIGURED"
      );

      // Restore
      if (originalGoogleClientId) process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
      if (originalViteClientId) process.env.VITE_GOOGLE_CLIENT_ID = originalViteClientId;
    });
  });
});

