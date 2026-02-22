import urllib.request
import json
import os

# State abbreviations and names
states = [
    {'code': 'al', 'name': 'alabama'},
    {'code': 'ak', 'name': 'alaska'},
    {'code': 'az', 'name': 'arizona'},
    {'code': 'ar', 'name': 'arkansas'},
    {'code': 'ca', 'name': 'california'},
    {'code': 'co', 'name': 'colorado'},
    {'code': 'ct', 'name': 'connecticut'},
    {'code': 'de', 'name': 'delaware'},
    {'code': 'fl', 'name': 'florida'},
    {'code': 'ga', 'name': 'georgia'},
    {'code': 'hi', 'name': 'hawaii'},
    {'code': 'id', 'name': 'idaho'},
    {'code': 'il', 'name': 'illinois'},
    {'code': 'in', 'name': 'indiana'},
    {'code': 'ia', 'name': 'iowa'},
    {'code': 'ks', 'name': 'kansas'},
    {'code': 'ky', 'name': 'kentucky'},
    {'code': 'la', 'name': 'louisiana'},
    {'code': 'me', 'name': 'maine'},
    {'code': 'md', 'name': 'maryland'},
    {'code': 'ma', 'name': 'massachusetts'},
    {'code': 'mi', 'name': 'michigan'},
    {'code': 'mn', 'name': 'minnesota'},
    {'code': 'ms', 'name': 'mississippi'},
    {'code': 'mo', 'name': 'missouri'},
    {'code': 'mt', 'name': 'montana'},
    {'code': 'ne', 'name': 'nebraska'},
    {'code': 'nv', 'name': 'nevada'},
    {'code': 'nh', 'name': 'new_hampshire'},
    {'code': 'nj', 'name': 'new_jersey'},
    {'code': 'nm', 'name': 'new_mexico'},
    {'code': 'ny', 'name': 'new_york'},
    {'code': 'nc', 'name': 'north_carolina'},
    {'code': 'nd', 'name': 'north_dakota'},
    {'code': 'oh', 'name': 'ohio'},
    {'code': 'ok', 'name': 'oklahoma'},
    {'code': 'or', 'name': 'oregon'},
    {'code': 'pa', 'name': 'pennsylvania'},
    {'code': 'ri', 'name': 'rhode_island'},
    {'code': 'sc', 'name': 'south_carolina'},
    {'code': 'sd', 'name': 'south_dakota'},
    {'code': 'tn', 'name': 'tennessee'},
    {'code': 'tx', 'name': 'texas'},
    {'code': 'ut', 'name': 'utah'},
    {'code': 'vt', 'name': 'vermont'},
    {'code': 'va', 'name': 'virginia'},
    {'code': 'wa', 'name': 'washington'},
    {'code': 'wv', 'name': 'west_virginia'},
    {'code': 'wi', 'name': 'wisconsin'},
    {'code': 'wy', 'name': 'wyoming'},
    {'code': 'dc', 'name': 'district_of_columbia'}
]

base_url = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master'
output_dir = '/vercel/share/v0-project/public/geojson'

# Create output directory
os.makedirs(output_dir, exist_ok=True)

print("Starting GeoJSON download...")
print(f"Output directory: {output_dir}\n")

successful = 0
failed = 0

for state in states:
    url = f"{base_url}/{state['code']}_{state['name']}_zip_codes_geo.min.json"
    output_path = f"{output_dir}/{state['code']}.geojson"
    
    print(f"Fetching {state['code'].upper()}...", end=' ')
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())
            
        with open(output_path, 'w') as f:
            json.dump(data, f)
        
        feature_count = len(data.get('features', []))
        print(f"✓ Success ({feature_count} features)")
        successful += 1
        
    except Exception as e:
        print(f"✗ Failed: {str(e)}")
        failed += 1

print(f"\n{'='*50}")
print(f"Download complete!")
print(f"Successful: {successful}")
print(f"Failed: {failed}")
print(f"{'='*50}")
