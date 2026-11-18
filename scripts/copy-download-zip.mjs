import { copyFileSync, statSync } from 'node:fs';

copyFileSync('.output/weblens-0.1.0-chrome.zip', 'docs/downloads/weblens-0.1.0-chrome.zip');
copyFileSync('.output/weblens-0.1.0-chrome.zip', 'docs/downloads/weblens-chrome.zip');
copyFileSync('public/icon/128.png', 'docs/assets/icon-128.png');

console.log('updated downloads', statSync('docs/downloads/weblens-chrome.zip').size);
