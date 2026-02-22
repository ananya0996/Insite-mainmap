'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import MapGL, { Layer, Source, MapRef } from 'react-map-gl';
import type { CircleLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ZipcodeData } from '@/lib/csv-parser';
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
  const [zipcodeGeojson, setZipcodeGeojson] = useState<any>(null);

  // Fetch zipcode boundaries and merge with score data
  useEffect(() => {
    const fetchZipcodeGeojson = async () => {
      try {
        console.log('[v0] Starting to fetch zipcode boundaries...');
        
        // Create a map of zipcode to overall_score for quick lookup
        const scoreMap = new Map(data.map(d => [d.zipcode, d.overall_score]));
        const countyMap = new Map(data.map(d => [d.zipcode, d.county_name]));
        
        // Map of zipcode prefixes to state abbreviations
        const stateMapping: { [key: string]: string } = {
          '94': 'ca', '95': 'ca', '90': 'ca', '91': 'ca', '92': 'ca', '93': 'ca', '96': 'ca',
          '10': 'ny', '11': 'ny', '12': 'ny', '13': 'ny', '14': 'ny',
          '60': 'il', '61': 'il', '62': 'il',
          '33': 'fl', '34': 'fl', '32': 'fl',
          '85': 'az', '86': 'az',
          '78': 'tx', '75': 'tx', '76': 'tx', '77': 'tx', '79': 'tx',
          '37': 'tn',
          '28': 'nc',
          '83': 'id',
          '98': 'wa',
          '30': 'ga',
          '02': 'ma',
          '80': 'co',
        };
        
        // Get unique states needed
        const statesNeeded = new Set<string>();
        data.forEach(d => {
          const prefix = d.zipcode.substring(0, 2);
          const state = stateMapping[prefix];
          if (state) {
            statesNeeded.add(state);
          }
        });
        
        console.log('[v0] States needed:', Array.from(statesNeeded));
        
        // State name mapping for URLs
        const stateNames: { [key: string]: string } = {
          'ca': 'california', 'ny': 'new_york', 'il': 'illinois', 'fl': 'florida',
          'az': 'arizona', 'tx': 'texas', 'tn': 'tennessee', 'nc': 'north_carolina',
          'id': 'idaho', 'wa': 'washington', 'ga': 'georgia', 'ma': 'massachusetts',
          'co': 'colorado'
        };
        
        // Fetch all state GeoJSON files
        const allFeatures: any[] = [];
        
        for (const state of statesNeeded) {
          const stateName = stateNames[state];
          if (!stateName) continue;
          
          const url = `https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/${state}_${stateName}_zip_codes_geo.min.json`;
          console.log('[v0] Fetching:', url);
          
          try {
            const response = await fetch(url);
            if (!response.ok) {
              console.error('[v0] Failed to fetch', state, response.status);
              continue;
            }
            const geojson = await response.json();
            console.log('[v0] Fetched', state, '- features:', geojson.features?.length);
            
            // Filter and add features
            const stateFeatures = geojson.features
              .filter((feature: any) => {
                const zipcode = feature.properties.ZCTA5CE10 || feature.properties.GEOID10?.substring(2);
                return scoreMap.has(zipcode);
              })
              .map((feature: any) => {
                const zipcode = feature.properties.ZCTA5CE10 || feature.properties.GEOID10?.substring(2);
                return {
                  ...feature,
                  properties: {
                    ...feature.properties,
                    zipcode,
                    overall_score: scoreMap.get(zipcode) || 0,
                    county_name: countyMap.get(zipcode) || 'Unknown'
                  }
                };
              });
            
            allFeatures.push(...stateFeatures);
            console.log('[v0] Added', stateFeatures.length, 'features from', state);
          } catch (err) {
            console.error('[v0] Error fetching state', state, err);
          }
        }
        
        console.log('[v0] Total features loaded:', allFeatures.length);
        
        if (allFeatures.length > 0) {
          setZipcodeGeojson({
            type: 'FeatureCollection',
            features: allFeatures
          });
        } else {
          console.error('[v0] No features loaded, falling back to circles');
          setZipcodeGeojson(null);
        }
      } catch (error) {
        console.error('[v0] Error fetching zipcode boundaries:', error);
        // Fallback to point data if boundaries fail to load
        setZipcodeGeojson(null);
      }
    };

    if (data.length > 0) {
      fetchZipcodeGeojson();
    }
  }, [data]);

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

  // Get color based on score - white to dark blue gradient
  const getColor = (score: number): string => {
    if (score >= 90) return '#1e3a8a'; // Dark blue
    if (score >= 85) return '#3b82f6'; // Blue
    if (score >= 80) return '#60a5fa'; // Light blue
    if (score >= 75) return '#93c5fd'; // Lighter blue
    if (score >= 70) return '#dbeafe'; // Very light blue
    return '#f0f9ff'; // Almost white (very pale blue)
  };

  return (
    <div className="relative h-full w-full">
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
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: USA_CENTER.longitude,
          latitude: USA_CENTER.latitude,
          zoom: USA_CENTER.zoom
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={zipcodeGeojson ? ['zipcode-fill'] : ['zipcode-heatmap']}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {zipcodeGeojson ? (
          // Use polygon boundaries when available
          <Source id="zipcode-boundaries" type="geojson" data={zipcodeGeojson}>
            <Layer 
              id="zipcode-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'overall_score'],
                  70, '#f0f9ff',
                  75, '#dbeafe',
                  80, '#93c5fd',
                  85, '#60a5fa',
                  90, '#3b82f6',
                  95, '#1e3a8a'
                ],
                'fill-opacity': 0.75
              }}
            />
            <Layer 
              id="zipcode-outline"
              type="line"
              paint={{
                'line-color': '#ffffff',
                'line-width': 1,
                'line-opacity': 0.5
              }}
            />
          </Source>
        ) : (
          // Fallback to circle markers if boundaries fail to load
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
                  70, '#f0f9ff',
                  75, '#dbeafe',
                  80, '#93c5fd',
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
        )}
      </MapGL>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white px-4 py-3 shadow-lg">
        <div className="text-xs font-semibold text-gray-900 mb-2">Overall Score</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: '#1e3a8a' }} />
            <span className="text-xs text-gray-600">90+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs text-gray-600">85-90</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: '#60a5fa' }} />
            <span className="text-xs text-gray-600">80-85</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: '#93c5fd' }} />
            <span className="text-xs text-gray-600">75-80</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: '#dbeafe' }} />
            <span className="text-xs text-gray-600">70-75</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: '#f0f9ff' }} />
            <span className="text-xs text-gray-600">&lt;70</span>
          </div>
        </div>
      </div>
    </div>
  );
}
