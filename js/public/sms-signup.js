const SMS_API =
  "https://steelblue-skunk-833121.hostingersite.com/api/sms/subscribe.php";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("smsSignupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phoneNumber").value.trim();
    const location =
      document.getElementById("locationName")?.textContent || "Barangay Lingga";

    try {
      const res = await fetch(SMS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phone,
          location: location
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Subscription failed");
      }

      alert("✅ " + data.message);
      form.reset();

    } catch (err) {
      alert("❌ " + err.message);
      console.error("SMS signup error:", err);
    }
  });
});
