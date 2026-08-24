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

const auth = Buffer.from(`${CPANEL_USER}:${CPANEL_PASS}`).toString('base64');

function cpanelPost(apiPath, params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const req = https.request({
      hostname: CPANEL_HOST, port: parseInt(CPANEL_PORT),
      path: apiPath, method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); });
    req.on('error', reject);
    req.write(body); req.end();
  });
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

async function uploadFiles(files, destBase, stats) {
  for (const { full, rel } of files) {
    const parts = rel.split('/').filter(Boolean);
    const file = parts.pop();
    const dir = destBase + (parts.length ? '/' + parts.join('/') : '');
    await ensureDir(dir);
    const content = fs.readFileSync(full, 'latin1');
    try {
      const r = JSON.parse(await cpanelPost('/execute/Fileman/save_file_content', { dir, file, content }));
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
  }
}

async function main() {
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

  // Public assets (images etc) → APP_PATH/public/ — skips uploads/ (user content)
  const publicFiles = walk('public', '').filter(f => !f.rel.startsWith('uploads/'));

  console.log(`Uploading ${serverFiles.length} server + ${staticFiles.length} static + ${publicFiles.length} public files...`);

  await uploadFiles(serverFiles, `${APP_PATH}/.next`, stats);
  await uploadFiles(staticFiles, STATIC_PATH, stats);
  await uploadFiles(publicFiles, `${APP_PATH}/public`, stats);

  console.log(`\nDone: ${stats.ok} ok, ${stats.fail} failed`);
  if (stats.fail > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
