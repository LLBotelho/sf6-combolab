/**
 * Discovers local fighter SVGs by their intended use:
 * - public/assets/portrait characters/: small Character Select portraits
 * - public/assets/display characters/: large selected / fighter-page artwork
 * The folders are deliberately not interchangeable. Images are never downloaded.
 */
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve('public/assets');
const output = resolve('src/data/fighterArt.generated.ts');

async function discover(folderName) {
  const base = join(root, folderName);
  const urls = [];
  async function visit(folder) {
    let items;
    try { items = await readdir(folder, { withFileTypes: true }); }
    catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const item of items) {
      const fullPath = join(folder, item.name);
      if (item.isDirectory()) await visit(fullPath);
      else if (item.isFile() && item.name.toLowerCase().endsWith('.svg')) {
        // Encode spaces and special characters, but keep directory separators.
        urls.push('/assets/' + relative(root, fullPath)
          .split(sep).map(encodeURIComponent).join('/'));
      }
    }
  }
  await visit(base);
  return urls.sort((a, b) => a.localeCompare(b));
}

const [portraits, displays] = await Promise.all([
  discover('portrait characters'),
  discover('display characters'),
]);
await mkdir(resolve('src/data'), { recursive: true });
await writeFile(output,
  '// AUTO-GENERATED — do not hand-edit. Run `npm run artwork` after moving SVGs.\n' +
  'export const availableFighterPortraitSvgs: readonly string[] = ' + JSON.stringify(portraits, null, 2) + ';\n' +
  'export const availableFighterDisplaySvgs: readonly string[] = ' + JSON.stringify(displays, null, 2) + ';\n',
  'utf8');
console.log(`[fighter artwork] ${portraits.length} portrait SVG(s), ${displays.length} display SVG(s).`);
if (!portraits.length || !displays.length) {
  console.warn('[fighter artwork] Confira as pastas public/assets/portrait characters e public/assets/display characters.');
}
