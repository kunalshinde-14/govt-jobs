/**
 * Job Expiry, Status, and Date Helpers (Asia/Kolkata timezone)
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates whether a value is a strict, valid calendar date in YYYY-MM-DD format.
 *
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidDateString(dateStr) {
  if (typeof dateStr !== "string" || !DATE_REGEX.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

/**
 * Returns a calendar date string formatted as YYYY-MM-DD in the Asia/Kolkata timezone.
 *
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} YYYY-MM-DD
 */
function getKolkataDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Checks whether a job deadline is expired compared to a reference date (in Asia/Kolkata).
 * Invalid or missing deadlines return true (treated as expired/invalid).
 *
 * @param {string} lastDate - YYYY-MM-DD string
 * @param {string|Date} [referenceDate] - defaults to current Kolkata date
 * @returns {boolean}
 */
function isJobExpired(lastDate, referenceDate) {
  if (!isValidDateString(lastDate)) return true;
  const refStr = referenceDate
    ? (typeof referenceDate === "string" && isValidDateString(referenceDate)
        ? referenceDate
        : getKolkataDateString(referenceDate))
    : getKolkataDateString();

  return lastDate < refStr;
}

/**
 * Checks whether a job object should be displayed as active.
 *
 * A job is active if:
 * 1. It is a non-null object
 * 2. Its status is NOT 'expired' and NOT 'archived'
 *    (accepts 'active' or undefined/null for legacy records)
 * 3. Its lastDate is a valid YYYY-MM-DD calendar date
 * 4. Its lastDate is on or after today's Asia/Kolkata calendar date
 *
 * @param {object} job
 * @param {string|Date} [referenceDate]
 * @returns {boolean}
 */
function isJobActive(job, referenceDate) {
  if (!job || typeof job !== "object") return false;
  if (job.status === "expired" || job.status === "archived") return false;
  if (job.status && job.status !== "active") return false;
  if (!isValidDateString(job.lastDate)) return false;

  return !isJobExpired(job.lastDate, referenceDate);
}

/**
 * Checks if an active job deadline falls within a closing-soon window (in days).
 *
 * @param {object} job
 * @param {string|Date} [referenceDate]
 * @param {number} [windowDays=7]
 * @returns {boolean}
 */
function isClosingSoon(job, referenceDate, windowDays = 7) {
  if (!isJobActive(job, referenceDate)) return false;

  const refStr = referenceDate
    ? (typeof referenceDate === "string" && isValidDateString(referenceDate)
        ? referenceDate
        : getKolkataDateString(referenceDate))
    : getKolkataDateString();

  const [year, month, day] = refStr.split("-").map(Number);
  const refDateObj = new Date(year, month - 1, day);
  refDateObj.setDate(refDateObj.getDate() + windowDays);

  const windowEndStr = getKolkataDateString(refDateObj);

  return job.lastDate <= windowEndStr;
}

/**
 * Formats a YYYY-MM-DD date into a compact, human-readable Indian date string (e.g. "27 Oct 2026").
 * If the input is not a valid YYYY-MM-DD string, returns the original input or empty string.
 *
 * @param {string} dateStr
 * @returns {string}
 */
function formatCompactDate(dateStr) {
  if (!isValidDateString(dateStr)) {
    return typeof dateStr === "string" ? dateStr : "";
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${months[month - 1]} ${year}`;
}

/**
 * Calculates real-time countdown to vacancy closing deadline based on Asia/Kolkata timezone.
 * Uses the documented end-of-day convention (23:59:59 IST) for YYYY-MM-DD dates.
 *
 * @param {string|object} jobOrLastDate - YYYY-MM-DD string or job object with lastDate and optional status
 * @param {string} [status] - job status ('active', 'expired', 'archived')
 * @param {number} [nowMs=Date.now()] - current epoch timestamp in milliseconds
 * @returns {object|null} countdown details or null if date is unknown/invalid
 */
function getJobCountdown(jobOrLastDate, status, nowMs = Date.now()) {
  let lastDate = jobOrLastDate;
  let jobStatus = status;

  if (jobOrLastDate && typeof jobOrLastDate === "object") {
    lastDate = jobOrLastDate.lastDate;
    jobStatus = status || jobOrLastDate.status;
  }

  // If status is explicitly expired or archived
  if (jobStatus === "expired" || jobStatus === "archived") {
    return {
      status: "closed",
      text: "Closed",
      isUrgent: false,
      diffMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  // If closing date is not a valid YYYY-MM-DD, closing time is unknown -> return null
  if (!isValidDateString(lastDate)) {
    return null;
  }

  // Target closing time is 23:59:59 in Asia/Kolkata (+05:30)
  const targetMs = new Date(`${lastDate}T23:59:59+05:30`).getTime();
  const currentMs = typeof nowMs === "number" ? nowMs : Date.now();
  const diffMs = targetMs - currentMs;

  // Deadline has passed
  if (diffMs <= 0) {
    return {
      status: "closed",
      text: "Closed",
      isUrgent: false,
      diffMs,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  // Formatted countdown badge text
  let text;
  if (days > 0) {
    text = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s`;
  } else {
    text = `${seconds}s`;
  }

  // Urgent if <= 3 days (72 hours) remaining
  const isUrgent = diffMs <= 3 * 24 * 60 * 60 * 1000;

  return {
    status: "active",
    text,
    isUrgent,
    diffMs,
    days,
    hours,
    minutes,
    seconds,
  };
}

module.exports = {
  DATE_REGEX,
  isValidDateString,
  getKolkataDateString,
  isJobExpired,
  isJobActive,
  isClosingSoon,
  formatCompactDate,
  getJobCountdown,
};
