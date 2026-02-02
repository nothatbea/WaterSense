async function loadResidents() {
    try {
        const response = await fetch("../../api/residents/list.php");

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const residents = await response.json();

        const tbody = document.getElementById("residentsTableBody");
        tbody.innerHTML = "";

        const total = residents.length;

        const pageSize = 5;
        const startIndex = 0;
        const endIndex = Math.min(pageSize, total);

        residents.slice(startIndex, endIndex).forEach(resident => {
            const alertStatus = resident.urgent_contact == 1
                ? "Urgent"
                : (resident.email_alerts == 1 || resident.sms_alerts == 1)
                    ? "Enabled"
                    : "Disabled";

            const row = `
                <tr class="border-b border-border hover:bg-secondary-50">
                    <td class="py-3 px-4">
                        <input type="checkbox" class="mr-3">
                        ${resident.full_name}
                    </td>
                    <td class="py-3 px-4">
                        ${resident.phone}<br>
                        <span class="text-xs text-text-secondary">${resident.email ?? ""}</span>
                    </td>
                    <td class="py-3 px-4 capitalize">
                        ${resident.barangay}
                    </td>
                    <td class="py-3 px-4">
                        ${alertStatus}
                    </td>
                    <td class="py-3 px-4">
                        ${resident.last_alert_date ?? "—"}
                    </td>
                    <td class="py-3 px-4">
                        <button class="action-btn" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;

            tbody.insertAdjacentHTML("beforeend", row);
        });

        document.getElementById("shownCount").textContent = endIndex;
        document.getElementById("totalCount").textContent = total;

        document.getElementById("showingFrom").textContent =
            total === 0 ? 0 : startIndex + 1;

        document.getElementById("showingTo").textContent = endIndex;
        document.getElementById("totalResidentsCount").textContent = total;

        document.getElementById("totalResidents").textContent =
            `Total Residents: ${total}`;

    } catch (error) {
        console.error("Failed to load residents:", error);
    }
}

document.getElementById("residentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("full_name", document.getElementById("fullName").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("barangay", document.getElementById("location").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("household_size", document.getElementById("householdSize").value);
    formData.append("registration_date", document.getElementById("registrationDate").value);
    formData.append("notes", document.getElementById("notes").value);

    if (document.getElementById("emailAlerts").checked) {
        formData.append("email_alerts", 1);
    }
    if (document.getElementById("smsAlerts").checked) {
        formData.append("sms_alerts", 1);
    }
    if (document.getElementById("urgentContact").checked) {
        formData.append("urgent_contact", 1);
    }

    try {
        const response = await fetch("../../api/residents/create.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message);
            return;
        }

        alert("Resident added successfully!");
        document.getElementById("residentForm").reset();

        loadResidents();
        loadResidentStats();

    } catch (err) {
        console.error("Failed to add resident:", err);
        alert("Server error. Please try again.");
    }
});

