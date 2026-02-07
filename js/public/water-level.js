const API_URL = "https://watersense-backend.onrender.com/api/sensors/latest";
// ===== TIME FORMATTER (AUTO TIMEZONE) =====
function formatTimestamp(isoString) {
  if (!isoString) return "—";

  const date = new Date(isoString);

  // Auto-detect browser timezone
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}


// ===== DOM LOOKUPS (GLOBAL) =====
const waterLevelText = document.getElementById("waterLevelText");
const waterFill = document.getElementById("waterFill");
const statusBadge = document.getElementById("statusBadge");
const lastUpdate = document.getElementById("lastUpdate");
const statusText = document.getElementById("statusText");

// ===== SHARED UI UPDATER =====
function updateUI({ water_level, status, timestamp }) {
  let level = parseFloat(water_level);
  if (isNaN(level)) level = 0;

  const maxHeight = 180; // cm
  const percent = Math.min(Math.max((level / maxHeight) * 100, 0), 100);

  waterLevelText.textContent = `${level.toFixed(1)} cm`;
  waterFill.style.height = `${percent}%`;

  statusText.textContent = status ? status.toLowerCase() : "unknown";

  lastUpdate.textContent = formatTimestamp(timestamp);
}


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

    const latest = data[0];

    updateUI({
      water_level: latest.water_level,
      status: latest.status,
      timestamp: latest.created_at
    });

  } catch (err) {
    console.error("Failed to fetch water level:", err.message);
  }
}


// ===== INITIAL LOAD =====
fetchLatestWaterLevel();

// ===== AUTO REFRESH (SAFETY NET) =====
setInterval(fetchLatestWaterLevel, 5000);

// ===== REALTIME UPDATE (WebSocket) =====
const ws = new WebSocket("wss://watersense-backend.onrender.com");

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);

  // Ignore non-sensor messages
  if (!data.water_level_cm) return;

  updateUI({
    water_level: data.water_level_cm,
    status: data.status,
    timestamp: data.received_at
  });
};


