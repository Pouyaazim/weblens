/**
 * بسته‌بندی افزونه داخل پوشه weblens تا بعد از Extract فایل‌ها پخش نشوند.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const root = process.cwd();
const src = join(root, '.output', 'chrome-mv3');
const stagingRoot = join(root, '.output', '_zip-staging');
const folderName = 'weblens';
const staged = join(stagingRoot, folderName);

if (!existsSync(src)) {
  console.error('Missing build output:', src);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version || '0.0.0';
const outZip = join(root, '.output', `weblens-${version}-chrome.zip`);
const outLatest = join(root, '.output', 'weblens-chrome.zip');

rmSync(stagingRoot, { recursive: true, force: true });
mkdirSync(staged, { recursive: true });
cpSync(src, staged, { recursive: true });

let packed = false;
try {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip();
  zip.addLocalFolder(staged, folderName);
  zip.writeZip(outZip);
  packed = true;
} catch {
  // fallback: tar (Windows 10+/macOS/Linux)
  try {
    rmSync(outZip, { force: true });
    execFileSync('tar', ['-a', '-cf', outZip, '-C', stagingRoot, folderName], { stdio: 'inherit' });
    packed = true;
  } catch (e) {
    console.error('Could not create zip', e);
    process.exit(1);
  }
}

if (!packed) process.exit(1);

cpSync(outZip, outLatest);
rmSync(stagingRoot, { recursive: true, force: true });

// sanity: first entry should be under weblens/
try {
  const AdmZip = require('adm-zip');
  const check = new AdmZip(outZip);
  const names = check.getEntries().map((e) => e.entryName);
  const ok = names.every((n) => n === `${folderName}/` || n.startsWith(`${folderName}/`));
  if (!ok) {
    console.error('Zip entries are not nested under weblens/', names.slice(0, 8));
    process.exit(1);
  }
  writeFileSync(join(root, '.output', 'zip-entries.txt'), names.slice(0, 20).join('\n'));
  console.log('packed', outZip, 'entries', names.length, 'sample', names.slice(0, 5));
} catch {
  console.log('packed', outZip);
}
