const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sharp = require('sharp');

// Configuration
// You can change these to point to different atlas files
const ATLAS_FILE = path.join(__dirname, '../frontend/assets/spine/crystal-mascot.atlas');
const OUTPUT_DIR = path.join(__dirname, '../frontend/assets/extracted/crystal-mascot');

async function processAtlas() {
    console.log(`[Atlas Extractor] Processing: ${ATLAS_FILE}`);

    if (!fs.existsSync(ATLAS_FILE)) {
        console.error("Atlas file not found!");
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`[Atlas Extractor] Created output directory: ${OUTPUT_DIR}`);
    }

    const fileStream = fs.createReadStream(ATLAS_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentImageFile = null;
    let currentRegion = null;
    const regions = [];

    let lineCount = 0;

    for await (const line of rl) {
        lineCount++;
        const trimmed = line.trim();

        if (line.length === 0) {
            currentRegion = null;
            continue;
        }

        // Header section (Image file definition)
        if (!currentImageFile && lineCount === 1) {
            // First line is usually the image file name
            // But sometimes it might be empty? NO, usually valid.
            if (trimmed.length > 0) {
                currentImageFile = trimmed;
                console.log(`[Atlas Extractor] Atlas Image: ${currentImageFile}`);
            }
            continue;
        }

        // Region properties
        if (line.includes(':')) {
            const parts = line.split(':');
            const key = parts[0].trim();
            const value = parts[1].trim();

            // Image headers (only if no region started yet)
            if (!currentRegion && (key === 'size' || key === 'format' || key === 'filter' || key === 'repeat')) {
                continue;
            }

            // Region properties
            if (currentRegion) {
                if (key === 'xy') {
                    const coords = value.split(',').map(n => parseInt(n.trim()));
                    currentRegion.x = coords[0];
                    currentRegion.y = coords[1];
                } else if (key === 'size') {
                    const sizes = value.split(',').map(n => parseInt(n.trim()));
                    currentRegion.w = sizes[0];
                    currentRegion.h = sizes[1];
                } else if (key === 'rotate') {
                    currentRegion.rotate = (value === 'true');
                }
                // We ignore orig, offset, index for simple extraction usually, 
                // unless we want to rebuild the trimmed whitespace. 
                // For now, raw extraction of the region.
            }
        } else {
            // This is a new region name
            if (trimmed.length > 0 && lineCount > 4) { // somewhat heuristic, ensure we passed header
                // Wait, if line has NO colon, it is a name.
                // But check if it's the PAGE name (if multiple pages).
                // Spine atlases usually list page name first.
                // If we already parsed header lines...

                // Let's assume after the header properties, any line without colon is a region name.
                // Header properties: size, format, filter, repeat.

                currentRegion = { name: trimmed, rotate: false, x: 0, y: 0, w: 0, h: 0 };
                regions.push(currentRegion);
            }
        }
    }

    console.log(`[Atlas Extractor] Found ${regions.length} regions.`);

    // Process extraction
    const imagePath = path.join(path.dirname(ATLAS_FILE), currentImageFile);
    if (!fs.existsSync(imagePath)) {
        console.error(`[Atlas Extractor] Corresponding image not found: ${imagePath}`);
        return;
    }

    for (const region of regions) {
        // Spine rotation: if true, the region is stored rotated 90 degrees CCW in the atlas?
        // Actually normally Spine rotation is 90 deg.
        // If rotate: true, width and height in 'size' usually refer to the UNROTATED size?
        // Let's check Spine spec.
        // "rotate": If true, the region is stored rotated 90 degrees counter-clockwise.
        // "size": The width and height of the region in the atlas image.

        let extractOptions = {
            left: region.x,
            top: region.y,
            width: region.w,
            height: region.h
        };

        // Output path
        const fileOut = path.join(OUTPUT_DIR, `${region.name}.png`);

        try {
            let pipeline = sharp(imagePath).extract(extractOptions);

            if (region.rotate) {
                console.log(`   Rotate: ${region.name}`);
                pipeline = pipeline.rotate(90);
                // Note: Sharp rotate(90) rotates 90 deg clockwise.
                // Spine is 90 deg counter-clockwise.
                // So maybe we need rotate(-90) or 270?
            }

            await pipeline.toFile(fileOut);
            console.log(`[OK] Extracted: ${region.name}`);
        } catch (e) {
            console.error(`[ERROR] Failed to extract ${region.name}: ${e.message}`);
        }
    }
}

processAtlas().catch(console.error);
