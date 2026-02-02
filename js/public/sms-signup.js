// sms-signup.js – Handles SMS alert signup only (styled like public_view.js)

const SMS_API_URL =
  "https://steelblue-skunk-833121.hostingersite.com/api/alerts/subscribe.php";

// Wait for DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing SMS signup...");

  const smsForm = document.getElementById("smsSignupForm");
  if (!smsForm) {
    console.error("SMS signup form not found");
    return;
  }

  smsForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonHTML = submitButton.innerHTML;

    console.log("Submitting phone number:", phoneNumber);

    // Validate PH mobile number
    if (!/^09\d{9}$/.test(phoneNumber)) {
      showNotification(
        "Please enter a valid 11-digit Philippine mobile number starting with 09.",
        "error"
      );
      return;
    }

    // Loading state
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <svg class="w-5 h-5 mr-2 animate-spin inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
        </path>
      </svg>
      Submitting...
    `;

    try {
      const response = await fetch(SMS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          location:
            document.getElementById("locationName")?.textContent ||
            "Barangay Lingga"
        })
      });

      const data = await response.json();
      console.log("SMS API response:", data);

      if (data.success) {
        if (data.already_subscribed) {
          showNotification("This number is already receiving alerts.", "info");
        } else if (data.reactivated) {
          showNotification(
            "Welcome back! Your alerts have been reactivated.",
            "success"
          );
        } else {
          showNotification(data.message, "success");
        }

        smsForm.reset();
      } else {
        showNotification(
          data.message || "Failed to subscribe. Please try again.",
          "error"
        );
      }
    } catch (err) {
      console.error("SMS signup error:", err);
      showNotification(
        "Network error. Please check your connection and try again.",
        "error"
      );
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonHTML;
    }
  });
});


// ================= NOTIFICATION SYSTEM =================

function showNotification(message, type = "info") {
  const existing = document.querySelector(".notification-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `notification-toast fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg animate-slide-in-right ${getNotificationClasses(
    type
  )}`;

  toast.innerHTML = `
    <div class="flex items-start gap-3">
      ${getNotificationIcon(type)}
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button onclick="this.closest('.notification-toast').remove()"
        class="opacity-70 hover:opacity-100">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("animate-fade-out");
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

function getNotificationClasses(type) {
  return {
    success: "bg-green-50 text-green-800 border border-green-200",
    error: "bg-red-50 text-red-800 border border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    info: "bg-blue-50 text-blue-800 border border-blue-200"
  }[type];
}

function getNotificationIcon(type) {
  return {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  }[type];
}

// ================= ANIMATIONS =================

const style = document.createElement("style");
style.textContent = `
  @keyframes slide-in-right {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
  .animate-fade-out {
    animation: fade-out 0.3s ease-out;
  }
`;
document.head.appendChild(style);
