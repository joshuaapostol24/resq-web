document.addEventListener("DOMContentLoaded", async () => {

    /*
    =========================================================
    AUTH
    =========================================================
    */

    const loggedIn = localStorage.getItem("resq_logged_in");

    if (loggedIn !== "true") {
        window.location.href = "/LOGIN/login.html";
        return;
    }

    /*
    =========================================================
    LOGOUT
    =========================================================
    */

    const logoutButton = document.querySelector(".btn-primary");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("resq_logged_in");
            localStorage.removeItem("resq_user");
            window.location.href = "/LOGIN/login.html";
        });
    }

    /*
    =========================================================
    LOAD ICONS
    =========================================================
    */

    if (window.lucide) window.lucide.createIcons();

    /*
    =========================================================
    HELPERS
    =========================================================
    */

    const API_BASE = "https://resq-app-xsb98.ondigitalocean.app/api";

    function setEl(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function getRiskClass(level = "") {
        level = String(level).toUpperCase();
        if (level === "VERY HIGH") return "very-high";
        if (level === "HIGH")      return "high";
        if (level === "MODERATE")  return "moderate";
        return "low";
    }

    function getRiskEmoji(level = "") {
        const map = {
            "VERY HIGH": "🔴", "HIGH": "🟠",
            "MODERATE": "🟡",  "LOW": "🟢", "VERY LOW": "⚪"
        };
        return map[String(level).toUpperCase()] || "❓";
    }

    /*
    =========================================================
    FETCH  GET /dashboard
    =========================================================
    */

    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        if (!response.ok) throw new Error("Dashboard fetch failed");
        const data = await response.json();

        // ── Users & Reports ──────────────────────────────────────────────────
        setEl("totalResidents", data.users?.total   ?? 0);
        setEl("totalReports",   data.reports?.total ?? 0);
        setEl("totalAssessments", data.assessments?.total ?? 0);

        // ── Risk summary ─────────────────────────────────────────────────────
        const risk = data.risk || {};

        setEl("highestRiskLevel",   `${getRiskEmoji(risk.highest_level)} ${risk.highest_level || "N/A"}`);
        setEl("barangaysAtRisk",    risk.high_count          ?? 0);
        setEl("totalAssessed",      risk.total_assessed      ?? 0);

        const riskLevelEl = document.getElementById("highestRiskLevel");
        if (riskLevelEl) {
            riskLevelEl.className = `summary-value risk-${getRiskClass(risk.highest_level)}`;
        }

        // ── Risk breakdown ───────────────────────────────────────────────────
        const s = risk.summary || {};
        setEl("riskVeryHigh", s["VERY HIGH"] ?? 0);
        setEl("riskHigh",     s["HIGH"]      ?? 0);
        setEl("riskModerate", s["MODERATE"]  ?? 0);
        setEl("riskLow",      s["LOW"]       ?? 0);

        // ── Latest simulation ────────────────────────────────────────────────
        const sim = data.latest_simulation;
        if (sim) {
            setEl("simRainfall",   sim.rainfall  != null ? `${sim.rainfall} mm/h` : "—");
            setEl("simHumidity",   sim.humidity  != null ? `${sim.humidity}%`     : "—");
            setEl("simDate",       sim.created_at
                ? new Date(sim.created_at).toLocaleString()
                : "—"
            );
            setEl("simVeryHigh",   sim.summary?.very_high ?? 0);
            setEl("simHigh",       sim.summary?.high      ?? 0);
            setEl("simModerate",   sim.summary?.moderate  ?? 0);
            setEl("simLow",        sim.summary?.low       ?? 0);
        }

        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        console.error("Dashboard load error:", error);
        setEl("totalResidents",   "—");
        setEl("totalReports",     "—");
        setEl("totalAssessments", "—");
        setEl("highestRiskLevel", "—");
        setEl("barangaysAtRisk",  "—");
    }

});