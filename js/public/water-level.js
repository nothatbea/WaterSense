const API_URL = "https://steelblue-skunk-833121.hostingersite.com/api/sensors/latest.php";

// ===== DOM LOOKUPS (GLOBAL) =====
const waterLevelText = document.getElementById("waterLevelText");
const waterFill = document.getElementById("waterFill");
const statusBadge = document.getElementById("statusBadge");
const lastUpdate = document.getElementById("lastUpdate");
const statusText = document.getElementById("statusText");

// ===== SHARED UI UPDATER =====
function updateUI({ water_level, status, created_at }) {
  let level = parseFloat(water_level);
  if (isNaN(level)) level = 0;

  const maxHeight = 180; // cm
  const percent = Math.min(Math.max((level / maxHeight) * 100, 0), 100);

  waterLevelText.textContent = `${level.toFixed(1)} cm`;
  waterFill.style.height = `${percent}%`;

  statusText.textContent = status.toLowerCase();
  lastUpdate.textContent = created_at;
}

// ===== FETCH (POLLING FALLBACK) =====
async function fetchLatestWaterLevel() {
  if (!waterLevelText || !waterFill || !statusBadge || !lastUpdate || !statusText) {
    console.warn("Water-level elements missing in DOM. Skipping update.");
    return;
  }

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API not reachable");

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    updateUI(data[0]);
  } catch (err) {
    console.error("Failed to fetch water level:", err.message);
  }
}

// ===== INITIAL LOAD =====
fetchLatestWaterLevel();

// ===== AUTO REFRESH (SAFETY NET) =====
setInterval(fetchLatestWaterLevel, 30000);

// ===== REALTIME UPDATE (WebSocket) =====
const ws = new WebSocket("wss://watersense-backend.onrender.com");

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);

  // Ignore handshake / non-sensor messages
  if (!data.water_level_cm) return;

  updateUI({
    water_level: data.water_level_cm,
    status: data.status,
    created_at: data.received_at
  });
};
