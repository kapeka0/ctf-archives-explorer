#!/usr/bin/env node
/**
 * Generates the static CTF dataset for the site from a blobless clone of
 * https://github.com/sajjadium/ctf-archives
 *
 * Usage:
 *   node scripts/build-data.mjs [path-to-clone]
 *
 * If no clone exists at the given path (default /tmp/ctf-archives), it is
 * created with `git clone --filter=blob:none --no-checkout` (tree only,
 * no challenge files are downloaded).
 *
 * Output:
 *   data/generated/index.json        – list of CTFs with per-year counts
 *   data/generated/ctfs/<slug>.json  – detail per CTF (years > categories > challenges)
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLONE = process.argv[2] ?? "/tmp/ctf-archives";
const REPO = "https://github.com/sajjadium/ctf-archives";

if (!existsSync(join(CLONE, ".git"))) {
  console.log(`Cloning tree of ${REPO} into ${CLONE} ...`);
  execSync(`git clone --depth 1 --filter=blob:none --no-checkout ${REPO} ${CLONE}`, {
    stdio: "inherit",
  });
}

const git = (args) =>
  execFileSync("git", args, {
    cwd: CLONE,
    maxBuffer: 1024 * 1024 * 512,
    encoding: "utf8",
  });

console.log("Listing repository tree ...");
// -z: NUL-separated raw paths, no C-style quoting of special characters.
const allFiles = git(["ls-tree", "-r", "--name-only", "-z", "HEAD:ctfs"]).split("\0").filter(Boolean);
console.log(`${allFiles.length} files in ctfs/`);

// CTFtime links live in README.md files at the CTF and year level.
const ctftime = new Map(); // "ctf" or "ctf/year" -> url
try {
  // -z: the path is NUL-terminated and not quoted.
  const grep = git(["grep", "-I", "-z", "-e", "ctftime.org", "HEAD:ctfs", "--", "*README.md"]);
  for (const line of grep.split("\n")) {
    // HEAD:ctfs:0CTF/README.md\0[CTFtime Page](https://ctftime.org/ctf/99)
    const nul = line.indexOf("\0");
    if (nul === -1) continue;
    const path = line.slice("HEAD:ctfs:".length, nul);
    const m = line.slice(nul + 1).match(/https:\/\/ctftime\.org\/[^\s)"]+/);
    if (m && path.endsWith("/README.md")) ctftime.set(path.slice(0, -"/README.md".length), m[0]);
  }
} catch {
  console.warn("git grep for ctftime links failed; continuing without them");
}
console.log(`${ctftime.size} CTFtime links found`);

// Round directories that add an extra nesting level between year and category.
const ROUNDS = new Set([
  "quals",
  "qual",
  "qualifier",
  "qualifiers",
  "prequals",
  "prequal",
  "finals",
  "final",
  "semifinals",
  "semifinal",
  "teaser",
  "online",
  "onsite",
]);

// ctf -> year -> array of path-parts relative to the year dir
const tree = new Map();
for (const file of allFiles) {
  const parts = file.split("/");
  if (parts.length < 3) continue; // README.md at ctf level or stray files
  const [ctf, year, ...rest] = parts;
  let years = tree.get(ctf);
  if (!years) tree.set(ctf, (years = new Map()));
  let files = years.get(year);
  if (!files) years.set(year, (files = []));
  files.push(rest);
}

const isReadme = (name) => /^readme(\.|$)/i.test(name);

/**
 * Turn a list of path-parts (relative to some directory) into challenges.
 * Layouts found in the archive:
 *   category/challenge/files...   (the common case)
 *   round/category/challenge/...  (Quals / Finals layers)
 *   challenge/files...            (no category layer)
 */
function collectChallenges(paths, prefix, catPrefix) {
  const byFirst = new Map();
  for (const p of paths) {
    if (p.length === 1) continue; // file at this level (README etc.)
    let bucket = byFirst.get(p[0]);
    if (!bucket) byFirst.set(p[0], (bucket = []));
    bucket.push(p.slice(1));
  }

  const challenges = [];
  for (const [name, sub] of byFirst) {
    const dirPath = `${prefix}/${name}`;
    const directFiles = sub.filter((p) => p.length === 1).map((p) => p[0]);
    const hasRealFiles = directFiles.some((f) => !isReadme(f));
    const hasSubDirs = sub.some((p) => p.length > 1);

    if (ROUNDS.has(name.toLowerCase()) && hasSubDirs && !hasRealFiles) {
      // Round layer: recurse, prefixing categories with the round name.
      challenges.push(...collectChallenges(sub, dirPath, catPrefix ? `${catPrefix} ${name}` : name));
    } else if (hasRealFiles || !hasSubDirs) {
      // Directory with its own files (or nothing but a README):
      // a challenge sitting directly at this level, without a category dir.
      challenges.push({
        name,
        category: catPrefix || "misc",
        path: dirPath,
        files: sub.length,
      });
    } else {
      // Category directory: its subdirectories are challenges.
      const byChal = new Map();
      for (const p of sub) {
        if (p.length === 1) continue; // category-level README
        let bucket = byChal.get(p[0]);
        if (!bucket) byChal.set(p[0], (bucket = []));
        bucket.push(p.slice(1));
      }
      const category = catPrefix ? `${catPrefix} ${name}` : name;
      for (const [chal, chalFiles] of byChal) {
        challenges.push({
          name: chal,
          category,
          path: `${dirPath}/${chal}`,
          files: chalFiles.length,
        });
      }
    }
  }
  return challenges;
}

const slugify = (name) => {
  const s = name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^\.+/, "");
  return s || "ctf";
};

const outDir = join(ROOT, "data", "generated");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, "ctfs"), { recursive: true });

const index = [];
const usedSlugs = new Set();
let totalChallenges = 0;
let totalEvents = 0;

for (const [ctf, years] of [...tree.entries()].sort(([a], [b]) => a.localeCompare(b, "en", { sensitivity: "base" }))) {
  let slug = slugify(ctf);
  while (usedSlugs.has(slug)) slug += "-x";
  usedSlugs.add(slug);

  const detailYears = [];
  for (const [year, files] of [...years.entries()].sort(([a], [b]) => b.localeCompare(a))) {
    const challenges = collectChallenges(files, `${ctf}/${year}`, "").sort(
      (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
    if (challenges.length === 0) continue;

    const categories = new Map();
    for (const c of challenges) categories.set(c.category, (categories.get(c.category) ?? 0) + 1);

    detailYears.push({
      year,
      ctftime: ctftime.get(`${ctf}/${year}`) ?? null,
      challenges,
      categories: [...categories.entries()].map(([name, count]) => ({ name, count })),
    });
    totalEvents++;
    totalChallenges += challenges.length;
  }
  if (detailYears.length === 0) continue;

  const allCats = [...new Set(detailYears.flatMap((y) => y.categories.map((c) => c.name)))];
  const count = detailYears.reduce((n, y) => n + y.challenges.length, 0);

  writeFileSync(
    join(outDir, "ctfs", `${slug}.json`),
    JSON.stringify({
      name: ctf,
      slug,
      ctftime: ctftime.get(ctf) ?? null,
      years: detailYears,
    })
  );

  index.push({
    slug,
    name: ctf,
    years: detailYears.map((y) => y.year),
    count,
    categories: allCats.slice(0, 6),
  });
}

writeFileSync(
  join(outDir, "index.json"),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    stats: { ctfs: index.length, events: totalEvents, challenges: totalChallenges },
    ctfs: index,
  })
);

console.log(`Done: ${index.length} CTFs, ${totalEvents} events, ${totalChallenges} challenges.`);
