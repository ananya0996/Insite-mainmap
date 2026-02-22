'use client';

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { MapBoxMap } from "./mapbox-map";
import { parseCSV, ZipcodeData } from "@/lib/csv-parser";

export function MapPanel() {
  const [zipcodeData, setZipcodeData] = useState<ZipcodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual Mapbox token
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'INVALID_API_KEY';

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/zipcode-data.csv');
        if (!response.ok) {
          throw new Error('Failed to load CSV data');
        }
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        setZipcodeData(parsed);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div
      className="flex h-full flex-col rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
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
              US Housing Market Overview
            </h2>
            <p className="text-xs" style={{ color: "#8b93a7" }}>
              Click on a zipcode to zoom in, hover to view details
            </p>
          </div>
        </div>
        <span
          className="rounded-xl px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: "#f0f2f7", color: "#8b93a7" }}
        >
          Interactive Map
        </span>
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
          <MapBoxMap data={zipcodeData} mapboxToken={MAPBOX_TOKEN} />
        )}
      </div>
    </div>
  );
}
