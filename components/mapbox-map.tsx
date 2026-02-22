'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Map, { Layer, Source, MapRef } from 'react-map-gl';
import type { CircleLayer, FillLayer, LineLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ZipcodeData } from '@/lib/csv-parser';
import { fetchAllZipcodeGeoJSON, ZipcodeGeoJSON } from '@/lib/geojson-loader';
import { Search, ZoomIn, ZoomOut, Home } from 'lucide-react';

interface MapBoxMapProps {
  data: ZipcodeData[];
  mapboxToken: string;
}

const USA_CENTER = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4
};

export function MapBoxMap({ data, mapboxToken }: MapBoxMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredZipcode, setHoveredZipcode] = useState<ZipcodeData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [zipcodeGeoJSON, setZipcodeGeoJSON] = useState<ZipcodeGeoJSON | null>(null);
  const [isLoadingGeoJSON, setIsLoadingGeoJSON] = useState(true);

  // Load all zipcode boundary GeoJSON files
  useEffect(() => {
    async function loadGeoJSON() {
      setIsLoadingGeoJSON(true);
      const geoJSON = await fetchAllZipcodeGeoJSON();
      setZipcodeGeoJSON(geoJSON);
      setIsLoadingGeoJSON(false);
    }
    loadGeoJSON();
  }, []);

  // Create GeoJSON from CSV data
  const geojsonData = {
    type: 'FeatureCollection' as const,
    features: data.map(item => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [item.longitude, item.latitude]
      },
      properties: {
        zipcode: item.zipcode,
        overall_score: item.overall_score,
        county_name: item.county_name
      }
    }))
  };

  // Filter suggestions based on search term
  const suggestions = searchTerm
    ? data.filter(item => 
        item.zipcode.startsWith(searchTerm)
      ).slice(0, 10)
    : [];

  // Handle zipcode search
  const handleSearchSelect = useCallback((zipcode: string) => {
    const item = data.find(d => d.zipcode === zipcode);
    if (item && mapRef.current) {
      mapRef.current.flyTo({
        center: [item.longitude, item.latitude],
        zoom: 12,
        duration: 2000
      });
      setSearchTerm(zipcode);
      setShowSuggestions(false);
    }
  }, [data]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [USA_CENTER.longitude, USA_CENTER.latitude],
        zoom: USA_CENTER.zoom,
        duration: 2000
      });
    }
  }, []);

  // Handle map click
  const handleMapClick = useCallback((event: any) => {
    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const coords = feature.geometry.coordinates;
      
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: coords,
          zoom: 12,
          duration: 2000
        });
      }
    }
  }, []);

  // Handle mouse move for hover tooltip
  const handleMouseMove = useCallback((event: any) => {
    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const props = feature.properties;
      
      setHoveredZipcode({
        zipcode: props.zipcode,
        overall_score: props.overall_score,
        county_name: props.county_name,
        latitude: 0,
        longitude: 0
      });
      
      setCursorPosition({ x: event.point.x, y: event.point.y });
    } else {
      setHoveredZipcode(null);
      setCursorPosition(null);
    }
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredZipcode(null);
    setCursorPosition(null);
  }, []);

  // Get color based on score
  const getColor = (score: number): string => {
    if (score >= 90) return '#1e3a8a'; // Dark blue
    if (score >= 85) return '#3b82f6'; // Blue
    if (score >= 80) return '#60a5fa'; // Light blue
    if (score >= 75) return '#fbbf24'; // Yellow
    if (score >= 70) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="relative h-full w-full">
      {/* GeoJSON Loading Indicator */}
      {isLoadingGeoJSON && (
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-6 py-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Loading zipcode boundaries...</div>
              <div className="text-xs text-gray-500">Fetching GeoJSON data for all states</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="absolute left-4 top-4 z-10 w-80">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search zipcode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
              {suggestions.map((item) => (
                <button
                  key={item.zipcode}
                  onClick={() => handleSearchSelect(item.zipcode)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="font-medium">{item.zipcode}</div>
                  <div className="text-xs text-gray-500">{item.county_name} - Score: {item.overall_score}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleResetZoom}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50"
          title="Reset View"
        >
          <Home className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Hover Tooltip */}
      {hoveredZipcode && cursorPosition && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg bg-white px-3 py-2 shadow-lg"
          style={{
            left: `${cursorPosition.x + 10}px`,
            top: `${cursorPosition.y + 10}px`
          }}
        >
          <div className="text-xs">
            <div className="font-bold text-gray-900">Zipcode: {hoveredZipcode.zipcode}</div>
            <div className="text-gray-600">{hoveredZipcode.county_name}</div>
            <div className="mt-1 font-semibold" style={{ color: getColor(hoveredZipcode.overall_score) }}>
              Score: {hoveredZipcode.overall_score}
            </div>
          </div>
        </div>
      )}

      {/* MapBox Map */}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: USA_CENTER.longitude,
          latitude: USA_CENTER.latitude,
          zoom: USA_CENTER.zoom
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={['zipcode-heatmap', 'zipcode-boundaries-fill']}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Zipcode Boundary Polygons */}
        {zipcodeGeoJSON && !isLoadingGeoJSON && (
          <Source id="zipcode-boundaries" type="geojson" data={zipcodeGeoJSON}>
            <Layer 
              id="zipcode-boundaries-fill"
              type="fill"
              paint={{
                'fill-color': '#4a90d9',
                'fill-opacity': 0.1
              }}
            />
            <Layer 
              id="zipcode-boundaries-line"
              type="line"
              paint={{
                'line-color': '#4a90d9',
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  4, 0.3,
                  8, 0.5,
                  12, 1
                ],
                'line-opacity': 0.4
              }}
            />
          </Source>
        )}

        {/* Zipcode Point Data */}
        <Source id="zipcode-data" type="geojson" data={geojsonData}>
          <Layer 
            id="zipcode-heatmap"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 8,
                12, 20
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'overall_score'],
                70, '#ef4444',
                75, '#f97316',
                80, '#fbbf24',
                85, '#60a5fa',
                90, '#3b82f6',
                95, '#1e3a8a'
              ],
              'circle-opacity': 0.7,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff'
            }}
          />
        </Source>
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white px-4 py-3 shadow-lg">
        <div className="text-xs font-semibold text-gray-900 mb-2">Overall Score</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#1e3a8a' }} />
            <span className="text-xs text-gray-600">90+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs text-gray-600">85-90</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#60a5fa' }} />
            <span className="text-xs text-gray-600">80-85</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
            <span className="text-xs text-gray-600">75-80</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span className="text-xs text-gray-600">70-75</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs text-gray-600">&lt;70</span>
          </div>
        </div>
      </div>
    </div>
  );
}
