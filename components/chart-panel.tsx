interface ChartBarData {
  label: string;
  value: number;
  maxValue: number;
}

interface ChartPanelProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: ChartBarData[];
  accentColor?: string;
  barColor?: string;
}

export function ChartPanel({
  title,
  subtitle,
  icon,
  data,
  accentColor = "bg-blue-50 text-blue-600",
  barColor = "#4a90d9",
}: ChartPanelProps) {
  return (
    <div
      className="flex h-full flex-col rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #e3e6ed" }}
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#1e2533" }}>
              {title}
            </h3>
            <p className="text-[11px]" style={{ color: "#8b93a7" }}>
              {subtitle}
            </p>
          </div>
        </div>
        <button
          className="rounded-xl px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-gray-100"
          style={{ color: "#6b7385" }}
        >
          View All
        </button>
      </div>

      {/* Chart Body */}
      <div className="flex flex-1 flex-col justify-center gap-2.5 px-4 py-3">
        {data.map((item) => {
          const percentage = (item.value / item.maxValue) * 100;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span
                className="w-20 shrink-0 truncate text-right text-xs font-medium"
                style={{ color: "#6b7385" }}
              >
                {item.label}
              </span>
              <div
                className="relative h-6 flex-1 overflow-hidden rounded-lg"
                style={{ backgroundColor: "#f0f2f7" }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%`, backgroundColor: barColor, opacity: 0.75 }}
                />
                <div className="absolute inset-y-0 right-2.5 flex items-center">
                  <span
                    className="font-mono text-[11px] font-semibold"
                    style={{ color: "#1e2533" }}
                  >
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
