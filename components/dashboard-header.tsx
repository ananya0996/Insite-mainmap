'use client';

import Image from "next/image";
import { MapPin, BarChart3, TrendingUp, Search } from "lucide-react";

export type DashboardView = "zip_codes" | "analytics" | "trends";

interface DashboardHeaderProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const NAV_ITEMS: { id: DashboardView; label: string; icon: typeof MapPin }[] = [
  { id: "zip_codes", label: "Zip Codes", icon: MapPin },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "trends", label: "Trends", icon: TrendingUp },
];

export function DashboardHeader({ activeView, onViewChange }: DashboardHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-3"
      style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #dde1ea", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-3">
        <Image
          src="/insite_logo.png"
          alt="Insite logo"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <h1 className="text-lg font-bold tracking-tight" style={{ color: "#1e2533" }}>
          Insite
        </h1>
        <span
          className="ml-1 rounded-md px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: "#edf2ff", color: "#4a90d9" }}
        >
          Dashboard
        </span>
      </div>

      <div
        className="flex items-center gap-1 rounded-xl px-4 py-2"
        style={{ backgroundColor: "#f0f2f7", border: "1px solid #e3e6ed" }}
      >
        <Search className="h-4 w-4" style={{ color: "#8b93a7" }} />
        <span className="ml-1 text-sm" style={{ color: "#8b93a7" }}>
          Search zip codes, metrics...
        </span>
      </div>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? '' : 'hover:bg-gray-100'
              }`}
              style={
                isActive
                  ? { backgroundColor: "#edf2ff", color: "#4a90d9" }
                  : { color: "#6b7385" }
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "#8b93a7" }}>
          Last updated: Feb 2026
        </span>
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "#34b87c", boxShadow: "0 0 6px rgba(52,184,124,0.4)" }}
        />
      </div>
    </header>
  );
}
