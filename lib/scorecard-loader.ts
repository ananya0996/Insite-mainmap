import { readFile } from "node:fs/promises";
import path from "node:path";

export type ScorecardByZcta = Map<string, {
  targetScore2024: number;
  investmentScore: number;
  forecastScore2030: number;
  forecastGrowthPct: number;
  medianIncome2544: number;
  vacancyRatePct: number;
}>;

let cached: ScorecardByZcta | null = null;

function normalizeZcta(z: string): string {
  const s = z.trim();
  return s.length >= 5 ? s.slice(0, 5) : s.padStart(5, "0");
}

function num(v: string | undefined): number {
  if (!v || v.trim() === "") return 0;
  const n = parseFloat(v.trim());
  return isNaN(n) || n < 0 ? 0 : n;
}

export async function loadScorecard(): Promise<ScorecardByZcta> {
  if (cached) return cached;

  const csvPath = path.join(
    process.cwd(),
    "dataset_extraction",
    "census_data_output",
    "builder_scorecard.csv",
  );
  const text = await readFile(csvPath, "utf8");
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const col = (name: string) => headers.indexOf(name);
  const iZip = col("ZIP_CODE");
  const iTarget = col("TARGET_SCORE_2024");
  const iInvest = col("INVESTMENT_SCORE");
  const iForecast = col("FORECAST_SCORE_2030");
  const iGrowth = col("FORECAST_GROWTH_PCT_TO_2030");
  const iIncome = col("MEDIAN_INCOME_25_44");
  const iVacancy = col("VACANCY_RATE_PCT");

  const map: ScorecardByZcta = new Map();

  for (let i = 1; i < lines.length; i++) {
    const v = lines[i].split(",");
    const rawZip = v[iZip]?.trim();
    if (!rawZip) continue;
    const zcta = normalizeZcta(rawZip.replace(/\.0$/, ""));

    map.set(zcta, {
      targetScore2024: num(v[iTarget]),
      investmentScore: num(v[iInvest]),
      forecastScore2030: num(v[iForecast]),
      forecastGrowthPct: num(v[iGrowth]),
      medianIncome2544: num(v[iIncome]),
      vacancyRatePct: num(v[iVacancy]),
    });
  }

  cached = map;
  return map;
}
