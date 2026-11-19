import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outDir = '.output';
const zip = readdirSync(outDir)
  .filter((f) => f.endsWith('-chrome.zip'))
  .map((f) => join(outDir, f))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];

if (!zip || !existsSync(zip)) {
  console.error('No chrome zip found in .output');
  process.exit(1);
}

copyFileSync(zip, 'docs/downloads/weblens-chrome.zip');
copyFileSync(zip, 'docs/downloads/weblens-0.1.1-chrome.zip');
if (existsSync('docs/downloads/weblens-0.1.0-chrome.zip')) {
  copyFileSync(zip, 'docs/downloads/weblens-0.1.0-chrome.zip');
}
if (existsSync('public/icon/128.png')) {
  copyFileSync('public/icon/128.png', 'docs/assets/icon-128.png');
}

console.log('updated downloads from', zip, statSync('docs/downloads/weblens-chrome.zip').size);
