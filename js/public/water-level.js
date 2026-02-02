const API_URL = "https://steelblue-skunk-833121.hostingersite.com/api/sensors/latest.php";

async function fetchLatestWaterLevel() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API not reachable");

    const data = await res.json();
    if (!data.length) return;

    const row = data[0];

    const level = parseFloat(row.water_level);
    const maxHeight = 180; // cm
    const percent = Math.min((level / maxHeight) * 100, 100);

    // Update text
    document.getElementById("waterLevelValue").textContent = `${level} cm`;
    document.getElementById("locationName").textContent = row.location_name;
    document.getElementById("currentTime").textContent =
      new Date(row.created_at).toLocaleString();

    // Update bar
    const bar = document.getElementById("waterLevelBar");
    bar.style.height = `${percent}%`;

    // Status logic
    const banner = document.getElementById("statusBanner");
    const indicator = document.getElementById("statusIndicator");

    if (percent >= 80) {
      banner.className = "alert alert-error";
      indicator.innerHTML = `
        <div class="status-indicator status-danger status-pulse w-6 h-6"></div>
        <span class="text-xs font-medium text-error-700 uppercase">danger</span>`;
    } else if (percent >= 60) {
      banner.className = "alert alert-warning";
      indicator.innerHTML = `
        <div class="status-indicator status-caution status-pulse w-6 h-6"></div>
        <span class="text-xs font-medium text-warning-700 uppercase">caution</span>`;
    } else {
      banner.className = "alert alert-success";
      indicator.innerHTML = `
        <div class="status-indicator status-safe w-6 h-6"></div>
        <span class="text-xs font-medium text-success-700 uppercase">normal</span>`;
    }

  } catch (err) {
    console.error("Failed to fetch water level:", err.message);
  }
}

// Initial load
fetchLatestWaterLevel();

// Auto refresh every 10s
setInterval(fetchLatestWaterLevel, 15000);

