/**
 * Frontend Job Expiry, Status, and Date Helpers (Asia/Kolkata timezone)
 */

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(dateStr) {
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

export function getKolkataDateString(date = new Date()) {
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

export function isJobExpired(lastDate, referenceDate) {
  if (!isValidDateString(lastDate)) return true;
  const refStr = referenceDate
    ? (typeof referenceDate === "string" && isValidDateString(referenceDate)
        ? referenceDate
        : getKolkataDateString(referenceDate))
    : getKolkataDateString();

  return lastDate < refStr;
}

export function isJobActive(job, referenceDate) {
  if (!job || typeof job !== "object") return false;
  if (job.status === "expired" || job.status === "archived") return false;
  if (job.status && job.status !== "active") return false;
  if (!isValidDateString(job.lastDate)) return false;

  return !isJobExpired(job.lastDate, referenceDate);
}

export function isClosingSoon(job, referenceDate, windowDays = 7) {
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
