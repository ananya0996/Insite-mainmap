// State mapping for GeoJSON files
export const STATE_MAPPING = [
  { code: 'al', name: 'alabama' },
  { code: 'ak', name: 'alaska' },
  { code: 'az', name: 'arizona' },
  { code: 'ar', name: 'arkansas' },
  { code: 'ca', name: 'california' },
  { code: 'co', name: 'colorado' },
  { code: 'ct', name: 'connecticut' },
  { code: 'de', name: 'delaware' },
  { code: 'fl', name: 'florida' },
  { code: 'ga', name: 'georgia' },
  { code: 'hi', name: 'hawaii' },
  { code: 'id', name: 'idaho' },
  { code: 'il', name: 'illinois' },
  { code: 'in', name: 'indiana' },
  { code: 'ia', name: 'iowa' },
  { code: 'ks', name: 'kansas' },
  { code: 'ky', name: 'kentucky' },
  { code: 'la', name: 'louisiana' },
  { code: 'me', name: 'maine' },
  { code: 'md', name: 'maryland' },
  { code: 'ma', name: 'massachusetts' },
  { code: 'mi', name: 'michigan' },
  { code: 'mn', name: 'minnesota' },
  { code: 'ms', name: 'mississippi' },
  { code: 'mo', name: 'missouri' },
  { code: 'mt', name: 'montana' },
  { code: 'ne', name: 'nebraska' },
  { code: 'nv', name: 'nevada' },
  { code: 'nh', name: 'new_hampshire' },
  { code: 'nj', name: 'new_jersey' },
  { code: 'nm', name: 'new_mexico' },
  { code: 'ny', name: 'new_york' },
  { code: 'nc', name: 'north_carolina' },
  { code: 'nd', name: 'north_dakota' },
  { code: 'oh', name: 'ohio' },
  { code: 'ok', name: 'oklahoma' },
  { code: 'or', name: 'oregon' },
  { code: 'pa', name: 'pennsylvania' },
  { code: 'ri', name: 'rhode_island' },
  { code: 'sc', name: 'south_carolina' },
  { code: 'sd', name: 'south_dakota' },
  { code: 'tn', name: 'tennessee' },
  { code: 'tx', name: 'texas' },
  { code: 'ut', name: 'utah' },
  { code: 'vt', name: 'vermont' },
  { code: 'va', name: 'virginia' },
  { code: 'wa', name: 'washington' },
  { code: 'wv', name: 'west_virginia' },
  { code: 'wi', name: 'wisconsin' },
  { code: 'wy', name: 'wyoming' },
  { code: 'dc', name: 'district_of_columbia' }
];

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master';

// Cache to store loaded GeoJSON data
const geojsonCache: Map<string, any> = new Map();

/**
 * Fetch GeoJSON data for a specific state
 */
export async function fetchStateGeoJSON(stateCode: string): Promise<any | null> {
  // Check cache first
  if (geojsonCache.has(stateCode)) {
    return geojsonCache.get(stateCode);
  }

  const state = STATE_MAPPING.find(s => s.code === stateCode.toLowerCase());
  if (!state) {
    console.warn(`State code ${stateCode} not found`);
    return null;
  }

  try {
    const url = `${GITHUB_BASE_URL}/${state.code}_${state.name}_zip_codes_geo.min.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch GeoJSON for ${stateCode}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Cache the data
    geojsonCache.set(stateCode, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching GeoJSON for ${stateCode}:`, error);
    return null;
  }
}

/**
 * Fetch GeoJSON data for multiple states
 */
export async function fetchMultipleStates(stateCodes: string[]): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  
  await Promise.all(
    stateCodes.map(async (code) => {
      const data = await fetchStateGeoJSON(code);
      if (data) {
        results.set(code, data);
      }
    })
  );

  return results;
}

/**
 * Get zipcode boundary data for a specific zipcode
 */
export function getZipcodeBoundary(geojsonData: any, zipcode: string): any | null {
  if (!geojsonData || !geojsonData.features) {
    return null;
  }

  const feature = geojsonData.features.find((f: any) => 
    f.properties?.ZCTA5CE10 === zipcode || f.properties?.GEOID10 === zipcode
  );

  return feature || null;
}
