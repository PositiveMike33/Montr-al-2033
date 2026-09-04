/**
 * God Eye View Launcher — Simplify URL generation
 * Avoid massive hash fragments that break the browser
 */

import express from "express";

const router = express.Router();

interface GodEyeViewParams {
  lat?: number;
  lon?: number;
  alt?: number;
  heading?: number;
  pitch?: number;
  style?: "normal" | "satellite" | "terrain";
  hud?: "tactical" | "strategic" | "minimal";
  map?: "osm" | "mapbox" | "google";
}

/**
 * Generate a clean God Eye View URL
 */
function buildGodEyeUrl(params: GodEyeViewParams): string {
  const defaults = {
    lat: params.lat || 45.5017,
    lon: params.lon || -73.5673,
    alt: params.alt || 600,
    heading: params.heading || 15,
    pitch: params.pitch || -30,
    style: params.style || "normal",
    hud: params.hud || "tactical",
    map: params.map || "osm",
  };

  // Build query string instead of hash (cleaner, shorter)
  const query = new URLSearchParams({
    lat: String(defaults.lat),
    lon: String(defaults.lon),
    alt: String(defaults.alt),
    heading: String(defaults.heading),
    pitch: String(defaults.pitch),
    style: defaults.style,
    hud: defaults.hud,
    map: defaults.map,
  }).toString();

  return `/god-eye-view?${query}`;
}

/**
 * GET /api/god-eye/launch
 * Return clean launch URL
 */
router.get("/launch", (req, res) => {
  const params: GodEyeViewParams = {
    lat: req.query.lat ? parseFloat(req.query.lat as string) : 45.5017,
    lon: req.query.lon ? parseFloat(req.query.lon as string) : -73.5673,
    alt: req.query.alt ? parseInt(req.query.alt as string) : 600,
    heading: req.query.heading ? parseInt(req.query.heading as string) : 15,
    pitch: req.query.pitch ? parseInt(req.query.pitch as string) : -30,
    style: (req.query.style as "normal" | "satellite" | "terrain") || "normal",
    hud: (req.query.hud as "tactical" | "strategic" | "minimal") || "tactical",
    map: (req.query.map as "osm" | "mapbox" | "google") || "osm",
  };

  const url = buildGodEyeUrl(params);
  res.json({
    url,
    fullUrl: `${process.env.APP_URL || "http://localhost:3000"}${url}`,
    params,
  });
});

/**
 * GET /god-eye-view
 * Landing page for God Eye View
 */
router.get("/view", (req, res) => {
  const lat = req.query.lat || "45.5017";
  const lon = req.query.lon || "-73.5673";
  const alt = req.query.alt || "600";
  const heading = req.query.heading || "15";
  const pitch = req.query.pitch || "-30";
  const style = req.query.style || "normal";
  const hud = req.query.hud || "tactical";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GOD EYE VIEW — Montréal 2033</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0e27 url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="%23003300" stroke-width="1" opacity="0.3"/></pattern></defs><rect width="1200" height="800" fill="%230a0e27"/><rect width="1200" height="800" fill="url(%23grid)"/></svg>');
      color: #00f3ff;
      font-family: 'Courier New', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .container {
      text-align: center;
      background: rgba(10, 14, 39, 0.95);
      border: 2px solid #00f3ff;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 0 30px #00f3ff;
      max-width: 600px;
    }
    h1 {
      font-size: 2.5em;
      text-shadow: 0 0 10px #00f3ff;
      margin-bottom: 20px;
    }
    .subtitle { color: #00ccff; margin-bottom: 30px; }
    .coordinates {
      background: rgba(0, 243, 255, 0.1);
      border: 1px solid #00f3ff;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      text-align: left;
      font-size: 0.9em;
    }
    .coord-row { margin: 5px 0; }
    .coord-label { color: #00ccff; font-weight: bold; }
    .controls {
      margin: 30px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .control-group {
      text-align: left;
    }
    label {
      display: block;
      color: #00ccff;
      margin-bottom: 5px;
      font-size: 0.9em;
    }
    input, select {
      width: 100%;
      padding: 8px;
      background: #1a1f3a;
      border: 1px solid #00f3ff;
      color: #00f3ff;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    input:focus, select:focus {
      outline: none;
      box-shadow: 0 0 10px #00f3ff;
      border-color: #00ffff;
    }
    .buttons {
      margin-top: 30px;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    button {
      padding: 12px 30px;
      font-size: 1em;
      border: 2px solid #00f3ff;
      background: #0a0e27;
      color: #00f3ff;
      cursor: pointer;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      transition: all 0.3s;
    }
    button:hover {
      background: #00f3ff;
      color: #0a0e27;
      box-shadow: 0 0 20px #00f3ff;
    }
    button:active {
      transform: scale(0.95);
    }
    .status {
      margin-top: 20px;
      padding: 15px;
      border-radius: 5px;
      font-size: 0.9em;
    }
    .status.info { background: rgba(0, 204, 255, 0.1); color: #00ccff; }
    .status.success { background: rgba(0, 255, 0, 0.1); color: #00ff00; }
    .status.error { background: rgba(255, 0, 0, 0.1); color: #ff6666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ GOD EYE VIEW</h1>
    <div class="subtitle">Montréal 2033 — Satellite Reconnaissance</div>

    <div class="coordinates">
      <div class="coord-row">
        <span class="coord-label">📍 Latitude:</span> ${lat}°
      </div>
      <div class="coord-row">
        <span class="coord-label">📍 Longitude:</span> ${lon}°
      </div>
      <div class="coord-row">
        <span class="coord-label">📡 Altitude:</span> ${alt}m
      </div>
      <div class="coord-row">
        <span class="coord-label">🧭 Heading:</span> ${heading}°
      </div>
      <div class="coord-row">
        <span class="coord-label">📊 Pitch:</span> ${pitch}°
      </div>
    </div>

    <div class="controls">
      <div class="control-group">
        <label for="lat">Latitude</label>
        <input type="number" id="lat" value="${lat}" step="0.0001">
      </div>
      <div class="control-group">
        <label for="lon">Longitude</label>
        <input type="number" id="lon" value="${lon}" step="0.0001">
      </div>
      <div class="control-group">
        <label for="alt">Altitude (m)</label>
        <input type="number" id="alt" value="${alt}" min="100" max="5000">
      </div>
      <div class="control-group">
        <label for="heading">Heading (°)</label>
        <input type="number" id="heading" value="${heading}" min="0" max="360">
      </div>
      <div class="control-group">
        <label for="pitch">Pitch (°)</label>
        <input type="number" id="pitch" value="${pitch}" min="-90" max="0">
      </div>
      <div class="control-group">
        <label for="style">Map Style</label>
        <select id="style">
          <option value="normal" ${style === "normal" ? "selected" : ""}>Normal</option>
          <option value="satellite" ${style === "satellite" ? "selected" : ""}>Satellite</option>
          <option value="terrain" ${style === "terrain" ? "selected" : ""}>Terrain</option>
        </select>
      </div>
      <div class="control-group">
        <label for="hud">HUD Mode</label>
        <select id="hud">
          <option value="tactical" ${hud === "tactical" ? "selected" : ""}>Tactical</option>
          <option value="strategic" ${hud === "strategic" ? "selected" : ""}>Strategic</option>
          <option value="minimal" ${hud === "minimal" ? "selected" : ""}>Minimal</option>
        </select>
      </div>
    </div>

    <div class="buttons">
      <button onclick="launchViewer()">🚀 LANCER</button>
      <button onclick="resetDefaults()">🔄 RESET</button>
    </div>

    <div class="status info" id="status">Prêt à lancer la surveillance orbitale</div>
  </div>

  <script>
    function launchViewer() {
      const params = {
        lat: document.getElementById('lat').value,
        lon: document.getElementById('lon').value,
        alt: document.getElementById('alt').value,
        heading: document.getElementById('heading').value,
        pitch: document.getElementById('pitch').value,
        style: document.getElementById('style').value,
        hud: document.getElementById('hud').value,
      };

      const url = '/god-eye-view?' + new URLSearchParams(params).toString();
      window.open(url, 'god_eye_view', 'width=1400,height=900,menubar=no,toolbar=no');
      
      document.getElementById('status').innerHTML = '✓ Fenêtre lancée — Surveillance activée';
      document.getElementById('status').className = 'status success';
    }

    function resetDefaults() {
      document.getElementById('lat').value = '45.5017';
      document.getElementById('lon').value = '-73.5673';
      document.getElementById('alt').value = '600';
      document.getElementById('heading').value = '15';
      document.getElementById('pitch').value = '-30';
      document.getElementById('style').value = 'normal';
      document.getElementById('hud').value = 'tactical';
      document.getElementById('status').innerHTML = 'Réinitialisé aux coordonnées par défaut';
      document.getElementById('status').className = 'status info';
    }

    // Auto-launch if parameters provided
    window.addEventListener('load', () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('auto')) {
        setTimeout(() => launchViewer(), 500);
      }
    });
  </script>
</body>
</html>
  `;

  res.type("text/html").send(html);
});

/**
 * GET /god-eye-view (actual viewer — placeholder)
 */
router.get("/viewer", (req, res) => {
  const lat = req.query.lat || "45.5017";
  const lon = req.query.lon || "-73.5673";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>God Eye View</title>
  <style>
    body { margin: 0; background: #000; color: #00f3ff; font-family: monospace; }
    #map { width: 100%; height: 100vh; }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${lat}, ${lon}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    L.marker([${lat}, ${lon}]).addTo(map).bindPopup('📍 Montréal 2033');
  </script>
</body>
</html>
  `;

  res.type("text/html").send(html);
});

export default router;
