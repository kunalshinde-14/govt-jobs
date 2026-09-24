const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

// ─────────────────────────────────────────────
// STARTUP GUARD — fail fast if required env
// vars are missing rather than running broken.
// ─────────────────────────────────────────────
const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_SECRET",
  "ADMIN_JWT_SECRET",
  "ADMIN_PASSWORD",
  "CRON_SECRET",
];

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnv.join(", ")
  );
  process.exit(1);
}

// ─────────────────────────────────────────────
// DNS — helps with Atlas resolution on Render
// ─────────────────────────────────────────────
dns.setServers(["1.1.1.1", "8.8.8.8"]);


const app = express();


// ─────────────────────────────────────────────
// SECURITY HEADERS — helmet sets safe defaults:
// X-Frame-Options, X-Content-Type-Options,
// Strict-Transport-Security, and more.
// Must be first middleware.
// ─────────────────────────────────────────────
app.use(helmet());


// ─────────────────────────────────────────────
// CORS
// localhost:5173 is only included in development
// to avoid exposing it in production.
// ─────────────────────────────────────────────
const allowedOrigins = [
  "https://jansetu.in",
  "https://www.jansetu.in",
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(express.json());


// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
const userRoutes  = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jobRoutes   = require("./routes/jobRoutes");
const authRoutes  = require("./routes/authRoutes");
const cronRoutes  = require("./routes/cronRoutes");


// ─────────────────────────────────────────────
// CRON
// ─────────────────────────────────────────────
const startDeleteExpiredJobs = require("./cron/deleteExpiredJobs");


// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────
app.use("/api/jobs",  jobRoutes);
app.use("/api/jobs",  cronRoutes);
app.use("/api/auth",  authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);


// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});


// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// Catches any unhandled errors thrown by routes.
// Never leaks stack traces or error.message to
// the client in production.
// ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});


// ─────────────────────────────────────────────
// MONGODB CONNECTION
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB Connected");

    // Start nightly expired-job cleanup
    startDeleteExpiredJobs();

  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });


// ─────────────────────────────────────────────
// SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
