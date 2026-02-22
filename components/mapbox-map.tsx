'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import Map, { Layer, Source, MapRef, MapLayerMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';
import type { ChoroplethFeatureCollection } from '@/lib/occupancy-choropleth';
import type { MapMode } from './map-panel';

interface MapBoxMapProps {
  geojson: ChoroplethFeatureCollection;
  years: number[];
  mapboxToken: string;
  mode: MapMode;
  onZctaSelect: (zcta: string) => void;
  onZctaDeselect: () => void;
}

const USA_CENTER = { longitude: -98.5795, latitude: 39.8283, zoom: 4 };

const FILL_LAYER_ID = 'zcta-fill';
const OUTLINE_LAYER_ID = 'zcta-outline';
const INTERACTIVE_LAYERS = [FILL_LAYER_ID];

const HOUSING_LEGEND = [
  { min: 0,      color: '#f0f4ff', label: '0 – 5K' },
  { min: 5000,   color: '#dce6fc', label: '5K – 20K' },
  { min: 20000,  color: '#b8ccf8', label: '20K – 50K' },
  { min: 50000,  color: '#93b2f2', label: '50K – 100K' },
  { min: 100000, color: '#7196e8', label: '100K – 200K' },
  { min: 200000, color: '#5a7fd4', label: '200K+' },
];

const TARGET_LEGEND = [
  { min: 0,     color: '#f0f4ff', label: '0 – 500' },
  { min: 500,   color: '#dce6fc', label: '500 – 2K' },
  { min: 2000,  color: '#b8ccf8', label: '2K – 5K' },
  { min: 5000,  color: '#93b2f2', label: '5K – 10K' },
  { min: 10000, color: '#7196e8', label: '10K – 25K' },
  { min: 25000, color: '#5a7fd4', label: '25K+' },
];

export function MapBoxMap({ geojson, years, mapboxToken, mode, onZctaSelect, onZctaDeselect }: MapBoxMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedYear, setSelectedYear] = useState<number>(years[years.length - 1]);
  const [hoveredInfo, setHoveredInfo] = useState<Record<string, string | number> | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  const tKey = useMemo(() => `t_${selectedYear}`, [selectedYear]);
  const oKey = useMemo(() => `o_${selectedYear}`, [selectedYear]);
  const vKey = useMemo(() => `v_${selectedYear}`, [selectedYear]);

  const isHousing = mode === 'housing';
  const colorProperty = isHousing ? tKey : 'target_score';
  const legend = isHousing ? HOUSING_LEGEND : TARGET_LEGEND;

  const fillColorExpr: unknown[] = [
    'step',
    ['coalesce', ['to-number', ['get', colorProperty]], 0],
    legend[0].color,
    legend[1].min, legend[1].color,
    legend[2].min, legend[2].color,
    legend[3].min, legend[3].color,
    legend[4].min, legend[4].color,
    legend[5].min, legend[5].color,
  ];

  const handleZoomIn = useCallback(() => { mapRef.current?.zoomIn(); }, []);
  const handleZoomOut = useCallback(() => { mapRef.current?.zoomOut(); }, []);

  const handleResetZoom = useCallback(() => {
    onZctaDeselect();
    mapRef.current?.flyTo({
      center: [USA_CENTER.longitude, USA_CENTER.latitude],
      zoom: USA_CENTER.zoom,
      duration: 2000,
    });
  }, [onZctaDeselect]);

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature?.geometry || !mapRef.current) return;

    const zcta = String((feature.properties as Record<string, unknown>)?.zcta ?? '');
    if (!zcta) return;

    let allCoords: number[][] = [];
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      for (const ring of geom.coordinates as number[][][]) allCoords = allCoords.concat(ring);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates as number[][][][])
        for (const ring of poly) allCoords = allCoords.concat(ring);
    }
    if (allCoords.length === 0) return;

    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const [lng, lat] of allCoords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    onZctaSelect(zcta);
    mapRef.current.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: 80, duration: 1400, maxZoom: 14 },
    );
  }, [onZctaSelect]);

  const handleMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature?.properties) {
      setHoveredInfo(null);
      setCursorPosition(null);
      return;
    }
    setHoveredInfo(feature.properties as Record<string, string | number>);
    setCursorPosition({ x: event.point.x, y: event.point.y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredInfo(null);
    setCursorPosition(null);
  }, []);

  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    if (mapRef.current.getZoom() <= USA_CENTER.zoom + 0.5) onZctaDeselect();
  }, [onZctaDeselect]);

  const renderTooltip = () => {
    if (!hoveredInfo || !cursorPosition) return null;
    const p = hoveredInfo;

    return (
      <div
        className="pointer-events-none absolute z-20 rounded-lg bg-white px-4 py-3 shadow-lg"
        style={{ left: `${cursorPosition.x + 14}px`, top: `${cursorPosition.y + 14}px` }}
      >
        <div className="text-xs leading-relaxed">
          <div className="font-bold text-gray-900">PIN: {p.zcta}</div>

          {isHousing ? (
            <>
              <div className="text-gray-500">Year: {selectedYear}</div>
              <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                <span className="text-gray-500">Total units</span>
                <span className="font-semibold text-gray-800 text-right">{Number(p[tKey] ?? 0).toLocaleString()}</span>
                <span className="text-gray-500">Occupied</span>
                <span className="font-semibold text-emerald-700 text-right">{Number(p[oKey] ?? 0).toLocaleString()}</span>
                <span className="text-gray-500">Vacant</span>
                <span className="font-semibold text-amber-700 text-right">{Number(p[vKey] ?? 0).toLocaleString()}</span>
              </div>
            </>
          ) : (
            <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <span className="text-gray-500">Growth Potential</span>
              <span className="font-semibold text-blue-700 text-right">{Number(p.target_score ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="text-gray-500">Investment</span>
              <span className="font-semibold text-indigo-700 text-right">{Number(p.investment_score ?? 0).toFixed(1)}</span>
              <span className="text-gray-500">Forecast 2030</span>
              <span className="font-semibold text-gray-800 text-right">{Number(p.forecast_2030 ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="text-gray-500">Growth %</span>
              <span className="font-semibold text-emerald-700 text-right">{Number(p.forecast_growth ?? 0).toFixed(1)}%</span>
              <span className="text-gray-500">Income 25-44</span>
              <span className="font-semibold text-gray-800 text-right">${Number(p.median_income ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="text-gray-500">Vacancy Rate</span>
              <span className="font-semibold text-amber-700 text-right">{Number(p.vacancy_rate ?? 0).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full w-full">
      {/* Year selector — only for housing mode */}
      {isHousing && (
        <div className="absolute left-4 top-4 z-10 rounded-lg bg-white/95 p-3 shadow-lg">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">Year</div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-300"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50" title="Zoom In">
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50" title="Zoom Out">
          <ZoomOut className="h-5 w-5 text-gray-700" />
        </button>
        <button onClick={handleResetZoom} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50" title="Reset View">
          <Home className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {renderTooltip()}

      <Map
        ref={mapRef}
        initialViewState={{ longitude: USA_CENTER.longitude, latitude: USA_CENTER.latitude, zoom: USA_CENTER.zoom }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={INTERACTIVE_LAYERS}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMoveEnd={handleMoveEnd}
      >
        <Source id="zcta-boundaries" type="geojson" data={geojson}>
          <Layer
            id={FILL_LAYER_ID}
            type="fill"
            paint={{
              'fill-color': fillColorExpr as never,
              'fill-opacity': 0.82,
            }}
          />
          <Layer
            id={OUTLINE_LAYER_ID}
            type="line"
            paint={{
              'line-color': '#d0d8e8',
              'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.15, 8, 0.5, 12, 1],
              'line-opacity': 0.8,
            }}
          />
        </Source>
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white px-4 py-3 shadow-lg">
        <div className="mb-2 text-xs font-semibold text-gray-900">
          {isHousing ? `Total Housing Units (${selectedYear})` : 'Growth Potential Index (2024)'}
        </div>
        <div className="flex items-center gap-2">
          {legend.map((stop) => (
            <div key={stop.label} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: stop.color }} />
              <span className="text-[11px] text-gray-600">{stop.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
