import express from "express";
import db from "../config/db.js";

const router = express.Router();

// 🔵 إضافة Log
router.post("/add", (req, res) => {
    const { user_id, action, module, importance } = req.body;

    const sql = `
        INSERT INTO activity_log (user_id, action, module, importance)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [user_id, action, module, importance || "Medium"], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Log added", id: results.insertId });
    });
});

// 🔵 جلب كل الـ Logs
router.get("/all", (req, res) => {
    const sql = "SELECT * FROM activity_log ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔵 جلب logs حسب الموديول
router.get("/module/:name", (req, res) => {
    const sql = "SELECT * FROM activity_log WHERE module = ? ORDER BY created_at DESC";

    db.query(sql, [req.params.name], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔵 جلب logs حسب المستخدم
router.get("/user/:id", (req, res) => {
    const sql = "SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
