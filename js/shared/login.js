document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const messageBox = document.getElementById("loginMessage");
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    function showMessage(text, type = "error") {
        messageBox.textContent = text;
        messageBox.classList.remove("hidden", "alert-error", "alert-success");
        messageBox.classList.add(type === "success" ? "alert-success" : "alert-error");
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        messageBox.classList.add("hidden");

        if (username.value.trim() === "" || password.value.trim() === "") {
            showMessage("All fields are required");
            return;
        }

        const formData = new FormData();
        formData.append("username", username.value.trim());
        formData.append("password", password.value);

        try {
            const response = await fetch("../../api/auth/login.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                showMessage(result.message);
                return;
            }

            showMessage("Login successful. Redirecting…", "success");

            setTimeout(() => {
                if (result.role === "admin") {
                    window.location.href = "/WaterSense_v3/pages/admin/dashboard.html";
                } else {
                    window.location.href = "/WaterSense_v3/pages/staff/dashboard.html";
                }
            }, 800);

        } catch (err) {
            showMessage("Server error. Please try again.");
        }
    });
});
