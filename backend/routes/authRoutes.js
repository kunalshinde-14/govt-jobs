const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

const User = require("../models/User");
const { authLimiter } = require("../middleware/rateLimiter");

// Injectable Google client for automated testing
let customGoogleClient = null;

function setGoogleClientForTesting(client) {
  customGoogleClient = client;
}

/**
 * Verifies a Google ID token with Google's public keys.
 * Never trust payload sent directly by the client without cryptographic verification.
 *
 * @param {string} idToken
 * @returns {Promise<object>} verified payload
 */
async function verifyGoogleIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId && !customGoogleClient) {
    const error = new Error("GOOGLE_CLIENT_ID is not configured");
    error.code = "NOT_CONFIGURED";
    throw error;
  }

  const client = customGoogleClient || new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  return ticket.getPayload();
}

// 🔥 SIGNUP
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔥 LOGIN
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account was registered with Google. Please sign in with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔥 GOOGLE SIGN-IN
router.post("/google", authLimiter, async (req, res) => {
  try {
    const credential = req.body?.credential || req.body?.token || req.body?.idToken;

    if (!credential || typeof credential !== "string") {
      return res.status(400).json({ message: "Google ID credential is required" });
    }

    let payload;
    try {
      payload = await verifyGoogleIdToken(credential);
    } catch (verifyError) {
      if (verifyError.code === "NOT_CONFIGURED") {
        console.error("Google authentication configuration missing (GOOGLE_CLIENT_ID)");
        return res.status(500).json({
          message: "Google authentication is not configured on the server",
        });
      }
      // Never log raw tokens or secrets
      console.error("Google verification error:", verifyError.message);
      return res.status(401).json({
        message: "Invalid or expired Google credential",
      });
    }

    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    if (!payload.email_verified) {
      return res.status(400).json({ message: "Google email is not verified" });
    }

    const googleId = String(payload.sub);
    const normalizedEmail = String(payload.email).toLowerCase().trim();
    const name = typeof payload.name === "string" && payload.name.trim()
      ? payload.name.trim()
      : normalizedEmail.split("@")[0];

    // 1. Primary lookup by stable Google account identifier (`sub`)
    let user = await User.findOne({ googleId });

    if (user) {
      // Existing Google user found
      if (!user.name && name) {
        user.name = name;
        await user.save();
      }
    } else {
      // 2. Secondary check by verified email to handle existing accounts
      const existingUserByEmail = await User.findOne({ email: normalizedEmail });

      if (existingUserByEmail) {
        // Prevent unsafe account linking if already linked to a different Google account
        if (existingUserByEmail.googleId && existingUserByEmail.googleId !== googleId) {
          return res.status(409).json({
            message: "This email is already associated with another Google account",
          });
        }

        // Safely link Google ID to existing verified account
        existingUserByEmail.googleId = googleId;
        if (!existingUserByEmail.name && name) {
          existingUserByEmail.name = name;
        }
        await existingUserByEmail.save();
        user = existingUserByEmail;
      } else {
        // 3. New user registration via Google
        user = await User.create({
          name,
          email: normalizedEmail,
          googleId,
        });
      }
    }

    // Standard user JWT issuance (never grant admin permissions via Google login)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Google auth route error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Export helper for testing
router._setGoogleClientForTesting = setGoogleClientForTesting;
router._verifyGoogleIdToken = verifyGoogleIdToken;

module.exports = router;
