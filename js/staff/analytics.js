// ============================
// TIME RANGE BUTTONS
// ============================
document.querySelectorAll('.time-range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.time-range-btn').forEach(b => {
            b.classList.remove('active', 'bg-primary', 'text-white');
            b.classList.add('text-text-secondary');
        });

        btn.classList.add('active', 'bg-primary', 'text-white');
        btn.classList.remove('text-text-secondary');

        console.log('Time range changed to:', btn.dataset.range);
    });
});

// ============================
// LOCATION SELECTOR
// ============================
document.getElementById('locationSelector')
    ?.addEventListener('change', e => {
        console.log('Location changed to:', e.target.value);
    });

// ============================
// GENERATE REPORT
// ============================
document.getElementById('generateReport')
    ?.addEventListener('click', () => {
        console.log('Generating report...');
        alert('Report generation started. You will receive a notification when ready.');
    });

// ============================
// REFRESH DATA
// ============================
document.getElementById('refreshData')
    ?.addEventListener('click', function () {
        const icon = this.querySelector('svg');
        icon.classList.add('animate-spin');

        setTimeout(() => {
            icon.classList.remove('animate-spin');
            updateTimestamp();
            console.log('Data refreshed');
        }, 1000);
    });

// ============================
// TIMESTAMP & AUTO REFRESH
// ============================
function updateTimestamp() {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    document.getElementById('lastUpdate').textContent = timestamp;
}

let refreshCountdown = 300;

function updateRefreshCountdown() {
    const minutes = Math.floor(refreshCountdown / 60);
    const seconds = refreshCountdown % 60;

    document.getElementById('nextRefresh').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    refreshCountdown--;

    if (refreshCountdown < 0) {
        refreshCountdown = 300;
        updateTimestamp();
        console.log('Auto-refresh triggered');
    }
}

setInterval(updateRefreshCountdown, 1000);
updateTimestamp();



