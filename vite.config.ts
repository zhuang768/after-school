import { defineConfig, type Connect } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const headerCsp = `${csp}; frame-ancestors 'none'`;

function applyDocumentCsp(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) {
  const path = req.url?.split('?')[0] ?? '';
  if (path === '/' || path.endsWith('.html')) res.setHeader('Content-Security-Policy', headerCsp);
  next();
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'production-csp',
      apply: 'build',
      transformIndexHtml(html) {
        return html
          .replace(
            '<head>',
            `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
          )
          .replaceAll('<link rel="stylesheet" crossorigin', '<link rel="stylesheet"');
      },
    },
    {
      name: 'document-csp-header',
      configureServer(server) {
        server.middlewares.use(applyDocumentCsp);
      },
      configurePreviewServer(server) {
        server.middlewares.use(applyDocumentCsp);
      },
    },
  ],
  build: { target: 'es2022' },
});
