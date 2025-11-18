
// Fetch server test route
fetch("http://localhost:5000/api/test")
    .then((res) => res.json())
    .then((data) => {
        document.getElementById("status").innerText = "✅ Connected to Backend & MySQL!";
        document.getElementById("db-time").innerText =
            "Database Time: " + new Date(data[0].server_time).toLocaleString();
    })
    .catch((err) => {
        console.error("❌ Error connecting to backend:", err);
        document.getElementById("status").innerText = "❌ Cannot connect to backend.";
    });
