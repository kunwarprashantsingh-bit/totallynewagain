import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

async function main() {
  const zip = new AdmZip();
  const root = process.cwd();
  const distPath = path.join(root, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist folder does not exist. Please run build first.');
    process.exit(1);
  }

  // Add the entire dist directory to the zip archive
  zip.addLocalFolder(distPath);
  
  const outputPath = path.join(root, 'public', 'dist.zip');
  
  // Ensure public folder exists
  const publicDir = path.join(root, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  zip.writeZip(outputPath);
  console.log(`Successfully created ${outputPath}`);
}

main().catch(console.error);
