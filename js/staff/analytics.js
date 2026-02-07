/*************************************************
 * CONFIG
 *************************************************/
const ANALYTICS_API =
  "https://steelblue-skunk-833121.hostingersite.com/api/analytics/water_trend.php"; // Hostinger API endpoint
const ALERT_ANALYTICS_API =
  "https://steelblue-skunk-833121.hostingersite.com/api/analytics/alert_analytics.php";

const AUTO_REFRESH_SECONDS = 300; // 5 minutes
let refreshCountdown = AUTO_REFRESH_SECONDS;

/*************************************************
 * DOM REFERENCES
 *************************************************/
const lastUpdateEl = document.getElementById("lastUpdate");
const nextRefreshEl = document.getElementById("nextRefresh");

const svg = document.querySelector("svg");
const trendLine = svg?.querySelector("polyline"); // main trend line
const dataPoint = svg?.querySelector("circle");   // latest data point

// Alert Summary counts
const criticalCountEl = document.querySelector("[data-alert='EMERGENCY']");
const dangerCountEl  = document.querySelector("[data-alert='DANGER']");
const warningCountEl = document.querySelector("[data-alert='WARNING']");
const cautionCountEl = document.querySelector("[data-alert='CAUTION']");

// Recent Alerts container
const recentAlertsEl = document.getElementById("recentAlerts");


/*************************************************
 * TIME RANGE BUTTONS (UI ONLY – backend-ready)
 *************************************************/
document.querySelectorAll(".time-range-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-range-btn").forEach(b => {
      b.classList.remove("active", "bg-primary", "text-white");
      b.classList.add("text-text-secondary");
    });

    btn.classList.add("active", "bg-primary", "text-white");
    btn.classList.remove("text-text-secondary");

    fetchAnalytics(); // refresh data
  });
});

/*************************************************
 * REFRESH BUTTON
 *************************************************/
document.getElementById("refreshData")?.addEventListener("click", () => {
  fetchAnalytics(true);
});

/*************************************************
 * UPDATE TIMESTAMP
 *************************************************/
function updateTimestamp() {
  const now = new Date();
  lastUpdateEl.textContent = now.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

/*************************************************
 * AUTO REFRESH COUNTDOWN
 *************************************************/
function updateRefreshCountdown() {
  const minutes = Math.floor(refreshCountdown / 60);
  const seconds = refreshCountdown % 60;

  if (nextRefreshEl) {
    nextRefreshEl.textContent =
      `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  refreshCountdown--;

  if (refreshCountdown < 0) {
    refreshCountdown = AUTO_REFRESH_SECONDS;
    fetchAnalytics();
  }
}

setInterval(updateRefreshCountdown, 1000);

/*************************************************
 * FETCH ANALYTICS DATA
 *************************************************/
async function fetchAnalytics(manual = false) {
  try {
    if (manual) {
      const icon = document.querySelector("#refreshData svg");
      icon?.classList.add("animate-spin");
      setTimeout(() => icon?.classList.remove("animate-spin"), 800);
    }

    const res = await fetch(ANALYTICS_API);
    const data = await res.json();

    if (!data.values || !data.values.length) {
      console.warn("No analytics data returned");
      return;
    }

    renderTrend(data.timestamps, data.values);

    updateTimestamp();
    refreshCountdown = AUTO_REFRESH_SECONDS;

  } catch (err) {
    console.error("Analytics fetch failed:", err);
  }
}

/*************************************************
 * RENDER SVG TREND LINE (LGU SAFE – TIME ACCURATE)
 *************************************************/
function renderTrend(timestamps, values) {
  if (!trendLine || !timestamps?.length) return;

  const WIDTH = 700;
  const HEIGHT = 240;
  const MAX_CM = 180;
  const X_START = 60;
  const Y_START = 50;

  // Convert HH:mm timestamps to epoch (same-day)
  const times = timestamps.map(t =>
    new Date(`1970-01-01T${t}:00`).getTime()
  );

  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const spanT = maxT - minT || 1;

  const points = values.map((val, i) => {
    const x =
      X_START + ((times[i] - minT) / spanT) * WIDTH;
    const y =
      Y_START + (1 - val / MAX_CM) * HEIGHT;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  trendLine.setAttribute("points", points.join(" "));

  // Latest data point
  if (dataPoint) {
    const lastIndex = values.length - 1;
    const cx =
      X_START + ((times[lastIndex] - minT) / spanT) * WIDTH;
    const cy =
      Y_START + (1 - values[lastIndex] / MAX_CM) * HEIGHT;

    dataPoint.setAttribute("cx", cx);
    dataPoint.setAttribute("cy", cy);
  }
}

async function fetchAlertAnalytics() {
  try {
    const res = await fetch(ALERT_ANALYTICS_API);
    const data = await res.json();

    // ----- SUMMARY -----
    if (criticalCountEl) criticalCountEl.textContent = data.summary.EMERGENCY ?? 0;
    if (dangerCountEl)  dangerCountEl.textContent  = data.summary.DANGER ?? 0;
    if (warningCountEl) warningCountEl.textContent = data.summary.WARNING ?? 0;
    if (cautionCountEl) cautionCountEl.textContent = data.summary.CAUTION ?? 0;

    // ----- RECENT ALERTS -----
    if (recentAlertsEl) {
      recentAlertsEl.innerHTML = "";

      data.recent.forEach(alert => {
        const item = document.createElement("div");
        item.className = "flex items-start gap-2 p-2 rounded-md";

        item.innerHTML = `
          <div class="flex-1">
            <p class="text-sm font-medium text-text-primary">
              ${alert.status} – ${alert.water_level} cm
            </p>
            <p class="text-xs text-text-secondary mt-1">
              ${new Date(alert.sent_at).toLocaleString()}
            </p>
          </div>
        `;

        recentAlertsEl.appendChild(item);
      });
    }

  } catch (err) {
    console.error("Alert analytics fetch failed:", err);
  }
}



/*************************************************
 * INIT
 *************************************************/
updateTimestamp();
fetchAnalytics();
updateTimestamp();
fetchAnalytics();
fetchAlertAnalytics();

