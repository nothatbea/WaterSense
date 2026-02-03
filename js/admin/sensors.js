document.addEventListener('DOMContentLoaded', () => {
    /* =============================
       CONSTANTS & DOM ELEMENTS
    ============================= */
    const API_BASE_URL = 'https://steelblue-skunk-833121.hostingersite.com/api/sensors';
    
    // Filter elements
    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const searchInput = document.getElementById('searchInput');
    
    // Checkbox elements
    const selectAllCheckbox = document.getElementById('selectAll');
    const deviceCheckboxes = document.querySelectorAll('.device-checkbox');
    
    // Device detail elements
    const deviceRows = document.querySelectorAll('.device-row');
    const deviceDetailContent = document.getElementById('deviceDetailContent');
    
    // Map elements
    const mapViewToggle = document.getElementById('mapViewToggle');
    const mapSection = document.getElementById('mapSection');
    const closeMapView = document.getElementById('closeMapView');
    
    // Calibration elements
    const offsetSlider = document.getElementById('linggaOffset');
    const offsetInput = document.getElementById('linggaOffsetInput');
    const setRefBtn = document.getElementById('setReferenceBtn');
    const saveCalibrationBtn = document.getElementById('saveCalibrationBtn');

    /* =============================
       DEVICE DATA
    ============================= */
    const deviceData = {
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

    /* =============================
       FILTER FUNCTIONS
    ============================= */
    function applyFilters() {
        console.log('Filters applied:', {
            location: locationFilter.value,
            status: statusFilter.value,
            type: typeFilter.value,
            search: searchInput.value.toLowerCase()
        });
    }

    /* =============================
       BATTERY FUNCTIONS
    ============================= */
    function adcToBatteryPercent(adc) {
        const ADC_MAX = 4095;
        const ADC_MIN = 2800;

        if (adc === null || isNaN(adc)) return null;

        let percent = ((adc - ADC_MIN) / (ADC_MAX - ADC_MIN)) * 100;
        percent = Math.max(0, Math.min(100, percent));

        return Math.round(percent);
    }

    function updateBatteryUI(locationId, rawADC) {
        const bars = document.querySelectorAll(
            `.battery-bar[data-location-id="${locationId}"]`
        );
        const texts = document.querySelectorAll(
            `.battery-text[data-location-id="${locationId}"]`
        );

        if (!bars.length || !texts.length) return;

        // NULL / invalid battery
        if (rawADC === null) {
            bars.forEach(bar => {
                bar.style.width = "0%";
                bar.className = "battery-bar h-2 rounded-full bg-secondary-300";
            });
            texts.forEach(text => {
                text.textContent = "--%";
                text.className = "battery-text text-xs font-medium text-text-secondary";
            });
            return;
        }

        const percent = adcToBatteryPercent(Number(rawADC));

        bars.forEach(bar => {
            bar.style.width = percent + "%";
            bar.className = "battery-bar h-2 rounded-full";
        });

        texts.forEach(text => {
            text.textContent = percent + "%";
            text.className = "battery-text text-xs font-medium";
        });

        if (percent > 60) {
            bars.forEach(bar => bar.classList.add("bg-success-500"));
            texts.forEach(text => text.classList.add("text-success-600"));
        } else if (percent > 30) {
            bars.forEach(bar => bar.classList.add("bg-warning-500"));
            texts.forEach(text => text.classList.add("text-warning-600"));
        } else {
            bars.forEach(bar => bar.classList.add("bg-error-500"));
            texts.forEach(text => text.classList.add("text-error-600"));
        }
    }

    /* =============================
       CALIBRATION FUNCTIONS
    ============================= */
    function updateCalibrationBadge(offset) {
        const badge = document.getElementById("calibrationBadge");
        const status = document.getElementById("calibrationStatus");

        if (!badge || !status) return;

        if (Math.abs(offset) > 0.01) {
            badge.classList.remove("hidden");
            status.textContent = "Calibrated";
            status.classList.remove("badge-secondary");
            status.classList.add("badge-success");
        } else {
            badge.classList.add("hidden");
            status.textContent = "Not Calibrated";
            status.classList.remove("badge-success");
            status.classList.add("badge-secondary");
        }
    }

    function previewCalibration() {
        const rawEl = document.getElementById("rawValue");
        const offsetEl = document.getElementById("linggaOffset");
        const calibratedEl = document.getElementById("calibratedValue");

        if (!rawEl || !offsetEl || !calibratedEl) return;

        const raw = parseFloat(rawEl.textContent);
        const offset = parseFloat(offsetEl.value);

        if (isNaN(raw) || isNaN(offset)) return;

        const preview = raw + offset;
        calibratedEl.textContent = preview.toFixed(1) + " cm";

        updateCalibrationBadge(offset);
    }

    /* =============================
       API FUNCTIONS
    ============================= */
    async function loadLatestBattery() {
        try {
            const res = await fetch(`${API_BASE_URL}/latest.php`);
            const data = await res.json();

            data.forEach(sensor => {
                // Update battery UI
                updateBatteryUI(sensor.location_id, sensor.battery);

                // Update calibration UI (ADMIN ONLY, Lingga example)
                if (sensor.location_id === 1) {
                    const lastCalEl = document.getElementById("lastCalibratedAt");

                    if (lastCalEl) {
                        lastCalEl.textContent = sensor.calibrated_at
                            ? sensor.calibrated_at
                            : "—";
                    }

                    // Raw & calibrated values
                    const rawValueEl = document.getElementById("rawValue");
                    const calibratedValueEl = document.getElementById("calibratedValue");
                    
                    if (rawValueEl) {
                        rawValueEl.textContent = sensor.raw_water_level;
                    }
                    
                    if (calibratedValueEl) {
                        calibratedValueEl.textContent = sensor.water_level + " cm";
                    }

                    // Set current offset into controls
                    if (offsetSlider && offsetInput) {
                        offsetSlider.value = sensor.calibration_offset;
                        offsetInput.value = sensor.calibration_offset;
                    }

                    // Update badge state
                    updateCalibrationBadge(sensor.calibration_offset);
                }
            });
        } catch (err) {
            console.error("Latest sensor fetch failed:", err);
        }
    }

    async function saveCalibration() {
        const offset = parseFloat(document.getElementById("linggaOffset").value);

        try {
            const res = await fetch(`${API_BASE_URL}/saveCalibration.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location_id: 1, // Lingga
                    offset: offset
                })
            });

            const result = await res.json();

            if (result.success) {
                alert("Calibration saved successfully.");
                // Reload values from backend
                loadLatestBattery();
            } else {
                alert("Failed to save calibration.");
            }
        } catch (err) {
            console.error("Save calibration failed:", err);
            alert("Error saving calibration.");
        }
    }

    /* =============================
       DEVICE DETAIL FUNCTIONS
    ============================= */
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

    function closeDeviceDetail() {
        deviceDetailContent.innerHTML = `
            <p class="text-sm text-text-secondary text-center">
                Select a device to view details
            </p>
        `;
    }

    /* =============================
       ACTION HANDLERS
    ============================= */
    function handleBulkCalibrate() {
        const selected = [...deviceCheckboxes].filter(cb => cb.checked).length;
        if (!selected) {
            alert('Select at least one device.');
            return;
        }
        alert(`Calibration scheduled for ${selected} device(s).`);
    }

    function handleScheduleMaintenance() {
        alert('Maintenance scheduler opened.');
    }

    function handleExportReport() {
        alert('Exporting report...');
    }

    function handleSetReference() {
        const raw = parseFloat(
            document.getElementById("rawValue")?.textContent
        );
        const ref = parseFloat(
            document.getElementById("linggaReference")?.value
        );

        if (isNaN(raw) || isNaN(ref)) {
            alert("Please enter a valid reference level.");
            return;
        }

        const suggestedOffset = ref - raw;

        offsetSlider.value = suggestedOffset.toFixed(1);
        offsetInput.value = suggestedOffset.toFixed(1);

        previewCalibration();
    }

    /* =============================
       EVENT LISTENERS - FILTERS
    ============================= */
    locationFilter?.addEventListener('change', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);
    typeFilter?.addEventListener('change', applyFilters);
    searchInput?.addEventListener('input', applyFilters);

    /* =============================
       EVENT LISTENERS - CHECKBOXES
    ============================= */
    selectAllCheckbox?.addEventListener('change', function() {
        deviceCheckboxes.forEach(cb => cb.checked = this.checked);
    });

    /* =============================
       EVENT LISTENERS - DEVICE DETAILS
    ============================= */
    deviceRows.forEach(row => {
        row.addEventListener('click', e => {
            if (e.target.closest('button') || e.target.type === 'checkbox') return;
            showDeviceDetails(row.dataset.deviceId);
        });
    });

    document.getElementById('closeDetailPanel')?.addEventListener('click', closeDeviceDetail);

    /* =============================
       EVENT LISTENERS - MAP VIEW
    ============================= */
    mapViewToggle?.addEventListener('click', () => {
        mapSection.classList.toggle('hidden');
    });

    closeMapView?.addEventListener('click', () => {
        mapSection.classList.add('hidden');
    });

    /* =============================
       EVENT LISTENERS - ACTIONS
    ============================= */
    document.getElementById('bulkCalibrate')?.addEventListener('click', handleBulkCalibrate);
    document.getElementById('scheduleMaintenance')?.addEventListener('click', handleScheduleMaintenance);
    document.getElementById('exportReport')?.addEventListener('click', handleExportReport);

    /* =============================
       EVENT LISTENERS - CALIBRATION
    ============================= */
    if (offsetSlider && offsetInput) {
        offsetSlider.addEventListener("input", () => {
            offsetInput.value = offsetSlider.value;
            previewCalibration();
        });

        offsetInput.addEventListener("input", () => {
            offsetSlider.value = offsetInput.value;
            previewCalibration();
        });
    }

    setRefBtn?.addEventListener('click', handleSetReference);
    saveCalibrationBtn?.addEventListener('click', saveCalibration);

    /* =============================
       INITIALIZATION
    ============================= */
    // Initial load
    loadLatestBattery();
    
    // Refresh every 30 seconds
    setInterval(loadLatestBattery, 30000);
});