/**
 * JanSetu SEO Helpers
 *
 * Provides shared utilities for:
 * 1. Quantitative salary parsing for Schema.org JobPosting compliance
 * 2. Hiring organization resolution (preventing generic category labels from becoming employer names)
 * 3. Breadcrumb category and navigation mapping
 * 4. RFC-4180 compliant CSV line parsing for Search Console reporting
 */

export const CATEGORY_MAP = {
  banking: { name: "Banking", slug: "banking" },
  defence: { name: "Defence", slug: "defence" },
  railway: { name: "Railway", slug: "railway" },
  ssc: { name: "SSC", slug: "ssc" },
  upsc: { name: "UPSC", slug: "upsc" },
  police: { name: "Police", slug: "police" },
  teaching: { name: "Teaching", slug: "teaching" },
  "state-psc": { name: "State PSC", slug: "state-psc" },
};

export const GENERIC_DEPARTMENTS = new Set([
  "psu",
  "banking",
  "defence",
  "defense",
  "insurance",
  "high court",
  "railway",
  "police",
  "teaching",
  "state psc",
  "central",
  "state",
]);

/**
 * Extracts clean numeric salary amount from diverse Indian recruitment notifications
 * for valid Schema.org QuantitativeValue compliance.
 *
 * Never treats Pay Band (PB-1), Grade Pay (GP), or Pay Matrix Level (Level 10)
 * as salary amounts.
 *
 * @param {string} salaryStr
 * @returns {object|undefined} Schema.org MonetaryAmount or undefined
 */
export function parseSalarySchema(salaryStr) {
  if (!salaryStr || typeof salaryStr !== "string") return undefined;

  // 1. Remove commas used as thousand separators
  let s = salaryStr.replace(/,/g, "");

  // 2. Strip Pay Band indicators (e.g. "PB-1", "PB 2", "Pay Band-3")
  s = s.replace(/\b(Pay\s*Band|PB)\s*[-–—:]*\s*\d+\b/gi, " ");

  // 3. Strip Grade Pay indicators (e.g. "+ GP 2000", "+ Grade Pay Rs. 4200", "GP-2800")
  s = s.replace(/(?:\+|\band)?\s*(?:GP|Grade\s*Pay)\s*[-–—:]*\s*(?:₹|Rs\.?|INR)?\s*\d+\b/gi, " ");

  // 4. Strip Pay Matrix Level indicators (e.g. "Level 10", "Pay Level-7", "Level-3", "Level 10 stipend")
  s = s.replace(/\b(?:Pay\s+)?Level\s*[-–—:]*\s*\d+\b/gi, " ");

  // 5. Strip 7th CPC references
  s = s.replace(/\b7th\s*CPC\b/gi, " ");

  // 6. Detect period: year vs month
  const isAnnual = /\b(?:year|annum|p\.a|lpa|ctc)\b/i.test(salaryStr);
  const unitText = isAnnual ? "YEAR" : "MONTH";

  // 7. Find all remaining digit sequences
  const rawNumbers = s.match(/\d+/g);
  if (!rawNumbers || rawNumbers.length === 0) return undefined;

  // Filter numbers: In Indian context, base monthly salary is >= 1000 INR
  // Any isolated small number (< 1000) is an index, grade, or level.
  const validNumbers = rawNumbers
    .map(Number)
    .filter((n) => !isNaN(n) && n >= 1000);

  if (validNumbers.length === 0) return undefined;

  // Range validation
  if (validNumbers.length >= 2) {
    const min = validNumbers[0];
    const max = validNumbers[1];

    if (max >= min) {
      return {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: min,
          maxValue: max,
          unitText,
        },
      };
    }
  }

  // Single valid salary amount
  const single = validNumbers[0];
  return {
    "@type": "MonetaryAmount",
    currency: "INR",
    value: {
      "@type": "QuantitativeValue",
      value: single,
      unitText,
    },
  };
}

/**
 * Resolves the hiring organization accurately.
 * Does not turn generic sector categories (PSU, Banking, Defence, etc.) into employer names.
 *
 * @param {object} job
 * @param {string} domainUrl
 * @returns {object|undefined} Schema.org Organization or undefined
 */
export function resolveHiringOrganization(job, domainUrl = "https://jansetu.in") {
  if (!job || typeof job !== "object") return undefined;

  // 1. Explicit verified organization field if available
  if (job.organization && typeof job.organization === "string" && job.organization.trim()) {
    return {
      "@type": "Organization",
      name: job.organization.trim(),
      sameAs: domainUrl,
    };
  }

  const dept = (job.department || "").trim();
  const deptLower = dept.toLowerCase();

  // 2. Specific commission / department authority (e.g. UPSC, SSC, APPSC, TNPSC, MPSC, DRDO, ISRO)
  if (dept && !GENERIC_DEPARTMENTS.has(deptLower)) {
    return {
      "@type": "Organization",
      name: dept,
      sameAs: domainUrl,
    };
  }

  // 3. For generic category labels, resolve specific organization from title prefix
  if (job.title && typeof job.title === "string") {
    const title = job.title.trim();
    const knownOrgPatterns = [
      /^(UCO Bank|State Bank of India|SBI|Punjab National Bank|PNB|Bank of Baroda|BOB|Canara Bank|Union Bank of India|Indian Bank|Bank of India|Central Bank of India|IBPS|RBI|NABARD|SEBI|SIDBI|EXIM Bank|NHB)\b/i,
      /^(BEL|BHEL|ONGC|IOCL|NTPC|SAIL|GAIL|HPCL|BPCL|Coal India|CIL|NALCO|NMDC|PowerGrid|PGCIL|HAL|DRDO|ISRO|BARC|BBNL|EdCIL)\b/i,
      /^(Indian Army|Indian Navy|Indian Air Force|IAF|Coast Guard|Border Security Force|BSF|CRPF|CISF|ITBP|SSB|BRO|Assam Rifles)\b/i,
      /^(LIC|NICL|NIACL|OICL|UIIC|GIC Re|ESIC|EPFO)\b/i,
      /^([A-Za-z\s]+High Court|[A-Za-z\s]+Police)\b/i,
    ];

    for (const pattern of knownOrgPatterns) {
      const match = title.match(pattern);
      if (match && match[0]) {
        return {
          "@type": "Organization",
          name: match[0].trim(),
          sameAs: domainUrl,
        };
      }
    }

    const roleMatch = title.match(/^(.+?)\s+(?:Apprentice|Project|Engineer|Officer|Clerk|Manager|Assistant|Executive|Peon|Constable|Trainee|Recruitment|Exam|Notification)\b/i);
    if (roleMatch && roleMatch[1] && roleMatch[1].length >= 3 && roleMatch[1].length <= 50) {
      return {
        "@type": "Organization",
        name: roleMatch[1].trim(),
        sameAs: domainUrl,
      };
    }
  }

  // 4. Fallback to domain authority if external, without claiming generic category name
  if (domainUrl && !domainUrl.includes("jansetu.in")) {
    try {
      const host = new URL(domainUrl).hostname.replace(/^www\./, "");
      return {
        "@type": "Organization",
        name: `Government Recruiting Authority (${host})`,
        sameAs: domainUrl,
      };
    } catch {
      // ignore
    }
  }

  return undefined;
}

/**
 * Maps a job to its truthful category. Never defaults unknown departments to Banking.
 *
 * @param {object} job
 * @returns {object|null} { name, slug } or null
 */
export function resolveCategory(job) {
  if (!job || typeof job !== "object") return null;
  const dept = (job.department || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const text = `${dept} ${title}`;

  if (dept.includes("bank") || text.includes("ibps") || text.includes("sbi") || text.includes("rbi") || text.includes("bank")) {
    return CATEGORY_MAP.banking;
  }
  if (dept.includes("defence") || dept.includes("defense") || text.includes("army") || text.includes("navy") || text.includes("air force") || text.includes("afcat") || text.includes("bro gref") || text.includes("tgc")) {
    return CATEGORY_MAP.defence;
  }
  if (dept.includes("railway") || text.includes("rrb") || text.includes("railway")) {
    return CATEGORY_MAP.railway;
  }
  if (dept.includes("upsc") || text.includes("upsc") || text.includes("nda") || text.includes("cds") || text.includes("civil services")) {
    return CATEGORY_MAP.upsc;
  }
  if (dept.includes("ssc") || text.includes("ssc cgl") || text.includes("ssc chsl") || text.includes("ssc mts")) {
    return CATEGORY_MAP.ssc;
  }
  if (dept.includes("police") || text.includes("police") || text.includes("constable") || text.includes("sub-inspector")) {
    return CATEGORY_MAP.police;
  }
  if (dept.includes("teach") || text.includes("professor") || text.includes("teacher") || text.includes("tet") || text.includes("tgt") || text.includes("pgt")) {
    return CATEGORY_MAP.teaching;
  }
  if (dept.includes("psc") || dept.includes("dsssb") || dept.includes("court") || text.includes("psc")) {
    return CATEGORY_MAP["state-psc"];
  }

  return null;
}

/**
 * RFC-4180 compliant CSV line parser.
 * Handles quoted fields, embedded commas, and escaped double quotes ("").
 *
 * @param {string} line
 * @returns {string[]}
 */
export function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  result.push(current.trim());
  return result;
}

