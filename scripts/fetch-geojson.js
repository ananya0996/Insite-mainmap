import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// State abbreviations for all US states
const states = [
  'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
  'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
  'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
  'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
  'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy', 'dc'
];

const baseURL = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master';
const outputDir = path.join(__dirname, '..', 'public', 'geojson');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function fetchGeoJSON(state) {
  const url = `${baseURL}/${state}_${state}_zip_codes_geo.min.json`;
  console.log(`Fetching ${state.toUpperCase()}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`  ⚠️  ${state.toUpperCase()} not found (${response.status})`);
      return false;
    }
    
    const data = await response.json();
    const outputPath = path.join(outputDir, `${state}.geojson`);
    
    fs.writeFileSync(outputPath, JSON.stringify(data));
    console.log(`  ✓ ${state.toUpperCase()} saved successfully`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error fetching ${state.toUpperCase()}:`, error.message);
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
