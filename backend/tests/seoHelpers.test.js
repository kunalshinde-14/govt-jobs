const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  CATEGORY_MAP,
  GENERIC_DEPARTMENTS,
  parseSalarySchema,
  resolveHiringOrganization,
  resolveCategory,
  parseCsvLine,
  parseCsv,
} = require("../utils/seoHelpers");

describe("JanSetu SEO — Structured Data, Salary Parser & CSV Compliance", () => {
  describe("parseSalarySchema() — QuantitativeValue & Pay Band Defense", () => {
    it("parses single monthly salary correctly", () => {
      const res = parseSalarySchema("₹16,650 per month");
      assert.deepEqual(res, {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          value: 16650,
          unitText: "MONTH",
        },
      });
    });

    it("parses standard salary range (min and max) correctly", () => {
      const res = parseSalarySchema("₹56,100 - ₹1,77,500");
      assert.deepEqual(res, {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: 56100,
          maxValue: 177500,
          unitText: "MONTH",
        },
      });
    });

    it("strips Pay Matrix Level (Level 10) and does not treat 10 as salary amount", () => {
      const res = parseSalarySchema("₹56,100 - ₹1,77,500 (Level 10)");
      assert.equal(res?.value?.minValue, 56100);
      assert.equal(res?.value?.maxValue, 177500);
      assert.notEqual(res?.value?.minValue, 10);
    });

    it("strips Pay Band (PB-1), Grade Pay (GP 2000), and Level 3 without treating 1 as salary", () => {
      const res = parseSalarySchema("PB-1 ₹5,200 - ₹20,200 + GP ₹2,000 (Level 3)");
      assert.ok(res);
      assert.equal(res.value.minValue, 5200);
      assert.equal(res.value.maxValue, 20200);
      assert.notEqual(res.value.minValue, 1);
      assert.notEqual(res.value.minValue, 2000);
    });

    it("parses Pay Level-7 with Rs prefix and hyphen notation", () => {
      const res = parseSalarySchema("Pay Level-7 (Rs. 44,900 - 1,42,400/-)");
      assert.ok(res);
      assert.equal(res.value.minValue, 44900);
      assert.equal(res.value.maxValue, 142400);
    });

    it("detects annual pay indicators (CTC, per annum, p.a.) and sets unitText to YEAR", () => {
      const res = parseSalarySchema("₹6,00,000 - ₹12,00,000 per annum");
      assert.ok(res);
      assert.equal(res.value.minValue, 600000);
      assert.equal(res.value.maxValue, 1200000);
      assert.equal(res.value.unitText, "YEAR");
    });

    it("omits structured salary (returns undefined) when only Level or 7th CPC is mentioned without amounts", () => {
      assert.equal(parseSalarySchema("Level 10 as per 7th CPC"), undefined);
      assert.equal(parseSalarySchema("Pay Matrix Level 4"), undefined);
    });

    it("omits structured salary (returns undefined) for unquantified government norm strings", () => {
      assert.equal(parseSalarySchema("As per government norms"), undefined);
      assert.equal(parseSalarySchema("Refer official notification"), undefined);
      assert.equal(parseSalarySchema("Not Disclosed"), undefined);
      assert.equal(parseSalarySchema(""), undefined);
      assert.equal(parseSalarySchema(null), undefined);
      assert.equal(parseSalarySchema(undefined), undefined);
    });
  });

  describe("resolveHiringOrganization() — Real Recruiter vs Generic Labels", () => {
    it("prefers explicit verified organization field when provided", () => {
      const job = {
        title: "Project Engineer",
        department: "PSU",
        organization: "Bharat Electronics Limited",
      };
      const org = resolveHiringOrganization(job, "https://jobapply.in/bel");
      assert.deepEqual(org, {
        "@type": "Organization",
        name: "Bharat Electronics Limited",
        sameAs: "https://jobapply.in/bel",
      });
    });

    it("preserves specific commissions and authorities (APPSC, TNPSC, UPSC, SSC)", () => {
      const job = {
        title: "Assistant Section Officer",
        department: "APPSC",
      };
      const org = resolveHiringOrganization(job, "https://appsc.gov.in");
      assert.deepEqual(org, {
        "@type": "Organization",
        name: "APPSC",
        sameAs: "https://appsc.gov.in",
      });
    });

    it("never returns generic categories (PSU, Banking, Defence, High Court) as employer name", () => {
      for (const generic of ["PSU", "Banking", "Defence", "High Court", "Insurance", "State PSC"]) {
        const job = {
          title: "Apprentice 2026",
          department: generic,
        };
        const org = resolveHiringOrganization(job, "https://jansetu.in");
        if (org) {
          assert.notEqual(org.name.toLowerCase(), generic.toLowerCase());
        }
      }
    });

    it("extracts specific organization from title prefix when department is generic", () => {
      const ucoJob = {
        title: "UCO Bank Apprentice 2026",
        department: "Banking",
      };
      const ucoOrg = resolveHiringOrganization(ucoJob, "https://www.ucobank.com");
      assert.equal(ucoOrg?.name, "UCO Bank");

      const belJob = {
        title: "BEL Project Engineer-I 2026",
        department: "PSU",
      };
      const belOrg = resolveHiringOrganization(belJob, "https://jobapply.in/bel");
      assert.equal(belOrg?.name, "BEL");

      const armyJob = {
        title: "Indian Army Technical Graduate Course TGC 145 2026",
        department: "Defence",
      };
      const armyOrg = resolveHiringOrganization(armyJob, "https://joinindianarmy.nic.in");
      assert.equal(armyOrg?.name, "Indian Army");
    });
  });

  describe("resolveCategory() — Truthful Category & No Banking Default", () => {
    it("maps banking recruitment accurately", () => {
      assert.equal(resolveCategory({ department: "Banking" })?.slug, "banking");
      assert.equal(resolveCategory({ title: "IBPS PO 2026", department: "Finance" })?.slug, "banking");
    });

    it("maps defence, upsc, ssc, and state-psc accurately", () => {
      assert.equal(resolveCategory({ department: "Defence" })?.slug, "defence");
      assert.equal(resolveCategory({ department: "UPSC" })?.slug, "upsc");
      assert.equal(resolveCategory({ department: "SSC" })?.slug, "ssc");
      assert.equal(resolveCategory({ department: "TNPSC" })?.slug, "state-psc");
      assert.equal(resolveCategory({ department: "APPSC" })?.slug, "state-psc");
    });

    it("returns null for unknown sectors (e.g. PSU, Health) without defaulting to Banking", () => {
      assert.equal(resolveCategory({ department: "PSU", title: "Project Engineer" }), null);
      assert.equal(resolveCategory({ department: "Health & Family Welfare" }), null);
      assert.equal(resolveCategory({ department: "Agriculture Dept" }), null);
    });
  });

  describe("parseCsvLine() & parseCsv() — GSC CSV Parser Robustness", () => {
    it("parses unquoted comma-separated lines", () => {
      const line = "Page,Clicks,Impressions,CTR,Position";
      assert.deepEqual(parseCsvLine(line), ["Page", "Clicks", "Impressions", "CTR", "Position"]);
    });

    it("handles quoted fields containing embedded commas without splitting", () => {
      const line = `"upsc nda, cds recruitment",25,"1,450",1.7%,4.2`;
      const cols = parseCsvLine(line);
      assert.equal(cols.length, 5);
      assert.equal(cols[0], "upsc nda, cds recruitment");
      assert.equal(cols[1], "25");
      assert.equal(cols[2], "1,450");
      assert.equal(cols[3], "1.7%");
      assert.equal(cols[4], "4.2");
    });

    it("handles escaped quotes inside quoted fields", () => {
      const line = `"upsc ""civil services"" notification",10,500,2.0%,3.1`;
      const cols = parseCsvLine(line);
      assert.equal(cols[0], `upsc "civil services" notification`);
    });

    it("cleans comma-separated numbers and parses valid numeric values", () => {
      const csv = `Query,Clicks,Impressions,CTR,Position
"upsc nda, na exam","1,250","25,000",5.0%,2.1
"banking po",80,"2,400",3.3%,5.4`;

      const records = parseCsv(csv);
      assert.equal(records.length, 2);
      assert.equal(records[0].url, "upsc nda, na exam");
      assert.equal(records[0].clicks, 1250);
      assert.equal(records[0].impressions, 25000);
      assert.equal(records[0].ctr, 0.05);
      assert.equal(records[0].position, 2.1);
    });

    it("handles empty input or malformed single-line input gracefully", () => {
      assert.deepEqual(parseCsv(""), []);
      assert.deepEqual(parseCsv("Page,Clicks,Impressions"), []);
      assert.deepEqual(parseCsv(null), []);
    });
  });
});

