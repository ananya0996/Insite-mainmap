import { MapPin } from "lucide-react";

export function MapPanel() {
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
              Click on a region to explore housing insights
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

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Subtle dot grid background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, #b0b7c9 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(74,144,217,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Placeholder US map silhouette */}
        <div className="relative flex flex-col items-center gap-5">
          <div className="relative">
            <svg
              viewBox="0 0 960 600"
              className="h-auto w-full max-w-[560px]"
              style={{ opacity: 0.15 }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M234 160L200 170L175 200L150 195L130 210L115 250L120 280L140 300L135 330L155 360L185 370L210 390L240 395L270 380L300 385L340 375L370 360L400 340L430 335L460 340L490 320L520 310L550 330L580 340L610 335L640 320L670 310L700 290L720 260L740 245L760 250L780 230L790 200L775 175L750 165L720 170L690 160L660 155L630 165L600 170L570 160L540 155L510 165L480 170L450 160L420 155L390 165L360 170L330 160L300 155L270 165Z"
                stroke="#4a90d9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Animated pulse dots for key cities */}
            <div className="absolute left-[18%] top-[55%]">
              <span
                className="absolute inline-flex h-3 w-3 animate-ping rounded-full"
                style={{ backgroundColor: "rgba(74,144,217,0.3)" }}
              />
              <span
                className="relative inline-flex h-3 w-3 rounded-full"
                style={{ backgroundColor: "#4a90d9", boxShadow: "0 0 6px rgba(74,144,217,0.3)" }}
              />
            </div>
            <div className="absolute left-[75%] top-[35%]">
              <span
                className="absolute inline-flex h-3 w-3 animate-ping rounded-full"
                style={{ backgroundColor: "rgba(74,144,217,0.3)", animationDelay: "0.5s" }}
              />
              <span
                className="relative inline-flex h-3 w-3 rounded-full"
                style={{ backgroundColor: "#4a90d9", boxShadow: "0 0 6px rgba(74,144,217,0.3)" }}
              />
            </div>
            <div className="absolute left-[45%] top-[65%]">
              <span
                className="absolute inline-flex h-3 w-3 animate-ping rounded-full"
                style={{ backgroundColor: "rgba(229,150,59,0.3)", animationDelay: "1s" }}
              />
              <span
                className="relative inline-flex h-3 w-3 rounded-full"
                style={{ backgroundColor: "#e5963b", boxShadow: "0 0 6px rgba(229,150,59,0.3)" }}
              />
            </div>
            <div className="absolute left-[55%] top-[40%]">
              <span
                className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full"
                style={{ backgroundColor: "rgba(52,184,124,0.3)", animationDelay: "1.5s" }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "#34b87c", boxShadow: "0 0 6px rgba(52,184,124,0.3)" }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm font-semibold" style={{ color: "#1e2533" }}>
              US Map Visualization
            </p>
            <p className="text-xs" style={{ color: "#8b93a7" }}>
              Geographic data will be loaded here
            </p>
          </div>
        </div>

        {/* Bottom legend bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3"
          style={{ backgroundColor: "rgba(255,255,255,0.9)", borderTop: "1px solid #e3e6ed", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#4a90d9" }} />
              <span className="text-xs font-medium" style={{ color: "#6b7385" }}>
                High Opportunity
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#e5963b" }} />
              <span className="text-xs font-medium" style={{ color: "#6b7385" }}>
                Moderate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#e5646e" }} />
              <span className="text-xs font-medium" style={{ color: "#6b7385" }}>
                Low Opportunity
              </span>
            </div>
          </div>
          <span className="font-mono text-xs" style={{ color: "#a0a7b8" }}>
            41,702 zip codes tracked
          </span>
        </div>
      </div>
    </div>
  );
}
