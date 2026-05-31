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
    const logoutButton = document.querySelector(".btn-logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("resq_logged_in");
            localStorage.removeItem("resq_user");
            window.location.href = "/LOGIN/login.html";
        });
    }

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

    function timeAgo(dateStr) {
        if (!dateStr) return "Unknown time";
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60)   return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400)return `${Math.floor(diff / 3600)} hours ago`;
        return new Date(dateStr).toLocaleDateString();
    }

    function riskColor(level = "") {
        const map = {
            "VERY HIGH": "#DC2626",
            "HIGH":      "#D97706",
            "MODERATE":  "#CA8A04",
            "LOW":       "#16A34A",
            "VERY LOW":  "#64748B",
        };
        return map[String(level).toUpperCase()] || "#64748B";
    }

    function riskEmoji(level = "") {
        const map = {
            "VERY HIGH": "🔴", "HIGH": "🟠",
            "MODERATE": "🟡",  "LOW": "🟢", "VERY LOW": "⚪"
        };
        return map[String(level).toUpperCase()] || "⚪";
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

        // ── Row 1: Summary cards ─────────────────────────────────────────────
        setEl("totalResidents",   data.users?.total         ?? 0);
        setEl("totalReports",     data.reports?.total       ?? 0);
        setEl("totalAssessments", data.assessments?.total   ?? 0);
        setEl("pendingCount",     data.pending_reports?.count ?? 0);

        // ── Pending reports card ─────────────────────────────────────────────
        const latest = data.pending_reports?.latest_report;
        if (latest) {
            setEl("pendingLatestTitle", latest.title || "No title");
            setEl("pendingLatestTime",  timeAgo(latest.created_at));
        } else {
            setEl("pendingLatestTitle", "No pending reports");
            setEl("pendingLatestTime",  "");
        }

        // ── Latest simulation ────────────────────────────────────────────────
        const sim = data.latest_simulation;
        if (sim) {
            setEl("simDate",     sim.created_at ? new Date(sim.created_at).toLocaleString() : "—");
            setEl("simRainfall", sim.rainfall   != null ? `${sim.rainfall} mm/h` : "—");
            setEl("simHumidity", sim.humidity   != null ? `${sim.humidity}%`     : "—");

            const rankList = document.getElementById("simRankings");
            if (rankList) {
                const barangays = sim.top_barangays || [];
                if (!barangays.length) {
                    rankList.innerHTML = `<li class="rank-empty">No simulation data available</li>`;
                } else {
                    rankList.innerHTML = barangays.map(b => `
                        <li class="rank-item">
                            <span class="rank-num">#${b.rank}</span>
                            <span class="rank-name">${b.barangay_name}</span>
                            <span class="rank-badge" style="color:${riskColor(b.risk_level)}">
                                ${riskEmoji(b.risk_level)} ${b.risk_level}
                            </span>
                            <span class="rank-score">${b.final_risk}%</span>
                        </li>
                    `).join("");
                }
            }
        } else {
            setEl("simDate",     "—");
            setEl("simRainfall", "—");
            setEl("simHumidity", "—");
            const rankList = document.getElementById("simRankings");
            if (rankList) rankList.innerHTML = `<li class="rank-empty">No simulation data</li>`;
        }

        // ── Latest news ──────────────────────────────────────────────────────
        const newsList = document.getElementById("newsList");
        if (newsList) {
            const news = data.latest_news || [];
            if (!news.length) {
                newsList.innerHTML = `<li class="news-empty">No announcements yet</li>`;
            } else {
                newsList.innerHTML = news.map((item, i) => `
                    <li class="news-item" onclick="window.location.href='../NEWS/news.html'">
                        <span class="news-num">${i + 1}</span>
                        <div class="news-info">
                            <span class="news-title">${item.title}</span>
                            <span class="news-date">${item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                        </div>
                    </li>
                `).join("");
            }
        }

        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        console.error("Dashboard load error:", error);
        ["totalResidents","totalReports","totalAssessments","pendingCount"].forEach(id => setEl(id, "—"));
    }

});