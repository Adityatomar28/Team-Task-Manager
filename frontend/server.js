import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const PORT = Number(process.env.PORT) || 4173;
const HOST = "0.0.0.0";
const DIST_DIR = resolve("dist");
const INDEX_FILE = join(DIST_DIR, "index.html");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  const type = MIME_TYPES[extname(filePath)] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": filePath === INDEX_FILE ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(res);
}

function resolveStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname.split("?")[0]);
  const requestedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(DIST_DIR, requestedPath);

  if (!filePath.startsWith(DIST_DIR)) return null;
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return null;

  return filePath;
}

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.url === "/health") {
    return sendJson(res, 200, {
      success: true,
      message: "TeamSync frontend is running",
    });
  }

  const filePath = resolveStaticPath(req.url || "/");
  if (filePath) {
    return sendFile(res, filePath);
  }

  return sendFile(res, INDEX_FILE);
});

server.listen(PORT, HOST, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Frontend server failed to start:", error);
  process.exit(1);
});
