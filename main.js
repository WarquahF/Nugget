const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  modules: [
    { name: "Vision Control", status: "ready", load: 74, detail: "Camera hand tracking and article motion" },
    { name: "Tactical Globe", status: "ready", load: 88, detail: "3D city sphere with pinch expansion" },
    { name: "Launcher", status: "armed", load: 61, detail: "Whitelisted desktop app commands" },
    { name: "Memory Core", status: "syncing", load: 43, detail: "Session notes and local context" },
    { name: "Voice Router", status: "ready", load: 58, detail: "Browser speech input when supported" },
    { name: "Network Pulse", status: "stable", load: 36, detail: "Local server health monitor" },
    { name: "Security Mesh", status: "watch", load: 82, detail: "Runtime checks and surface hardening" }
  ],
  messages: [
    {
      role: "system",
      text: "Nugget is online. Camera control, tactical map, modules, launch commands, and diagnostics are available."
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
  setupGlobe();
  setupVision();
  $("#systemState").textContent = "ONLINE";
}

function bindNavigation() {
  $$(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      activatePanel(button.dataset.panel);
      history.replaceState(null, "", `#${button.dataset.panel}`);
    });
  });
  const initialPanel = location.hash.replace("#", "").split("-")[0];
  if (initialPanel && $(`#${initialPanel}`)) activatePanel(initialPanel);
}

function activatePanel(panelId) {
  $$(".nav-button").forEach((item) => item.classList.toggle("active", item.dataset.panel === panelId));
  $$(".panel").forEach((panel) => panel.classList.toggle("active-panel", panel.id === panelId));
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

  if (normalized.includes("map") || normalized.includes("globe") || normalized.includes("city")) {
    showPanel("map");
    addMessage("system", "Tactical city sphere opened.");
    return;
  }

  if (normalized.includes("camera") || normalized.includes("hand") || normalized.includes("pinch")) {
    showPanel("vision");
    addMessage("system", "Vision module selected. Camera hand tracking can move the article and expand the tactical globe.");
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

let tacticalGlobe = null;

function setupGlobe() {
  tacticalGlobe = new TacticalGlobe({
    mount: $("#globeMount"),
    labels: $("#cityLabels"),
    scaleLabel: $("#globeScale"),
    countLabel: $("#cityCount"),
    pinchLabel: $("#pinchLevel")
  });
  tacticalGlobe.start();
  $("#globeMaxButton").addEventListener("click", () => tacticalGlobe.setExpansion(1));
  $("#globeResetButton").addEventListener("click", () => tacticalGlobe.setExpansion(0));
  if (location.hash.includes("max")) tacticalGlobe.setExpansion(1, true);
}

class TacticalGlobe {
  constructor(parts) {
    Object.assign(this, parts);
    this.expansion = 0;
    this.targetExpansion = 0;
    this.rotation = 0;
    this.cityNodes = [];
    this.three = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globeGroup = null;
    this.fallback = false;
    this.countLabel.textContent = String(CITIES.length);
  }

  async start() {
    try {
      this.three = await import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js");
      this.buildScene();
      this.buildLabels();
      this.animate();
    } catch (error) {
      this.fallback = true;
      this.mount.innerHTML = '<div class="fallback-globe"></div>';
      this.buildLabels();
      this.animateFallback();
      addMessage("error", `3D map fallback active: ${error.message}`);
    }
  }

  buildScene() {
    const THREE = this.three;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    this.camera.position.set(0, 0, 6.6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.mount.appendChild(this.renderer.domElement);

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(2, 96, 96),
      new THREE.MeshStandardMaterial({
        color: 0x0a2f38,
        emissive: 0x05262d,
        roughness: 0.72,
        metalness: 0.12,
        transparent: true,
        opacity: 0.96
      })
    );
    this.globeGroup.add(surface);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(2.012, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x65f5c8,
        wireframe: true,
        transparent: true,
        opacity: 0.2
      })
    );
    this.globeGroup.add(wire);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.08, 80, 80),
      new THREE.MeshBasicMaterial({
        color: 0x63a8ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
      })
    );
    this.globeGroup.add(atmosphere);

    const cityGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CITIES.length * 3);
    CITIES.forEach((city, index) => {
      const p = latLonToVector(city.lat, city.lon, 2.06);
      positions[index * 3] = p.x;
      positions[index * 3 + 1] = p.y;
      positions[index * 3 + 2] = p.z;
    });
    cityGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const cityPoints = new THREE.Points(
      cityGeometry,
      new THREE.PointsMaterial({
        color: 0xf5c965,
        size: 0.045,
        transparent: true,
        opacity: 0.95
      })
    );
    this.globeGroup.add(cityPoints);

    this.scene.add(new THREE.AmbientLight(0x93fff0, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(4, 3, 5);
    this.scene.add(key);

    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  buildLabels() {
    this.labels.innerHTML = "";
    this.cityNodes = CITIES.map((city) => {
      const node = document.createElement("span");
      node.textContent = city.name;
      node.className = "city-label";
      this.labels.appendChild(node);
      return { city, node };
    });
  }

  animate() {
    this.expansion += (this.targetExpansion - this.expansion) * 0.08;
    this.rotation += 0.0026 + this.expansion * 0.003;

    if (this.globeGroup) {
      const scale = 1 + this.expansion * 1.18;
      this.globeGroup.scale.setScalar(scale);
      this.globeGroup.rotation.y = this.rotation;
      this.globeGroup.rotation.x = -0.18 + this.expansion * 0.1;
      this.camera.position.z = 6.6 - this.expansion * 2.35;
      this.renderer.render(this.scene, this.camera);
    }

    this.updateLabels();
    this.updateReadout();
    requestAnimationFrame(() => this.animate());
  }

  animateFallback() {
    this.expansion += (this.targetExpansion - this.expansion) * 0.08;
    this.rotation += 0.003;
    this.updateLabels();
    this.updateReadout();
    requestAnimationFrame(() => this.animateFallback());
  }

  setExpansion(value, immediate = false) {
    this.targetExpansion = clamp(value, 0, 1);
    if (immediate) this.expansion = this.targetExpansion;
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const rect = this.mount.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updateLabels() {
    const rect = this.mount.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const labelOpacity = this.expansion > 0.28 ? 1 : 0;
    const THREE = this.three;

    this.cityNodes.forEach(({ city, node }) => {
      let x;
      let y;
      let visible = true;

      if (THREE && this.camera && this.globeGroup) {
        const point = latLonToVector(city.lat, city.lon, 2.16);
        const vector = new THREE.Vector3(point.x, point.y, point.z);
        vector.applyEuler(this.globeGroup.rotation);
        visible = vector.z > -0.15;
        vector.multiplyScalar(this.globeGroup.scale.x);
        vector.project(this.camera);
        x = (vector.x * 0.5 + 0.5) * rect.width;
        y = (-vector.y * 0.5 + 0.5) * rect.height;
      } else {
        const projected = projectCity(city, this.rotation);
        x = projected.x * rect.width;
        y = projected.y * rect.height;
        visible = projected.visible;
      }

      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      node.style.opacity = visible ? labelOpacity : 0;
    });
  }

  updateReadout() {
    this.scaleLabel.textContent = (1 + this.expansion * 1.18).toFixed(2);
    this.pinchLabel.textContent = this.targetExpansion > 0.62 ? "max" : this.targetExpansion > 0.18 ? "expanding" : "idle";
    this.labels.classList.toggle("labels-visible", this.expansion > 0.28);
  }
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
      const thumbTip = result.landmarks?.[0]?.[4];
      if (indexTip) {
        const mirroredX = 1 - indexTip.x;
        this.moveArticle(mirroredX, indexTip.y);
        if (thumbTip && tacticalGlobe) {
          const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
          const pinchStrength = clamp(1 - (pinchDistance - 0.035) / 0.15, 0, 1);
          tacticalGlobe.setExpansion(pinchStrength);
          $("#pinchLevel").textContent = pinchStrength > 0.62 ? "max" : pinchStrength > 0.18 ? "expanding" : "idle";
        }
      } else {
        this.status.textContent = "searching";
        if (tacticalGlobe) tacticalGlobe.setExpansion(0);
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

const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "Toronto", lat: 43.6532, lon: -79.3832 },
  { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
  { name: "Sao Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Rio", lat: -22.9068, lon: -43.1729 },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
  { name: "Lima", lat: -12.0464, lon: -77.0428 },
  { name: "Bogota", lat: 4.711, lon: -74.0721 },
  { name: "London", lat: 51.5072, lon: -0.1276 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Rome", lat: 41.9028, lon: 12.4964 },
  { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { name: "Vienna", lat: 48.2082, lon: 16.3738 },
  { name: "Warsaw", lat: 52.2297, lon: 21.0122 },
  { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Lagos", lat: 6.5244, lon: 3.3792 },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219 },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
  { name: "Johannesburg", lat: -26.2041, lon: 28.0473 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753 },
  { name: "Tehran", lat: 35.6892, lon: 51.389 },
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Dhaka", lat: 23.8103, lon: 90.4125 },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { name: "Manila", lat: 14.5995, lon: 120.9842 },
  { name: "Hanoi", lat: 21.0278, lon: 105.8342 },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "Shanghai", lat: 31.2304, lon: 121.4737 },
  { name: "Shenzhen", lat: 22.5431, lon: 114.0579 },
  { name: "Seoul", lat: 37.5665, lon: 126.978 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Osaka", lat: 34.6937, lon: 135.5023 },
  { name: "Taipei", lat: 25.033, lon: 121.5654 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Melbourne", lat: -37.8136, lon: 144.9631 },
  { name: "Auckland", lat: -36.8509, lon: 174.7645 }
];

function latLonToVector(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}

function projectCity(city, rotation) {
  const point = latLonToVector(city.lat, city.lon, 1);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const x = point.x * cos - point.z * sin;
  const z = point.x * sin + point.z * cos;
  return {
    x: 0.5 + x * 0.32,
    y: 0.5 - point.y * 0.32,
    visible: z > -0.1
  };
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
