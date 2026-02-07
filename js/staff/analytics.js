/*************************************************
 * CONFIG
 *************************************************/
const ANALYTICS_API =
  "https://steelblue-skunk-833121.hostingersite.com/api/analytics/water_level_trend.php"; // Hostinger API endpoint

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


/*************************************************
 * INIT
 *************************************************/
updateTimestamp();
fetchAnalytics();
