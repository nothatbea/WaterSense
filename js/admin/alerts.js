document.addEventListener('DOMContentLoaded', () => {

    /* =============================
       FILTERS
    ============================= */
    const statusFilter = document.getElementById('alertStatusFilter');
    const severityFilter = document.getElementById('alertSeverityFilter');

    function applyFilters() {
        console.log('Filters:', {
            status: statusFilter.value,
            severity: severityFilter.value
        });
    }

    statusFilter?.addEventListener('change', applyFilters);
    severityFilter?.addEventListener('change', applyFilters);

    /* =============================
       THRESHOLD SLIDERS (SYNC)
    ============================= */
    function syncSlider(rangeEl, inputEl) {
        rangeEl.addEventListener('input', () => {
            inputEl.value = rangeEl.value;
        });

        inputEl.addEventListener('input', () => {
            rangeEl.value = inputEl.value;
        });
    }

    syncSlider(
        document.getElementById('linggaWarning'),
        document.getElementById('linggaWarningInput')
    );

    syncSlider(
        document.getElementById('linggaCritical'),
        document.getElementById('linggaCriticalInput')
    );

    /* =============================
       SAVE THRESHOLDS
    ============================= */
    document.getElementById('saveThresholdsBtn')?.addEventListener('click', () => {
        alert('Alert thresholds saved successfully.');
        console.log('Thresholds saved');
    });

    /* =============================
       ACKNOWLEDGE SINGLE ALERT
    ============================= */
    document.querySelectorAll('.acknowledge-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const alertId = btn.dataset.alertId;
            alert(`Alert ${alertId} acknowledged.`);
            btn.closest('.alert')?.remove();
        });
    });

    /* =============================
       ACKNOWLEDGE ALL
    ============================= */
    document.getElementById('acknowledgeAllBtn')?.addEventListener('click', () => {
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        alert('All alerts acknowledged.');
    });

    /* =============================
       EXPORT & TEST
    ============================= */
    document.getElementById('exportAlertsBtn')?.addEventListener('click', () => {
        alert('Exporting alert history...');
    });

    document.getElementById('testAlertBtn')?.addEventListener('click', () => {
        alert('Test alert triggered successfully.');
    });

    /* =============================
       HISTORY FILTER
    ============================= */
    document.getElementById('historyDaysFilter')?.addEventListener('change', function () {
        console.log('History range:', this.value, 'days');
    });

    /* =============================
       LOAD MORE
    ============================= */
    document.getElementById('loadMoreAlerts')?.addEventListener('click', () => {
        alert('Loading more alert history...');
    });

});
