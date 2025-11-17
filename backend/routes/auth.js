/*just for testing*/

import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });

            if (results.length === 0) {
                return res.json({ success: false, message: "Invalid login" });
            }

            return res.json({ success: true, message: "Login success", user: results[0] });
        }
    );
});

export default router;
