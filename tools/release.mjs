#!/usr/bin/env node
// Freeze builds from src/index.html.
//
//   node tools/release.mjs m1.10        set src/ to M1.10, write builds/m1.10 and builds/m1.10-qa,
//                                       update builds/SHA256SUMS and the version in tests/package.json
//   node tools/release.mjs dev [m1.10] [--test]
//                                       write a throwaway build pair of the current src/ to .work/builds/ (named
//                                       after src's version, or the one given), and optionally run the test suite
//
// The QA build differs from the release build in exactly two lines (the <title> and QA_BUILD), which the
// tests check. Each build's README.md is hand-written: the script never overwrites one, it only warns.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/index.html');
const args = process.argv.slice(2);
const target = args[0];
if (!target || !(target === 'dev' || /^m\d+(\.\d+){0,2}$/.test(target))) {
  console.error('usage: node tools/release.mjs <m1.10 | dev [m1.10] [--test]>');
  process.exit(2);
}

let src = fs.readFileSync(SRC, 'utf8');
const cur = (src.match(/<title>Labyrinth Remake \((M[\d.]+) prototype\)<\/title>/) || [])[1];
if (!cur) { console.error('src/index.html: no "<title>Labyrinth Remake (Mx.y prototype)</title>" line'); process.exit(1); }
const devVer = args.slice(1).find(a => /^m\d+(\.\d+){0,2}$/.test(a));
const ver = target === 'dev' ? (devVer || cur.toLowerCase()) : target; // e.g. m1.10
const VER = ver.toUpperCase(); // e.g. M1.10

// Version strings that name the build. Each must occur exactly once.
const VERSION_SITES = [
  [/<title>Labyrinth Remake \(M[\d.]+ prototype\)<\/title>/, `<title>Labyrinth Remake (${VER} prototype)</title>`],
  [/'M[\d.]+ PROTOTYPE - PLACEHOLDER TITLE'/, `'${VER} PROTOTYPE - PLACEHOLDER TITLE'`],
  [/Labyrinth Remake - M[\d.]+ prototype/, `Labyrinth Remake - ${VER} prototype`],
  [/var QA_BUILD=false; \/\* the QA build \(build\/m[\d.]+-qa\) flips this to true \*\//, `var QA_BUILD=false; /* the QA build (build/${ver}-qa) flips this to true */`],
];
for (const [re, rep] of VERSION_SITES) {
  const n = (src.match(new RegExp(re.source, 'g')) || []).length;
  if (n !== 1) { console.error(`src/index.html: expected one match of ${re}, found ${n}`); process.exit(1); }
  src = src.replace(re, rep);
}
const qa = src
  .replace(`<title>Labyrinth Remake (${VER} prototype)</title>`, `<title>Labyrinth Remake (${VER} prototype, QA build)</title>`)
  .replace(/var QA_BUILD=false;.*$/m, 'var QA_BUILD=true; /* QA build: the test hook is always on */');
const diff = src.split('\n').filter((l, i) => l !== qa.split('\n')[i]).length;
if (diff !== 2) { console.error(`QA build should differ in 2 lines, differs in ${diff}`); process.exit(1); }

const outDir = target === 'dev' ? path.join(ROOT, '.work/builds') : path.join(ROOT, 'builds');
if (target === 'dev') { // some tests compare against older frozen builds: link them in next to the dev pair
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const d of fs.readdirSync(path.join(ROOT, 'builds'))) {
    if (d === ver || d === `${ver}-qa` || !fs.statSync(path.join(ROOT, 'builds', d)).isDirectory()) continue;
    fs.symlinkSync(path.join(ROOT, 'builds', d), path.join(outDir, d));
  }
}
const write = (rel, text) => { const f = path.join(outDir, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
write(`${ver}/index.html`, src);
write(`${ver}-qa/index.html`, qa);
console.log(`wrote ${path.relative(ROOT, outDir)}/${ver}/index.html and ${ver}-qa/index.html (${(Buffer.byteLength(src) / 1024).toFixed(1)} KB)`);

if (target === 'dev') {
  if (args.includes('--test')) {
    const r = spawnSync(process.execPath, [...process.execArgv, 'm1.test.mjs', ver], {
      cwd: path.join(ROOT, 'tests'), stdio: 'inherit', env: { ...process.env, BUILDS_DIR: outDir },
    });
    process.exit(r.status ?? 1);
  }
  console.log(`test it: cd tests && BUILDS_DIR=../.work/builds node m1.test.mjs ${ver}`);
  process.exit(0);
}

// Release: keep src/ in step with the frozen build, refresh checksums and the test package.
fs.writeFileSync(SRC, src);
const sums = [];
for (const rel of fs.readdirSync(outDir).map(d => `${d}/index.html`).sort()) { // byte order of the paths, like `LC_ALL=C sort`
  const f = path.join(outDir, rel);
  if (fs.existsSync(f)) sums.push(`${crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')}  ${rel}`);
}
fs.writeFileSync(path.join(outDir, 'SHA256SUMS'), sums.join('\n') + '\n');
const pkgFile = path.join(ROOT, 'tests/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
const nums = ver.slice(1).split('.').map(Number);
pkg.version = [nums[0] ?? 1, nums[1] ?? 0, nums[2] ?? 0].join('.');
pkg.scripts.test = `node m1.test.mjs ${ver}`;
fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
console.log(`updated src/index.html, builds/SHA256SUMS (${sums.length} builds) and tests/package.json (${pkg.version})`);
for (const d of [ver, `${ver}-qa`]) if (!fs.existsSync(path.join(outDir, d, 'README.md'))) console.warn(`note: builds/${d}/README.md is missing; write the build notes by hand`);
