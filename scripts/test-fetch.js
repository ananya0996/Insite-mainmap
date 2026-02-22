console.log('[v0] Testing GeoJSON fetch...');

const testURL = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/ca_california_zip_codes_geo.min.json';

try {
  const response = await fetch(testURL);
  console.log('[v0] Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('[v0] Successfully fetched California GeoJSON');
    console.log('[v0] Number of features:', data.features?.length || 0);
  }
} catch (error) {
  console.error('[v0] Error:', error.message);
}
