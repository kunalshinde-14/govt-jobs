/**
 * JanSetu Google Search Console Performance & Indexing Analysis Script
 *
 * Usage:
 *   node scripts/importGscData.js [path/to/Pages.csv]
 *
 * Capabilities:
 * - Parses standard GSC CSV exports (Pages, Queries, or combined 28-day periods)
 * - Identifies high-impression, low-CTR opportunities (< 2.5% CTR in top 20)
 * - Identifies top-performing core pages and keyword drivers
 * - Detects 404/Soft-404 patterns needing immediate indexing investigation
 * - Generates structured weekly reporting tables
 */

import fs from "fs";
import path from "path";
import { parseCsvLine } from "../src/utils/seoHelpers.js";

// Minimum thresholds for triage
const LOW_CTR_THRESHOLD = 0.025; // 2.5%
const HIGH_IMPRESSIONS_THRESHOLD = 50;
const TOP_RANK_THRESHOLD = 15.0;

export function parseCsv(content) {
  if (!content || typeof content !== "string") return [];

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  // Parse header with quote-awareness
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

    // Normalize standard GSC fields
    const url =
      row["page"] ||
      row["top pages"] ||
      row["query"] ||
      row["top queries"] ||
      row["url"] ||
      "";

    // Clean comma-separated digits in numeric fields
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

export function analyzeGscData(records) {
  const totalClicks = records.reduce((acc, r) => acc + r.clicks, 0);
  const totalImpressions = records.reduce((acc, r) => acc + r.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = records.length > 0
    ? records.reduce((acc, r) => acc + r.position, 0) / records.length
    : 0;

  // Triage 1: High Impressions, Weak CTR (Snippet Optimization Needed)
  const ctrOpportunities = records
    .filter((r) => r.impressions >= HIGH_IMPRESSIONS_THRESHOLD && r.position <= TOP_RANK_THRESHOLD && r.ctr < LOW_CTR_THRESHOLD)
    .sort((a, b) => b.impressions - a.impressions);

  // Triage 2: Top Click Drivers (Core Traffic Anchors)
  const topPerformers = [...records].sort((a, b) => b.clicks - a.clicks).slice(0, 10);

  // Triage 3: Pages Needing Indexing / Discovery Investigation
  const lowVisibility = records.filter((r) => r.impressions < 5 && r.clicks === 0);

  return {
    summary: {
      totalRows: records.length,
      totalClicks,
      totalImpressions,
      avgCtr: (avgCtr * 100).toFixed(2) + "%",
      avgPosition: avgPosition.toFixed(1),
    },
    ctrOpportunities,
    topPerformers,
    lowVisibilityCount: lowVisibility.length,
  };
}

// CLI Execution
const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.log("==================================================================");
  console.log("  JanSetu Search Console Reporting & Optimization Tool");
  console.log("==================================================================");
  console.log("Usage: node scripts/importGscData.js <path-to-gsc-export.csv>\n");
  console.log("Specification: Expects standard Google Search Console export CSV");
  console.log("Columns: Page/Query, Clicks, Impressions, CTR, Position");
  console.log("Run with sample data: node scripts/importGscData.js sample\n");
  process.exit(0);
}

if (filePath === "sample") {
  const sampleData = `Page,Clicks,Impressions,CTR,Position
https://jansetu.in/,340,4200,8.1%,4.2
https://jansetu.in/category/banking,85,1850,4.6%,6.1
https://jansetu.in/category/defence,62,1420,4.4%,5.8
https://jansetu.in/category/state-psc,14,1200,1.2%,8.4
https://jansetu.in/state/delhi,45,980,4.6%,7.2
https://jansetu.in/state/maharashtra,38,1100,3.5%,8.1
https://jansetu.in/job/6ad0ce48e904a2394ffeee24,28,450,6.2%,3.1
https://jansetu.in/job/6ad0ce48e904a2394ffeee26,12,680,1.8%,6.5`;

  const records = parseCsv(sampleData);
  const analysis = analyzeGscData(records);

  console.log("------------------------------------------------------------------");
  console.log("  Search Console Performance Summary (28-Day Window)");
  console.log("------------------------------------------------------------------");
  console.log(`Analyzed Rows:     ${analysis.summary.totalRows}`);
  console.log(`Total Clicks:      ${analysis.summary.totalClicks}`);
  console.log(`Total Impressions: ${analysis.summary.totalImpressions}`);
  console.log(`Aggregate CTR:     ${analysis.summary.avgCtr}`);
  console.log(`Average Position:  ${analysis.summary.avgPosition}`);
  console.log("\n------------------------------------------------------------------");
  console.log("  High Impression, Low CTR Action Items (< 2.5% CTR in Top 15)");
  console.log("------------------------------------------------------------------");
  if (analysis.ctrOpportunities.length === 0) {
    console.log("  No low-CTR anomalies detected.");
  } else {
    analysis.ctrOpportunities.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.url}`);
      console.log(`   Impressions: ${item.impressions} | Clicks: ${item.clicks} | CTR: ${(item.ctr * 100).toFixed(2)}% | Pos: ${item.position}`);
      console.log("   Action: Improve title & meta description urgency (highlight vacancies & closing date)\n");
    });
  }

  process.exit(0);
}

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found at ${filePath}`);
  process.exit(1);
}

const rawContent = fs.readFileSync(filePath, "utf-8");
const records = parseCsv(rawContent);
const analysis = analyzeGscData(records);

console.log("------------------------------------------------------------------");
console.log(`  JanSetu Search Console Report: ${path.basename(filePath)}`);
console.log("------------------------------------------------------------------");
console.log(`Analyzed Pages/Queries: ${analysis.summary.totalRows}`);
console.log(`Total Clicks:           ${analysis.summary.totalClicks}`);
console.log(`Total Impressions:      ${analysis.summary.totalImpressions}`);
console.log(`Aggregate CTR:          ${analysis.summary.avgCtr}`);
console.log(`Average Position:       ${analysis.summary.avgPosition}`);
console.log("\n------------------------------------------------------------------");
console.log("  High Priority Optimization Targets (< 2.5% CTR, High Impressions)");
console.log("------------------------------------------------------------------");
analysis.ctrOpportunities.forEach((item, idx) => {
  console.log(`${idx + 1}. ${item.url}`);
  console.log(`   Impressions: ${item.impressions} | Clicks: ${item.clicks} | CTR: ${(item.ctr * 100).toFixed(2)}% | Pos: ${item.position}`);
});

