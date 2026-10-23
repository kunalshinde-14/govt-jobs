/**
 * JanSetu SEO Helpers (CommonJS backend mirror)
 */

const CATEGORY_MAP = {
  banking: { name: "Banking", slug: "banking" },
  defence: { name: "Defence", slug: "defence" },
  railway: { name: "Railway", slug: "railway" },
  ssc: { name: "SSC", slug: "ssc" },
  upsc: { name: "UPSC", slug: "upsc" },
  police: { name: "Police", slug: "police" },
  teaching: { name: "Teaching", slug: "teaching" },
  "state-psc": { name: "State PSC", slug: "state-psc" },
};

const GENERIC_DEPARTMENTS = new Set([
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

function parseSalarySchema(salaryStr) {
  if (!salaryStr || typeof salaryStr !== "string") return undefined;

  let s = salaryStr.replace(/,/g, "");
  s = s.replace(/\b(Pay\s*Band|PB)\s*[-–—:]*\s*\d+\b/gi, " ");
  s = s.replace(/(?:\+|\band)?\s*(?:GP|Grade\s*Pay)\s*[-–—:]*\s*(?:₹|Rs\.?|INR)?\s*\d+\b/gi, " ");
  s = s.replace(/\b(?:Pay\s+)?Level\s*[-–—:]*\s*\d+\b/gi, " ");
  s = s.replace(/\b7th\s*CPC\b/gi, " ");

  const isAnnual = /\b(?:year|annum|p\.a|lpa|ctc)\b/i.test(salaryStr);
  const unitText = isAnnual ? "YEAR" : "MONTH";

  const rawNumbers = s.match(/\d+/g);
  if (!rawNumbers || rawNumbers.length === 0) return undefined;

  const validNumbers = rawNumbers
    .map(Number)
    .filter((n) => !isNaN(n) && n >= 1000);

  if (validNumbers.length === 0) return undefined;

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

function resolveHiringOrganization(job, domainUrl = "https://jansetu.in") {
  if (!job || typeof job !== "object") return undefined;

  if (job.organization && typeof job.organization === "string" && job.organization.trim()) {
    return {
      "@type": "Organization",
      name: job.organization.trim(),
      sameAs: domainUrl,
    };
  }

  const dept = (job.department || "").trim();
  const deptLower = dept.toLowerCase();

  if (dept && !GENERIC_DEPARTMENTS.has(deptLower)) {
    return {
      "@type": "Organization",
      name: dept,
      sameAs: domainUrl,
    };
  }

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

function resolveCategory(job) {
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

function parseCsvLine(line) {
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

function parseCsv(content) {
  if (!content || typeof content !== "string") return [];

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.replace(/^["']|["']$/g, "").trim().toLowerCase()
  );

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCsvLine(lines[i]);
    if (rawCols.length < headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => {
      let val = (rawCols[idx] || "").replace(/^["']|["']$/g, "").trim();
      row[h] = val;
    });

    const url =
      row["page"] ||
      row["top pages"] ||
      row["query"] ||
      row["top queries"] ||
      row["url"] ||
      "";

    const rawClicks = (row["clicks"] || "0").replace(/,/g, "");
    const rawImpressions = (row["impressions"] || "0").replace(/,/g, "");
    const clicks = parseInt(rawClicks, 10);
    const impressions = parseInt(rawImpressions, 10);

    let ctrStr = row["ctr"] || "0%";
    let ctr = parseFloat(ctrStr.replace(/%/g, "").replace(/,/g, "")) / 100;
    if (isNaN(ctr) && impressions > 0) ctr = clicks / impressions;

    const rawPos = (row["position"] || "0").replace(/,/g, "");
    const position = parseFloat(rawPos);

    if (url) {
      records.push({
        url,
        clicks: isNaN(clicks) ? 0 : clicks,
        impressions: isNaN(impressions) ? 0 : impressions,
        ctr: isNaN(ctr) ? 0 : ctr,
        position: isNaN(position) ? 0 : position,
      });
    }
  }

  return records;
}

module.exports = {
  CATEGORY_MAP,
  GENERIC_DEPARTMENTS,
  parseSalarySchema,
  resolveHiringOrganization,
  resolveCategory,
  parseCsvLine,
  parseCsv,
};

