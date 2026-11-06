import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("qa/playwright");
const OV_DIR = path.join(ROOT, "overflows");
fs.mkdirSync(OV_DIR, { recursive: true });

const merged = {};
for (const file of fs.readdirSync(OV_DIR).filter((f) => f.endsWith(".json"))) {
  const key = file.replace(/\.json$/, "");
  const data = JSON.parse(fs.readFileSync(path.join(OV_DIR, file), "utf8"));
  merged[key] = typeof data.extra === "number" ? data.extra : data;
}

fs.writeFileSync(path.join(ROOT, "overflows.json"), JSON.stringify(merged, null, 2));

const expected = 30 * 7;
const summary = {
  overflowKeys: Object.keys(merged).length,
  overflowExpected: expected,
  overflowComplete: Object.keys(merged).length === expected,
  resultsExists: fs.existsSync(path.join(ROOT, "results.json")),
};
fs.writeFileSync(path.join(ROOT, "qa-summary.json"), JSON.stringify(summary, null, 2));
console.log("overflow keys", summary.overflowKeys, "/", expected);
