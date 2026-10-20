const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // 🔥 SAVED JOBS
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    // 🎯 USER OPPORTUNITY PREFERENCES
    preferences: {
      qualification: {
        type: [String],
        default: [],
        validate: {
          validator: function (v) {
            if (!Array.isArray(v)) return false;
            const allowed = ["10th", "12th", "Graduate"];
            return v.every((q) => allowed.includes(q));
          },
          message: "Qualifications must only include 10th, 12th, or Graduate",
        },
      },
      sectors: {
        type: [String],
        default: [],
      },
      states: {
        type: [String],
        default: [],
      },
      notifications: {
        frequency: {
          type: String,
          enum: ["daily", "weekly", "none"],
          default: "daily",
        },
        emailAlerts: {
          type: Boolean,
          default: false,
        },
      },
    },

    // 🕒 VISIT & ACTIVITY TRACKING
    lastVisitedAt: {
      type: Date,
      default: Date.now,
    },
    previousVisitedAt: {
      type: Date,
      default: null,
    },

    // 👁️ SEEN OPPORTUNITIES TRACKING
    seenJobs: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
          required: true,
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 📋 APPLICATION TRACKER
    applications: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
          required: true,
        },
        status: {
          type: String,
          enum: ["Interested", "Preparing", "Applied", "Exam/Result"],
          default: "Interested",
        },
        notes: {
          type: String,
          default: "",
          maxlength: 500,
          trim: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
userSchema.index({ "seenJobs.jobId": 1 });
userSchema.index({ "applications.jobId": 1 });

module.exports = mongoose.model("User", userSchema);
