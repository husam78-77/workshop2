
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./config/db.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🧭 Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Test API route
app.get("/api/test", (req, res) => {
    db.query("SELECT NOW() AS `server_time`", (err, results) => {
        if (err) {
            console.error("❌ Error fetching data from MySQL:", err);
            return res.status(500).json({
                error: "Database query failed",
                details: err.message,
            });
        }
        res.json(results);
    });
});

// main folder view file
app.use(express.static(path.join(__dirname, "../frontend/public")));


// route declaration

// start - module inspection
app.get("/inspection", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/inspection/main.html"));
});

app.get("/inspection/create1", (req, res) => {
    const filePath = path.join(__dirname, "../frontend/public/inspection/create1.html");
    console.log("Serving:", filePath);
    res.sendFile(filePath);
});
app.get("/inspection/create2", (req, res) => {
    const filePath = path.join(__dirname, "../frontend/public/inspection/create2.html");
    console.log("Serving:", filePath);
    res.sendFile(filePath);
});

app.get("/test-create", (req, res) => {
    res.send("Route OK!");
});

// end - module inspection


// server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
