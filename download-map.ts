import fs from 'fs';
import path from 'path';

async function download() {
  const url = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';
  console.log(`Downloading topojson from ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch map data: ${response.statusText}`);
  }
  const text = await response.text();
  const destDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const destPath = path.join(destDir, 'world-110m.json');
  fs.writeFileSync(destPath, text, 'utf8');
  console.log(`Map data downloaded successfully to ${destPath} (${text.length} bytes)`);
}

download().catch((err) => {
  console.error("Failed to download map:", err);
  process.exit(1);
});
