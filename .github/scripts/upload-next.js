#!/usr/bin/env node
// Uploads .next/server + static + manifests + BUILD_ID to cPanel via save_file_content API.
// Env vars: CPANEL_HOST, CPANEL_PORT, CPANEL_USER, CPANEL_PASS, APP_PATH, STATIC_PATH
const fs = require('fs');
const path = require('path');
const https = require('https');

const { CPANEL_HOST, CPANEL_PORT = '2083', CPANEL_USER, CPANEL_PASS, APP_PATH, STATIC_PATH } = process.env;
if (!CPANEL_HOST || !CPANEL_USER || !CPANEL_PASS || !APP_PATH || !STATIC_PATH) {
  console.error('Missing env: CPANEL_HOST, CPANEL_USER, CPANEL_PASS, APP_PATH, STATIC_PATH');
  process.exit(1);
}

let SESSION_ID = '';
let SESSION_VAL = '';

function httpPost(path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: CPANEL_HOST, port: parseInt(CPANEL_PORT),
      path, method: 'POST', rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        ...extraHeaders
      }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ body: d, headers: res.headers })); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function login() {
  const body = `user=${encodeURIComponent(CPANEL_USER)}&pass=${encodeURIComponent(CPANEL_PASS)}&goto_uri=/`;
  const { headers } = await httpPost('/login/', body);
  const loc = headers['location'] || '';
  const cookie = (headers['set-cookie'] || []).find(c => c.startsWith('cpsession=')) || '';
  SESSION_ID = (loc.match(/\/(cpsess\d+)\//) || [])[1] || '';
  SESSION_VAL = (cookie.match(/cpsession=([^;]+)/) || [])[1] || '';
  if (!SESSION_ID || !SESSION_VAL) throw new Error('cPanel login failed — check credentials');
  console.log('Logged in, session:', SESSION_ID);
}

function cpanelPost(apiPath, params) {
  const body = typeof params === 'string' ? params : new URLSearchParams(params).toString();
  return httpPost(`/${SESSION_ID}${apiPath}`, body, { 'Cookie': 'cpsession=' + SESSION_VAL })
    .then(r => r.body);
}

function walk(dir, rel, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const relPath = rel ? `${rel}/${f}` : f;
    if (fs.statSync(full).isDirectory()) walk(full, relPath, files);
    else files.push({ full, rel: relPath });
  }
  return files;
}

const createdDirs = new Set();

async function ensureDir(dir) {
  if (createdDirs.has(dir)) return;
  createdDirs.add(dir);
  try { await cpanelPost('/execute/Fileman/mkdir', { path: dir }); } catch (_) {}
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function uploadFiles(files, destBase, stats) {
  for (const { full, rel } of files) {
    const parts = rel.split('/').filter(Boolean);
    const file = parts.pop();
    const dir = destBase + (parts.length ? '/' + parts.join('/') : '');
    await ensureDir(dir);
    const isBinary = /\.(png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|eot|otf)$/i.test(file);
    let content;
    if (isBinary) {
      // For binary files, read as Buffer and encode each byte as %XX manually
      // URLSearchParams would double-encode bytes > 127 as UTF-8, corrupting binary
      const buf = fs.readFileSync(full);
      content = buf.toString('latin1');
    } else {
      // Read as Buffer, decode as UTF-8, escape only non-ASCII literal chars
      // This avoids double-escaping existing \uXXXX sequences in compiled JS
      const buf = fs.readFileSync(full);
      const str = buf.toString('utf8');
      // Only escape chars that are actual Unicode codepoints > 127 in the string
      // (not escape sequences like \u0041 which are already ASCII)
      content = str.replace(/[^\x00-\x7F]/g, c => {
        const code = c.codePointAt(0);
        if (code > 0xFFFF) {
          const hi = ((code - 0x10000) >> 10) + 0xD800;
          const lo = ((code - 0x10000) & 0x3FF) + 0xDC00;
          return `\\u${hi.toString(16).padStart(4,'0')}\\u${lo.toString(16).padStart(4,'0')}`;
        }
        return `\\u${code.toString(16).padStart(4,'0')}`;
      });
    }

    // Build form body manually to control encoding of binary content
    // URLSearchParams encodes bytes > 127 as UTF-8 multi-byte sequences,
    // which corrupts binary files. We percent-encode each byte as %XX instead.
    function pctEncode(s) {
      let out = '';
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A) ||
            (c >= 0x30 && c <= 0x39) || c === 0x2D || c === 0x5F || c === 0x2E || c === 0x7E) {
          out += s[i];
        } else if (c === 0x20) {
          out += '+';
        } else {
          out += '%' + c.toString(16).padStart(2, '0').toUpperCase();
        }
      }
      return out;
    }
    try {
      // Use manual percent-encoding for the body to preserve binary bytes correctly
      const body = `dir=${pctEncode(dir)}&file=${pctEncode(file)}&content=${pctEncode(content)}`;
      const r = JSON.parse(await cpanelPost('/execute/Fileman/save_file_content', body));
      if (r.status === 1) { stats.ok++; process.stdout.write('.'); }
      else {
        const msg = JSON.stringify(r.errors);
        // "does not exist for the account" = dir doesn't exist yet on server — non-fatal
        if (msg.includes('does not exist for the account')) {
          console.log(`\nWARN (dir missing, skipped): ${rel}`);
        } else {
          stats.fail++; console.log(`\nFAIL ${rel}: ${msg}`);
        }
      }
    } catch (e) { stats.fail++; console.log(`\nERR ${rel}: ${e.message}`); }
    await delay(200);
  }
}

async function main() {
  await login();
  const nextDir = '.next';

  // Server files + manifests + BUILD_ID → APP_PATH/.next/
  const serverFiles = walk(path.join(nextDir, 'server'), 'server');
  for (const name of ['BUILD_ID', 'build-manifest.json', 'app-build-manifest.json', 'required-server-files.json', 'routes-manifest.json']) {
    const fp = path.join(nextDir, name);
    if (fs.existsSync(fp)) serverFiles.push({ full: fp, rel: name });
  }

  // Static files → STATIC_PATH/ (public dir, not app dir)
  const staticFiles = walk(path.join(nextDir, 'static'), '');

  console.log(`Uploading ${serverFiles.length} server files + ${staticFiles.length} static files...`);
  const stats = { ok: 0, fail: 0 };

  // Public assets → APP_PATH/public/ — skips uploads/ (user content) and binary files
  const publicFiles = walk('public', '').filter(f =>
    !f.rel.startsWith('uploads/') &&
    !/\.(png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|eot|otf|svg)$/i.test(f.rel)
  );

  console.log(`Uploading ${serverFiles.length} server + ${staticFiles.length} static + ${publicFiles.length} public files...`);

  await uploadFiles(serverFiles, `${APP_PATH}/.next`, stats);
  await uploadFiles(staticFiles, STATIC_PATH, stats);
  await uploadFiles(publicFiles, `${APP_PATH}/public`, stats);

  console.log(`\nDone: ${stats.ok} ok, ${stats.fail} failed`);
  if (stats.fail > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
