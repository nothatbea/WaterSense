document.addEventListener('DOMContentLoaded', () => {

    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const searchInput = document.getElementById('searchInput');

    function applyFilters() {
        console.log('Filters applied:', {
            location: locationFilter.value,
            status: statusFilter.value,
            type: typeFilter.value,
            search: searchInput.value.toLowerCase()
        });
    }

    locationFilter?.addEventListener('change', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);
    typeFilter?.addEventListener('change', applyFilters);
    searchInput?.addEventListener('input', applyFilters);

    /* =============================
       SELECT ALL CHECKBOX
    ============================= */
    const selectAllCheckbox = document.getElementById('selectAll');
    const deviceCheckboxes = document.querySelectorAll('.device-checkbox');

    selectAllCheckbox?.addEventListener('change', function () {
        deviceCheckboxes.forEach(cb => cb.checked = this.checked);
    });

    /* =============================
       DEVICE DETAIL PANEL
    ============================= */
    const deviceRows = document.querySelectorAll('.device-row');
    const deviceDetailContent = document.getElementById('deviceDetailContent');

    const deviceData = {
        "LM-PAL-001": {
            name: "LM-PAL-001",
            location: "Barangay Palingon",
            status: "Online",
            battery: "87%",
            signal: "Excellent",
            installed: "03/15/2024",
            lastCalibration: "12/10/2025",
            uptime: "99.8%",
            dataPoints: "1,440"
        },
        "LM-LIN-001": {
            name: "LM-LIN-001",
            location: "Barangay Lingga",
            status: "Online",
            battery: "92%",
            signal: "Good",
            installed: "03/20/2024",
            lastCalibration: "12/08/2025",
            uptime: "99.5%",
            dataPoints: "1,438"
        }
    };

    deviceRows.forEach(row => {
        row.addEventListener('click', e => {
            if (e.target.closest('button') || e.target.type === 'checkbox') return;
            showDeviceDetails(row.dataset.deviceId);
        });
    });

    function showDeviceDetails(id) {
        const d = deviceData[id];
        if (!d) return;

        deviceDetailContent.innerHTML = `
            <div class="space-y-4">
                <h4 class="font-semibold">${d.name}</h4>
                <p>${d.location}</p>
                <p>Status: ${d.status}</p>
                <p>Battery: ${d.battery}</p>
                <p>Signal: ${d.signal}</p>
                <p>Installed: ${d.installed}</p>
                <p>Last Calibration: ${d.lastCalibration}</p>
                <p>Uptime: ${d.uptime}</p>
                <p>Data Points: ${d.dataPoints}</p>
            </div>
        `;
    }

    document.getElementById('closeDetailPanel')?.addEventListener('click', () => {
        deviceDetailContent.innerHTML = `
            <p class="text-sm text-text-secondary text-center">
                Select a device to view details
            </p>
        `;
    });

    /* =============================
       MAP VIEW
    ============================= */
    const mapViewToggle = document.getElementById('mapViewToggle');
    const mapSection = document.getElementById('mapSection');
    const closeMapView = document.getElementById('closeMapView');

    mapViewToggle?.addEventListener('click', () => {
        mapSection.classList.toggle('hidden');
    });

    closeMapView?.addEventListener('click', () => {
        mapSection.classList.add('hidden');
    });

    /* =============================
       ACTION BUTTONS
    ============================= */
    document.getElementById('bulkCalibrate')?.addEventListener('click', () => {
        const selected = [...deviceCheckboxes].filter(cb => cb.checked).length;
        if (!selected) return alert('Select at least one device.');
        alert(`Calibration scheduled for ${selected} device(s).`);
    });

    document.getElementById('scheduleMaintenance')?.addEventListener('click', () => {
        alert('Maintenance scheduler opened.');
    });

    document.getElementById('exportReport')?.addEventListener('click', () => {
        alert('Exporting report...');
    });

});
