'use client';

import { useState, useCallback } from 'react';
import { DashboardHeader, type DashboardView } from "@/components/dashboard-header";
import { MapPanel, type MapMode } from "@/components/map-panel";
import { FeatureChartsPanel } from "@/components/feature-charts-panel";

const VIEW_TO_MAP_MODE: Record<DashboardView, MapMode> = {
  zip_codes: "housing",
  analytics: "growth_potential",
  trends: "housing",
};

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>("zip_codes");
  const [selectedZcta, setSelectedZcta] = useState<string | null>(null);

  const handleViewChange = useCallback((view: DashboardView) => {
    setActiveView(view);
  }, []);

  const handleZctaSelect = useCallback((zcta: string) => {
    setSelectedZcta(zcta);
  }, []);

  const handleZctaDeselect = useCallback(() => {
    setSelectedZcta(null);
  }, []);

  const mapMode = VIEW_TO_MAP_MODE[activeView];

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#e8ecf3", color: "#232a36" }}
    >
      <DashboardHeader activeView={activeView} onViewChange={handleViewChange} />

      <main className="flex flex-1 gap-5 overflow-hidden p-5">
        <section className="flex-[3] min-w-0">
          <MapPanel
            mode={mapMode}
            selectedZcta={selectedZcta}
            onZctaSelect={handleZctaSelect}
            onZctaDeselect={handleZctaDeselect}
          />
        </section>

        <aside className="flex flex-[1.2] min-w-0 flex-col">
          <FeatureChartsPanel selectedZcta={selectedZcta} />
        </aside>
      </main>
    </div>
  );
}
