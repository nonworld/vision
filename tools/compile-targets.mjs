/* =============================================================================
 * NON WebAR — target compiler (Node, CPU)
 * -----------------------------------------------------------------------------
 * Compiles every label in targets/src/*.png into MindAR .mind files:
 *   - one single-target file per SKU  (fast ?sku= path)
 *   - one combined non-all.mind        (no-param detection fallback)
 *
 * This is the primary, fastest way to (re)build targets — the whole set takes
 * ~25s on CPU. (tools/compile.html is a zero-install browser fallback.)
 *
 * Setup + run:
 *   cd tools
 *   npm install
 *   npm run compile
 *
 * MindAR's OfflineCompiler hard-imports node-canvas, which needs system libs
 * (cairo/pango). We sidestep that with @napi-rs/canvas (prebuilt, zero system
 * deps) and a tiny shim that makes `import 'canvas'` resolve to it. The shim is
 * (re)written automatically below, so `npm install && npm run compile` works on
 * a clean checkout.
 * =============================================================================
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..');
const SRC = resolve(REPO, 'targets/src');
const OUT = resolve(REPO, 'targets');

// SKU order — MUST match config.js `combinedOrder` (drives targetIndex).
const ORDER = ['non1', 'non2', 'non3', 'non5', 'non7', 'non9'];

// --- ensure the canvas → @napi-rs/canvas shim exists before importing mind-ar
function ensureCanvasShim() {
  const canvasDir = resolve(__dirname, 'node_modules/canvas');
  const shim = resolve(canvasDir, 'shim.mjs');
  if (!existsSync(canvasDir)) mkdirSync(canvasDir, { recursive: true });
  writeFileSync(
    resolve(canvasDir, 'package.json'),
    JSON.stringify({ name: 'canvas', version: '0.0.0-shim', type: 'module', main: 'shim.mjs', exports: './shim.mjs' }, null, 2)
  );
  writeFileSync(shim, "export { createCanvas, loadImage, Image } from '@napi-rs/canvas';\n");
}

ensureCanvasShim();

// Dynamic imports AFTER the shim is in place.
const { loadImage } = await import('@napi-rs/canvas');
const { OfflineCompiler } = await import('mind-ar/src/image-target/offline-compiler.js');

async function compile(skus, outFile) {
  const images = [];
  for (const s of skus) images.push(await loadImage(resolve(SRC, `${s}.png`)));
  const compiler = new OfflineCompiler();
  await compiler.compileImageTargets(images, () => {});
  const buffer = compiler.exportData();
  writeFileSync(outFile, Buffer.from(buffer));
  console.log(`✓ ${outFile.split('/').pop()} (${(buffer.length / 1024).toFixed(0)} KB, ${skus.length} target${skus.length > 1 ? 's' : ''})`);
}

const t0 = Date.now();
for (const sku of ORDER) await compile([sku], resolve(OUT, `${sku}.mind`));
await compile(ORDER, resolve(OUT, 'non-all.mind'));
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
