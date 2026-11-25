import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

function createGroqMiddleware(getApiKey) {
  return async (req, res, next) => {
    const urlPath = (req.url || '').split('?')[0];
    if (urlPath !== '/api/groq') return next();

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.end();
      return;
    }

    if (req.method !== 'POST') return next();

    const apiKey = getApiKey();
    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing VITE_GROQ_API_KEY / GROQ_API_KEY in .env' }));
      return;
    }

    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const bodyStr = Buffer.concat(chunks).toString('utf8');

      const upstream = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: bodyStr,
      });

      const responseText = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      res.end(responseText);
    } catch (err) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message || 'Groq proxy error' }));
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const resolveKey = () =>
    (
      env.VITE_GROQ_API_KEY ||
      env.GROQ_API_KEY ||
      process.env.VITE_GROQ_API_KEY ||
      process.env.GROQ_API_KEY ||
      ''
    ).trim();

  const localGroqPlugin = {
    name: 'local-groq-proxy',
    configureServer(server) {
      server.middlewares.use(createGroqMiddleware(resolveKey));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createGroqMiddleware(resolveKey));
    },
  };

  return {
    plugins: [react(), localGroqPlugin],
    server: {
      host: true,
    },
    preview: {
      host: true,
      allowedHosts: true,
    },
  };
});
