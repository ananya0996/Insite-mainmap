import { readFile } from "node:fs/promises";
import path from "node:path";
import * as shapefile from "shapefile";
import {
  buildOccupancyByYear,
  normalizeZcta,
  parseOccupancyCSV,
} from "@/lib/occupancy-parser";
import { loadScorecard } from "@/lib/scorecard-loader";

type FeatureGeometry = {
  type: string;
  coordinates: unknown;
};

type ChoroplethFeature = {
  type: "Feature";
  geometry: FeatureGeometry;
  properties: Record<string, string | number>;
};

export type ChoroplethFeatureCollection = {
  type: "FeatureCollection";
  features: ChoroplethFeature[];
};

export type OccupancyChoroplethPayload = {
  years: number[];
  geojson: ChoroplethFeatureCollection;
};

let cachedPayload: OccupancyChoroplethPayload | null = null;

const COORD_PRECISION = 3;
const MAX_RING_POINTS = 50;

function round(n: number): number {
  const factor = 10 ** COORD_PRECISION;
  return Math.round(n * factor) / factor;
}

function simplifyRing(ring: number[][]): number[][] {
  if (ring.length <= MAX_RING_POINTS) {
    return ring.map(([lng, lat]) => [round(lng), round(lat)]);
  }
  const step = (ring.length - 1) / (MAX_RING_POINTS - 1);
  const result: number[][] = [];
  for (let i = 0; i < MAX_RING_POINTS - 1; i++) {
    const [lng, lat] = ring[Math.round(i * step)];
    result.push([round(lng), round(lat)]);
  }
  result.push([result[0][0], result[0][1]]);
  return result;
}

function simplifyGeometry(geom: FeatureGeometry): FeatureGeometry {
  if (geom.type === "Polygon") {
    const coords = geom.coordinates as number[][][];
    return { type: "Polygon", coordinates: coords.map(simplifyRing) };
  }
  if (geom.type === "MultiPolygon") {
    const coords = geom.coordinates as number[][][][];
    return {
      type: "MultiPolygon",
      coordinates: coords.map((polygon) => polygon.map(simplifyRing)),
    };
  }
  return geom;
}

function getFeatureZcta(properties: Record<string, unknown>): string | null {
  const prioritizedKeys = [
    "ZCTA5CE20",
    "GEOID20",
    "ZCTA5CE10",
    "GEOID10",
    "ZCTA5CE",
    "GEOID",
  ];

  for (const key of prioritizedKeys) {
    const value = properties[key];
    if (typeof value === "string" || typeof value === "number") {
      return normalizeZcta(value);
    }
  }

  for (const [key, value] of Object.entries(properties)) {
    if (!/(zcta|geoid)/i.test(key)) continue;
    if (typeof value === "string" || typeof value === "number") {
      return normalizeZcta(value);
    }
  }

  return null;
}

export async function loadOccupancyChoroplethPayload(): Promise<OccupancyChoroplethPayload> {
  if (cachedPayload) return cachedPayload;

  const csvPath = path.join(
    process.cwd(),
    "dataset_extraction",
    "census_data_output",
    "B25002_occupancy_status_zcta.csv",
  );
  const shpPath = path.join(
    process.cwd(),
    "dataset_extraction",
    "zcta_boundaries",
    "tl_2025_us_zcta520.shp",
  );

  const csvText = await readFile(csvPath, "utf8");
  const rows = parseOccupancyCSV(csvText);
  const occupancyByYear = buildOccupancyByYear(rows);
  const years = Object.keys(occupancyByYear)
    .map((y) => Number(y))
    .sort((a, b) => a - b);

  const knownZctas = new Set<string>();
  for (const yearMap of Object.values(occupancyByYear)) {
    for (const z of Object.keys(yearMap)) knownZctas.add(z);
  }

  const dbfPath = shpPath.replace(/\.shp$/i, ".dbf");
  const shpBuf = await readFile(shpPath);
  const dbfBuf = await readFile(dbfPath);

  const shpAB = shpBuf.buffer.slice(
    shpBuf.byteOffset,
    shpBuf.byteOffset + shpBuf.byteLength,
  );
  const dbfAB = dbfBuf.buffer.slice(
    dbfBuf.byteOffset,
    dbfBuf.byteOffset + dbfBuf.byteLength,
  );

  const collection = await shapefile.read(shpAB, dbfAB);
  const scorecard = await loadScorecard();

  const features: ChoroplethFeature[] = [];
  for (const feature of collection.features) {
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const zcta = getFeatureZcta(props);
    if (!zcta || !feature.geometry) continue;
    if (!knownZctas.has(zcta) && !scorecard.has(zcta)) continue;

    const featureProperties: Record<string, string | number> = { zcta };
    for (const year of years) {
      const yearData = occupancyByYear[year]?.[zcta];
      featureProperties[`t_${year}`] = yearData?.total_units ?? 0;
      featureProperties[`o_${year}`] = yearData?.occupied_units ?? 0;
      featureProperties[`v_${year}`] = yearData?.vacant_units ?? 0;
    }

    const sc = scorecard.get(zcta);
    featureProperties.target_score = sc?.targetScore2024 ?? 0;
    featureProperties.investment_score = sc?.investmentScore ?? 0;
    featureProperties.forecast_2030 = sc?.forecastScore2030 ?? 0;
    featureProperties.forecast_growth = sc?.forecastGrowthPct ?? 0;
    featureProperties.median_income = sc?.medianIncome2544 ?? 0;
    featureProperties.vacancy_rate = sc?.vacancyRatePct ?? 0;

    features.push({
      type: "Feature",
      geometry: simplifyGeometry(feature.geometry as FeatureGeometry),
      properties: featureProperties,
    });
  }

  cachedPayload = {
    years,
    geojson: { type: "FeatureCollection", features },
  };

  return cachedPayload;
}
