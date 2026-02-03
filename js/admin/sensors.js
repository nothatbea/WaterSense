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
    /* =============================
   BATTERY VISUALIZATION
============================= */

// Convert raw ADC to battery %
function adcToBatteryPercent(adc) {
    const ADC_MAX = 4095;
    const ADC_MIN = 2800;

    if (adc === null || isNaN(adc)) return null;

    let percent = ((adc - ADC_MIN) / (ADC_MAX - ADC_MIN)) * 100;
    percent = Math.max(0, Math.min(100, percent));

    return Math.round(percent);
}

// Update battery UI (desktop + mobile)
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

    // Fetch latest battery values
        // Fetch latest sensor values (battery + calibration-aware levels)
    async function loadLatestBattery() {
        try {
            const res = await fetch('/api/sensors/latest.php');
            const data = await res.json();

            data.forEach(sensor => {

                // --- Battery (existing behavior) ---
                updateBatteryUI(sensor.location_id, sensor.battery);

                // --- Calibration UI (ADMIN ONLY, Lingga example) ---
                if (sensor.location_id === 1) {

                    // Raw & calibrated values
                    document.getElementById("rawValue").textContent =
                        sensor.raw_water_level;

                    document.getElementById("calibratedValue").textContent =
                        sensor.water_level + " cm";

                    // Set current offset into controls
                    if (offsetSlider && offsetInput) {
                        offsetSlider.value = sensor.calibration_offset;
                        offsetInput.value  = sensor.calibration_offset;
                    }

                    // Badge state
                    updateCalibrationBadge(sensor.calibration_offset);
                }
            });

        } catch (err) {
            console.error("Latest sensor fetch failed:", err);
        }
    }


        /* =============================
       CALIBRATION UI HELPERS
    ============================= */

    // Show / hide "Calibration Active" badge based on offset
    function updateCalibrationBadge(offset) {
        const badge  = document.getElementById("calibrationBadge");
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

    // Preview calibrated value (visual only, no backend write)
    function previewCalibration() {
        const rawEl        = document.getElementById("rawValue");
        const offsetEl     = document.getElementById("linggaOffset");
        const calibratedEl = document.getElementById("calibratedValue");

        if (!rawEl || !offsetEl || !calibratedEl) return;

        const raw    = parseFloat(rawEl.textContent);
        const offset = parseFloat(offsetEl.value);

        if (isNaN(raw) || isNaN(offset)) return;

        const preview = raw + offset;
        calibratedEl.textContent = preview.toFixed(1) + " cm";

        // Update badge during preview
        updateCalibrationBadge(offset);
    }

        /* =============================
       CALIBRATION UI INTERACTIONS
    ============================= */

    const offsetSlider = document.getElementById("linggaOffset");
    const offsetInput  = document.getElementById("linggaOffsetInput");
    const setRefBtn    = document.getElementById("setReferenceBtn");

    // Sync slider → number input
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

    // Compute suggested offset from manual reference
    if (setRefBtn) {
        setRefBtn.addEventListener("click", () => {
            const raw = parseFloat(
                document.getElementById("rawValue")?.textContent
            );
            const ref = parseFloat(
                document.getElementById("linggaReference")?.value
            );

            if (isNaN(raw) || isNaN(ref)) {
                alert("Please enter a valid reference level. ");
                return;
            }

            const suggestedOffset = ref - raw;

            offsetSlider.value = suggestedOffset.toFixed(1);
            offsetInput.value  = suggestedOffset.toFixed(1);

            previewCalibration();
        });
    }



     // Initial load + refresh
    loadLatestBattery();
    setInterval(loadLatestBattery, 30000);


});
