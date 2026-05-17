import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const projectBase = '/friday-night-dynasty/';
const indexPath = resolve(process.cwd(), 'dist', 'index.html');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!existsSync(indexPath)) {
  fail('dist/index.html not found. Run `pnpm build` first.');
  process.exit();
}

const indexHtml = readFileSync(indexPath, 'utf8');

const checks = [
  {
    name: 'root element exists',
    ok: indexHtml.includes('<div id="root"></div>')
  },
  {
    name: 'JavaScript bundle is referenced',
    ok: /<script[^>]+type="module"[^>]+src="\/friday-night-dynasty\/assets\/[^"']+\.js"/.test(indexHtml)
  },
  {
    name: 'CSS bundle is referenced',
    ok: /<link[^>]+href="\/friday-night-dynasty\/assets\/[^"']+\.css"/.test(indexHtml)
  },
  {
    name: 'GitHub Pages base path is used',
    ok: indexHtml.includes(projectBase)
  },
  {
    name: 'no root-only /assets/ references remain',
    ok: !/(src|href)="\/assets\//.test(indexHtml)
  }
];

for (const check of checks) {
  if (check.ok) {
    pass(check.name);
  } else {
    fail(check.name);
  }
}

if (process.exitCode) {
  console.error('\nIndex check failed. Most likely Vite base path or build output is wrong.');
  process.exit();
}

console.log('\nBuilt index is ready for GitHub Pages.');
