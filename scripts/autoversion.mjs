#!/usr/bin/env node
/**
 * Sovereign Auto-Versioner
 * No third-party services. No release-please. No googleapis.
 * The system reads itself and decides its own version.
 *
 * Rules:
 *   feat!  or BREAKING CHANGE in body → major
 *   feat   → minor
 *   fix / perf / refactor / security  → patch
 *   chore / docs / ci / style / test  → no bump
 *
 * Bonus signal: counts registered tools in src/tools/*.ts
 * If tool count grew by ≥5 since last tag → forces minor even if commits say patch.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}

function currentVersion() {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
  return pkg.version;
}

function lastTag() {
  try {
    return run("git describe --tags --abbrev=0");
  } catch {
    return null;
  }
}

function commitsSinceTag(tag) {
  const range = tag ? `${tag}..HEAD` : "HEAD";
  const log = run(`git log ${range} --pretty=format:"%s|||%b|||END"`);
  if (!log) return [];
  return log
    .split("|||END")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [subject, body = ""] = entry.split("|||");
      return { subject: subject.trim(), body: body.trim() };
    });
}

function countTools() {
  try {
    const out = run(
      `grep -r "registerTool(" ${resolve(ROOT, "src/tools")} --include="*.ts" -l`
    );
    const files = out.split("\n").filter(Boolean).length;
    const total = run(
      `grep -r "registerTool(" ${resolve(ROOT, "src/tools")} --include="*.ts" | wc -l`
    );
    return { files, total: parseInt(total, 10) };
  } catch {
    return { files: 0, total: 0 };
  }
}

function countToolsAtTag(tag) {
  if (!tag) return 0;
  try {
    const out = run(
      `git show ${tag}:src/tools/index.ts 2>/dev/null | grep -c "registerTool(" || echo 0`
    );
    return parseInt(out, 10);
  } catch {
    return 0;
  }
}

function decideBump(commits, toolDelta) {
  let bump = null; // null = no release

  for (const { subject, body } of commits) {
    const text = subject + "\n" + body;

    if (/BREAKING CHANGE/i.test(text) || /^[a-z]+!:/.test(subject)) {
      return "major"; // immediate, can't go higher
    }

    if (/^feat(\([^)]+\))?:/.test(subject)) {
      bump = "minor";
    } else if (
      /^(fix|perf|refactor|security)(\([^)]+\))?:/.test(subject) &&
      bump !== "minor"
    ) {
      bump = "patch";
    }
    // chore/docs/ci/style/test → leave bump as-is
  }

  // Tool count signal: ≥5 new tools forces at least minor
  if (toolDelta >= 5 && bump === "patch") {
    console.log(
      `  ↑ tool delta ${toolDelta} ≥ 5, upgrading patch → minor`
    );
    bump = "minor";
  }

  return bump;
}

function applyBump(version, bump) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
  return version;
}

function bumpPackageJson(newVersion) {
  const path = resolve(ROOT, "package.json");
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  pkg.version = newVersion;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
}

function bumpServerJson(newVersion) {
  const path = resolve(ROOT, "server.json");
  try {
    const s = JSON.parse(readFileSync(path, "utf8"));
    s.version = newVersion;
    if (Array.isArray(s.packages) && s.packages[0]) {
      s.packages[0].version = newVersion;
    }
    writeFileSync(path, JSON.stringify(s, null, 2) + "\n");
  } catch {
    // server.json is optional
  }
}

function buildChangelog(commits, version, date) {
  const feat = commits.filter((c) => /^feat(\([^)]+\))?:/.test(c.subject));
  const fix = commits.filter((c) =>
    /^(fix|perf|refactor|security)(\([^)]+\))?:/.test(c.subject)
  );
  const other = commits.filter(
    (c) => !feat.includes(c) && !fix.includes(c)
  );

  const lines = [`## ${version} — ${date}\n`];
  if (feat.length) {
    lines.push("### Features");
    feat.forEach((c) => lines.push(`- ${c.subject}`));
  }
  if (fix.length) {
    lines.push("\n### Fixes");
    fix.forEach((c) => lines.push(`- ${c.subject}`));
  }
  if (other.length) {
    lines.push("\n### Other");
    other.forEach((c) => lines.push(`- ${c.subject}`));
  }
  return lines.join("\n") + "\n";
}

function prependChangelog(entry) {
  const path = resolve(ROOT, "CHANGELOG.md");
  let existing = "";
  try {
    existing = readFileSync(path, "utf8");
  } catch {
    existing = "# Changelog\n\n";
  }
  // Insert after first line (# Changelog header)
  const lines = existing.split("\n");
  const headerEnd = lines.findIndex((l) => l.startsWith("# ")) + 1;
  lines.splice(headerEnd + 1, 0, entry);
  writeFileSync(path, lines.join("\n"));
}

// ─── main ────────────────────────────────────────────────────────────────────

const dryRun = process.argv.includes("--dry-run");
const skipGit = process.argv.includes("--no-git");

const tag = lastTag();
const version = currentVersion();
const commits = commitsSinceTag(tag);
const toolsNow = countTools();
const toolsBefore = countToolsAtTag(tag);
const toolDelta = toolsNow.total - toolsBefore;

console.log(`\n🐋 Flying Whale Sovereign Auto-Versioner`);
console.log(`   current : ${version}`);
console.log(`   last tag: ${tag ?? "none"}`);
console.log(`   commits : ${commits.length} since last tag`);
console.log(`   tools   : ${toolsNow.total} now | ${toolsBefore} at tag | Δ${toolDelta}`);

if (commits.length === 0) {
  console.log("\n✓ Nothing to release — no commits since last tag.");
  process.exit(0);
}

const bump = decideBump(commits, toolDelta);

if (!bump) {
  console.log(
    "\n✓ No release — commits are chore/docs/ci only."
  );
  process.exit(0);
}

const newVersion = applyBump(version, bump);
const date = new Date().toISOString().slice(0, 10);

console.log(`\n  bump: ${bump.toUpperCase()}  →  ${version} ➜ ${newVersion}`);

if (dryRun) {
  console.log("\n[dry-run] No files written, no git commits.");
  process.exit(0);
}

// Write version files
bumpPackageJson(newVersion);
bumpServerJson(newVersion);

// Write changelog
const entry = buildChangelog(commits, newVersion, date);
prependChangelog(entry);

console.log(`  ✓ package.json → ${newVersion}`);
console.log(`  ✓ CHANGELOG.md updated`);

if (!skipGit) {
  run(`git add package.json server.json CHANGELOG.md`);
  run(
    `git commit -m "chore: release ${newVersion}" --no-verify || true`
  );
  run(`git tag v${newVersion}`);
  run(`git push && git push --tags`);
  console.log(`  ✓ tag v${newVersion} pushed`);
}

console.log(`\n🚀 Released ${newVersion}\n`);
