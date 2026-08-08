// Minimal static dev server. Unlike `python3 -m http.server` it sends no-store,
// so edits to CSS and ES modules show up on reload instead of being cached.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".md": "text/plain; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
  const relative = requestPath.endsWith("/") ? `${requestPath}index.html` : requestPath;
  const filePath = path.join(ROOT, relative);

  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    response.end("404");
    return;
  }

  response.writeHead(200, {
    "content-type": TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    "cache-control": "no-store, must-revalidate",
  });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`i-dle site: http://${HOST}:${PORT}`);
});
