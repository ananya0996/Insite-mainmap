import Image from "next/image";
import { MapPin, BarChart3, TrendingUp } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-3">
        <Image
          src="/images/insite-logo.jpg"
          alt="Insite logo"
          width={32}
          height={32}
          className="rounded"
        />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Insite
        </h1>
        <span className="ml-1 rounded-sm bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
          Dashboard
        </span>
      </div>

      <nav className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <MapPin className="h-4 w-4" />
          <span>Zip Codes</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Trends</span>
        </button>
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Last updated: Feb 2026
        </span>
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>
    </header>
  );
}
