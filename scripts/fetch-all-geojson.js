import fs from 'fs';
import path from 'path';

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

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Fetching GeoJSON files for all states...\n');

let successCount = 0;
let failCount = 0;

for (const state of states) {
  const url = `${baseURL}/${state.code}_${state.name}_zip_codes_geo.min.json`;
  console.log(`Fetching ${state.code.toUpperCase()}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`  Failed (${response.status})`);
      failCount++;
      continue;
    }
    
    const data = await response.json();
    const outputPath = path.join(outputDir, `${state.code}.geojson`);
    
    fs.writeFileSync(outputPath, JSON.stringify(data));
    console.log(`  Success - ${data.features?.length || 0} zipcodes`);
    successCount++;
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    failCount++;
  }
}

console.log(`\nComplete! Success: ${successCount}, Failed: ${failCount}`);
