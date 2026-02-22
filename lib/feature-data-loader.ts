import { readFile } from "node:fs/promises";
import path from "node:path";
import { FEATURE_DEFINITIONS, type FeatureDefinition } from "./feature-definitions";

export type FeatureTimeSeries = Record<string, Record<number, number>>;

const cache = new Map<string, Map<string, Map<number, number>>>();

function parseNum(v: string | undefined): number {
  if (!v || v.trim() === "") return 0;
  const n = parseFloat(v.trim());
  if (isNaN(n) || n < 0) return 0;
  return n;
}

async function loadCSV(
  fileName: string,
): Promise<{ headers: string[]; rows: string[][] }> {
  const csvPath = path.join(
    process.cwd(),
    "dataset_extraction",
    "census_data_output",
    fileName,
  );
  const text = await readFile(csvPath, "utf8");
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(","));
  return { headers, rows };
}

function normalizeZcta(z: string): string {
  const s = z.trim();
  return s.length >= 5 ? s.slice(0, 5) : s.padStart(5, "0");
}

async function ensureLoaded(def: FeatureDefinition): Promise<void> {
  if (cache.has(def.id)) return;

  const { headers, rows } = await loadCSV(def.csvFile);

  const zctaIdx = headers.indexOf("zcta");
  const yearIdx = headers.indexOf("year");
  const colIndices = def.columns.map((c) => headers.indexOf(c));

  const byZcta = new Map<string, Map<number, number>>();

  for (const values of rows) {
    const zcta = normalizeZcta(values[zctaIdx] ?? "");
    const year = parseInt(values[yearIdx] ?? "", 10);
    if (!zcta || isNaN(year)) continue;

    let val = 0;
    for (const ci of colIndices) {
      if (ci < 0) continue;
      val += parseNum(values[ci]);
    }

    if (!byZcta.has(zcta)) byZcta.set(zcta, new Map());
    byZcta.get(zcta)!.set(year, val);
  }

  cache.set(def.id, byZcta);
}

export async function getFeatureTimeSeries(
  featureIds: string[],
  zcta: string,
): Promise<Record<string, { year: number; value: number }[]>> {
  const normalizedZcta = normalizeZcta(zcta);
  const result: Record<string, { year: number; value: number }[]> = {};

  for (const fid of featureIds) {
    const def = FEATURE_DEFINITIONS.find((d) => d.id === fid);
    if (!def) {
      result[fid] = [];
      continue;
    }

    await ensureLoaded(def);
    const byZcta = cache.get(fid);
    const yearMap = byZcta?.get(normalizedZcta);

    if (!yearMap) {
      result[fid] = [];
      continue;
    }

    const series = Array.from(yearMap.entries())
      .map(([year, value]) => ({ year, value }))
      .sort((a, b) => a.year - b.year);

    result[fid] = series;
  }

  return result;
}
