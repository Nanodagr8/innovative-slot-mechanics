/**
 * Bundle stake-engine RGS Client for browser use
 * Run: node tools/bundle-rgs-client.js
 */
const esbuild = require('esbuild');
const path = require('path');

const entryContent = `
import { RGSClient, DisplayAmount, ParseAmount } from 'stake-engine';
window.RGSClient = RGSClient;
window.DisplayAmount = DisplayAmount;
window.ParseAmount = ParseAmount;
`;

const entryFile = path.join(__dirname, 'rgs-entry.mjs');
require('fs').writeFileSync(entryFile, entryContent);

esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    format: 'iife',
    globalName: 'StakeEngine',
    outfile: path.join(__dirname, '..', 'games', 'hexakeno', 'stake-release', 'frontend', 'stake-engine-bundle.js'),
    platform: 'browser',
    target: ['es2020'],
    minify: false,
}).then(() => {
    console.log('[Bundle] stake-engine-bundle.js created successfully.');
    require('fs').unlinkSync(entryFile);
}).catch((err) => {
    console.error('[Bundle] Failed:', err);
    process.exit(1);
});
