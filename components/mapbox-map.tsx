'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import Map, { Layer, Source, MapRef, MapLayerMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';
import type { ChoroplethFeatureCollection } from '@/lib/occupancy-choropleth';

interface MapBoxMapProps {
  geojson: ChoroplethFeatureCollection;
  years: number[];
  mapboxToken: string;
}

const USA_CENTER = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4
};

const FILL_LAYER_ID = 'zcta-fill';
const OUTLINE_LAYER_ID = 'zcta-outline';
const INTERACTIVE_LAYERS = [FILL_LAYER_ID];

const LEGEND_STOPS = [
  { min: 0,      max: 5000,   color: '#f0f4ff', label: '0 – 5K' },
  { min: 5000,   max: 20000,  color: '#dce6fc', label: '5K – 20K' },
  { min: 20000,  max: 50000,  color: '#b8ccf8', label: '20K – 50K' },
  { min: 50000,  max: 100000, color: '#93b2f2', label: '50K – 100K' },
  { min: 100000, max: 200000, color: '#7196e8', label: '100K – 200K' },
  { min: 200000, max: Infinity, color: '#5a7fd4', label: '200K+' },
];

export function MapBoxMap({ geojson, years, mapboxToken }: MapBoxMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedYear, setSelectedYear] = useState<number>(years[years.length - 1]);
  const [hoveredInfo, setHoveredInfo] = useState<{
    zcta: string;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
  } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  const tKey = useMemo(() => `t_${selectedYear}`, [selectedYear]);
  const oKey = useMemo(() => `o_${selectedYear}`, [selectedYear]);
  const vKey = useMemo(() => `v_${selectedYear}`, [selectedYear]);

  const fillLayerId = FILL_LAYER_ID;
  const outlineLayerId = OUTLINE_LAYER_ID;

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleResetZoom = useCallback(() => {
    mapRef.current?.flyTo({
      center: [USA_CENTER.longitude, USA_CENTER.latitude],
      zoom: USA_CENTER.zoom,
      duration: 2000,
    });
  }, []);

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature?.geometry || !mapRef.current) return;

    let allCoords: number[][] = [];
    const geom = feature.geometry;

    if (geom.type === 'Polygon') {
      const rings = geom.coordinates as number[][][];
      for (const ring of rings) allCoords = allCoords.concat(ring);
    } else if (geom.type === 'MultiPolygon') {
      const polys = geom.coordinates as number[][][][];
      for (const poly of polys) for (const ring of poly) allCoords = allCoords.concat(ring);
    }

    if (allCoords.length === 0) return;

    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const [lng, lat] of allCoords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    mapRef.current.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: 80, duration: 1400, maxZoom: 14 },
    );
  }, []);

  const handleMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature?.properties) {
      setHoveredInfo(null);
      setCursorPosition(null);
      return;
    }

    const p = feature.properties as Record<string, string | number>;
    setHoveredInfo({
      zcta: String(p.zcta ?? ''),
      totalUnits: Number(p[tKey] ?? 0),
      occupiedUnits: Number(p[oKey] ?? 0),
      vacantUnits: Number(p[vKey] ?? 0),
    });
    setCursorPosition({ x: event.point.x, y: event.point.y });
  }, [tKey, oKey, vKey]);

  const handleMouseLeave = useCallback(() => {
    setHoveredInfo(null);
    setCursorPosition(null);
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Year selector */}
      <div className="absolute left-4 top-4 z-10 rounded-lg bg-white/95 p-3 shadow-lg">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
          Year
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-300"
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

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

      {/* Hover tooltip */}
      {hoveredInfo && cursorPosition && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg bg-white px-4 py-3 shadow-lg"
          style={{
            left: `${cursorPosition.x + 14}px`,
            top: `${cursorPosition.y + 14}px`,
          }}
        >
          <div className="text-xs leading-relaxed">
            <div className="font-bold text-gray-900">ZCTA: {hoveredInfo.zcta}</div>
            <div className="text-gray-500">Year: {selectedYear}</div>
            <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <span className="text-gray-500">Total units</span>
              <span className="font-semibold text-gray-800 text-right">{hoveredInfo.totalUnits.toLocaleString()}</span>
              <span className="text-gray-500">Occupied</span>
              <span className="font-semibold text-emerald-700 text-right">{hoveredInfo.occupiedUnits.toLocaleString()}</span>
              <span className="text-gray-500">Vacant</span>
              <span className="font-semibold text-amber-700 text-right">{hoveredInfo.vacantUnits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: USA_CENTER.longitude,
          latitude: USA_CENTER.latitude,
          zoom: USA_CENTER.zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={INTERACTIVE_LAYERS}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Source id="zcta-boundaries" type="geojson" data={geojson}>
          <Layer
            id={fillLayerId}
            type="fill"
            paint={{
              'fill-color': [
                'step',
                ['coalesce', ['to-number', ['get', tKey]], 0],
                LEGEND_STOPS[0].color,
                LEGEND_STOPS[1].min, LEGEND_STOPS[1].color,
                LEGEND_STOPS[2].min, LEGEND_STOPS[2].color,
                LEGEND_STOPS[3].min, LEGEND_STOPS[3].color,
                LEGEND_STOPS[4].min, LEGEND_STOPS[4].color,
                LEGEND_STOPS[5].min, LEGEND_STOPS[5].color,
              ],
              'fill-opacity': 0.82,
            }}
          />
          <Layer
            id={outlineLayerId}
            type="line"
            paint={{
              'line-color': '#d0d8e8',
              'line-width': [
                'interpolate', ['linear'], ['zoom'],
                3, 0.15,
                8, 0.5,
                12, 1,
              ],
              'line-opacity': 0.8,
            }}
          />
        </Source>
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white px-4 py-3 shadow-lg">
        <div className="mb-2 text-xs font-semibold text-gray-900">
          Total Housing Units ({selectedYear})
        </div>
        <div className="flex items-center gap-2">
          {LEGEND_STOPS.map((stop) => (
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
