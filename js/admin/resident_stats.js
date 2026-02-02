async function loadResidentStats() {
    const res = await fetch("../database/get_residents.php");
    const data = await res.json();

    const palingon = data.filter(r => r.barangay === "palingon").length;
    const lingga = data.filter(r => r.barangay === "lingga").length;

    const enabled = data.filter(r => r.email_alerts || r.sms_alerts).length;
    const disabled = data.length - enabled;
    const urgent = data.filter(r => r.urgent_contact).length;

    document.getElementById("totalResidents").textContent =
        `Total Residents: ${data.length}`;

    document.getElementById("palingonCount").textContent = palingon;
    document.getElementById("linggaCount").textContent = lingga;

    document.getElementById("totalSubscribers").textContent = enabled;
    document.getElementById("alertsEnabledCount").textContent = enabled;
    document.getElementById("alertsDisabledCount").textContent = disabled;
    document.getElementById("urgentCount").textContent = urgent;
}

async function loadRecentRegistrations() {
    try {
        const response = await fetch("../../api/residents/recent.php");

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const residents = await response.json();
        const container = document.getElementById("recentRegistrationsList");

        container.innerHTML = "";

        if (residents.length === 0) {
            container.innerHTML = `
                <p class="text-sm text-text-secondary">No recent registrations</p>
            `;
            return;
        }

        residents.forEach(resident => {
            const item = `
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-text-primary">
                            ${resident.full_name}
                        </p>
                        <p class="text-xs text-text-secondary capitalize">
                            Barangay ${resident.barangay}
                        </p>
                    </div>
                    <span class="text-xs text-text-secondary">
                        ${resident.registration_date}
                    </span>
                </div>
            `;

            container.insertAdjacentHTML("beforeend", item);
        });

    } catch (error) {
        console.error("Failed to load recent registrations:", error);
    }
}
