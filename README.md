# Nugget

A modular JARVIS-style local command deck with camera hand tracking and a tactical 3D globe.

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## OS Launch Files

Windows:

```bat
StartJarvis-Windows.bat
```

Linux:

```bash
chmod +x StartJarvis-Linux.sh
./StartJarvis-Linux.sh
```

Mac:

```bash
chmod +x StartJarvis-Mac.sh
./StartJarvis-Mac.sh
```

All launchers start the same local app at `http://localhost:3000`.

## What changed

- Restored a valid `package.json` with working scripts.
- Replaced the broken `/static/js/...` bundle reference with a direct static app.
- Added Core, Vision, Modules, and Security panels.
- Added browser camera hand detection through MediaPipe Tasks Vision.
- Added a movable article card that follows your index fingertip.
- Added a tactical 3D globe with city labels that expands from the camera pinch gesture.
- Rebuilt `server.js` with Node's built-in HTTP module so it runs without installing Express.

## Hand Control

Go to `VISION`, press `Start Camera`, allow camera permission, and hold one hand in view. The article card moves with your index fingertip. If the camera or model is blocked, you can still drag the article with your pointer.

## Launcher

Try commands like:

```text
open calculator
open notepad
open paint
```

The launcher only allows whitelisted apps.
