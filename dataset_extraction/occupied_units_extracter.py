"""
Census B25002 - Occupancy Status (Occupied / Vacant Housing Units)
Geography: ZCTA (ZIP Code Tabulation Area)
Output: CSV with columns → zcta, year, total_units, occupied_units, vacant_units
"""

import os
import time
import requests
import pandas as pd

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────
API_KEY     = "b48e8ca5fdf019c82fb5202ef4944251cdd45deb"
OUTPUT_DIR  = "./census_data_output"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "B25002_occupancy_status_zcta.csv")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ACS 5-Year estimates are available from 2009 → 2026 for ZCTAs
ACS_YEARS = list(range(2009, 2026))

# B25002 variable definitions
VARIABLES = {
    "B25002_001E": "total_units",
    "B25002_002E": "occupied_units",
    "B25002_003E": "vacant_units",
}

# ─────────────────────────────────────────────
# DOWNLOAD
# ─────────────────────────────────────────────
def download_b25002():
    all_frames = []
    base_url   = "https://api.census.gov/data"
    var_string = ",".join(VARIABLES.keys())   # e.g. "B25002_001E,B25002_002E,B25002_003E"

    for year in ACS_YEARS:
        url    = f"{base_url}/{year}/acs/acs5"
        params = {
            "get": var_string,
            "for": "zip code tabulation area:*",
            "key": API_KEY,
        }

        print(f"Fetching B25002 for {year} ...")
        try:
            resp = requests.get(url, params=params, timeout=60)

            if resp.status_code != 200:
                print(f"  ⚠  Skipped {year}: HTTP {resp.status_code} — {resp.text[:200]}")
                continue

            data    = resp.json()
            headers = data[0]
            rows    = data[1:]

            df = pd.DataFrame(rows, columns=headers)

            # Rename geography column and add year
            df.rename(columns={"zip code tabulation area": "zcta"}, inplace=True)
            df["year"] = year

            # Rename raw variable codes → readable column names
            df.rename(columns=VARIABLES, inplace=True)

            # Keep only the columns we care about
            df = df[["zcta", "year", "total_units", "occupied_units", "vacant_units"]]

            # Cast numeric columns (Census returns everything as strings)
            for col in ["total_units", "occupied_units", "vacant_units"]:
                df[col] = pd.to_numeric(df[col], errors="coerce")

            all_frames.append(df)
            print(f"  ✓  {year}: {len(df):,} ZCTAs")
            time.sleep(0.4)   # be polite to the API

        except Exception as e:
            print(f"  ⚠  Skipped {year}: {e}")

    if not all_frames:
        print("No data collected. Check your API key or network connection.")
        return pd.DataFrame()

    return pd.concat(all_frames, ignore_index=True)


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    print("=" * 55)
    print("B25002 — Occupancy Status  |  ZCTA Level  |  All Years")
    print("=" * 55)

    df = download_b25002()

    if df.empty:
        return

    df.to_csv(OUTPUT_FILE, index=False)

    print(f"\n{'─' * 55}")
    print(f"Saved → {os.path.abspath(OUTPUT_FILE)}")
    print(f"Total rows  : {len(df):,}")
    print(f"Years       : {sorted(df['year'].unique())}")
    print(f"Unique ZCTAs: {df['zcta'].nunique():,}")
    print(f"\nSample (first 5 rows):")
    print(df.head().to_string(index=False))


if __name__ == "__main__":
    main()