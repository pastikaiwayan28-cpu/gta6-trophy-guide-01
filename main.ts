// Leonida Trophy Atlas — entrypoint.
// Validates the trophy data first (fail hard on anything wrong), then copies
// app/ and screenshots/ to the output directory and writes dossier.json
// with buildDossier from vendor/makefun-frontend.ts.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : "/output";

function fail(message: string): never {
  throw new Error("main.ts: " + message);
}

function nonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// --- Validate the trophy data before handing anything in. ---
const dataPath = join(repoRoot, "app", "data", "trophies.json");
if (!existsSync(dataPath)) fail("missing app/data/trophies.json");
const data = JSON.parse(readFileSync(dataPath, "utf8")) as {
  trophies?: Array<Record<string, unknown>>;
};
if (!Array.isArray(data.trophies)) fail("trophies.json has no trophies array");
const trophies = data.trophies;
if (trophies.length !== 55) fail("expected 55 trophies, found " + trophies.length);

const grades = ["platinum", "gold", "silver", "bronze"];
const kinds = ["story", "missable", "collectibles", "activities", "online"];
const seenIds = new Set<number>();
const gradeCounts: Record<string, number> = {};
let hiddenCount = 0;
const unconfirmedIds: number[] = [];
const missableIds: number[] = [];

for (const t of trophies) {
  if (typeof t.id !== "number" || !Number.isInteger(t.id)) fail("trophy with a bad id");
  if (seenIds.has(t.id)) fail("duplicate trophy id " + t.id);
  seenIds.add(t.id);
  if (!nonBlank(t.name)) fail("trophy " + t.id + " has a blank name");
  if (!nonBlank(t.description)) fail("trophy " + t.id + " has a blank description");
  if (!nonBlank(t.guide)) fail("trophy " + t.id + " has a blank guide");
  if (!nonBlank(t.source)) fail("trophy " + t.id + " has no source for its guide");
  if (typeof t.grade !== "string" || !grades.includes(t.grade)) {
    fail("trophy " + t.id + " has a bad grade");
  }
  gradeCounts[t.grade] = (gradeCounts[t.grade] ?? 0) + 1;
  if (typeof t.kind !== "string" || !kinds.includes(t.kind)) {
    fail("trophy " + t.id + " has a bad kind");
  }
  if (t.hidden === true) hiddenCount += 1;
  if (t.unconfirmed === true) unconfirmedIds.push(t.id);
  if (t.missable === true) missableIds.push(t.id);
}

for (let id = 1; id <= 55; id += 1) {
  if (!seenIds.has(id)) fail("missing trophy id " + id);
}
if (gradeCounts.platinum !== 1) fail("expected 1 platinum, found " + (gradeCounts.platinum ?? 0));
if (gradeCounts.gold !== 2) fail("expected 2 gold, found " + (gradeCounts.gold ?? 0));
if (gradeCounts.silver !== 6) fail("expected 6 silver, found " + (gradeCounts.silver ?? 0));
if (gradeCounts.bronze !== 46) fail("expected 46 bronze, found " + (gradeCounts.bronze ?? 0));
if (hiddenCount !== 28) fail("expected 28 hidden trophies, found " + hiddenCount);
if (JSON.stringify(unconfirmedIds) !== JSON.stringify([44, 45, 49, 50, 51])) {
  fail("unconfirmed trophies must be exactly 44, 45, 49, 50, 51, found " + unconfirmedIds.join(","));
}
if (JSON.stringify(missableIds) !== JSON.stringify([28])) {
  fail("the only missable trophy must be 28, found " + missableIds.join(","));
}

// --- Validate the screenshots: 3 or 4 real renders, each at most 256 KiB. ---
const shotsDir = join(repoRoot, "screenshots");
if (!existsSync(shotsDir)) fail("missing screenshots/ directory");
const shots = readdirSync(shotsDir)
  .filter((name) => !name.startsWith("."))
  .sort();
if (shots.length < 3 || shots.length > 4) {
  fail("expected 3 or 4 screenshots, found " + shots.length);
}
for (const shot of shots) {
  if (!/\.(png|jpe?g)$/i.test(shot)) fail("screenshot " + shot + " is not a PNG or JPEG");
  const size = statSync(join(shotsDir, shot)).size;
  if (size > 262144) fail("screenshot " + shot + " is " + size + " bytes, over the 256 KiB cap");
}

// --- Hand the guide in. ---
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });

const dossier = await buildDossier(repoRoot, {
  text_max_bytes: 50331648,
  image_max_bytes: 262144,
  max_images: 4,
  dossier_max_bytes: 1572864,
});
writeFileSync(join(outDir, "dossier.json"), dossier);

console.log(
  "Leonida Trophy Atlas: 55 trophies validated (1 platinum, 2 gold, 6 silver, 46 bronze, " +
    "28 hidden, 5 unconfirmed, 1 missable), " + shots.length + " screenshots (" +
    shots.join(", ") + "), and dossier written to " + outDir + "/dossier.json",
);
