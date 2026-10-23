#!/usr/bin/env node
/*
 * Validate the per-category data modules and regenerate data/counts.js.
 *
 *   node scripts/build-data.js           validate, then rewrite data/counts.js
 *                                        and the tool count in index.html
 *   node scripts/build-data.js --check   validate only; exit 1 if anything is
 *                                        invalid or out of date (use before a PR)
 *
 * Requires Node.js 16+. No dependencies.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');
const rel = p => path.relative(ROOT, p).split(path.sep).join('/');
const errors = [];
const warnings = [];

// Names deliberately listed in more than one category (present since the
// 2024.1 data). Any other cross-category duplicate is reported as a warning.
const KNOWN_SHARED = new Set([
  'image_export', 'ncdu', 'exiftool', 'pypykatz', 'yarp-memcarver', 'aws_ir',
  'cloudforensics', 'ec2metadata', 'ScoutSuite', 's3fs', 'sshfs', 'keyhunter',
  'pehash', 'Kazam', 'dnsrecon', 'Tor Browser', 'BTCrecover'
]);

// Different spellings of the same tool, counted once in TOTAL.
// (The 26.03 listing itself spells this one both ways.)
const ALIASES = { 'aws_cli': 'aws CLI' };

// Same slug rule that produced the existing file names
// ("Office & Docs" -> "office-and-docs").
const slug = name => name.toLowerCase().replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function run(file, ctx, expose) {
  const code = fs.readFileSync(file, 'utf8') + (expose ? `\n;globalThis.__out={${expose}};` : '');
  vm.runInContext(code, ctx, { filename: rel(file) });
  return ctx.__out;
}

// ── 1. manifest and runbooks ────────────────────────────────────────────────
const ctx = vm.createContext({});
ctx.window = ctx;
let M, RB;
try {
  M = run(path.join(ROOT, 'data/manifest.js'), ctx, 'CAT,TAB_GROUPS,SUBCATS,EV_TYPES,CAT_EV_DEFAULTS');
} catch (e) { console.error('data/manifest.js: ' + e.message); process.exit(1); }
try {
  RB = run(path.join(ROOT, 'data/runbooks.js'), ctx, 'RUNBOOKS').RUNBOOKS;
} catch (e) { errors.push('data/runbooks.js: ' + e.message); RB = []; }

const CATS = Object.keys(M.CAT);
const CAT_FILE = Object.fromEntries(CATS.map(c => [c, slug(c)]));

for (const c of CATS) {
  const m = M.CAT[c];
  if (!m || !m.i || !/^#[0-9a-f]{6}$/i.test(m.c || '') || !m.d) errors.push(`manifest: CAT['${c}'] needs i (icon), c (#rrggbb colour) and d (description)`);
  if (!M.TAB_GROUPS.some(g => g.tabs.includes(c))) warnings.push(`manifest: '${c}' is not in any TAB_GROUPS entry, so it has no tab`);
}
for (const g of M.TAB_GROUPS) for (const t of g.tabs)
  if (!t.startsWith('__') && !CATS.includes(t)) errors.push(`manifest: TAB_GROUPS '${g.label}' lists unknown category '${t}'`);
for (const c of Object.keys(M.SUBCATS)) if (!CATS.includes(c)) errors.push(`manifest: SUBCATS has unknown category '${c}'`);

// ── 2. category modules ─────────────────────────────────────────────────────
const toolsDir = path.join(ROOT, 'data/tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js')).sort();
for (const c of CATS) if (!files.includes(CAT_FILE[c] + '.js'))
  errors.push(`category '${c}' has no module: create data/tools/${CAT_FILE[c]}.js`);
for (const f of files) if (!Object.values(CAT_FILE).includes(f.replace(/\.js$/, '')))
  errors.push(`data/tools/${f} does not match any category in data/manifest.js (expected one of: ${Object.values(CAT_FILE).join(', ')})`);

const tools = [];
const counts = Object.fromEntries(CATS.map(c => [c, 0]));
const TYPES = new Set();
for (const f of files) {
  const cat = CATS.find(c => CAT_FILE[c] + '.js' === f);
  if (!cat) continue; // already reported above
  const file = path.join(toolsDir, f);
  const tctx = vm.createContext({});
  tctx.window = tctx;
  try { run(file, tctx); } catch (e) { errors.push(`data/tools/${f}: ${e.message}`); continue; }
  const data = tctx.TS_DATA || {};
  const keys = Object.keys(data);
  if (!keys.includes(cat)) errors.push(`data/tools/${f}: must assign window.TS_DATA["${cat}"]`);
  for (const k of keys) {
    if (k !== cat) { errors.push(`data/tools/${f}: assigns TS_DATA["${k}"] but this file belongs to '${cat}'`); continue; }
    if (!Array.isArray(data[k])) { errors.push(`data/tools/${f}: TS_DATA["${k}"] is not an array`); continue; }
    const seen = new Set();
    data[k].forEach((t, i) => {
      const where = `data/tools/${f} #${i + 1} (${t && t.n ? t.n : 'no name'})`;
      if (!t || typeof t !== 'object') { errors.push(`${where}: not an object`); return; }
      for (const key of ['n', 't', 'c', 'p', 'ev'])
        if (!(key in t)) errors.push(`${where}: missing '${key}'`);
      if (typeof t.n !== 'string' || !t.n.trim()) errors.push(`${where}: 'n' must be a non-empty string`);
      if (typeof t.t !== 'string' || !t.t.trim()) errors.push(`${where}: 't' must be a non-empty string`);
      if ('p' in t && typeof t.p !== 'string') errors.push(`${where}: 'p' must be a string ('' if unknown)`);
      if ('s' in t && typeof t.s !== 'string') errors.push(`${where}: 's' must be a string ('' if unknown)`);
      if (t.c !== cat) errors.push(`${where}: c is '${t.c}' but the file is for '${cat}'`);
      if (!Array.isArray(t.ev)) errors.push(`${where}: 'ev' must be an array`);
      else for (const e of t.ev) if (!M.EV_TYPES.includes(e)) errors.push(`${where}: unknown evidence type '${e}'`);
      if (t.sub && !(M.SUBCATS[cat] || []).includes(t.sub)) errors.push(`${where}: subcategory '${t.sub}' is not in SUBCATS['${cat}']`);
      if ('oss' in t && typeof t.oss !== 'boolean') errors.push(`${where}: 'oss' must be true or false`);
      if (typeof t.n === 'string') {
        if (seen.has(t.n)) errors.push(`${where}: duplicate name inside ${cat}`);
        seen.add(t.n);
      }
      TYPES.add(t.t);
      tools.push(t);
      counts[cat]++;
    });
  }
}

// ── 3. cross-checks ─────────────────────────────────────────────────────────
const byName = new Map();
for (const t of tools) byName.set(t.n, (byName.get(t.n) || []).concat(t.c));
for (const [n, cs] of byName)
  if (cs.length > 1 && !KNOWN_SHARED.has(n)) warnings.push(`'${n}' appears in several categories: ${cs.join(', ')}`);
const lower = tools.map(t => t.n.toLowerCase());
for (const rb of RB) for (const s of rb.steps || []) {
  const q = String(s.tool || '').toLowerCase();
  if (!lower.includes(q) && !lower.some(n => n.includes(q))) warnings.push(`runbook ${rb.id}: step tool '${s.tool}' matches no tool`);
}
// ENTRIES = tool cards (what COUNTS adds up to). TOTAL = distinct tools: a
// tool listed in two categories counts once, ALIASES count once, and an
// entry grouping several utilities ("sha1sum / sha224sum / ...") counts
// each of them, as the Tsurugi listing does.
const ENTRIES = tools.length;
const distinct = new Set();
for (const t of tools) for (const part of String(t.n).split(' / ')) {
  const n = part.trim();
  distinct.add((ALIASES[n] || n).toLowerCase());
}
const TOTAL = distinct.size;

// ── 4. generated output ─────────────────────────────────────────────────────
// Same layout as the file this replaces (Python json.dumps style), so
// regenerating it gives a minimal diff.
const py = o => '{' + Object.entries(o).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ') + '}';
const countsJs = '// GENERATED by scripts/build-data.js. Do not edit by hand.\n' +
  `const CAT_FILE=${py(CAT_FILE)};\n` +
  `const COUNTS=${py(counts)};\n` +
  '// TOTAL counts each distinct tool once; ENTRIES counts cards (sum of COUNTS).\n' +
  `const TOTAL=${TOTAL};\n` +
  `const ENTRIES=${ENTRIES};\n`;
const fmt = n => n.toLocaleString('en-US');
const countsPath = path.join(ROOT, 'data/counts.js');
const indexPath = path.join(ROOT, 'index.html');
const indexOld = fs.readFileSync(indexPath, 'utf8');
const indexNew = indexOld
  .replace(/(content=")[\d,]+( tools from Tsurugi)/, `$1${fmt(TOTAL)}$2`)
  .replace(/(placeholder="Search all )[\d,]+( tools)/, `$1${fmt(TOTAL)}$2`);
const countsOld = fs.existsSync(countsPath) ? fs.readFileSync(countsPath, 'utf8') : '';

const readme = fs.existsSync(path.join(ROOT, 'README.md')) ? fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8') : '';
if (readme && !readme.includes(fmt(TOTAL))) warnings.push(`README.md does not mention the current total (${fmt(TOTAL)} tools)`);

// ── 5. report ───────────────────────────────────────────────────────────────
const empty = k => tools.filter(t => !String(t[k] || '').trim()).length;
console.log(`${TOTAL} distinct tools in ${ENTRIES} entries, ${CATS.length} categories (${files.length} modules)`);
console.log(`types: ${[...TYPES].sort().join(', ')}`);
console.log(`entries without a purpose: ${empty('p')}, without a DFIR scenario: ${empty('s')}`);
warnings.forEach(w => console.log('warning: ' + w));
errors.forEach(e => console.log('ERROR: ' + e));
if (errors.length) { console.log(`\n${errors.length} error(s); nothing written.`); process.exit(1); }

const stale = [];
if (countsOld !== countsJs) stale.push('data/counts.js');
if (indexOld !== indexNew) stale.push('index.html (tool count)');
if (CHECK) {
  if (stale.length) { console.log(`\nOut of date: ${stale.join(', ')}. Run: node scripts/build-data.js`); process.exit(1); }
  console.log('\nOK: data valid, generated files up to date.');
} else {
  if (countsOld !== countsJs) fs.writeFileSync(countsPath, countsJs);
  if (indexOld !== indexNew) fs.writeFileSync(indexPath, indexNew);
  console.log(stale.length ? `\nUpdated: ${stale.join(', ')}` : '\nOK: nothing to update.');
}
