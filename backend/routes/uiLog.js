import express from "express";
import db from "../config/db.js";

const router = express.Router();

function buildSmartMessage(action, moduleName, meta) {
    let name = meta?.row?.name || meta?.form?.name || "";
    let id = meta?.row?.id || meta?.form?.id || meta?.record_id || "";
    let file = meta?.file || "";

    switch (action) {
        case "delete":
            return name
                ? `Deleted ${moduleName} "${name}" (#${id})`
                : `Deleted ${moduleName} #${id}`;

        case "create":
            return name
                ? `Created ${moduleName} "${name}" (#${id})`
                : `Created new ${moduleName}`;

        case "update":
            return name
                ? `Updated ${moduleName} "${name}" (#${id})`
                : `Updated ${moduleName} #${id}`;

        case "upload":
            return file ? `Uploaded file "${file}"` : "Uploaded file";

        case "approve":
            return `Approved ${moduleName} #${id}`;

        case "reject":
            return `Rejected ${moduleName} #${id}`;

        case "login":
            return "User logged in";

        case "logout":
            return "User logged out";

        default:
            return `${action} on ${moduleName}`;
    }
}

/* IMPORTANCE */
function getImportance(action) {
    if (action === "delete") return "High";
    if (action === "create") return "Low";
    return "Medium";
}

/* MAIN UI LOG ENDPOINT */
router.post("/ui-log", (req, res) => {
    const { module, action, meta } = req.body;

    const username = req.user?.username || null;
    const user_id = req.user?.id || null;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const record_id =
        meta?.row?.id ||
        meta?.form?.id ||
        meta?.record_id ||
        null;

    const message = buildSmartMessage(action, module, meta);
    const importance = getImportance(action);

    const sql = `
        INSERT INTO activity_log
        (user_id, username, module, action, importance, message, record_id, meta, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
        user_id,
        username,
        module,
        action,
        importance,
        message,
        record_id,
        JSON.stringify(meta || {}),
        ip,
        userAgent
    ];

    db.query(sql, params, (err) => {
        if (err) {
            console.error("UI Log DB Error:", err);
            return res.status(500).json({ ok: false, error: err.message });
        }
        return res.json({ ok: true });
    });
});

export default router;
