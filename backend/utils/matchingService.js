/**
 * JanSetu Personalized Matching Service
 *
 * Compares government job vacancies against user opportunity preferences.
 * Produces transparent match reasons and explicitly distinguishes
 * criteria-based matching from guaranteed official eligibility.
 */

const SECTOR_KEYWORDS = {
  banking: ["bank", "ibps", "sbi", "rbi", "nabard", "insurance", "lic", "nicl", "finance"],
  defence: ["defence", "army", "navy", "air force", "coast guard", "itbp", "crpf", "bsf", "cisf", "nda", "cds", "military"],
  railway: ["railway", "rrb", "rrc", "irctc", "metro"],
  ssc: ["ssc", "staff selection", "cgl", "chsl", "cpo", "mts", "gd"],
  upsc: ["upsc", "civil services", "ias", "ips", "ifs", "nda", "epfo"],
  police: ["police", "constable", "sub-inspector", "si", "dsp"],
  teaching: ["teacher", "kvs", "nvs", "tet", "ctet", "professor", "lecturer", "education"],
  "state psc": ["psc", "bpsc", "mpsc", "uppsc", "rpsc", "wbpsc", "appsc", "tspsc", "kpsc", "high court", "district court"],
  "state-psc": ["psc", "bpsc", "mpsc", "uppsc", "rpsc", "wbpsc", "appsc", "tspsc", "kpsc", "high court", "district court"],
};

/**
 * Normalizes text for keyword matching.
 *
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  return typeof str === "string" ? str.toLowerCase().trim() : "";
}

/**
 * Checks whether a job's department / title matches a preferred sector.
 *
 * @param {object} job
 * @param {string} sector
 * @returns {boolean}
 */
function matchesSectorKeyword(job, sector) {
  const normSector = normalize(sector);
  const dept = normalize(job?.department);
  const title = normalize(job?.title);

  // Direct substring match
  if (dept.includes(normSector) || title.includes(normSector)) {
    return true;
  }

  // Keywords mapping lookup
  const keywords = SECTOR_KEYWORDS[normSector] || [];
  return keywords.some((kw) => dept.includes(kw) || title.includes(kw));
}

/**
 * Evaluates match between a job and a user's preferences.
 *
 * @param {object} job
 * @param {object} preferences - { qualification: string[], sectors: string[], states: string[] }
 * @returns {object} match result
 */
function evaluateJobMatch(job, preferences = {}) {
  if (!job) {
    return {
      isMatch: false,
      score: 0,
      matchReasons: [],
      matchType: "none",
      disclaimer: "Review the official recruitment notification to verify complete eligibility.",
    };
  }

  const userQuals = Array.isArray(preferences?.qualification) ? preferences.qualification : [];
  const userSectors = Array.isArray(preferences?.sectors) ? preferences.sectors : [];
  const userStates = Array.isArray(preferences?.states) ? preferences.states : [];

  const hasPreferences = userQuals.length > 0 || userSectors.length > 0 || userStates.length > 0;

  // If user has not set any preferences yet, match is generic/broad
  if (!hasPreferences) {
    return {
      isMatch: true,
      score: 1,
      matchReasons: ["General recruitment opportunity across India"],
      matchType: "broad_discovery",
      disclaimer: "Match based on general active vacancies. Set your preferences for personalized recommendations. Review the official recruitment notifications to confirm complete eligibility.",
    };
  }

  const matchReasons = [];
  let score = 0;
  let qualMatched = false;
  let sectorMatched = false;
  let stateMatched = false;

  // 1. Qualification matching
  if (userQuals.length > 0) {
    const jobQual = normalize(job.qualification);
    const directMatch = userQuals.some((q) => normalize(q) === jobQual);

    if (directMatch) {
      qualMatched = true;
      score += 2;
      matchReasons.push(`Matches your qualification (${job.qualification})`);
    } else if (userQuals.some((q) => normalize(q) === "graduate") && (jobQual === "10th" || jobQual === "12th")) {
      // Graduates are generally eligible for 10th/12th entry jobs
      qualMatched = true;
      score += 1;
      matchReasons.push(`Open to your education level (${job.qualification} minimum)`);
    }
  }

  // 2. Sector matching
  if (userSectors.length > 0) {
    const matchedSector = userSectors.find((s) => matchesSectorKeyword(job, s));
    if (matchedSector) {
      sectorMatched = true;
      score += 2;
      matchReasons.push(`Matches your selected sector (${matchedSector})`);
    }
  }

  // 3. State / Regional matching
  if (userStates.length > 0) {
    const jobState = normalize(job.state);
    if (jobState === "all india") {
      stateMatched = true;
      score += 1.5;
      matchReasons.push("All-India national opening open to your state");
    } else {
      const stateHit = userStates.find((s) => normalize(s) === jobState);
      if (stateHit) {
        stateMatched = true;
        score += 2;
        matchReasons.push(`In your preferred state (${job.state})`);
      }
    }
  }

  // Determine overall match status
  // Criteria: matches at least one active preference without hard conflicts
  const isMatch = qualMatched || sectorMatched || stateMatched;

  let matchType = "partial_match";
  const criteriaCount = (userQuals.length > 0 ? 1 : 0) + (userSectors.length > 0 ? 1 : 0) + (userStates.length > 0 ? 1 : 0);
  const matchedCount = (qualMatched ? 1 : 0) + (sectorMatched ? 1 : 0) + (stateMatched ? 1 : 0);

  if (criteriaCount > 0 && matchedCount === criteriaCount) {
    matchType = "confirmed_criteria";
  } else if (matchedCount > 0) {
    matchType = "approximate_match";
  }

  return {
    isMatch,
    score,
    matchReasons,
    matchType,
    disclaimer: "Match based on declared criteria only. JanSetu does not guarantee eligibility — always verify official notifications for age limits, mandatory degrees, and category relaxations.",
  };
}

module.exports = {
  evaluateJobMatch,
  SECTOR_KEYWORDS,
};
