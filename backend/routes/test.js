import express from "express";
import db from "../config/db.js";

const router = express.Router();

// CREATE test (POST)
router.post("/create", (req, res) => {
    db.query("INSERT INTO test_table (name) VALUES ('test')", (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ insertId: result.insertId });
    });
});

// UPDATE test (PUT)
router.put("/update/:id", (req, res) => {
    res.json({ ok: true });
});

// DELETE test (DELETE)
router.delete("/delete/:id", (req, res) => {
    res.json({ ok: true });
});

export default router;
