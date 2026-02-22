import { MapPin } from "lucide-react";

export function MapPanel() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">
            US Housing Market Overview
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Interactive Map
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Grid overlay for visual texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(187 80% 48% / 0.04) 0%, transparent 70%)",
          }}
        />

        {/* Placeholder US map silhouette using dots */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <svg
              viewBox="0 0 960 600"
              className="h-auto w-full max-w-[560px] opacity-20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M234 160L200 170L175 200L150 195L130 210L115 250L120 280L140 300L135 330L155 360L185 370L210 390L240 395L270 380L300 385L340 375L370 360L400 340L430 335L460 340L490 320L520 310L550 330L580 340L610 335L640 320L670 310L700 290L720 260L740 245L760 250L780 230L790 200L775 175L750 165L720 170L690 160L660 155L630 165L600 170L570 160L540 155L510 165L480 170L450 160L420 155L390 165L360 170L330 160L300 155L270 165Z"
                stroke="hsl(187 80% 48%)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Animated pulse dots for key cities */}
            <div className="absolute left-[18%] top-[55%]">
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-accent/40" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent/70" />
            </div>
            <div className="absolute left-[75%] top-[35%]">
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-accent/40" style={{ animationDelay: "0.5s" }} />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent/70" />
            </div>
            <div className="absolute left-[45%] top-[65%]">
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-accent/40" style={{ animationDelay: "1s" }} />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent/70" />
            </div>
            <div className="absolute left-[55%] top-[40%]">
              <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-accent/40" style={{ animationDelay: "1.5s" }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent/70" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              US Map Visualization
            </p>
            <p className="text-xs text-muted-foreground/60">
              Click on a zip code region to explore detailed housing insights
            </p>
          </div>
        </div>

        {/* Bottom stat bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-border bg-card/80 px-5 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground">
                High Opportunity
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">
                Moderate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-xs text-muted-foreground">
                Low Opportunity
              </span>
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground/50">
            41,702 zip codes tracked
          </span>
        </div>
      </div>
    </div>
  );
}
