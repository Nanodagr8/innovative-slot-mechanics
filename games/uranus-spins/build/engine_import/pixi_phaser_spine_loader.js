import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Assets } from 'pixi.js';

/**
 * Uranus Spins Asset Loader & Spine Factory
 * (GOD-MODE Studio Grade Integration)
 */

export async function loadUranusSpinsAssets(manifests) {
    console.log("[Uranus] Loading manifests:", Object.keys(manifests));

    const assetsToLoad = [];
    for (const group in manifests) {
        // Assume naming convention: group.json + group.png + group.atlas
        assetsToLoad.push({ alias: group, src: `assets/spine/${group}.json` });
    }

    return await Assets.load(assetsToLoad);
}

export function createSpine(name, spineData) {
    if (!spineData) {
        console.error(`[Uranus] Missing spine data for ${name}`);
        return null;
    }

    const spine = new Spine(spineData.spineData);

    // Auto-wiring events based on mapped schema
    spine.state.addListener({
        event: (entry, event) => {
            console.log(`[Spine Event] ${name} -> ${event.data.name}`, event.floatValue, event.stringValue);
            // Emit as engine event
            spine.emit(event.data.name, event);
        }
    });

    return spine;
}
