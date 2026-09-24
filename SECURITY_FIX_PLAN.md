# SECURITY FIX PLAN — JANSETU.IN
**Date:** September 24, 2026  
**Repo:** https://github.com/kunalshinde-14/govt-jobs (PUBLIC)  
**Status:** Pre-implementation — approved fixes only

---

## ⚠️ IMMEDIATE ALERT — SECRETS ALREADY PUBLICLY EXPOSED

`backend/.env` has been committed to a **public GitHub repository** and remains in Git history across two commits:

| Commit | Keys Exposed |
|---|---|
| `5cb61a7` | `MONGO_URI` |
| `da76ee9` | `MONGO_URI`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET` |

**These secrets must be rotated immediately**, regardless of any code changes made here. Removing the file from Git tracking does not purge it from history — anyone who has already cloned or starred the repo has had access to these values.

**Rotation checklist (manual, required before deployment):**
- [ ] Rotate MongoDB Atlas password and update connection string → new `MONGO_URI`
- [ ] Generate a new `ADMIN_JWT_SECRET` (minimum 32 random characters)
- [ ] Change `ADMIN_PASSWORD` to a new strong password
- [ ] Generate a new `JWT_SECRET` (minimum 32 random characters) — this key is currently **missing** from `.env` entirely (see SEC-6 below)
- [ ] Update all four values in the Render environment variable dashboard
- [ ] Do NOT commit the new `.env` after fixing gitignore

---

## CONFIRMED VULNERABILITIES

### SEC-1 — `backend/.env` Tracked by Git and Pushed to Public Repo
| | |
|---|---|
| **Severity** | 🔴 Critical |
| **Files affected** | `.gitignore`, `backend/.env` |
| **Evidence** | `git ls-files backend/.env` exits 0. `git log -- backend/.env` shows commits `5cb61a7`, `da76ee9`. Remote is `https://github.com/kunalshinde-14/govt-jobs` (public). |
| **Risk** | Full database access (`MONGO_URI`), admin panel takeover (`ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`), user JWT forgery (`JWT_SECRET` — currently undefined, see SEC-6). |
| **Proposed fix** | 1. Add `backend/.env` and `**/.env` patterns to `.gitignore`. 2. Run `git rm --cached backend/.env` to untrack without deleting the file. 3. Commit the removal. 4. Rotate all secrets (manual step — cannot be automated). |
| **Breaking changes** | None to application logic. Render env vars must be re-confirmed after rotation. |
| **Deployment changes** | Rotate all secrets in Render dashboard after gitignore fix. |

---

### SEC-2 — `JWT_SECRET` Missing from `.env`
| | |
|---|---|
| **Severity** | 🔴 Critical |
| **Files affected** | `backend/.env`, `backend/routes/authRoutes.js`, `backend/middleware/authMiddleware.js` |
| **Evidence** | Current `backend/.env` contains only `MONGO_URI`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`. `authRoutes.js` calls `jwt.sign({ id: user._id }, process.env.JWT_SECRET, ...)` — `process.env.JWT_SECRET` resolves to `undefined`. In JWT libraries, signing with `undefined` either throws or produces a token signed with a literal `undefined` string, meaning any attacker who knows this can forge user tokens. |
| **Risk** | All user JWTs are cryptographically worthless. User sessions and saved-jobs access are fully forgeable. |
| **Proposed fix** | Add `JWT_SECRET=<strong-random-value>` to `backend/.env` and to the Render environment dashboard. No code changes required — `authRoutes.js` and `authMiddleware.js` already reference this key correctly. |
| **Breaking changes** | Adding a real `JWT_SECRET` will invalidate all currently issued user tokens. All logged-in users will be signed out once. |
| **Deployment changes** | Add `JWT_SECRET` to Render environment variables. |

---

### SEC-3 — Unauthenticated Mass-Deletion Endpoint
| | |
|---|---|
| **Severity** | 🔴 Critical |
| **Files affected** | `backend/routes/cronRoutes.js`, `backend/server.js` |
| **Evidence** | `GET /api/jobs/expired` calls `Job.deleteMany(...)` with no middleware. Route is mounted at `/api/jobs/expired` with no auth guard. |
| **Risk** | Any anonymous HTTP client can delete all jobs with a past `lastDate`. A malformed date in any record could cause unintended deletions. |
| **Proposed fix** | Protect the route with a `CRON_SECRET` environment variable checked against a request header (`x-cron-secret`). This is the standard pattern for external cron triggers (e.g. Vercel cron, UptimeRobot, cron-job.org). The existing node-cron in `deleteExpiredJobs.js` does not use this HTTP route, so it is unaffected. If this HTTP endpoint is not used by any external service, it can be removed entirely — but we will protect it rather than delete it to preserve optionality. |
| **Breaking changes** | Any external service currently calling this endpoint without the secret header will stop working. |
| **Deployment changes** | Add `CRON_SECRET` to Render environment variables. |

---

### SEC-4 — No Rate Limiting on Authentication Endpoints
| | |
|---|---|
| **Severity** | 🔴 Critical |
| **Files affected** | `backend/routes/authRoutes.js`, `backend/routes/adminRoutes.js`, `backend/server.js`, `backend/package.json` |
| **Evidence** | No rate limiting middleware present anywhere in the codebase. Admin login uses a single shared password with no lockout. |
| **Risk** | Brute-force attack on `POST /api/auth/login`, spam account creation via `POST /api/auth/signup`, and brute-force on `POST /api/admin/login` (which grants full write access to all job listings). |
| **Proposed fix** | Install `express-rate-limit` and apply: (a) a general auth limiter to `/api/auth/*` — 20 requests per 15 minutes per IP; (b) a strict admin limiter to `/api/admin/login` — 5 requests per 15 minutes per IP. |
| **Breaking changes** | None for normal users. Automated scripts hitting these endpoints repeatedly will be blocked with HTTP 429. |
| **Deployment changes** | None — package install only. |

---

### SEC-5 — Duplicate Admin Middleware Applied Twice Per Request
| | |
|---|---|
| **Severity** | 🟠 High |
| **Files affected** | `backend/middleware/adminMiddleware.js`, `backend/middleware/verifyAdmin.js`, `backend/routes/jobRoutes.js` |
| **Evidence** | Both files contain identical logic: extract `Authorization` header, verify with `ADMIN_JWT_SECRET`, check `decoded.admin === true`. In `jobRoutes.js` both are applied to every admin route: `router.post("/", verifyAdmin, adminMiddleware, ...)`. JWT is decoded twice per request. |
| **Risk** | Not a security vulnerability per se, but creates confusion about which middleware is authoritative, making future changes error-prone. If one is updated and the other is not, behaviour will diverge silently. |
| **Proposed fix** | Keep `verifyAdmin.js` (better name, already used first in the chain). Delete `adminMiddleware.js`. Update `jobRoutes.js` to remove the `adminMiddleware` import and second middleware reference. |
| **Breaking changes** | None — same JWT logic, same outcome. |
| **Deployment changes** | None. |

---

### SEC-6 — No Security Headers (Missing Helmet)
| | |
|---|---|
| **Severity** | 🟠 High |
| **Files affected** | `backend/server.js`, `backend/package.json` |
| **Evidence** | No `helmet` middleware present. Express by default exposes `X-Powered-By: Express` and omits `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, etc. |
| **Risk** | Clickjacking, MIME-sniffing, missing HSTS, fingerprinting. |
| **Proposed fix** | Install `helmet` and add `app.use(helmet())` before all routes in `server.js`. |
| **Breaking changes** | None — Render serves over HTTPS. Helmet defaults are safe for an API backend. |
| **Deployment changes** | None. |

---

### SEC-7 — Stack Traces Leaked in Error Responses
| | |
|---|---|
| **Severity** | 🟠 High |
| **Files affected** | `backend/routes/authRoutes.js`, `backend/routes/jobRoutes.js`, `backend/routes/userRoutes.js`, `backend/routes/adminRoutes.js` |
| **Evidence** | Every catch block returns `res.status(500).json({ message: error.message })`. In Node.js, `error.message` on a Mongoose or JWT error can include connection strings, field names, schema details, and internal paths. |
| **Risk** | Information disclosure. Mongoose errors in particular can expose the `MONGO_URI` host, collection names, and document field names. |
| **Proposed fix** | Replace `error.message` with a generic message in all 500 responses. Log the real error server-side with `console.error`. Keep specific user-facing messages (e.g. "Invalid credentials", "User already exists") which are intentional. |
| **Breaking changes** | None to functionality. Frontend already handles error messages. |
| **Deployment changes** | None. |

---

### SEC-8 — CORS Allows `localhost:5173` in Production
| | |
|---|---|
| **Severity** | 🟡 Medium |
| **Files affected** | `backend/server.js` |
| **Evidence** | CORS origin list: `["https://jansetu.in", "https://www.jansetu.in", "http://localhost:5173"]`. The `localhost` origin should not be present in a production server. |
| **Risk** | Any local development server on port 5173 can make credentialed requests to the production API. In practice risk is low (CORS is browser-enforced only), but it is unnecessary exposure. |
| **Proposed fix** | Move `localhost:5173` behind an environment variable check: only include it when `NODE_ENV !== "production"`. This preserves local development without exposing it in production. |
| **Breaking changes** | None in production. Local dev unaffected since Render is not used locally. |
| **Deployment changes** | Set `NODE_ENV=production` in Render environment variables (it likely already is, but confirm). |

---

## SUMMARY TABLE

| ID | Issue | Severity | Fix Type | Breaking? |
|---|---|---|---|---|
| SEC-1 | `.env` committed to public repo | 🔴 Critical | gitignore + `git rm --cached` + **rotate secrets** | No (code); Yes (tokens invalidated after rotation) |
| SEC-2 | `JWT_SECRET` missing from `.env` | 🔴 Critical | Add env var | Yes — all user sessions invalidated once |
| SEC-3 | Unauthenticated deletion endpoint | 🔴 Critical | Add `CRON_SECRET` header check | Only breaks uncredentialed callers |
| SEC-4 | No rate limiting on auth routes | 🔴 Critical | Install + configure `express-rate-limit` | No |
| SEC-5 | Duplicate admin middleware | 🟠 High | Remove `adminMiddleware.js`, fix imports | No |
| SEC-6 | No security headers | 🟠 High | Install + apply `helmet` | No |
| SEC-7 | Stack traces in 500 responses | 🟠 High | Generic error messages + server-side logging | No |
| SEC-8 | `localhost` in production CORS | 🟡 Medium | Env-gated CORS origin | No |

---

## FILES THAT WILL BE CHANGED

| File | Change |
|---|---|
| `.gitignore` | Add `backend/.env`, `**/.env`, `**/.env.*`, `**/.env.local` |
| `backend/.env` | Untracked via `git rm --cached` (not deleted); `JWT_SECRET` added |
| `backend/package.json` | Add `express-rate-limit`, `helmet` as dependencies |
| `backend/server.js` | Add `helmet()`, rate limiter import, NODE_ENV-gated CORS |
| `backend/routes/authRoutes.js` | Apply auth rate limiter; generic 500 messages |
| `backend/routes/adminRoutes.js` | Apply strict admin rate limiter; generic 500 message |
| `backend/routes/jobRoutes.js` | Remove `adminMiddleware` import and second middleware arg; generic 500 messages |
| `backend/routes/userRoutes.js` | Generic 500 messages |
| `backend/routes/cronRoutes.js` | Add `CRON_SECRET` header verification |
| `backend/middleware/adminMiddleware.js` | **Deleted** (duplicate of `verifyAdmin.js`) |

---

## ENVIRONMENT VARIABLES REQUIRED AFTER FIXES

All must be set in the **Render dashboard** (not in `.env` committed to Git):

| Variable | Action | Notes |
|---|---|---|
| `MONGO_URI` | **ROTATE** | Exposed in commit `5cb61a7`. Change Atlas password. |
| `ADMIN_PASSWORD` | **ROTATE** | Exposed in commit `da76ee9`. |
| `ADMIN_JWT_SECRET` | **ROTATE** | Exposed in commit `da76ee9`. Use 32+ random chars. |
| `JWT_SECRET` | **ADD (NEW)** | Currently missing. Use 32+ random chars. All user sessions will reset once. |
| `CRON_SECRET` | **ADD (NEW)** | Any strong random string. Used to protect `/api/jobs/expired`. |
| `NODE_ENV` | **CONFIRM** | Should be `production` on Render. |

---

*Plan complete. No files have been modified yet. Awaiting implementation.*
