async function login() {
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();
  if (data.success) {
    window.location.href = "grievance.html";
  } else {
    alert("Wrong password, try again 💔");
  }
}

function checkAuth() {
  fetch("/check-auth")
    .then(res => res.json())
    .then(data => {
      if (!data.loggedIn) {
        alert("Access denied. Please log in first 💌");
        window.location.href = "index.html";
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("grievanceForm")) {
    checkAuth();

    document.getElementById("grievanceForm").addEventListener("submit", async function(event) {
      event.preventDefault();
      const formData = new FormData(this);
      const payload = {
        title: formData.get('title'),
        description: formData.get('description'),
        mood: formData.get('mood')
      };

      const res = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.location.href = "thankyou.html";
      } else {
        alert("Oops! Something went wrong. Try again.");
      }
    });
  }
});
