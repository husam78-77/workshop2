import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import autoLogger from "./middleware/autoLogger.js";
import uiLogRoute from "./routes/uiLog.js";

import db from "./config/db.js";
import activityRoutes from "./routes/activity.js";
import testRoutes from "./routes/test.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🟧 Auto backend logger MUST be before routes
app.use(autoLogger);

// 🟦 UI Logger route
app.use("/api/activity", uiLogRoute);

// 🧭 Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🟦 API ROUTES
app.use("/api/auth", authRoutes);       // ← 2) USE HERE
app.use("/api/activity", activityRoutes);
app.use("/api/test", testRoutes);

// 🔵 Test API
app.get("/api/test-time", (req, res) => {
    db.query("SELECT NOW() AS server_time", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔵 Serve components
app.use("/components", express.static(path.join(__dirname, "../frontend/public/components")));

// 🔵 Serve static frontend
app.use(express.static(path.join(__dirname, "../frontend/public")));

// 🔵 Catch-all (SPA fallback)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// 🔵 Start
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
