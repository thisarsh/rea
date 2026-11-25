import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT || 7860);
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
};

function getGroqKey() {
  return (process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || '').trim();
}

function readJsonBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // Health check endpoint (never reveals secret value)
  if (req.method === 'GET' && urlPath === '/health') {
    sendJson(res, 200, { status: 'ok', groqConfigured: Boolean(getGroqKey()) });
    return;
  }

  // Runtime Groq proxy using Render/host environment variables
  if (req.method === 'POST' && urlPath === '/api/groq') {
    const apiKey = getGroqKey();
    if (!apiKey) {
      sendJson(res, 500, {
        error: 'GROQ_API_KEY or VITE_GROQ_API_KEY is not configured in server environment variables.',
      });
      return;
    }

    try {
      const bodyStr = await readJsonBody(req);
      const upstream = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: bodyStr,
      });

      const responseText = await upstream.text();
      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(responseText);
    } catch (err) {
      sendJson(res, 502, { error: err.message || 'Upstream Groq request failed' });
    }
    return;
  }

  // Serve built static assets from ./dist
  const normalized = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  let targetFile = path.join(DIST_DIR, normalized || 'index.html');

  if (!targetFile.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(targetFile, 'index.html');
  }

  // SPA fallback to index.html for client-side routes without file extension
  if (!fs.existsSync(targetFile)) {
    if (path.extname(urlPath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    targetFile = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(targetFile).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(targetFile).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ReA server listening on http://0.0.0.0:${PORT} (groqConfigured=${Boolean(getGroqKey())})`);
});
