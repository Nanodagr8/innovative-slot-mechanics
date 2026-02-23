/**
 * Sprite Sheet Extractor
 * Extracts individual atlas regions from composite sprite sheet images
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Source images (the uploaded composites)
const SOURCES = {
    // The quad-grid composite (enemies, player, fx, boss)
    quad: path.join(__dirname, '../frontend/assets/atlases/atlas_quad.png'),
    // The 8-panel composite  
    full8: path.join(__dirname, '../frontend/assets/atlases/game_atlas.png')
};

const OUTPUT_DIR = path.join(__dirname, '../frontend/assets/atlases/extracted');

// Region definitions based on visual analysis of the uploaded images
// Format: { name, sourceKey, x, y, width, height }
const REGIONS = [
    // From atlas_quad.png (2x2 grid, each quadrant ~512x512 in a 1024x1024 image)
    // Top-left: enemies
    { name: 'enemies_base', source: 'quad', x: 0, y: 0, w: 512, h: 512 },
    // Top-right: player
    { name: 'player', source: 'quad', x: 512, y: 0, w: 512, h: 512 },
    // Bottom-left: fx
    { name: 'fx', source: 'quad', x: 0, y: 512, w: 512, h: 512 },
    // Bottom-right: boss
    { name: 'boss', source: 'quad', x: 512, y: 512, w: 512, h: 512 }
];

async function extractRegions() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('[Extractor] Starting sprite extraction...');

    for (const region of REGIONS) {
        const sourcePath = SOURCES[region.source];

        if (!fs.existsSync(sourcePath)) {
            console.warn(`[Extractor] Source not found: ${sourcePath}`);
            continue;
        }

        const outputPath = path.join(OUTPUT_DIR, `${region.name}.png`);

        try {
            // Get image metadata first
            const metadata = await sharp(sourcePath).metadata();
            console.log(`[Extractor] Source ${region.source}: ${metadata.width}x${metadata.height}`);

            // Scale extraction coordinates based on actual image size
            const scaleX = metadata.width / 1024;
            const scaleY = metadata.height / 1024;

            const extractX = Math.round(region.x * scaleX);
            const extractY = Math.round(region.y * scaleY);
            const extractW = Math.round(region.w * scaleX);
            const extractH = Math.round(region.h * scaleY);

            await sharp(sourcePath)
                .extract({
                    left: extractX,
                    top: extractY,
                    width: extractW,
                    height: extractH
                })
                .png()
                .toFile(outputPath);

            console.log(`[Extractor] Extracted: ${region.name} -> ${outputPath}`);
        } catch (err) {
            console.error(`[Extractor] Failed to extract ${region.name}:`, err.message);
        }
    }

    console.log('[Extractor] Extraction complete!');
}

extractRegions().catch(console.error);
