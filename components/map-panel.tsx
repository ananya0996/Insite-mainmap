'use client';

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { MapBoxMap } from "./mapbox-map";
import type { ChoroplethFeatureCollection } from "@/lib/occupancy-choropleth";

interface OccupancyChoroplethPayload {
  years: number[];
  geojson: ChoroplethFeatureCollection;
}

export type MapMode = "housing" | "growth_potential";

interface MapPanelProps {
  mode: MapMode;
  selectedZcta: string | null;
  onZctaSelect: (zcta: string) => void;
  onZctaDeselect: () => void;
}

export function MapPanel({ mode, selectedZcta, onZctaSelect, onZctaDeselect }: MapPanelProps) {
  const [payload, setPayload] = useState<OccupancyChoroplethPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/occupancy-choropleth');
        if (!response.ok) {
          throw new Error('Failed to load map data');
        }
        const data = (await response.json()) as OccupancyChoroplethPayload;
        setPayload(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const title = mode === "housing"
    ? "US Housing Units Choropleth"
    : "Growth Potential Index (2024)";

  const subtitle = mode === "housing"
    ? "Click a pin code to explore feature time-series"
    : "High-income households aged 25-44 by pin code";

  return (
    <div
      className="flex h-full flex-col rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: "1px solid #e3e6ed" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "#edf2ff" }}
          >
            <MapPin className="h-4 w-4" style={{ color: "#4a90d9" }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#1e2533" }}>
              {title}
            </h2>
            <p className="text-xs" style={{ color: "#8b93a7" }}>
              {subtitle}
            </p>
          </div>
        </div>

        {selectedZcta ? (
          <span className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <MapPin className="h-3 w-3" />
            PIN {selectedZcta}
          </span>
        ) : (
          <span
            className="rounded-xl px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "#f0f2f7", color: "#8b93a7" }}
          >
            Interactive Map
          </span>
        )}
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-3 text-sm text-gray-600">Loading map data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-red-600">{error}</p>
              <p className="mt-2 text-xs text-gray-500">Please add a NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables</p>
            </div>
          </div>
        ) : (
          payload && (
            <MapBoxMap
              geojson={payload.geojson}
              years={payload.years}
              mapboxToken={MAPBOX_TOKEN}
              mode={mode}
              onZctaSelect={onZctaSelect}
              onZctaDeselect={onZctaDeselect}
            />
          )
        )}
      </div>
    </div>
  );
}
