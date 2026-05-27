const { createServer } = require("http");
const { readFile } = require("fs/promises");
const { existsSync } = require("fs");
const { extname, join, normalize } = require("path");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

const modules = [
  { name: "Vision Control", status: "ready", load: 74, detail: "Camera hand tracking and article motion" },
  { name: "Tactical Globe", status: "ready", load: 88, detail: "3D city sphere with pinch expansion" },
  { name: "Launcher", status: "armed", load: 61, detail: "Whitelisted desktop app commands" },
  { name: "Memory Core", status: "syncing", load: 43, detail: "Session notes and local context" },
  { name: "Voice Router", status: "ready", load: 58, detail: "Browser speech input when supported" },
  { name: "Network Pulse", status: "stable", load: 36, detail: "Local server health monitor" },
  { name: "Security Mesh", status: "watch", load: 82, detail: "Runtime checks and surface hardening" }
];

const allowedApps = new Map([
  ["calculator", "calc"],
  ["calc", "calc"],
  ["notepad", "notepad"],
  ["paint", "mspaint"],
  ["explorer", "explorer"],
  ["terminal", "wt"],
  ["cmd", "cmd"],
  ["edge", "msedge"],
  ["chrome", "chrome"],
  ["vscode", "code"],
  ["code", "code"],
  ["taskmanager", "taskmgr"]
]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/health") {
      return sendJson(res, 200, {
        success: true,
        status: "healthy",
        version: "2.0.0",
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === "/api/modules") {
      return sendJson(res, 200, { success: true, modules });
    }

    if (url.pathname === "/api/launch-app" && req.method === "POST") {
      const body = await readJson(req);
      return launchApp(res, body);
    }

    if (url.pathname.startsWith("/api/")) {
      return sendJson(res, 404, { success: false, error: "Endpoint not found" });
    }

    return serveStatic(url.pathname, res);
  } catch (error) {
    return sendJson(res, 500, { success: false, error: error.message });
  }
});

async function serveStatic(pathname, res) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(ROOT, cleanPath));

  if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
    return sendJson(res, 404, { success: false, error: "File not found" });
  }

  const data = await readFile(filePath);
  res.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  res.end(data);
}

function launchApp(res, body) {
  const requested = String(body.appName || body.executable || "").toLowerCase().trim();
  const command = allowedApps.get(requested);

  if (!command) {
    return sendJson(res, 400, {
      success: false,
      error: `"${requested || "unknown"}" is not in the allowed launcher list.`
    });
  }

  const child = spawn(command, [], {
    detached: true,
    stdio: "ignore",
    shell: process.platform === "win32"
  });

  child.once("error", (error) => {
    sendJson(res, 500, { success: false, error: error.message });
  });

  child.once("spawn", () => {
    child.unref();
    sendJson(res, 200, {
      success: true,
      message: `${requested} launched.`,
      appName: requested,
      command
    });
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  if (res.headersSent) return;
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

server.listen(PORT, () => {
  console.log(`Nugget running at http://localhost:${PORT}`);
  console.log("Camera hand tracking works from localhost after browser permission is granted.");
});
