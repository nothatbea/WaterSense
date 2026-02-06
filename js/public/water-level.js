const API_URL = "https://watersense-backend.onrender.com/api/sensors/latest";

async function fetchLatestWaterLevel() {

  // ===== DOM LOOKUPS =====
  const waterLevelText = document.getElementById("waterLevelText");
  const waterFill = document.getElementById("waterFill");
  const statusBadge = document.getElementById("statusBadge");
  const lastUpdate = document.getElementById("lastUpdate");
  const statusText = document.getElementById("statusText");

  // ===== SAFETY GUARD =====
  if (!waterLevelText || !waterFill || !statusBadge || !lastUpdate || !statusText) {
    console.warn("Water-level elements missing in DOM. Skipping update.");
    return;
  }

  try {
    // ===== FETCH DATA =====
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API not reachable");

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    const row = data[0];

    // ===== PARSE LEVEL =====
    let level = parseFloat(row.water_level);
    if (isNaN(level)) level = 0;

    const maxHeight = 180; // cm
    const percent = Math.min(Math.max((level / maxHeight) * 100, 0), 100);

    // ===== UPDATE UI =====
    waterLevelText.textContent = `${level.toFixed(1)} cm`;
    waterFill.style.height = `${percent}%`;

    statusBadge.textContent = "none";
    statusText.textContent = row.status.toLowerCase();

    lastUpdate.textContent = row.created_at;

  } catch (err) {
    console.error("Failed to fetch water level:", err.message);
  }
}

// ===== INITIAL LOAD =====
fetchLatestWaterLevel();

// ===== AUTO REFRESH =====
setInterval(fetchLatestWaterLevel, 30000);
