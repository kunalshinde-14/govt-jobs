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

module.exports = {
  DATE_REGEX,
  isValidDateString,
  getKolkataDateString,
  isJobExpired,
  isJobActive,
  isClosingSoon,
};
