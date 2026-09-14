import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { securityHeaders, rateLimiter } from './server/security';
import apiRouter from './server/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for reverse proxy / Cloud Run container environment
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(securityHeaders);
  app.use(rateLimiter);

  // Body Parsing Middleware (support large muster roll Excel payloads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes (Mounted FIRST before Vite middleware)
  app.use('/api', apiRouter);

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enterprise Gateway] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Security Posture] Company Portal RBAC, Rate Limiting & SHA-256 Audit Logging active`);
  });
}

startServer();
