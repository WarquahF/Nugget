# Nugget OS

A modular JARVIS-style local command deck with camera hand tracking.

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## What changed

- Restored a valid `package.json` with working scripts.
- Replaced the broken `/static/js/...` bundle reference with a direct static app.
- Added Core, Vision, Modules, and Security panels.
- Added browser camera hand detection through MediaPipe Tasks Vision.
- Added a movable article card that follows your index fingertip.
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
