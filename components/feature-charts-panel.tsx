'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FEATURE_DEFINITIONS } from '@/lib/feature-definitions';
import { BarChart3, X, ChevronDown, MapPin } from 'lucide-react';

interface FeatureChartsPanelProps {
  selectedZcta: string | null;
}

type TimeSeriesData = Record<string, { year: number; value: number }[]>;

const grouped = (() => {
  const map = new Map<string, typeof FEATURE_DEFINITIONS>();
  for (const f of FEATURE_DEFINITIONS) {
    if (!map.has(f.group)) map.set(f.group, []);
    map.get(f.group)!.push(f);
  }
  return Array.from(map.entries());
})();

export function FeatureChartsPanel({ selectedZcta }: FeatureChartsPanelProps) {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({});
  const [loading, setLoading] = useState(false);

  const toggleFeature = useCallback((id: string) => {
    setSelectedFeatureIds((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFeature = useCallback((id: string) => {
    setSelectedFeatureIds((prev) => prev.filter((f) => f !== id));
  }, []);

  useEffect(() => {
    if (!selectedZcta || selectedFeatureIds.length === 0) {
      setTimeSeriesData({});
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(
      `/api/feature-timeseries?zcta=${selectedZcta}&features=${selectedFeatureIds.join(',')}`,
    )
      .then((r) => r.json())
      .then((data: TimeSeriesData) => {
        if (!cancelled) {
          setTimeSeriesData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedZcta, selectedFeatureIds]);

  const isDisabled = !selectedZcta;
  const selectedDefs = selectedFeatureIds
    .map((id) => FEATURE_DEFINITIONS.find((f) => f.id === id))
    .filter(Boolean) as typeof FEATURE_DEFINITIONS;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Feature selector card */}
      <div
        className="rounded-2xl overflow-hidden flex-shrink-0"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid #e3e6ed' }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold" style={{ color: '#1e2533' }}>
                Feature Explorer
              </h3>
              <p className="text-[10px]" style={{ color: '#8b93a7' }}>
                Select up to 3 features
              </p>
            </div>
          </div>
          {selectedZcta && (
            <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
              <MapPin className="h-3 w-3" />
              {selectedZcta}
            </span>
          )}
        </div>

        <div className="px-4 py-3">
          {isDisabled ? (
            <div className="flex items-center justify-center rounded-lg bg-gray-50 py-4">
              <p className="text-xs text-gray-400">
                Click a zip code on the map to enable
              </p>
            </div>
          ) : (
            <>
              {/* Selected tags */}
              {selectedDefs.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {selectedDefs.map((def) => (
                    <span
                      key={def.id}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: def.color + '18', color: def.color }}
                    >
                      {def.label}
                      <button onClick={() => removeFeature(def.id)} className="ml-0.5 hover:opacity-70">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                <span>{selectedFeatureIds.length >= 3 ? 'Max 3 selected' : 'Add feature...'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
                  {grouped.map(([group, features]) => (
                    <div key={group}>
                      <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {group}
                      </div>
                      {features.map((f) => {
                        const isSelected = selectedFeatureIds.includes(f.id);
                        const isFull = selectedFeatureIds.length >= 3 && !isSelected;
                        return (
                          <button
                            key={f.id}
                            disabled={isFull}
                            onClick={() => {
                              toggleFeature(f.id);
                              if (!isSelected && selectedFeatureIds.length >= 2) setDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] transition-colors ${
                              isFull ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-50'
                            } ${isSelected ? 'bg-blue-50/50 font-medium' : ''}`}
                          >
                            <div
                              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: f.color, opacity: isSelected ? 1 : 0.5 }}
                            />
                            <span className="text-gray-700">{f.label}</span>
                            {isSelected && (
                              <span className="ml-auto text-[10px] text-blue-500">selected</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Charts area */}
      <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto">
        {isDisabled ? (
          <div
            className="flex flex-1 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="text-center px-6">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-400">No zip code selected</p>
              <p className="mt-1 text-[11px] text-gray-300">
                Click on a pin code region on the map to view time-series data
              </p>
            </div>
          </div>
        ) : selectedDefs.length === 0 ? (
          <div
            className="flex flex-1 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="text-center px-6">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-400">No features selected</p>
              <p className="mt-1 text-[11px] text-gray-300">
                Choose up to 3 features from the dropdown above
              </p>
            </div>
          </div>
        ) : (
          selectedDefs.map((def) => {
            const series = timeSeriesData[def.id] ?? [];
            return (
              <div
                key={def.id}
                className="rounded-2xl overflow-hidden flex-1 min-h-[180px]"
                style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: '1px solid #e3e6ed' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: def.color }}
                    />
                    <span className="text-[11px] font-semibold" style={{ color: '#1e2533' }}>
                      {def.label}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFeature(def.id)}
                    className="rounded p-0.5 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                </div>

                <div className="px-2 py-2 h-[calc(100%-36px)]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-r-transparent" />
                    </div>
                  ) : series.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-[11px] text-gray-400">No data for this pin code</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="year"
                          tick={{ fontSize: 10, fill: '#8b93a7' }}
                          tickLine={false}
                          axisLine={{ stroke: '#e3e6ed' }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#8b93a7' }}
                          tickLine={false}
                          axisLine={false}
                          width={50}
                          tickFormatter={(v: number) =>
                            v >= 1000000
                              ? `${(v / 1000000).toFixed(1)}M`
                              : v >= 1000
                                ? `${(v / 1000).toFixed(0)}K`
                                : v.toLocaleString()
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            fontSize: 11,
                            borderRadius: 8,
                            border: '1px solid #e3e6ed',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}
                          formatter={(value: number | undefined) => [
                            `${def.unit === '$' ? '$' : ''}${(value ?? 0).toLocaleString()}${def.unit === '%' ? '%' : ''}`,
                            def.label,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={def.color}
                          strokeWidth={2}
                          dot={{ r: 3, fill: def.color }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
