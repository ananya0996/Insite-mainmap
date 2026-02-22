import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// State abbreviations and names for all US states
const states = [
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

const baseURL = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master';
const outputDir = path.join(process.cwd(), 'public', 'geojson');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function fetchGeoJSON(state) {
  const url = `${baseURL}/${state.code}_${state.name}_zip_codes_geo.min.json`;
  console.log(`Fetching ${state.code.toUpperCase()}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`  ⚠️  ${state.code.toUpperCase()} not found (${response.status})`);
      return false;
    }
    
    const data = await response.json();
    const outputPath = path.join(outputDir, `${state.code}.geojson`);
    
    fs.writeFileSync(outputPath, JSON.stringify(data));
    console.log(`  ✓ ${state.code.toUpperCase()} saved successfully`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error fetching ${state.code.toUpperCase()}:`, error.message);
    return false;
  }
}

async function fetchAllStates() {
  console.log('Starting GeoJSON fetch for all US states...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  // Fetch states in batches to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < states.length; i += batchSize) {
    const batch = states.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchGeoJSON));
    
    results.forEach(success => {
      if (success) successCount++;
      else failCount++;
    });
    
    // Small delay between batches
    if (i + batchSize < states.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n✓ Fetch complete!`);
  console.log(`  Success: ${successCount} states`);
  console.log(`  Failed: ${failCount} states`);
  console.log(`  Output directory: ${outputDir}`);
}

fetchAllStates().catch(console.error);
