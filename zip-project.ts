import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

const zip = new AdmZip();

function addDirectoryToZip(dirPath: string, zipPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    // Skip node_modules, dist, public, hidden directories/files (except .gitignore and .env.example), and any zip files
    const isDotKeep = file === ".gitignore" || file === ".env.example";
    if (
      (file.startsWith(".") && !isDotKeep) ||
      ["node_modules", "dist", "public", "temp", "coverage", "out", "build"].includes(file) ||
      file.endsWith(".zip")
    ) {
      continue;
    }
    
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      addDirectoryToZip(fullPath, path.join(zipPath, file));
    } else {
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

// Add root files and src directory
addDirectoryToZip(process.cwd(), "");

// Manually add public folder contents (excluding the zip itself if it exists)
if (fs.existsSync("public")) {
  const publicFiles = fs.readdirSync("public");
  for (const file of publicFiles) {
    if (file === "source.zip") continue;
    const fullPath = path.join("public", file);
    if (fs.statSync(fullPath).isDirectory()) {
      zip.addLocalFolder(fullPath, "public/" + file);
    } else {
      zip.addLocalFile(fullPath, "public");
    }
  }
}

if (!fs.existsSync(path.join(process.cwd(), "public"))) {
  fs.mkdirSync(path.join(process.cwd(), "public"), { recursive: true });
}

zip.writeZip(path.join(process.cwd(), "public", "source.zip"));
console.log("Successfully created public/source.zip");
