document.addEventListener('DOMContentLoaded', () => {

    let autoRefreshEnabled = true;
    let refreshInterval = null;

    const autoRefreshBtn = document.getElementById('autoRefreshToggle');
    const timeRangeSelect = document.getElementById('timeRange');

    /* =============================
       AUTO REFRESH
    ============================= */
    function startAutoRefresh() {
        refreshInterval = setInterval(() => {
            console.log('Refreshing dashboard data...');
            updateLastUpdated();
        }, 30000);
    }

    function stopAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    autoRefreshBtn?.addEventListener('click', function () {
        autoRefreshEnabled = !autoRefreshEnabled;

        if (autoRefreshEnabled) {
            this.classList.remove('btn-outline');
            this.classList.add('btn-primary');
            startAutoRefresh();
        } else {
            this.classList.remove('btn-primary');
            this.classList.add('btn-outline');
            stopAutoRefresh();
        }
    });

    startAutoRefresh();

    //  TIME RANGE CHANGE */
    timeRangeSelect?.addEventListener('change', function () {
        console.log('Time range changed to:', this.value);
        updateLastUpdated();
    });

    /* LAST UPDATED TIMESTAMP  */
    function updateLastUpdated() {
        const timestamp = new Date().toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        document.querySelectorAll('.text-xs.text-text-secondary').forEach(el => {
            if (el.textContent.includes('Last updated:')) {
                el.textContent = `Last updated: ${timestamp}`;
            }
        });
    }
    

    setInterval(updateLastUpdated, 60000);

});
