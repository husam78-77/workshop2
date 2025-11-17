// autoLogger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve ES Module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load log template config
const templatesPath = path.join(__dirname, "..", "config", "logTemplates.json");
const LOG_TEMPLATES = JSON.parse(fs.readFileSync(templatesPath, "utf8"));

/* -Helpers*/

// pick the first valid field from candidates
function pickField(obj, fields) {
    if (!obj) return undefined;
    for (const f of fields) {
        if (obj[f] !== undefined && obj[f] !== null && obj[f] !== "") {
            return obj[f];
        }
    }
    return undefined;
}

// apply {vars} inside templates
function formatTemplate(tmpl, vars) {
    return tmpl
        .replace(/{([^}]+)}/g, (_, key) => vars[key] ?? "")
        .replace(/\s+\(\#\)/g, ""); // clean empty leftovers
}

// extract module from URL
function parseModuleFromUrl(url) {
    const parts = url.split("?")[0].split("/").filter(Boolean);
    if (!parts.length) return "unknown";
    return parts[0] === "api" && parts[1] ? parts[1] : parts[0];
}

// translate HTTP method → action
function getActionFromMethod(method) {
    switch (method.toUpperCase()) {
        case "POST": return "create";
        case "PUT":
        case "PATCH": return "update";
        case "DELETE": return "delete";
        default: return null;
    }
}

/* -----------------------------------------------------------
   Middleware
----------------------------------------------------------- */

export default function autoLogger(req, res, next) {

    // skip GET
    const action = getActionFromMethod(req.method);
    if (!action) return next();

    // 🚫 skip UI log route
    if (req.originalUrl.includes("/api/activity/ui-log")) {
        return next();
    }

    const moduleName = parseModuleFromUrl(req.originalUrl || req.url);

    // get last path segment if numeric (example: /users/23)
    const urlParts = (req.originalUrl || req.url).split("?")[0].split("/").filter(Boolean);
    const lastPart = urlParts[urlParts.length - 1];
    const candidateIdFromUrl = /^\d+$/.test(lastPart) ? lastPart : undefined;

    // Run after response is done
    res.on("finish", () => {
        try {
            const source = {
                ...(req.body || {}),
                ...(res.locals || {}),
                ...(res.locals?.responseBody || {})
            };

            const config = LOG_TEMPLATES[moduleName] || LOG_TEMPLATES.default;

            // determine final record id
            const finalId =
                res.locals?.insertId ||
                res.locals?.record_id ||
                res.locals?.id ||
                candidateIdFromUrl ||
                pickField(source, config.idFields);

            // name/title/etc.
            const name = pickField(source, config.nameFields);
            const title = name || pickField(source, ["title", "report_name", "inspection_title"]);
            const altFields = Array.isArray(config.altFields) ? config.altFields : [];
            const vessel = pickField(source, [...altFields, "vessel_name", "vessel"]);
            const date = pickField(source, ["inspection_date", "date", "checked_at"]);

            const vars = {
                module: moduleName,
                id: finalId || "",
                name: name || title || "",
                title: title || "",
                vessel: vessel || "",
                date: date || ""
            };

            // choose template
            const template =
                config.templates[action] ||
                LOG_TEMPLATES.default.templates[action];

            const message = formatTemplate(template, vars).trim();

            // importance levels
            let importance = "Medium";
            if (action === "delete") importance = "High";
            else if (action === "create") importance = "Low";

            const actor =
                req.user?.name ||
                req.user?.username ||
                req.ip ||
                "system";

            // final DB log entry
            const logEntry = {
                user_id: req.user?.id || null,
                username: req.user?.username || req.user?.name || null,
                module: moduleName,
                action,
                importance,
                message,
                record_id: finalId ?? null,
                meta: JSON.stringify({
                    url: req.originalUrl || req.url,
                    method: req.method,
                    bodyKeys: Object.keys(req.body || {}),
                    responseStatus: res.statusCode
                }),
                ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                user_agent: req.headers["user-agent"],
                created_at: new Date()
            };


            // Insert into DB
            if (global.db?.query) {
                const sql = `
                    INSERT INTO activity_log
                    (user, module, action, message, importance, record_id, meta, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const params = [
                    logEntry.user_id,
                    logEntry.username,
                    logEntry.module,
                    logEntry.action,
                    logEntry.importance,
                    logEntry.message,
                    logEntry.record_id,
                    logEntry.meta,
                    logEntry.ip_address,
                    logEntry.user_agent,
                    logEntry.created_at
                ];


                global.db.query(sql, params, (err) => {
                    if (err) console.error("AutoLogger DB Error:", err);
                });
            } else {
                console.log("[AutoLog]", logEntry);
            }

        } catch (err) {
            console.error("autoLogger error:", err);
        }
    });

    next();
}
