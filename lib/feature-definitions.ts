export interface FeatureDefinition {
  id: string;
  label: string;
  group: string;
  csvFile: string;
  columns: string[];
  aggregation: "direct" | "sum";
  color: string;
  unit: string;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    id: "median_income_25_44",
    label: "Median Income (25-44 yr)",
    group: "Income",
    csvFile: "S1903_Median_Income_zcta_all_years.csv",
    columns: ["median_income_householder_age_25_44"],
    aggregation: "direct",
    color: "#4a90d9",
    unit: "$",
  },
  {
    id: "population_25_44",
    label: "Population % (25-44 yr)",
    group: "Population",
    csvFile: "S0101_Population_zcta_all_years.csv",
    columns: [
      "pct_total_age_25_29",
      "pct_total_age_30_34",
      "pct_total_age_35_39",
      "pct_total_age_40_44",
    ],
    aggregation: "sum",
    color: "#e5963b",
    unit: "%",
  },
  {
    id: "commute_under_30",
    label: "Commute < 30 min",
    group: "Travel Time",
    csvFile: "B08303_Travel_time_to_work_zcta_all_years.csv",
    columns: ["commute_under_30_min"],
    aggregation: "direct",
    color: "#34b87c",
    unit: "",
  },
  {
    id: "commute_30_60",
    label: "Commute 30-60 min",
    group: "Travel Time",
    csvFile: "B08303_Travel_time_to_work_zcta_all_years.csv",
    columns: ["commute_30_to_60_min"],
    aggregation: "direct",
    color: "#f59e0b",
    unit: "",
  },
  {
    id: "commute_over_60",
    label: "Commute > 60 min",
    group: "Travel Time",
    csvFile: "B08303_Travel_time_to_work_zcta_all_years.csv",
    columns: ["commute_over_60_min"],
    aggregation: "direct",
    color: "#ef4444",
    unit: "",
  },
  {
    id: "total_units",
    label: "Total Housing Units",
    group: "Housing",
    csvFile: "B25002_occupancy_status_zcta.csv",
    columns: ["total_units"],
    aggregation: "direct",
    color: "#6366f1",
    unit: "",
  },
  {
    id: "occupied_units",
    label: "Occupied Units",
    group: "Housing",
    csvFile: "B25002_occupancy_status_zcta.csv",
    columns: ["occupied_units"],
    aggregation: "direct",
    color: "#10b981",
    unit: "",
  },
  {
    id: "vacant_units",
    label: "Vacant Units",
    group: "Housing",
    csvFile: "B25002_occupancy_status_zcta.csv",
    columns: ["vacant_units"],
    aggregation: "direct",
    color: "#f97316",
    unit: "",
  },
  {
    id: "movers_25_44",
    label: "Movers Age 25-44",
    group: "Migration",
    csvFile: "S0701_Move_in_zcta_all_years.csv",
    columns: ["total_age_25_34", "total_age_35_44"],
    aggregation: "sum",
    color: "#8b5cf6",
    unit: "",
  },
  {
    id: "movers_income_75k_plus",
    label: "Movers Income ≥ $75K (%)",
    group: "Migration",
    csvFile: "S0701_Move_in_zcta_all_years.csv",
    columns: ["pct_income_75k_or_more"],
    aggregation: "direct",
    color: "#ec4899",
    unit: "%",
  },
];
