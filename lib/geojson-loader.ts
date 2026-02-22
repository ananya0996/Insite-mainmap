// State abbreviations for all 50 states + DC
const STATE_CODES = [
  'ak', 'al', 'ar', 'az', 'ca', 'co', 'ct', 'dc', 'de', 'fl',
  'ga', 'hi', 'ia', 'id', 'il', 'in', 'ks', 'ky', 'la', 'ma',
  'md', 'me', 'mi', 'mn', 'mo', 'ms', 'mt', 'nc', 'nd', 'ne',
  'nh', 'nj', 'nm', 'nv', 'ny', 'oh', 'ok', 'or', 'pa', 'ri',
  'sc', 'sd', 'tn', 'tx', 'ut', 'va', 'vt', 'wa', 'wi', 'wv',
  'wy'
];

const STATE_NAMES: Record<string, string> = {
  'ak': 'alaska',
  'al': 'alabama',
  'ar': 'arkansas',
  'az': 'arizona',
  'ca': 'california',
  'co': 'colorado',
  'ct': 'connecticut',
  'dc': 'district_of_columbia',
  'de': 'delaware',
  'fl': 'florida',
  'ga': 'georgia',
  'hi': 'hawaii',
  'ia': 'iowa',
  'id': 'idaho',
  'il': 'illinois',
  'in': 'indiana',
  'ks': 'kansas',
  'ky': 'kentucky',
  'la': 'louisiana',
  'ma': 'massachusetts',
  'md': 'maryland',
  'me': 'maine',
  'mi': 'michigan',
  'mn': 'minnesota',
  'mo': 'missouri',
  'ms': 'mississippi',
  'mt': 'montana',
  'nc': 'north_carolina',
  'nd': 'north_dakota',
  'ne': 'nebraska',
  'nh': 'new_hampshire',
  'nj': 'new_jersey',
  'nm': 'new_mexico',
  'nv': 'nevada',
  'ny': 'new_york',
  'oh': 'ohio',
  'ok': 'oklahoma',
  'or': 'oregon',
  'pa': 'pennsylvania',
  'ri': 'rhode_island',
  'sc': 'south_carolina',
  'sd': 'south_dakota',
  'tn': 'tennessee',
  'tx': 'texas',
  'ut': 'utah',
  'va': 'virginia',
  'vt': 'vermont',
  'wa': 'washington',
  'wi': 'wisconsin',
  'wv': 'west_virginia',
  'wy': 'wyoming'
};

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master';

export interface ZipcodeFeature {
  type: 'Feature';
  properties: {
    ZCTA5CE10: string;
    GEOID10: string;
    CLASSFP10: string;
    MTFCC10: string;
    FUNCSTAT10: string;
    ALAND10: number;
    AWATER10: number;
    INTPTLAT10: string;
    INTPTLON10: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface ZipcodeGeoJSON {
  type: 'FeatureCollection';
  features: ZipcodeFeature[];
}

/**
 * Fetch GeoJSON data for a single state
 */
async function fetchStateGeoJSON(stateCode: string): Promise<ZipcodeGeoJSON | null> {
  try {
    const stateName = STATE_NAMES[stateCode];
    const url = `${GITHUB_RAW_BASE}/${stateCode}_${stateName}_zip_codes_geo.min.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch GeoJSON for ${stateCode}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching GeoJSON for ${stateCode}:`, error);
    return null;
  }
}

/**
 * Fetch all state GeoJSON files and combine them into a single FeatureCollection
 */
export async function fetchAllZipcodeGeoJSON(): Promise<ZipcodeGeoJSON> {
  console.log('[v0] Starting to fetch all state GeoJSON files...');
  
  // Fetch all states in parallel
  const promises = STATE_CODES.map(code => fetchStateGeoJSON(code));
  const results = await Promise.all(promises);
  
  // Combine all features into a single collection
  const allFeatures: ZipcodeFeature[] = [];
  let successCount = 0;
  
  results.forEach((geojson, index) => {
    if (geojson && geojson.features) {
      allFeatures.push(...geojson.features);
      successCount++;
    }
  });
  
  console.log(`[v0] Successfully loaded ${successCount}/${STATE_CODES.length} state GeoJSON files`);
  console.log(`[v0] Total zipcode boundaries: ${allFeatures.length}`);
  
  return {
    type: 'FeatureCollection',
    features: allFeatures
  };
}
