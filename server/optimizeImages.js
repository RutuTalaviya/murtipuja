const fs = require("fs");
const path = require("path");
let sharp = null;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("sharp is required for optimize script:", e.message);
  process.exit(1);
}

const uploadsDir = path.join(__dirname, "uploads");

async function runOptimization() {
  if (!fs.existsSync(uploadsDir)) {
    console.log("No uploads directory found.");
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} total files in ${uploadsDir}`);

  let optimizedCount = 0;
  let totalSavedBytes = 0;

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const ext = path.extname(file).toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".bmp"].includes(ext);

    if (!isImage) continue;

    const stats = fs.statSync(filePath);
    // If file is larger than 100KB, optimize it
    if (stats.size > 100 * 1024) {
      try {
        const rawBuffer = fs.readFileSync(filePath);
        const optimizedBuffer = await sharp(rawBuffer)
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const baseName = path.basename(file, ext);
        const newFileName = `${baseName}.webp`;
        const newFilePath = path.join(uploadsDir, newFileName);

        fs.writeFileSync(newFilePath, optimizedBuffer);
        const saved = stats.size - optimizedBuffer.size;
        totalSavedBytes += saved;
        optimizedCount++;

        console.log(`[Optimized] ${file} (${(stats.size / 1024).toFixed(1)} KB -> ${(optimizedBuffer.size / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.warn(`Failed to optimize ${file}:`, err.message);
      }
    }
  }

  console.log(`Optimization complete! Optimized ${optimizedCount} images. Total disk space saved: ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB`);
}

runOptimization();
