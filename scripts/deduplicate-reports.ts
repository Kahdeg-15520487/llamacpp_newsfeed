/**
 * Deduplicates PRs across daily reports.
 * For each PR, keeps it only in the earliest report where it appears,
 * removing it from all later reports.
 * 
 * Usage: npx tsx scripts/deduplicate-reports.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_DIR = path.resolve("output");
const BOOK_SRC = path.resolve("book/src");

// Categories from the prompt
const CATEGORIES = [
  "Backend", "Quantization", "Model Support", "Performance",
  "Server/API", "CLI/Tooling", "Bug Fix", "Documentation",
  "Build/CI", "Other"
];

interface PrEntry {
  prNumber: number;
  category: string;
  title: string;
  mergedDate: string;
  author: string;
  rawSection: string; // the full markdown from ### header to next ### or ---
}

interface ReportStats {
  total: number;
  categories: Record<string, number>;
}

interface ParsedReport {
  path: string;
  date: string;
  header: string;           // everything before first PR entry
  entries: PrEntry[];       // full PR detail sections
  footer: string;           // everything after last PR entry
  notableSection: string;   // Notable Mentions section (if any)
  runCommandSection: string; // Run Command Impact section (if any)
  summaryLine: number;      // line number of summary table start
  summaryEndLine: number;   // line number of summary table end
}

function extractPRNumbersFromSection(section: string): number[] {
  const prs: number[] = [];
  const re = /PR #(\d+)/g;
  let m;
  while ((m = re.exec(section)) !== null) {
    prs.push(parseInt(m[1]));
  }
  return prs;
}

function parseReport(filePath: string): ParsedReport {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const content = rawContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = content.split("\n");
  const dateMatch = content.match(/Daily News — (\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : path.basename(filePath, ".md").split("-").slice(0, 3).join("-");

  // Find all PR entries
  const entries: PrEntry[] = [];
  const prSectionRegex = /^### \[(.+?)\]\s+.+PR #(\d+): (.+)\r?$/;
  
  let i = 0;
  let headerEnd = 0;
  let footerStart = lines.length;
  let inNotable = false;
  let inRunCommand = false;
  let notableLines: string[] = [];
  let runCommandLines: string[] = [];
  let summaryStart = -1;
  let summaryEnd = -1;

  // Find summary table bounds
  for (i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## 📊 Summary")) {
      summaryStart = i;
    }
    if (summaryStart >= 0 && lines[i].startsWith("---") && i > summaryStart + 2) {
      summaryEnd = i;
      break;
    }
  }

  // Find header end (after summary table, before first PR)
  for (i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## 🔍 PR Details")) {
      headerEnd = i + 1;
      break;
    }
  }

  // Parse PR entries and find footer
  for (i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith("## 📝 Notable Mentions")) {
      inNotable = true;
      notableLines.push(line);
      continue;
    }
    if (inNotable && line.startsWith("## ")) {
      inNotable = false;
    }
    if (inNotable) {
      notableLines.push(line);
      continue;
    }

    if (line.startsWith("## 🖥️ Run Command Impact")) {
      inRunCommand = true;
      runCommandLines.push(line);
      continue;
    }
    if (inRunCommand && (line.startsWith("## ") || line.startsWith("*Report generated"))) {
      inRunCommand = false;
    }
    if (inRunCommand) {
      runCommandLines.push(line);
      continue;
    }

    if (line.startsWith("*Report generated")) {
      footerStart = i;
      break;
    }

    const m = line.match(prSectionRegex);
    if (m) {
      const category = m[1];
      const prNumber = parseInt(m[2]);
      const title = m[3];

      // Collect the section until next ### or ---
      let sectionStart = i;
      let sectionEnd = i;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("### ") || lines[j].startsWith("---") || lines[j].startsWith("## ")) {
          sectionEnd = j;
          break;
        }
      }
      
      const rawSection = lines.slice(sectionStart, sectionEnd).join("\n");

      // Extract merged date and author
      const mergedLine = rawSection.match(/\*\*Merged:\*\* (.+?) \|/);
      const authorLine = rawSection.match(/\*\*Author:\*\* @(\S+)/);

      entries.push({
        prNumber,
        category,
        title,
        mergedDate: mergedLine ? mergedLine[1] : "",
        author: authorLine ? authorLine[1] : "",
        rawSection,
      });
    }
  }

  // Also extract PR numbers from Notable Mentions and Run Command sections
  const notablePRs = extractPRNumbersFromSection(notableLines.join("\n"));
  const runCommandPRs = extractPRNumbersFromSection(runCommandLines.join("\n"));

  // Also check for PR references in descriptions (like "(Covered above...)" entries)
  // These are duplicate entries that just reference an earlier entry
  const coveredRefs: Set<number> = new Set();
  for (const entry of entries) {
    const coveredMatch = entry.rawSection.match(/\(Covered above/);
    if (coveredMatch) {
      coveredRefs.add(entry.prNumber);
    }
  }

  return {
    path: filePath,
    date,
    header: content.substring(0, content.indexOf("## 🔍 PR Details")),
    entries,
    footer: content.substring(content.lastIndexOf("*Report generated")),
    notableSection: notableLines.join("\n"),
    runCommandSection: runCommandLines.join("\n"),
    summaryLine: summaryStart,
    summaryEndLine: summaryEnd,
  };
}

function buildCategoryCounts(entries: PrEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    counts[cat] = 0;
  }
  for (const e of entries) {
    const cat = e.category;
    if (cat in counts) {
      counts[cat] = counts[cat] + 1;
    } else if (cat === "Bug Fix") {
      // Some reports use "Bug Fix" with space
      if ("Bug Fix" in counts) counts["Bug Fix"] = (counts["Bug Fix"] || 0) + 1;
      else counts[cat] = (counts[cat] || 0) + 1;
    } else {
      counts[cat] = (counts[cat] || 0) + 1;
    }
  }
  return counts;
}

function rebuildSummaryTable(entries: PrEntry[]): string {
  const counts = buildCategoryCounts(entries);
  let table = "## 📊 Summary\n\n";
  table += "| Metric | Count |\n";
  table += "|--------|-------|\n";
  table += `| PRs analyzed | ${entries.length} |\n`;
  
  // Include all categories that have entries, ordered by count desc
  const activeCats = Object.entries(counts)
    .filter(([_, c]) => c > 0)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [cat, count] of activeCats) {
    table += `| ${cat} PRs | ${count} |\n`;
  }
  
  return table;
}

// ── Main ──────────────────────────────────────────────────

function main() {
  // Get all report files sorted by date
  const reportFiles = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith(".md") && f.includes("llama-cpp-news"))
    .sort()
    .map(f => path.join(OUTPUT_DIR, f));

  console.log(`Found ${reportFiles.length} report files`);

  // Parse all reports
  const parsed = reportFiles.map(f => parseReport(f));
  
  // Also parse the book/src versions (they might be different after the daily workflow ran)
  const bookFiles = fs.readdirSync(BOOK_SRC)
    .filter(f => f.endsWith(".md") && f.includes("llama-cpp-news"))
    .sort()
    .map(f => path.join(BOOK_SRC, f));
  
  for (const bf of bookFiles) {
    const alreadyParsed = parsed.find(p => path.basename(p.path) === path.basename(bf));
    if (!alreadyParsed) {
      parsed.push(parseReport(bf));
    }
  }

  // Track seen PRs (earliest report wins)
  const seenPRs = new Map<number, string>(); // PR# -> report date
  const toRemove = new Map<string, Set<number>>(); // report path -> PRs to remove

  // Pass 1: build seenPRs, identify which report each PR belongs to
  for (const r of parsed) {
    for (const entry of r.entries) {
      if (!seenPRs.has(entry.prNumber)) {
        seenPRs.set(entry.prNumber, r.date);
      } else {
        // This PR was already seen in an earlier report
        if (!toRemove.has(r.path)) {
          toRemove.set(r.path, new Set());
        }
        toRemove.get(r.path)!.add(entry.prNumber);
      }
    }
  }

  // Print what we're removing
  console.log("\n=== Deduplication Plan ===");
  for (const [filePath, prs] of toRemove) {
    const fname = path.basename(filePath);
    console.log(`\n${fname}: removing ${prs.size} duplicate PRs: #${[...prs].sort((a,b)=>a-b).join(", #")}`);
  }

  // Pass 2: rebuild each report file
  for (const r of parsed) {
    const removeSet = toRemove.get(r.path) || new Set<number>();
    
    if (removeSet.size === 0) {
      continue; // no changes needed
    }

    const kept = r.entries.filter(e => !removeSet.has(e.prNumber));
    
    console.log(`\n--- Rebuilding ${path.basename(r.path)} ---`);
    console.log(`  Before: ${r.entries.length} PRs, After: ${kept.length} PRs`);
    console.log(`  Removed: ${r.entries.length - kept.length} duplicates`);

    // Rebuild the summary
    const newSummary = rebuildSummaryTable(kept);

    // Rebuild the PR details section
    const prDetailsHeader = "## 🔍 PR Details\n";
    const prEntries = kept.length > 0 
      ? kept.map(e => e.rawSection).join("\n\n") + "\n"
      : "*No new PRs to report today.*\n";

    // Handle Notable Mentions section - remove duplicate PRs from it
    let notableMentionsSection = r.notableSection;
    if (notableMentionsSection) {
      // Remove table rows containing removed PR numbers
      const notableLines = notableMentionsSection.split("\n");
      const filteredNotableLines = notableLines.filter(line => {
        for (const prNum of removeSet) {
          if (line.includes(`#${prNum}`)) {
            return false;
          }
        }
        // Also remove the Notable Mentions header if no mentions remain
        return true;
      });
      
      // Check if any actual mentions remain (skip header and separator lines)
      const mentionRows = filteredNotableLines.filter(l => l.startsWith("| #"));
      if (mentionRows.length === 0) {
        notableMentionsSection = ""; // Remove entire section
      } else {
        notableMentionsSection = filteredNotableLines.join("\n");
      }
    }

    // Handle Run Command section similarly
    let runCommandsSection = r.runCommandSection;
    if (runCommandsSection) {
      const rcLines = runCommandsSection.split("\n");
      const filteredRCLines = rcLines.filter(line => {
        for (const prNum of removeSet) {
          if (line.includes(`#${prNum}`)) {
            return false;
          }
        }
        return true;
      });
      const rcRows = filteredRCLines.filter(l => l.startsWith("| #"));
      if (rcRows.length === 0) {
        runCommandsSection = "";
      } else {
        runCommandsSection = filteredRCLines.join("\n");
      }
    }

    // Assemble the new content
    let newContent = r.header + "\n\n";
    
    // Replace the summary table (everything between ## 📊 Summary and the next ---)
    const headerLines = r.header.split("\n");
    const summaryStartIdx = headerLines.findIndex(l => l.startsWith("## 📊 Summary"));
    const summaryEndIdx = headerLines.findIndex((l, idx) => idx > summaryStartIdx && l.startsWith("---"));
    
    if (summaryStartIdx >= 0 && summaryEndIdx >= 0) {
      const before = headerLines.slice(0, summaryStartIdx).join("\n");
      const after = headerLines.slice(summaryEndIdx).join("\n");
      newContent = before + "\n" + newSummary + "\n" + after + "\n\n";
    }

    newContent += prDetailsHeader + "\n" + prEntries;
    
    if (notableMentionsSection) {
      newContent += notableMentionsSection + "\n\n";
    }
    
    if (runCommandsSection) {
      newContent += runCommandsSection + "\n\n";
    }
    
    newContent += r.footer;

    // Write back
    fs.writeFileSync(r.path, newContent, "utf-8");
    
    // Also update book/src copy if it exists
    const bookCopy = path.join(BOOK_SRC, path.basename(r.path));
    if (fs.existsSync(bookCopy)) {
      fs.writeFileSync(bookCopy, newContent, "utf-8");
    }
    
    console.log(`  ✅ Written to ${path.basename(r.path)}`);
  }

  // Print summary
  let totalDups = 0;
  for (const prs of toRemove.values()) {
    totalDups += prs.size;
  }
  console.log(`\n=== Done: removed ${totalDups} duplicate PR entries across all reports ===`);
}

main();
