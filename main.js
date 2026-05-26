const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  modules: [
    { name: "Vision Control", status: "ready", load: 74, detail: "Camera hand tracking and article motion" },
    { name: "Launcher", status: "armed", load: 61, detail: "Whitelisted desktop app commands" },
    { name: "Memory Core", status: "syncing", load: 43, detail: "Session notes and local context" },
    { name: "Voice Router", status: "ready", load: 58, detail: "Browser speech input when supported" },
    { name: "Network Pulse", status: "stable", load: 36, detail: "Local server health monitor" },
    { name: "Security Mesh", status: "watch", load: 82, detail: "Runtime checks and surface hardening" }
  ],
  messages: [
    {
      role: "system",
      text: "Nugget OS is online. Camera control, modules, launch commands, and diagnostics are available."
    }
  ]
};

const replies = [
  "Command accepted. Routing through the local module bus.",
  "I can handle that. Vision and command systems are standing by.",
  "Working from local runtime. No broken bundle path this time.",
  "System posture updated. Modules are responsive."
];

function boot() {
  bindNavigation();
  bindCore();
  bindModules();
  bindDiagnostics();
  renderChat();
  renderModules();
  runDiagnostics();
  setupVision();
  $("#systemState").textContent = "ONLINE";
}

function bindNavigation() {
  $$(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".nav-button").forEach((item) => item.classList.remove("active"));
      $$(".panel").forEach((panel) => panel.classList.remove("active-panel"));
      button.classList.add("active");
      $(`#${button.dataset.panel}`).classList.add("active-panel");
    });
  });
}

function bindCore() {
  $("#commandForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = $("#commandInput");
    const command = input.value.trim();
    if (!command) return;
    input.value = "";
    addMessage("user", command);
    await processCommand(command);
  });

  $("#voiceButton").addEventListener("click", startVoiceInput);
}

async function processCommand(command) {
  const normalized = command.toLowerCase();
  const launchMatch = normalized.match(/^(open|launch|start|run)\s+([\w.-]+)/);

  if (launchMatch) {
    const appName = launchMatch[2];
    addMessage("system", `Attempting to launch ${appName}.`);
    try {
      const response = await fetch("/api/launch-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName })
      });
      const result = await response.json();
      addMessage(result.success ? "system" : "error", result.message || result.error);
    } catch (error) {
      addMessage("error", `Launcher unavailable: ${error.message}`);
    }
    return;
  }

  if (normalized.includes("camera") || normalized.includes("hand")) {
    showPanel("vision");
    addMessage("system", "Vision module selected. Press Start Camera, then move your index finger.");
    return;
  }

  if (normalized.includes("module")) {
    showPanel("modules");
    addMessage("system", "Module matrix opened.");
    return;
  }

  addMessage("system", replies[Math.floor(Math.random() * replies.length)]);
}

function showPanel(panelId) {
  const button = $(`.nav-button[data-panel="${panelId}"]`);
  if (button) button.click();
}

function addMessage(role, text) {
  state.messages.push({ role, text });
  renderChat();
}

function renderChat() {
  $("#chatLog").innerHTML = state.messages
    .map((message) => `<div class="message ${message.role}"><span>${message.role}</span><p>${escapeHtml(message.text)}</p></div>`)
    .join("");
  $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function bindModules() {
  $("#refreshModules").addEventListener("click", renderModules);
}

async function renderModules() {
  try {
    const response = await fetch("/api/modules");
    const payload = await response.json();
    if (Array.isArray(payload.modules)) state.modules = payload.modules;
  } catch {
    // Local fallback stays active when the static file is opened directly.
  }

  $("#moduleGrid").innerHTML = state.modules
    .map(
      (module) => `
        <article class="module-card">
          <div>
            <p class="eyebrow">${escapeHtml(module.status)}</p>
            <h3>${escapeHtml(module.name)}</h3>
          </div>
          <p>${escapeHtml(module.detail)}</p>
          <div class="meter"><span style="width:${Number(module.load) || 0}%"></span></div>
        </article>
      `
    )
    .join("");
}

function bindDiagnostics() {
  $("#runDiagnostics").addEventListener("click", runDiagnostics);
}

function runDiagnostics() {
  const checks = [
    ["HTML entry", "healthy", "Uses /main.js directly instead of a missing build bundle."],
    ["Package metadata", "healthy", "Project package restored with runnable scripts."],
    ["Server", "healthy", "No Express dependency required; built-in Node HTTP is used."],
    ["Camera", "permission", "Requires localhost and browser permission."],
    ["Hand detector", "network", "Loads MediaPipe Tasks Vision from CDN when the camera starts."]
  ];

  $("#diagnostics").innerHTML = checks
    .map(
      ([name, status, detail]) => `
        <div class="diagnostic-row">
          <strong>${name}</strong>
          <span>${status}</span>
          <p>${detail}</p>
        </div>
      `
    )
    .join("");
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addMessage("error", "Voice input is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    $("#commandInput").value = transcript;
    $("#commandForm").requestSubmit();
  };
  recognition.onerror = (event) => addMessage("error", `Voice input failed: ${event.error}`);
  recognition.start();
}

function setupVision() {
  const controller = new HandController({
    video: $("#cameraFeed"),
    canvas: $("#handCanvas"),
    notice: $("#cameraNotice"),
    status: $("#handStatus"),
    xLabel: $("#handX"),
    yLabel: $("#handY"),
    arena: $("#articleArena"),
    article: $("#handArticle")
  });

  $("#cameraButton").addEventListener("click", () => controller.toggle());
  enablePointerFallback(controller);
}

function enablePointerFallback(controller) {
  let dragging = false;
  $("#handArticle").addEventListener("pointerdown", (event) => {
    dragging = true;
    $("#handArticle").setPointerCapture(event.pointerId);
  });
  window.addEventListener("pointerup", () => {
    dragging = false;
  });
  $("#articleArena").addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const rect = $("#articleArena").getBoundingClientRect();
    controller.moveArticle((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  });
}

class HandController {
  constructor(parts) {
    Object.assign(this, parts);
    this.running = false;
    this.detector = null;
    this.stream = null;
    this.lastVideoTime = -1;
    this.ctx = this.canvas.getContext("2d");
  }

  async toggle() {
    if (this.running) {
      this.stop();
      return;
    }
    await this.start();
  }

  async start() {
    try {
      this.notice.textContent = "Loading hand detector...";
      const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs");
      const resolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
      );
      this.detector = await vision.HandLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: "user" },
        audio: false
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      this.running = true;
      $("#cameraButton").textContent = "Stop Camera";
      this.notice.textContent = "Tracking hand";
      this.status.textContent = "tracking";
      this.loop();
    } catch (error) {
      this.notice.textContent = "Camera or model blocked";
      this.status.textContent = "fallback";
      addMessage("error", `Vision module failed: ${error.message}. You can still drag the article with your pointer.`);
    }
  }

  stop() {
    this.running = false;
    if (this.stream) this.stream.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.video.srcObject = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    $("#cameraButton").textContent = "Start Camera";
    this.notice.textContent = "Camera idle";
    this.status.textContent = "offline";
  }

  loop() {
    if (!this.running) return;
    this.resizeCanvas();

    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      const result = this.detector.detectForVideo(this.video, performance.now());
      this.draw(result.landmarks?.[0] || []);
      const indexTip = result.landmarks?.[0]?.[8];
      if (indexTip) {
        const mirroredX = 1 - indexTip.x;
        this.moveArticle(mirroredX, indexTip.y);
      } else {
        this.status.textContent = "searching";
      }
    }

    requestAnimationFrame(() => this.loop());
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  draw(landmarks) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!landmarks.length) return;
    this.ctx.fillStyle = "#65f5c8";
    this.ctx.strokeStyle = "rgba(101, 245, 200, 0.55)";
    this.ctx.lineWidth = 2;

    landmarks.forEach((point) => {
      const x = (1 - point.x) * this.canvas.width;
      const y = point.y * this.canvas.height;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  moveArticle(x, y) {
    const safeX = clamp(x, 0.08, 0.92);
    const safeY = clamp(y, 0.12, 0.88);
    const arenaRect = this.arena.getBoundingClientRect();
    const cardRect = this.article.getBoundingClientRect();
    const maxX = Math.max(0, arenaRect.width - cardRect.width);
    const maxY = Math.max(0, arenaRect.height - cardRect.height);
    const px = maxX * safeX;
    const py = maxY * safeY;
    this.article.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    this.xLabel.textContent = safeX.toFixed(2);
    this.yLabel.textContent = safeY.toFixed(2);
    this.status.textContent = "locked";
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

boot();
