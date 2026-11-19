import { copyFileSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const outDir = '.output';
const zip = readdirSync(outDir)
  .filter((f) => /^weblens-[\d.]+-chrome\.zip$/.test(f) || f === 'weblens-chrome.zip')
  .map((f) => join(outDir, f))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];

if (!zip || !existsSync(zip)) {
  console.error('No chrome zip found in .output');
  process.exit(1);
}

const versionMatch = zip.replace(/\\/g, '/').match(/weblens-([\d.]+)-chrome\.zip$/);
const version = versionMatch?.[1] ?? 'latest';

copyFileSync(zip, 'docs/downloads/weblens-chrome.zip');
copyFileSync(zip, `docs/downloads/weblens-${version}-chrome.zip`);

// keep a stable alias for older footer links during transition
for (const legacy of ['0.1.0', '0.1.1']) {
  if (legacy !== version) {
    copyFileSync(zip, `docs/downloads/weblens-${legacy}-chrome.zip`);
  }
}

if (existsSync('public/icon/128.png')) {
  copyFileSync('public/icon/128.png', 'docs/assets/icon-128.png');
}

console.log('updated downloads from', zip, '->', version, statSync('docs/downloads/weblens-chrome.zip').size);
