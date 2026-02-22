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
}

export function ChartPanel({
  title,
  subtitle,
  icon,
  data,
  accentColor = "bg-accent",
}: ChartPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-accent">{icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <button className="rounded-sm px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          View All
        </button>
      </div>

      {/* Chart Body */}
      <div className="flex flex-1 flex-col justify-center gap-3 px-4 py-3">
        {data.map((item) => {
          const percentage = (item.value / item.maxValue) * 100;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-right text-xs text-muted-foreground">
                {item.label}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted/50">
                <div
                  className={`absolute inset-y-0 left-0 rounded-sm ${accentColor} transition-all duration-700 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <span className="font-mono text-[11px] font-medium text-foreground drop-shadow-sm">
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
