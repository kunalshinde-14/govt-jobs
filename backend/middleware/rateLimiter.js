const rateLimit = require("express-rate-limit");

// ─────────────────────────────────────────────
// AUTH LIMITER
// Applied to: POST /api/auth/login
//             POST /api/auth/signup
// 20 requests per 15 minutes per IP.
// Generous enough for real users; blocks bots.
// ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    message: "Too many requests, please try again later.",
  },
  skipSuccessfulRequests: false,
});


// ─────────────────────────────────────────────
// ADMIN LOGIN LIMITER
// Applied to: POST /api/admin/login only
// 5 attempts per 15 minutes per IP.
// Admin password is a single shared secret —
// this is the primary brute-force defence.
// ─────────────────────────────────────────────
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many admin login attempts, please try again later.",
  },
  skipSuccessfulRequests: false,
});


module.exports = { authLimiter, adminLoginLimiter };
