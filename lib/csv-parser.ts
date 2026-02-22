export interface ZipcodeData {
  zipcode: string;
  overall_score: number;
  county_name: string;
  latitude: number;
  longitude: number;
}

export function parseCSV(csvText: string): ZipcodeData[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const key = header.trim();
      const value = values[index]?.trim();
      
      if (key === 'overall_score' || key === 'latitude' || key === 'longitude') {
        obj[key] = parseFloat(value);
      } else {
        obj[key] = value;
      }
    });
    
    return obj as ZipcodeData;
  });
}
