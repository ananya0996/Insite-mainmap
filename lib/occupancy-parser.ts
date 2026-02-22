/**
 * Parser for B25002 occupancy status ZCTA census data.
 * Columns: zcta, year, total_units, occupied_units, vacant_units
 */

export interface OccupancyRow {
  zcta: string;
  year: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
}

export interface OccupancyByYear {
  [zcta: string]: {
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    normalized: number; // 0–1 min-max normalized
  };
}

export type OccupancyDataByYear = Record<number, OccupancyByYear>;

/** Parse raw CSV text into OccupancyRow array */
export function parseOccupancyCSV(csvText: string): OccupancyRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: OccupancyRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string | number> = {};
    headers.forEach((h, j) => {
      const v = values[j]?.trim() ?? '';
      if (h === 'year') row[h] = parseInt(v, 10);
      else if (['total_units', 'occupied_units', 'vacant_units'].includes(h))
        row[h] = parseInt(v, 10) || 0;
      else row[h] = v;
    });
    rows.push(row as unknown as OccupancyRow);
  }
  return rows;
}

/** Normalize ZCTA code to 5-digit string (e.g., "601" -> "00601") */
export function normalizeZcta(zcta: string | number): string {
  const s = String(zcta).trim();
  return s.length >= 5 ? s.slice(0, 5) : s.padStart(5, '0');
}

/** Build data by year with min-max normalized total_units per year */
export function buildOccupancyByYear(rows: OccupancyRow[]): OccupancyDataByYear {
  const byYear: Record<number, { zcta: string; total_units: number; occupied_units: number; vacant_units: number }[]> = {};

  for (const row of rows) {
    const zcta = normalizeZcta(row.zcta);
    if (!byYear[row.year]) byYear[row.year] = [];
    byYear[row.year].push({
      zcta,
      total_units: row.total_units,
      occupied_units: row.occupied_units,
      vacant_units: row.vacant_units,
    });
  }

  const result: OccupancyDataByYear = {} as OccupancyDataByYear;

  for (const [yearStr, entries] of Object.entries(byYear)) {
    const year = parseInt(yearStr, 10);
    const values = entries.map((e) => e.total_units);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const byZcta: OccupancyByYear = {};
    for (const { zcta, total_units, occupied_units, vacant_units } of entries) {
      byZcta[zcta] = {
        total_units,
        occupied_units,
        vacant_units,
        normalized: (total_units - min) / range,
      };
    }
    result[year] = byZcta;
  }
  return result;
}
