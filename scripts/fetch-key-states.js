import fs from 'fs';
import path from 'path';

const states = [
  { code: 'ca', name: 'california' },
  { code: 'ny', name: 'new_york' },
  { code: 'tx', name: 'texas' },
  { code: 'fl', name: 'florida' },
  { code: 'il', name: 'illinois' }
];

const baseURL = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master';
const outputDir = path.join(process.cwd(), 'public', 'geojson');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Fetching key state GeoJSON files...\n');

for (const state of states) {
  const url = `${baseURL}/${state.code}_${state.name}_zip_codes_geo.min.json`;
  console.log(`Fetching ${state.code.toUpperCase()}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`  Failed: ${response.status}`);
      continue;
    }
    
    const data = await response.json();
    const outputPath = path.join(outputDir, `${state.code}.geojson`);
    
    fs.writeFileSync(outputPath, JSON.stringify(data));
    console.log(`  Saved: ${data.features?.length || 0} zipcodes\n`);
  } catch (error) {
    console.error(`  Error: ${error.message}\n`);
  }
}

console.log('Done!');
