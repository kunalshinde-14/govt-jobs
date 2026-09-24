# PROJECT AUDIT — JANSETU.IN
**Date:** September 24, 2026  
**Auditor:** Senior Software Architect  
**Codebase:** `govt-jobs` workspace  
**Live Domain:** https://jansetu.in

---

## 1. EXECUTIVE SUMMARY

JanSetu is a government job discovery platform for Indian users. It aggregates active government job listings, allows users to save jobs, and provides an admin interface for managing listings. The application is a full-stack JavaScript project: a React/Vite SPA on the frontend deployed to Vercel, and an Express/MongoDB API on the backend deployed to Render.

The product is functional and live. The core user journeys — browsing jobs, filtering, saving, applying — work end to end. However, the codebase has several security vulnerabilities that should be addressed before any further growth, along with a number of maintainability and UX issues that will slow down future development.

**Overall assessment:** Solid foundation. Needs security hardening and structural cleanup before scaling.

---

## 2. CURRENT ARCHITECTURE

### 2.1 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 19.2.5 |
| Frontend build | Vite | 8.0.10 |
| Styling | Tailwind CSS | 3.4.13 |
| Routing (client) | React Router DOM | 7.14.2 |
| HTTP client | Axios | 1.16.0 |
| Icons | Lucide React | 1.14.0 |
| Backend framework | Express | 5.2.1 |
| Database ODM | Mongoose | 9.6.1 |
| Authentication | JSON Web Token | 9.0.3 |
| Password hashing | bcryptjs | 3.0.3 |
| Cron scheduling | node-cron | 4.2.1 |
| Backend runtime | Node.js | (unspecified, latest LTS assumed) |
| Frontend deploy | Vercel | — |
| Backend deploy | Render | — |
| Database | MongoDB Atlas | — |

### 2.2 Repository Structure

```
govt-jobs/
├── backend/
│   ├── cron/
│   │   └── deleteExpiredJobs.js       # Daily cron at midnight
│   ├── middleware/
│   │   ├── adminMiddleware.js         # JWT admin verify (duplicate of verifyAdmin)
│   │   ├── authMiddleware.js          # JWT user verify
│   │   └── verifyAdmin.js             # JWT admin verify (duplicate of adminMiddleware)
│   ├── models/
│   │   ├── Job.js                     # Job schema
│   │   └── User.js                    # User schema
│   ├── routes/
│   │   ├── adminRoutes.js             # POST /api/admin/login
│   │   ├── authRoutes.js              # POST /api/auth/signup, /login
│   │   ├── cronRoutes.js              # GET /api/jobs/expired (unauthenticated!)
│   │   ├── jobRoutes.js               # CRUD /api/jobs
│   │   └── userRoutes.js              # Saved jobs CRUD
│   ├── .env                           # Secrets (not in .gitignore)
│   ├── package.json
│   ├── seed.js                        # Seed script with 100+ jobs
│   └── server.js                      # Entry point
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── logo.png
│   ├── robots.txt
│   └── sitemap.xml                    # Static, only lists homepage
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AdminProtectedRoute.jsx
│   │   ├── Categories.jsx
│   │   ├── ClosingSoon.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── JobCard.jsx
│   │   ├── JobDetail.jsx              # DEAD CODE — never used
│   │   ├── LatestJobs.jsx
│   │   ├── LoginModal.jsx
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminPage.jsx
│   │   ├── CategoryPage.jsx
│   │   ├── JobPage.jsx
│   │   ├── SavedJobs.jsx
│   │   └── StatePage.jsx
│   ├── utils/
│   │   └── api.js                     # BASE_URL constant
│   ├── App.jsx                        # Root component, state hub
│   ├── App.css                        # (empty or unused)
│   ├── index.css                      # Tailwind directives + shimmer animation
│   └── main.jsx                       # React entry point
├── .gitignore                         # Does NOT ignore backend/.env
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json                        # SPA rewrite rule
└── vite.config.js
```

### 2.3 Data Flow

```
Browser
  └── React SPA (Vercel)
        ├── GET /api/jobs          → Render backend → MongoDB Atlas
        ├── POST /api/auth/*       → JWT issued, stored in localStorage
        ├── GET/POST/DELETE        → /api/users/save-job/:id (auth required)
        └── POST/PUT/DELETE        → /api/jobs (admin JWT required)

Render backend
  └── node-cron (midnight)
        └── Job.deleteMany({ lastDate < today })
```

### 2.4 Authentication Model

- **User auth:** JWT signed with `JWT_SECRET`, `{ id: userId }` payload, 7-day expiry. Token stored in `localStorage`.
- **Admin auth:** Separate JWT signed with `ADMIN_JWT_SECRET`, `{ admin: true }` payload, 7-day expiry. Token stored in `localStorage` under `adminToken`.
- **Admin password:** Single shared plaintext password from `ADMIN_PASSWORD` env var. No admin user record in DB.

---

## 3. COMPLETE FEATURE INVENTORY

| # | Feature | Location | Status | Issues | Recommendation |
|---|---|---|---|---|---|
| 1 | Homepage | `App.jsx`, `Hero.jsx` | ✅ Working | State prop-drilled 4 levels deep | Consider Context or Zustand |
| 2 | Job search | `Hero.jsx`, `LatestJobs.jsx` | ✅ Working | Search state lives in App, passed down; no debounce | Add debounce (300ms) |
| 3 | Search autocomplete | `Hero.jsx` | ✅ Working | No keyboard navigation (a11y) | Add arrow-key navigation |
| 4 | Qualification filter | `Hero.jsx`, `LatestJobs.jsx` | ✅ Working | Filter only supports 10th/12th/Graduate — seed has "B.Tech", "PhD", "MBBS", etc. | Expand filter options |
| 5 | State quick links | `Hero.jsx` | ⚠️ Partial | Hard-coded to 4 states only (MH, Bihar, Rajasthan, UP) | Make dynamic from job data |
| 6 | Closing Soon section | `ClosingSoon.jsx` | ✅ Working | Shows top 6 soonest jobs regardless of whether they've already passed | Filter out past-deadline jobs |
| 7 | Latest Jobs grid | `LatestJobs.jsx` | ✅ Working | No pagination — renders all jobs at once | Add pagination or infinite scroll |
| 8 | Job card | `JobCard.jsx` | ✅ Working | Optimistic save/unsave works well | Minor a11y: button has no aria-label |
| 9 | Job detail page | `JobPage.jsx` | ✅ Working | Title set via `document.title` (not `<Helmet>`), no OG tags | Use react-helmet for proper SEO |
| 10 | Apply link | `JobCard.jsx`, `JobPage.jsx` | ✅ Working | Opens in new tab with `noopener noreferrer` | Good |
| 11 | Categories section | `Categories.jsx` | ⚠️ Partial | Hard-coded list of 8 categories; PSU/Teaching/State Govt/etc. in data don't appear | Make dynamic or expand list |
| 12 | Category page | `CategoryPage.jsx` | ✅ Working | Uses `.includes()` match — "SSC" would match "MPSC" | Use exact match |
| 13 | State page | `StatePage.jsx` | ✅ Working | Includes "All India" jobs on every state page (by design, reasonable) | Consider making this optional |
| 14 | User signup/login | `LoginModal.jsx`, `authRoutes.js` | ✅ Working | No email verification, no password strength enforcement, no rate limiting | Add rate limiting and min password length |
| 15 | Saved jobs (save) | `JobCard.jsx`, `userRoutes.js` | ✅ Working | Optimistic update + rollback on API failure is well implemented | — |
| 16 | Saved jobs (page) | `SavedJobs.jsx` | ✅ Working | Filters from all-jobs array client-side; if job is expired/deleted, it disappears silently | Acceptable behaviour |
| 17 | Navbar | `Navbar.jsx` | ✅ Working | No mobile hamburger menu; on small screens, user name is hidden (`hidden md:block`) | Add mobile menu |
| 18 | Footer | `Footer.jsx` | ⚠️ Wrong branding | Footer still reads "© 2026 GovtJobs" not "JanSetu" | Fix branding |
| 19 | Admin login | `AdminLogin.jsx`, `adminRoutes.js` | ✅ Working | Single shared password, no brute-force protection | Add rate limiting |
| 20 | Admin protected route | `AdminProtectedRoute.jsx` | ✅ Working | Client-side JWT decode without library (manual `atob`) — acceptable for route guard, server still validates | — |
| 21 | Admin job CRUD | `AdminPage.jsx`, `jobRoutes.js` | ✅ Working | No server-side field validation (any string accepted for all fields) | Add Joi/Zod validation |
| 22 | Expired job deletion (cron) | `deleteExpiredJobs.js` | ✅ Working | Runs at midnight server time — Render server timezone may differ from IST | Pin timezone or use UTC logic explicitly |
| 23 | Expired job deletion (HTTP) | `cronRoutes.js` | 🔴 Security issue | `GET /api/jobs/expired` deletes all expired jobs with NO authentication | Add admin auth middleware |
| 24 | Loading skeletons | `ClosingSoon.jsx`, `LatestJobs.jsx`, `Categories.jsx` | ✅ Working | Shimmer animation is clean | — |
| 25 | Responsive design | All components | ⚠️ Partial | Grid layouts work; Navbar collapses user name on mobile but no hamburger | Navbar needs mobile work |
| 26 | SEO — static | `index.html`, `robots.txt`, `sitemap.xml` | ⚠️ Partial | Meta description present; sitemap only lists homepage; no dynamic OG/Twitter tags | Generate dynamic sitemap; add Helmet |
| 27 | `JobDetail.jsx` component | `src/components/JobDetail.jsx` | 🔴 Dead code | Component exists and is not imported or used anywhere | Remove or repurpose |
| 28 | Seed script | `backend/seed.js` | ⚠️ Dev artifact | Committed to repo, contains 100+ hardcoded jobs; fine for setup but exposes data design | Move to `/scripts`, add to .gitignore or document clearly |

---

## 4. DATABASE OVERVIEW

### 4.1 Collections

#### `jobs` — Job model (`backend/models/Job.js`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | String | ✅ | Job title |
| `department` | String | ✅ | e.g. "SSC", "Banking", "Railway" |
| `qualification` | String | ✅ | e.g. "10th", "Graduate", "B.Tech", "PhD" |
| `state` | String | ✅ | e.g. "Maharashtra", "All India" |
| `salary` | String | ✅ | Free-form string (e.g. "₹47,600 - ₹1,51,100") |
| `vacancies` | Number | ✅ | Number of seats |
| `lastDate` | String | ✅ | ISO date string "YYYY-MM-DD" (stored as String, not Date) |
| `applyLink` | String | ✅ | Official application URL |
| `createdAt` | Date | auto | From `timestamps: true` |
| `updatedAt` | Date | auto | From `timestamps: true` |

**Notable issue:** `lastDate` is stored as a `String` type, not a `Date`. The cron job compares it against `today.toISOString().split("T")[0]` — this works because ISO date strings sort lexicographically, but it's fragile. A non-ISO value entered by admin would break deletion silently.

#### `users` — User model (`backend/models/User.js`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | ✅ | Display name |
| `email` | String | ✅ unique | Login identifier |
| `password` | String | ✅ | bcrypt hash (cost factor 10) |
| `savedJobs` | [ObjectId] | — | References to `Job` documents |

### 4.2 Indexes

Only the implicit `_id` index and the `email` unique index (from `unique: true` in schema) exist. No additional indexes are defined.

**Recommended indexes:**
- `jobs.department` — for category page queries (currently done client-side but backend filtering may be added)
- `jobs.lastDate` — for cron deletion query
- `jobs.state` — for state page queries
- `jobs.createdAt` — for latest jobs ordering

### 4.3 Expiry Logic

The cron job runs nightly and deletes any job where `lastDate < today` (string comparison, YYYY-MM-DD format). This is correct for well-formed data but has no fallback for malformed dates.

---

## 5. CRITICAL ISSUES

### 🔴 CRITICAL-1 — Unauthenticated Mass Deletion Endpoint

**File:** `backend/routes/cronRoutes.js`  
**Route:** `GET /api/jobs/expired`

This endpoint deletes all jobs with a past `lastDate` with no authentication whatsoever. Any user — or any bot — can call this URL and wipe all expired listings. While expired jobs are "done", an attacker could also abuse the query to confirm site behaviour. More critically, if the `lastDate` data is ever malformed, this could delete active listings.

```js
// Anyone can call this:
router.get("/expired", async (req, res) => {
  const result = await Job.deleteMany({ lastDate: { $lt: today } });
  res.json({ success: true, deleted: result.deletedCount });
});
```

**Fix:** Add `verifyAdmin` middleware to this route, or remove the HTTP endpoint entirely since a cron job already handles deletion.

---

### 🔴 CRITICAL-2 — `backend/.env` Not in `.gitignore`

**File:** `.gitignore` (root level)

The root `.gitignore` lists `node_modules`, `dist`, etc., but does **not** include `backend/.env`. The `backend/.env` file contains `MONGO_URI`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, and `ADMIN_PASSWORD`.

If this repo is ever pushed to a public GitHub repository, all production secrets are exposed.

```
# Current .gitignore does NOT include:
backend/.env
```

**Fix:** Add `backend/.env` and `**/.env` to `.gitignore` immediately.

---

### 🔴 CRITICAL-3 — No Rate Limiting on Auth or Admin Endpoints

**Files:** `backend/routes/authRoutes.js`, `backend/routes/adminRoutes.js`

There is no rate limiting on:
- `POST /api/auth/login` — brute-forceable user passwords
- `POST /api/auth/signup` — spam account creation
- `POST /api/admin/login` — brute-forceable single admin password

Since the admin uses a single shared password (no account lockout, no MFA), a brute-force attack against `/api/admin/login` could gain full write access to all job listings.

**Fix:** Add `express-rate-limit` to auth routes and especially the admin login endpoint.

---

## 6. SECURITY ASSESSMENT

| # | Issue | Severity | Details |
|---|---|---|---|
| S-1 | Unauthenticated deletion endpoint | 🔴 Critical | `GET /api/jobs/expired` — see CRITICAL-1 |
| S-2 | `.env` not gitignored | 🔴 Critical | Secrets at risk if repo goes public — see CRITICAL-2 |
| S-3 | No rate limiting | 🔴 Critical | Auth and admin routes wide open to brute force — see CRITICAL-3 |
| S-4 | Single shared admin password | 🟠 High | No per-user admin accounts, no audit trail, no lockout |
| S-5 | JWT in `localStorage` | 🟠 High | Vulnerable to XSS. `httpOnly` cookies are safer, but this is a common React pattern with acceptable risk if CSP is configured |
| S-6 | No input validation on job fields | 🟠 High | Admin can submit any string for `department`, `qualification`, `state`; no URL validation on `applyLink` beyond HTML `type="url"` |
| S-7 | No CSRF protection | 🟡 Medium | Backend is API-only with JWT, so CSRF risk is lower, but still worth noting |
| S-8 | No Helmet.js on Express | 🟡 Medium | Missing security headers (X-Frame-Options, HSTS, CSP, etc.) |
| S-9 | `applyLink` not validated server-side | 🟡 Medium | An admin could enter a non-government URL; no allowlist or domain validation |
| S-10 | No email verification for users | 🟢 Low | Users can sign up with fake emails; low risk given current feature set |
| S-11 | Password minimum length not enforced | 🟢 Low | No minimum password length on signup |

---

## 7. FULL PROBLEM INVENTORY

### Bugs

| # | Severity | File | Description |
|---|---|---|---|
| B-1 | 🟠 High | `ClosingSoon.jsx` | Shows jobs sorted by soonest deadline but does **not** filter out already-expired jobs. If the cron hasn't run yet today, jobs past their deadline appear in "Closing Soon". |
| B-2 | 🟡 Medium | `CategoryPage.jsx` | Category match uses `.includes()`: searching "SSC" would match any department containing "SSC" (e.g. "MPSC"). Should use exact match: `job.department.toLowerCase() === category.toLowerCase()`. |
| B-3 | 🟡 Medium | `LatestJobs.jsx` | Excludes the bottom 3 jobs by `lastDate` (earliest closing) from "Latest Jobs" to avoid overlap with "Closing Soon". But it hardcodes `.slice(0, 3)` when ClosingSoon shows 6. The sets can overlap. |
| B-4 | 🟢 Low | `JobPage.jsx` | `react-helmet` is installed in `package.json` but not imported or used anywhere. `document.title` is set manually with `useEffect`, which doesn't update OG/Twitter meta tags. |

### Code Quality Issues

| # | Severity | File | Description |
|---|---|---|---|
| Q-1 | 🟡 Medium | `middleware/adminMiddleware.js` + `middleware/verifyAdmin.js` | These two files are **identical** in logic. Both verify the admin JWT with `ADMIN_JWT_SECRET` and check `decoded.admin`. Both are applied to every admin route in `jobRoutes.js` (`verifyAdmin, adminMiddleware`), meaning the token is decoded and verified **twice** per request. |
| Q-2 | 🟡 Medium | `App.jsx` | Global state (`jobs`, `savedJobs`, `isLoggedIn`, `showLogin`, `filters`, `search`) is prop-drilled 3–4 levels deep into most components. As the app grows this becomes unmaintainable. |
| Q-3 | 🟡 Medium | `src/components/JobDetail.jsx` | This modal component is fully built but never imported or used anywhere in the app. The job detail is handled by `pages/JobPage.jsx` instead. Dead code. |
| Q-4 | 🟢 Low | `package.json` (root) | `jwt-decode` (v4.0.0) is listed as a dependency but is never imported in any file. `AdminProtectedRoute.jsx` decodes the JWT manually with `atob`. |
| Q-5 | 🟢 Low | `package.json` (root) | `react-helmet` (v6.1.0) is listed as a dependency but is never imported in any file. |
| Q-6 | 🟢 Low | `Footer.jsx` | Footer copyright reads "© 2026 GovtJobs" — should be "© 2026 JanSetu". |
| Q-7 | 🟢 Low | `Hero.jsx` | State quick-link buttons are hard-coded to 4 states. Users from other states get no shortcut. |

### Performance Issues

| # | Severity | Description |
|---|---|---|
| P-1 | 🟠 High | All jobs are fetched on app load and stored in memory. With 100+ jobs currently this is fine, but there is no pagination, search-as-you-type hits no API (purely client-side), and all filtering is in-browser. This will not scale past ~500 jobs without noticeable lag. |
| P-2 | 🟡 Medium | No search debounce — filter re-renders on every keystroke. |
| P-3 | 🟡 Medium | `Categories.jsx` iterates `jobs.map()` once per category on every render — 8 passes over the full jobs array. Should derive counts once with a single `reduce`. |

### Accessibility Issues

| # | Severity | Description |
|---|---|---|
| A-1 | 🟡 Medium | `JobCard.jsx` heart button has no `aria-label`. Screen readers announce nothing meaningful. |
| A-2 | 🟡 Medium | Hero search autocomplete has no keyboard navigation (arrow keys, Enter to select). |
| A-3 | 🟢 Low | Several interactive `<div>` elements in `Categories.jsx` use `onClick` without `role="button"` or `tabIndex`. |
| A-4 | 🟢 Low | No `<main>` landmark element wrapping page content. |

### SEO Issues

| # | Severity | Description |
|---|---|---|
| SEO-1 | 🟠 High | Job detail pages have no unique meta title/description (only `document.title` is set, no `<meta name="description">`). Google cannot index job-specific content effectively. |
| SEO-2 | 🟠 High | `sitemap.xml` is static and only lists the homepage. All category, state, and job pages are invisible to search crawlers. |
| SEO-3 | 🟡 Medium | No Open Graph or Twitter Card tags on any page. |
| SEO-4 | 🟡 Medium | No structured data (JSON-LD `JobPosting` schema) on job pages. This is a significant missed opportunity — Google shows rich job results for sites that implement it. |

---

## 8. DEPLOYMENT ASSESSMENT

### Frontend (Vercel)

| Item | Status | Notes |
|---|---|---|
| SPA rewrite rule | ✅ Configured | `vercel.json` correctly rewrites all routes to `index.html` |
| Build command | ✅ Standard | `vite build` |
| Environment | ✅ | `BASE_URL` in `src/utils/api.js` points to Render backend |
| Custom domain | ✅ | `jansetu.in` configured (from robots.txt/sitemap) |

### Backend (Render)

| Item | Status | Notes |
|---|---|---|
| Start command | ✅ | `node server.js` |
| Port | ✅ | Uses `process.env.PORT \|\| 5000` |
| CORS | ✅ | Allows `jansetu.in`, `www.jansetu.in`, `localhost:5173` |
| DNS override | ⚠️ Present | `dns.setServers(["1.1.1.1", "8.8.8.8"])` in `server.js` — added to resolve Atlas DNS issues on Render; acceptable but worth monitoring |
| Cold start | ⚠️ Risk | Render free tier spins down after inactivity; first request after sleep is slow (~30s). Cron job may miss its midnight window if instance is asleep. |
| Environment variables | 🔴 Risk | `backend/.env` not in `.gitignore` |

### MongoDB Atlas

| Item | Status | Notes |
|---|---|---|
| Connection | Via `MONGO_URI` env var | Not inspectable without credentials |
| Indexes | ⚠️ Only default | No compound or field indexes beyond `_id` and `email` unique |

---

## 9. RECOMMENDED ROADMAP

---

### Phase 1 — Stability and Security (Do First)
**Objective:** Fix all critical and high-severity issues. Ship nothing new until this is done.

| Task | Files Affected | Complexity |
|---|---|---|
| Add `backend/.env` to `.gitignore` | `.gitignore` | Trivial |
| Add admin auth to `GET /api/jobs/expired` or remove endpoint | `cronRoutes.js` | Low |
| Remove duplicate `adminMiddleware.js` (keep `verifyAdmin.js`) | `jobRoutes.js`, `adminMiddleware.js` | Low |
| Add `express-rate-limit` to auth and admin login routes | `authRoutes.js`, `adminRoutes.js`, `server.js` | Low |
| Add `helmet` to Express server | `server.js` | Trivial |
| Fix `ClosingSoon.jsx` to filter out past-deadline jobs | `ClosingSoon.jsx` | Low |
| Fix `CategoryPage.jsx` category match to use exact comparison | `CategoryPage.jsx` | Trivial |
| Fix `LatestJobs.jsx` exclusion count (exclude 6 not 3) | `LatestJobs.jsx` | Trivial |
| Fix Footer branding ("GovtJobs" → "JanSetu") | `Footer.jsx` | Trivial |
| Remove dead `JobDetail.jsx` component | `JobDetail.jsx` | Trivial |
| Remove unused `jwt-decode` and `react-helmet` from package.json | `package.json` | Trivial |

**Dependencies:** None  
**Risk:** Low — no user-facing feature changes  
**Testing:** Manual smoke test of all routes after middleware changes

---

### Phase 2 — SEO Foundation
**Objective:** Make job pages indexable and competitive in search.

| Task | Files Affected | Complexity |
|---|---|---|
| Install and use `react-helmet-async` (v2 replaces react-helmet) | All pages | Low |
| Add unique `<title>` and `<meta description>` to every page | `JobPage.jsx`, `CategoryPage.jsx`, `StatePage.jsx` | Low |
| Add Open Graph and Twitter Card tags to job pages | `JobPage.jsx` | Low |
| Add JSON-LD `JobPosting` structured data to `JobPage.jsx` | `JobPage.jsx` | Medium |
| Generate dynamic sitemap (either build-time script or backend route) | New `backend/routes/sitemapRoute.js` or build script | Medium |

**Dependencies:** `react-helmet-async`  
**Risk:** Low  
**Testing:** Use Google's Rich Results Test and Lighthouse SEO audit

---

### Phase 3 — Core UX Improvements
**Objective:** Fix the highest-impact user experience issues without a full rewrite.

| Task | Files Affected | Complexity |
|---|---|---|
| Add search debounce (300ms) | `Hero.jsx` | Low |
| Add keyboard navigation to search autocomplete | `Hero.jsx` | Medium |
| Add `aria-label` to heart save button | `JobCard.jsx` | Trivial |
| Add `role="button"` and `tabIndex` to clickable divs | `Categories.jsx` | Low |
| Fix qualification filter to include all values present in data (B.Tech, PhD, MBBS, Post Graduate) | `Hero.jsx`, `AdminPage.jsx` | Low |
| Make state quick-links dynamic from job data | `Hero.jsx` | Low |
| Expand `Categories.jsx` to include all departments in DB | `Categories.jsx` | Low |
| Add mobile Navbar menu | `Navbar.jsx` | Medium |
| Add pagination or "Load More" to `LatestJobs.jsx` | `LatestJobs.jsx` | Medium |

**Dependencies:** None  
**Risk:** Low to Medium  
**Testing:** Manual mobile/desktop; WCAG contrast check

---

### Phase 4 — User Retention Features
**Objective:** Give registered users reasons to return.

| Task | Files Affected | Complexity |
|---|---|---|
| Email notifications for closing-soon saved jobs | New `backend/services/emailService.js`, new cron | High |
| User profile page (manage saved jobs, update name/password) | New `src/pages/Profile.jsx`, `userRoutes.js` | Medium |
| "New this week" badge on job cards | `JobCard.jsx`, `Job.js` (use `createdAt`) | Low |
| Password reset / forgot password flow | New routes + email service | High |

**Dependencies:** Email provider (Resend, Nodemailer + SMTP)  
**Risk:** Medium — adds external dependency  
**Testing:** End-to-end email flow in staging

---

### Phase 5 — Job Discovery Improvements
**Objective:** Make the job feed smarter and more navigable.

| Task | Files Affected | Complexity |
|---|---|---|
| Server-side filtering and pagination | `jobRoutes.js`, `LatestJobs.jsx` | High |
| Multi-state filter | `Hero.jsx`, `LatestJobs.jsx`, `jobRoutes.js` | Medium |
| Salary range filter | `Hero.jsx`, `LatestJobs.jsx` | Medium |
| Sort by: newest, deadline soonest, most vacancies | `LatestJobs.jsx` | Low |
| Department/category filter chips | `LatestJobs.jsx` | Low |
| "Related jobs" section on `JobPage.jsx` | `JobPage.jsx` | Low |

**Dependencies:** Phase 5 benefits from server-side filtering (requires Phase 5 backend changes)  
**Risk:** High (server-side filtering changes API contract)  
**Testing:** All filter combinations; edge cases with zero results

---

### Phase 6 — Admin and Operations
**Objective:** Make job management reliable and auditable.

| Task | Files Affected | Complexity |
|---|---|---|
| Add server-side validation (Joi or Zod) to job create/update | `jobRoutes.js` | Low |
| Validate `lastDate` as a real Date, store as Date type | `Job.js`, `adminRoutes.js`, cron | Medium |
| Add per-admin accounts with email/password (replace shared password) | New `Admin.js` model, `adminRoutes.js` | High |
| Admin activity log | New `AdminLog.js` model | Medium |
| Bulk job import (CSV upload) | `AdminPage.jsx`, new upload route | High |
| Preview job card before publishing | `AdminPage.jsx` | Medium |
| Auto-fetch job metadata from official URL (optional/stretch) | New scraping service | Very High |

**Dependencies:** Zod or Joi for validation  
**Risk:** Admin model change is breaking for existing admin token  
**Testing:** All CRUD operations; invalid data rejection

---

## 10. QUESTIONS REQUIRING DEVELOPER DECISIONS

These items cannot be resolved by the architect alone and require your input before implementation.

1. **Secrets exposure risk:** Has `backend/.env` ever been committed to a public or shared Git repository? If yes, all secrets (`MONGO_URI`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `ADMIN_PASSWORD`) must be rotated immediately, even before any code changes.

2. **Admin password:** Do you want to keep a single shared admin password, or switch to per-admin accounts with email/password login? The latter requires a new `Admin` model and migration.

3. **`lastDate` stored as String:** The cron deletion currently relies on lexicographic string comparison of ISO dates. Do you want to migrate this to a proper `Date` type? This requires a one-time migration of existing documents.

4. **Server-side vs client-side filtering:** Currently all filtering (search, qualification, state) happens in the browser against the full jobs array. Do you want to move filtering to the backend (better for scale) or keep it client-side (simpler)?

5. **React state management:** The app currently prop-drills all global state through `App.jsx`. Do you want to introduce React Context, Zustand, or keep the current prop-drilling approach?

6. **Render cold starts:** Are you on the Render free tier? If so, the midnight cron job may not reliably fire. Do you want to set up an external ping service (e.g., UptimeRobot) or upgrade to a paid plan?

7. **Dynamic sitemap:** Should the sitemap be generated at build time (static, requires rebuild on new jobs) or served dynamically from the backend (always current, requires another backend route)?

8. **Email notifications:** Do you want email alerts for users when saved jobs are about to expire? This requires choosing an email provider and setting up a new cron job.

9. **`seed.js`:** Should this file remain in the repository for onboarding purposes, or be moved to a separate scripts folder and excluded from production deployments?

10. **Branding consistency:** Footer says "GovtJobs", robots.txt and sitemap reference `jansetu.in`, and `index.html` title says "JanSetu". Is "JanSetu" the final brand name everywhere?

---

*End of audit. No files were modified during this analysis.*
