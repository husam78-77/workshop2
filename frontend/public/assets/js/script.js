/* =========================================================
   SIDEBAR & PROFILE MENU FUNCTIONALITY
========================================================= */

// Wait for sidebar AND header elements to be available
function initSidebar() {
    const sidebar = document.getElementById("sidebarMenu");
    const menu = document.getElementById("profileMenu");
    const profileArea = document.querySelector(".sidebar-profile");
    const toggleBtn = document.getElementById("sidebarToggle");

    if (!sidebar || !menu || !profileArea || !toggleBtn) {
        setTimeout(initSidebar, 100);
        return;
    }

    console.log("✅ Sidebar and header loaded, initializing...");

    // Close menu
    function closeMenu() {
        menu.classList.remove("open");
    }

    // Open menu
    function openMenu() {
        menu.classList.add("open");
    }

    // Toggle menu
    function toggleMenu() {
        menu.classList.toggle("open");
    }

    // Main click handler for sidebar/profile
    document.addEventListener("click", (e) => {
        // Toggle sidebar button
        if (e.target.closest("#sidebarToggle")) {
            document.body.classList.toggle("sidebar-collapsed");
            closeMenu();
            return;
        }

        // Check if clicked inside profile area
        const clickedProfile = e.target.closest(".sidebar-profile");

        if (clickedProfile) {
            // Prevent default for profile trigger
            const profileLink = e.target.closest(".profile-trigger");
            if (profileLink) {
                e.preventDefault();
                e.stopPropagation();

                // If sidebar is collapsed, expand it first
                if (document.body.classList.contains("sidebar-collapsed")) {
                    document.body.classList.remove("sidebar-collapsed");
                    setTimeout(openMenu, 250);
                } else {
                    // Toggle menu
                    toggleMenu();
                }
            }
        } else {
            // Clicked outside - close menu
            closeMenu();
        }
    });

    // Set active nav item based on current page
    setActiveNavItem();
}

// Set active navigation item
function setActiveNavItem() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".sidebar .nav-link");

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
}

// Start sidebar initialization
initSidebar();
/* ------------------------------------------------------
   B3 — SMART CONTEXT EXTRACTION (FINAL VERSION)
--------------------------------------------------------- */

/* Extract ID and Name from table row */
function extractRowContext(el) {
    let row = el.closest("tr");
    if (!row) return null;

    let cells = [...row.querySelectorAll("td")].map(td => td.innerText.trim());

    return {
        id: cells[0] || null,
        name: cells[1] || null,
        all: cells
    };
}

/* Extract meaningful form fields */
function extractFormContext(el) {
    let form = el.closest("form");
    if (!form) return null;

    let data = {};

    form.querySelectorAll("input, select, textarea").forEach(input => {
        const key = input.name || input.id;
        if (!key) return;

        const value = input.value?.trim();
        if (value && value.length > 0) {
            data[key] = value;
        }
    });

    return data;
}

/* Extract best possible name/title/vessel/date clues */
function extractExtraContext() {

    let context = {};

    // Generic titles
    let title = document.querySelector(".card-title, h1, h2, .page-title");
    if (title) context.pageTitle = title.innerText.trim();

    // Strong indicators
    let vessel = document.querySelector("input[name='vessel'], select[name='vessel']");
    if (vessel) context.vessel = vessel.value;

    let date = document.querySelector("input[type='date']");
    if (date) context.date = date.value;

    // Extract text from first table
    let firstRow = document.querySelector("table tbody tr");
    if (firstRow) {
        let cells = [...firstRow.querySelectorAll("td")].map(td => td.innerText.trim());
        context.tablePreview = cells;
    }

    return context;
}

/* Detect action */
function detectAction(text) {
    text = text.toLowerCase();

    if (text.match(/delete|remove|trash/)) return "delete";
    if (text.match(/edit|update|modify/)) return "update";
    if (text.match(/add|new|create/)) return "create";
    if (text.match(/upload|attach/)) return "upload";
    if (text.match(/approve|accept/)) return "approve";
    if (text.match(/reject/)) return "reject";
    if (text.match(/save/)) return "update";
    if (text.match(/login|sign in/)) return "login";
    if (text.match(/logout|sign out/)) return "logout";

    return null;
}

/* Main click listener */
document.addEventListener("click", (e) => {
    const el = e.target.closest("button, a, input[type='submit']");
    if (!el) return;

    let text = (el.innerText || el.value || "").trim();
    let action = detectAction(text);
    if (!action) return;

    let moduleName = detectPageModule();
    let row = extractRowContext(el);
    let form = extractFormContext(el);
    let extra = extractExtraContext();

    fetch("/api/activity/ui-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            module: moduleName,
            action: action,
            meta: {
                buttonText: text,
                row,
                form,
                extra,
                page: moduleName,
                element: el.tagName.toLowerCase(),
                classes: el.className
            }
        })
    });
});

/* ------------------------------------------------------
   CLEAN SMART LOGGER — AI-LIKE LOGIC (LEVEL 3)
--------------------------------------------------------- */

/* DETECT ACTION */
function detectAction(text) {
    if (!text) return null;
    text = text.toLowerCase();

    if (text.includes("delete") || text.includes("remove") || text.includes("trash")) return "delete";
    if (text.includes("edit") || text.includes("update") || text.includes("modify")) return "update";
    if (text.includes("add") || text.includes("new") || text.includes("create")) return "create";
    if (text.includes("upload") || text.includes("attach")) return "upload";
    if (text.includes("approve") || text.includes("accept")) return "approve";
    if (text.includes("reject")) return "reject";
    if (text.includes("save")) return "update";
    if (text.includes("login")) return "login";
    if (text.includes("logout")) return "logout";

    return null;
}

/* DETECT PAGE MODULE */
function detectPageModule() {
    let path = window.location.pathname.toLowerCase();

    // Extract header text if available
    let headerText = "";
    let header = document.querySelector("h1, h2, .page-title, .page-header h4");
    if (header) headerText = header.innerText.toLowerCase();

    // Extract active sidebar
    let activeText = "";
    let active = document.querySelector(".nav-link.active, .menu-item.active");
    if (active) activeText = active.innerText.toLowerCase();

    // Combine all text sources (optional future logic)
    let combined = path + " " + headerText + " " + activeText;

    // Strict filename-based rules
    if (path.includes("login")) return "Authentication";
    if (path.includes("users")) return "User Management";
    if (path.includes("inspection")) return "Inspection Records";
    if (path.includes("report")) return "Auto Report Generation";
    if (path.includes("schedule")) return "Inspection Scheduling";
    if (path.includes("reference")) return "Reference Data";
    if (path.includes("notifications")) return "Notification & Alerts";
    if (path.includes("logs")) return "Activity Log";
    if (path.includes("index") || path.endsWith("/")) return "Dashboard & Analytics";

    return "General";
}


/* EXTRACT TABLE ROW */
function extractRowContext(el) {
    let row = el.closest("tr");
    if (!row) return null;

    let cells = [...row.querySelectorAll("td")].map(td => td.innerText.trim());

    return {
        text: cells.join(" | "),
        id: cells[0] || null,
        name: cells[1] || null,
        all: cells
    };
}

/* EXTRACT FORM */
function extractFormContext(el) {
    let form = el.closest("form");
    if (!form) return null;

    let data = {};
    form.querySelectorAll("input, select, textarea").forEach(input => {
        let key = input.name || input.id;
        if (key && input.value.trim()) data[key] = input.value.trim();
    });

    return data;
}

/* MAIN CLICK LOGGER */
document.addEventListener("click", (e) => {
    const el = e.target.closest("button, a, input[type='submit']");
    if (!el) return;

    let text = (el.innerText || el.value || "").trim().toLowerCase();
    let action = detectAction(text);
    if (!action) return;

    let moduleName = detectPageModule();
    let rowContext = extractRowContext(el);
    let formContext = extractFormContext(el);

    fetch("/api/activity/ui-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            module: moduleName,
            action: action,
            meta: {
                buttonText: text,
                row: rowContext,
                form: formContext,
                page: moduleName,
                element: el.tagName.toLowerCase(),
                classList: el.className
            }
        })
    });
});


