#!/usr/bin/env node
// Uploads .next/server + manifests + BUILD_ID to cPanel via save_file_content API.
// Secrets passed as env vars: CPANEL_HOST, CPANEL_PORT, CPANEL_USER, CPANEL_PASS, APP_PATH
const fs = require('fs');
const path = require('path');
const https = require('https');

const { CPANEL_HOST, CPANEL_PORT = '2083', CPANEL_USER, CPANEL_PASS, APP_PATH } = process.env;
if (!CPANEL_HOST || !CPANEL_USER || !CPANEL_PASS || !APP_PATH) {
  console.error('Missing env: CPANEL_HOST, CPANEL_USER, CPANEL_PASS, APP_PATH');
  process.exit(1);
}

const auth = Buffer.from(`${CPANEL_USER}:${CPANEL_PASS}`).toString('base64');

function postFile(dir, file, content) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({ dir, file, content }).toString();
    const req = https.request({
      hostname: CPANEL_HOST, port: parseInt(CPANEL_PORT),
      path: '/execute/Fileman/save_file_content', method: 'POST',
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

async function main() {
  const nextDir = '.next';
  const destBase = `${APP_PATH}/.next`;

  // Collect: server dir + top-level manifests + BUILD_ID
  const files = walk(path.join(nextDir, 'server'), 'server');
  for (const name of ['BUILD_ID', 'build-manifest.json', 'app-build-manifest.json', 'required-server-files.json', 'routes-manifest.json']) {
    const fp = path.join(nextDir, name);
    if (fs.existsSync(fp)) files.push({ full: fp, rel: name });
  }

  console.log(`Uploading ${files.length} files to ${destBase}...`);
  let ok = 0, fail = 0;
  for (const { full, rel } of files) {
    const parts = rel.split('/');
    const file = parts.pop();
    const dir = destBase + (parts.length ? '/' + parts.join('/') : '');
    const content = fs.readFileSync(full, 'utf8');
    try {
      const r = JSON.parse(await postFile(dir, file, content));
      if (r.status === 1) { ok++; process.stdout.write('.'); }
      else { fail++; console.log(`\nFAIL ${rel}: ${JSON.stringify(r.errors)}`); }
    } catch (e) { fail++; console.log(`\nERR ${rel}: ${e.message}`); }
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
