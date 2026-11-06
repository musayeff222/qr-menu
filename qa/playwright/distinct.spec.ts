import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { test, expect } from "@playwright/test";
import { SKIN_IDS, VIEWPORTS } from "./skins";

test("375px screenshots are unique files (not the same layout recolored only as identical pixels)", async () => {
  const dir = path.resolve("qa/playwright/shots");
  const hashes = new Map<string, string>();
  for (const skin of SKIN_IDS) {
    const file = path.join(dir, `${skin}__375.png`);
    expect(fs.existsSync(file), `missing ${skin}__375.png — run visual.spec first`).toBeTruthy();
    const buf = fs.readFileSync(file);
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    const dup = [...hashes.entries()].find(([, h]) => h === hash);
    expect(dup, `identical screenshot: ${skin} == ${dup?.[0]}`).toBeFalsy();
    hashes.set(skin, hash);
  }
});

test("layout fingerprints are unique per skin", async () => {
  const dir = path.resolve("qa/playwright/fingerprints");
  const layouts = new Map<string, string>();
  for (const skin of SKIN_IDS) {
    const file = path.join(dir, `${skin}.json`);
    expect(fs.existsSync(file), `no fingerprint for ${skin}`).toBeTruthy();
    const fp = JSON.parse(fs.readFileSync(file, "utf8")) as {
      skin: string;
      marker: string;
      layout: string;
      primary: string;
      bg: string;
    };
    expect(fp.marker).toBe(`skin-${skin}`);
    const prev = layouts.get(fp.layout);
    expect(prev, `same layout fingerprint: ${skin} == ${prev}`).toBeFalsy();
    layouts.set(fp.layout, skin);
  }
});

test("overflow records exist for every skin × viewport", async () => {
  const dir = path.resolve("qa/playwright/overflows");
  const expected = SKIN_IDS.length * VIEWPORTS.length;
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
  expect(files.length, `overflow shards ${files.length}/${expected}`).toBe(expected);
  const merged: Record<string, number> = {};
  for (const file of files) {
    const key = file.replace(/\.json$/, "");
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as { extra?: number };
    merged[key] = Number(data.extra || 0);
  }
  fs.writeFileSync(path.resolve("qa/playwright/overflows.json"), JSON.stringify(merged, null, 2));
  expect(Object.keys(merged)).toHaveLength(expected);
});
