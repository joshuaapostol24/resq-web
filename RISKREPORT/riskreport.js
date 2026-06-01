// RISKREPORT/riskreport.js

document.addEventListener("DOMContentLoaded", async () => {

// =============================================================
// CONFIG
// =============================================================

const API_BASE_URL = "https://resq-app-xsb98.ondigitalocean.app/api";

// =============================================================
// AUTH
// =============================================================

if (localStorage.getItem("resq_logged_in") !== "true") {
    window.location.href = "/LOGIN/login.html";
    return;
}

const logoutButton = document.querySelector('[data-action="logout"]');
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("resq_logged_in");
        localStorage.removeItem("resq_user");
        window.location.href = "/LOGIN/login.html";
    });
}

if (window.lucide) lucide.createIcons();

// =============================================================
// ELEMENT REFS
// =============================================================

const barangaySelect      = document.getElementById("barangaySelect");
const historyTableBody    = document.getElementById("historyTableBody");
const viewHistoryBtn      = document.getElementById("viewHistoryBtn");
const generateRiskBtn     = document.getElementById("generateRiskBtn");
const runSimulationBtn    = document.getElementById("runSimulationBtn");
const riskResultContainer = document.getElementById("riskResultContainer");
const simulationResults   = document.getElementById("simulationResults");
const weatherRiskBtn      = document.getElementById("weatherRiskBtn");

// Summary counters (Risk Report page top cards)
const totalAssessments  = document.getElementById("totalAssessments");
const highRiskCount     = document.getElementById("highRiskCount");
const moderateRiskCount = document.getElementById("moderateRiskCount");
const safeCount         = document.getElementById("safeCount");

// =============================================================
// HELPERS
// =============================================================

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getRiskClass(level = "") {
    level = String(level).toUpperCase();
    if (level === "VERY HIGH") return "critical";
    if (level === "HIGH")      return "high";
    if (level === "MODERATE")  return "moderate";
    if (level === "LOW")       return "low";
    return "low";
}

function getRiskEmoji(level = "") {
    const map = {
        "VERY HIGH": "🔴", "HIGH": "🟠",
        "MODERATE":  "🟡", "LOW":  "🟢", "VERY LOW": "⚪"
    };
    return map[String(level).toUpperCase()] || "❓";
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
}

function getDeltaArrow(direction) {
    if (direction === "worsened") return '<span style="color:#e74c3c">▲ Worsened</span>';
    if (direction === "improved") return '<span style="color:#27ae60">▼ Improved</span>';
    return '<span style="color:#888">— Unchanged</span>';
}

// =============================================================
// LOAD BARANGAYS (dropdown)
// =============================================================

async function loadBarangays() {
    try {
        const response = await fetch(`${API_BASE_URL}/barangays`);
        const data     = await response.json();

        const defaultOpt = '<option value="">Select Barangay</option>';
        const allOpt     = '<option value="ALL">🌐 All Barangays</option>';
        const divider    = '<option disabled>──────────────</option>';

        barangaySelect.innerHTML = defaultOpt + allOpt + divider +
            data.map(b => `<option value="${b.barangay_id}">${escapeHtml(b.name)}</option>`).join("");

        // Also populate simulation barangay select if it exists
        const simBarangay = document.getElementById("simBarangay");
        if (simBarangay) {
            simBarangay.innerHTML = defaultOpt +
                data.map(b => `<option value="${b.barangay_id}">${escapeHtml(b.name)}</option>`).join("");
        }

    } catch (error) {
        console.error("loadBarangays:", error);
    }
}

// =============================================================
// LOAD HISTORY  →  GET /weather/history/{barangay_id}
// =============================================================

async function loadHistory(barangayId) {
    if (!historyTableBody) return;
    historyTableBody.innerHTML = '<div class="loading">Loading history...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/weather/history/${barangayId}`);
        if (!response.ok) throw new Error("Failed to fetch history");

        const history = await response.json();

        if (!history.length) {
            historyTableBody.innerHTML = '<div class="history-empty">No history data</div>';
            return;
        }

        // Update summary counters if they exist on the page
        if (totalAssessments)  totalAssessments.textContent  = history.length;
        if (highRiskCount)     highRiskCount.textContent     = history.filter(h => h.risk_level === "HIGH" || h.risk_level === "VERY HIGH").length;
        if (moderateRiskCount) moderateRiskCount.textContent = history.filter(h => h.risk_level === "MODERATE").length;
        if (safeCount)         safeCount.textContent         = history.filter(h => h.risk_level === "LOW" || h.risk_level === "VERY LOW").length;

        const histRiskSummaryMap = {
            "VERY HIGH": "⚠️ This barangay was at very high flood risk at this time.",
            "HIGH":      "🔶 This barangay was at high flood risk at this time.",
            "MODERATE":  "🟡 This barangay had a moderate flood risk at this time.",
            "LOW":       "🟢 This barangay was at low flood risk at this time.",
            "VERY LOW":  "✅ This barangay was at very low flood risk. No significant rainfall was detected.",
        };

        historyTableBody.innerHTML = history.map((item, index) => {
            const level = String(item.risk_level || "").toUpperCase();
            const summary = histRiskSummaryMap[level] || "Risk level could not be determined.";
            return `
            <div class="result-card ${index >= 3 ? 'extra-history hidden-history' : ''}" style="margin-bottom:16px;">
                <div class="result-header">
                    <div>
                        <h2 style="font-size:16px;">${formatDate(item.timestamp)}</h2>
                        <p>Flood Risk Assessment Record</p>
                    </div>
                    <div class="risk-badge ${getRiskClass(item.risk_level)}">
                        ${getRiskEmoji(item.risk_level)} ${escapeHtml(item.risk_level)}
                    </div>
                </div>
                <div class="weather-grid">
                    <div class="weather-box"><span>Temperature</span><strong>${item.temperature ?? "—"}°C</strong></div>
                    <div class="weather-box"><span>Rainfall</span><strong>${item.rainfall ?? "—"} mm/h</strong></div>
                    <div class="weather-box"><span>Wind Speed</span><strong>${item.wind_speed ?? "—"} km/h</strong></div>
                    <div class="weather-box"><span>Humidity</span><strong>${item.humidity ?? "—"}%</strong></div>
                </div>
                <div class="risk-summary-box ${getRiskClass(item.risk_level)}" style="margin-top:12px;">
                    ${summary}
                </div>
            </div>`;
        }).join("");

        if (history.length > 3) {
            historyTableBody.innerHTML += `
                <button class="show-more-history-btn" id="showMoreHistoryBtn">
                    See More History (${history.length - 3} more)
                </button>`;

            document.getElementById("showMoreHistoryBtn")?.addEventListener("click", () => {
                document.querySelectorAll(".extra-history").forEach(c => c.classList.remove("hidden-history"));
                document.getElementById("showMoreHistoryBtn")?.remove();
            });
        }

    } catch (error) {
        console.error("loadHistory:", error);
        historyTableBody.innerHTML = '<div class="history-empty">Failed to load history</div>';
    }
}

// =============================================================
// SIMULATION HISTORY  →  GET /simulate/history
// =============================================================

async function loadSimulationHistory() {
    const container = document.getElementById("simulationHistoryContainer");
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading simulation history...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/simulate/history?limit=10`);
        const data     = await response.json();

        if (!data.runs?.length) {
            container.innerHTML = '<div class="history-empty">No simulation runs yet.</div>';
            return;
        }

        container.innerHTML = data.runs.map(run => `
            <div class="history-row sim-history-row" data-run-id="${run.id}" style="cursor:pointer">
                <div class="history-date">${formatDate(run.created_at)}</div>
                <div class="history-metric"><label>Rainfall</label><span>${run.rainfall} mm/h</span></div>
                <div class="history-metric"><label>Wind</label><span>${run.wind_speed} km/h</span></div>
                <div class="history-metric"><label>Humidity</label><span>${run.humidity}%</span></div>
                <div class="history-metric"><label>Temp</label><span>${run.temperature}°C</span></div>
                <div class="history-metric">
                    <label>Risk</label>
                    <span>
                        🔴 ${run.very_high_count}
                        🟠 ${run.high_count}
                        🟡 ${run.moderate_count}
                        🟢 ${run.low_count}
                    </span>
                </div>
                <button class="btn-view-sim-run" data-run-id="${run.id}">View</button>
            </div>
        `).join("");

        // Clicking "View" loads full run details
        container.querySelectorAll(".btn-view-sim-run").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const runId = btn.dataset.runId;
                await loadSimulationRunDetail(runId);
            });
        });

    } catch (error) {
        console.error("loadSimulationHistory:", error);
        container.innerHTML = '<div class="history-empty">Failed to load simulation history.</div>';
    }
}

// =============================================================
// SIMULATION RUN DETAIL  →  GET /simulate/history/{run_id}
// =============================================================

async function loadSimulationRunDetail(runId) {
    try {
        const response = await fetch(`${API_BASE_URL}/simulate/history/${runId}`);
        if (!response.ok) throw new Error("Run not found");
        const run = await response.json();
        renderSimulationResults(run.barangays, run.inputs, run.summary, null, run.created_at);
    } catch (error) {
        console.error("loadSimulationRunDetail:", error);
        alert("Failed to load simulation run details.");
    }
}

// =============================================================
// WEATHER RISK (single barangay)  →  POST /predict-risk
// =============================================================

if (weatherRiskBtn) {
    weatherRiskBtn.addEventListener("click", async () => {
        const barangayVal = barangaySelect?.value;
        const resultDiv   = document.getElementById("weatherRiskResult");

        if (!barangayVal) {
            alert("Please select a barangay.");
            return;
        }

        if (resultDiv) resultDiv.innerHTML = '<div class="loading">Fetching live weather risk...</div>';

        try {
            let data;

            if (barangayVal === "ALL") {
                // ── All barangays  →  POST /predict-risk/all ─────────────────
                const response = await fetch(`${API_BASE_URL}/predict-risk/all`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hazard_type: "Flood" })
                });
                if (!response.ok) throw new Error("Prediction failed");
                data = await response.json();

                if (resultDiv) {
                    resultDiv.innerHTML = `
                        <div class="result-card">
                            <div class="result-header">
                                <div>
                                    <h2>All Barangays — Live Risk</h2>
                                    <p>ML-Based Disaster Risk Assessment</p>
                                </div>
                                <div class="summary-badges">
                                    🔴 ${data.summary.very_high}
                                    🟠 ${data.summary.high}
                                    🟡 ${data.summary.moderate}
                                    🟢 ${data.summary.low}
                                </div>
                            </div>
                            <div class="barangay-list">
                                ${data.barangays.map(b => `
                                    <div class="barangay-row">
                                        <span class="risk-badge ${getRiskClass(b.risk_level)}">
                                            ${getRiskEmoji(b.risk_level)} ${escapeHtml(b.risk_level)}
                                        </span>
                                        <span class="barangay-name">${escapeHtml(b.barangay_name)}</span>
                                        <span class="barangay-score">Score: ${b.final_risk?.toFixed(4)}</span>
                                        <span class="barangay-rain">🌧 ${b.rainfall?.toFixed(1)} mm/h</span>
                                        <span class="barangay-wind">💨 ${b.wind_speed?.toFixed(1)} km/h</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>`;
                }

            } else {
                // ── Single barangay  →  POST /predict-risk ───────────────────
                const response = await fetch(`${API_BASE_URL}/predict-risk`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        barangay_id: Number(barangayVal),
                        hazard_type: "Flood"
                    })
                });
                if (!response.ok) throw new Error("Prediction failed");
                data = await response.json();

                const barangayName = barangaySelect.options[barangaySelect.selectedIndex].text;
                if (resultDiv) {
                    const riskLevel = String(data.risk_level || "").toUpperCase();
                    const riskSummaryMap = {
                        "VERY HIGH": "⚠️ This barangay is at very high flood risk. Immediate precautions and possible evacuation may be needed.",
                        "HIGH":      "🔶 This barangay is at high flood risk. Residents should prepare and monitor updates closely.",
                        "MODERATE":  "🟡 This barangay has a moderate flood risk. Stay alert and keep emergency supplies ready.",
                        "LOW":       "🟢 This barangay is at low flood risk under current conditions. Stay informed.",
                        "VERY LOW":  "✅ This barangay is currently at very low flood risk. No significant rainfall detected — risk will rise when rainfall exceeds 7.5 mm/h.",
                    };
                    const riskSummary = riskSummaryMap[riskLevel] || "Risk level could not be determined.";

                    resultDiv.innerHTML = `
                        <div class="result-card">
                            <div class="result-header">
                                <div>
                                    <h2>${escapeHtml(barangayName)}</h2>
                                    <p>Live Flood Risk Assessment</p>
                                </div>
                                <div class="risk-badge ${getRiskClass(data.risk_level)}">
                                    ${getRiskEmoji(data.risk_level)} ${escapeHtml(data.risk_level)}
                                </div>
                            </div>
                            <div class="weather-grid">
                                <div class="weather-box"><span>Temperature</span><strong>${data.temperature ?? "—"}°C</strong></div>
                                <div class="weather-box"><span>Rainfall</span><strong>${data.rainfall ?? "—"} mm/h</strong></div>
                                <div class="weather-box"><span>Wind Speed</span><strong>${data.wind_speed ?? "—"} km/h</strong></div>
                                <div class="weather-box"><span>Humidity</span><strong>${data.humidity ?? "—"}%</strong></div>
                                <div class="weather-box"><span>Season</span><strong>${escapeHtml(data.season ?? "—")}</strong></div>
                            </div>
                            <div class="flood-susceptibility-section">
                                <h4>Flood Susceptibility</h4>
                                <div class="weather-grid">
                                    <div class="weather-box">
                                        <span>Flood Hazard Level</span>
                                        <strong>${escapeHtml(data.flood_hazard_level ?? "N/A")}</strong>
                                    </div>
                                    <div class="weather-box">
                                        <span>Storm Surge Risk</span>
                                        <strong>${(data.storm_surge_score > 0) ? "Present" : "None"}</strong>
                                    </div>
                                    <div class="weather-box">
                                        <span>Overall Hazard</span>
                                        <strong>${escapeHtml(data.overall_hazard ?? "N/A")}</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="risk-summary-box ${getRiskClass(data.risk_level)}">
                                ${riskSummary}
                            </div>
                        </div>`;
                }
            }

            // ── Announcement modal if HIGH/VERY HIGH ──────────────────────
            if (data.suggest_announcement) {
                showAnnouncementModal(data.suggest_announcement, null);
            }

        } catch (error) {
            console.error("weatherRiskBtn:", error);
            if (resultDiv) resultDiv.innerHTML = '<div class="error-state">Failed to fetch live risk.</div>';
        }
    });
}

// =============================================================
// SIMULATION  →  POST /simulate/  (all 15 barangays)
//             →  POST /simulate/barangay/{id}  (single)
// =============================================================

if (runSimulationBtn) {
    runSimulationBtn.addEventListener("click", async () => {

        const rainfall = Number(document.getElementById("simRainfall")?.value);
        const humidity = Number(document.getElementById("simHumidity")?.value);
        const wind     = Number(document.getElementById("simWind")?.value);
        const temp     = Number(document.getElementById("simTemp")?.value);

        const body = {
            rainfall:    rainfall,
            humidity:    humidity,
            wind_speed:  wind,
            temperature: temp,
        };

        if (simulationResults) {
            simulationResults.innerHTML = '<div class="loading">Running simulation for all barangays...</div>';
        }

        const chartCard = document.getElementById("chartCard");
        if (chartCard) chartCard.classList.remove("hidden");
        const factorBars = document.getElementById("factorBars");
        if (factorBars) {
            factorBars.innerHTML = `
                <div class="factor-bars">
                    ${[
                        { label: "Rainfall",    value: rainfall, max: 500 },
                        { label: "Humidity",    value: humidity, max: 100 },
                        { label: "Wind Speed",  value: wind,     max: 300 },
                        { label: "Temperature", value: temp,     max: 60  },
                    ].map(item => `
                        <div class="factor-row">
                            <div class="factor-label">${item.label}</div>
                            <div class="factor-track">
                                <div class="factor-fill" style="width:${(item.value / item.max) * 100}%"></div>
                            </div>
                            <div class="factor-value">${item.value}</div>
                        </div>
                    `).join("")}
                </div>`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/simulate/`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });
            if (!response.ok) throw new Error("Simulation failed");
            const data = await response.json();

            renderSimulationResults(
                data.barangays,
                data.inputs,
                data.summary,
                data.comparison,
            );

            if (data.suggest_announcement) {
                showAnnouncementModal(data.suggest_announcement, data);
            }

        } catch (error) {
            console.error("runSimulationBtn:", error);
            if (simulationResults) {
                simulationResults.innerHTML = '<div class="error-state">Failed to run simulation.</div>';
            }
        }
    });
}

// =============================================================
// RENDER: ALL-BARANGAY SIMULATION RESULTS
// =============================================================

function renderSimulationResults(barangays, inputs, summary, comparison, runDate = null) {
    if (!simulationResults) return;

    const inputsHtml = inputs ? `
        <div class="weather-grid">
            <div class="weather-box"><span>Rainfall</span><strong>${inputs.rainfall?.toFixed(1) ?? "—"} mm/h</strong></div>
            <div class="weather-box"><span>Humidity</span><strong>${inputs.humidity?.toFixed(1) ?? "—"}%</strong></div>
            <div class="weather-box"><span>Wind Speed</span><strong>${inputs.wind_speed?.toFixed(1) ?? "—"} km/h</strong></div>
            <div class="weather-box"><span>Temperature</span><strong>${inputs.temperature?.toFixed(1) ?? "—"}°C</strong></div>
        </div>` : "";

    const summaryHtml = summary ? `
        <div class="summary-row">
            🔴 Very High: <strong>${summary.very_high}</strong> &nbsp;
            🟠 High: <strong>${summary.high}</strong> &nbsp;
            🟡 Moderate: <strong>${summary.moderate}</strong> &nbsp;
            🟢 Low: <strong>${summary.low}</strong>
        </div>` : "";

    // Build comparison rows or plain rows
    const useComparison = comparison?.barangays?.length > 0;
    const rowsData      = useComparison ? comparison.barangays : barangays;

    const barangayRows = rowsData.map(row => {
        if (useComparison) {
            // Comparison row
            const cur   = row.current;
            const prev  = row.previous;
            const delta = row.delta;

            return `
                <div class="barangay-row comparison-row">
                    <span class="barangay-name">${escapeHtml(row.barangay_name)}</span>
                    <span class="risk-badge ${getRiskClass(cur.risk_level)}">
                        ${getRiskEmoji(cur.risk_level)} ${escapeHtml(cur.risk_level)}
                    </span>
                    <span class="barangay-score">Score: ${cur.final_score?.toFixed(4)}</span>
                    ${prev ? `
                        <span class="prev-risk">
                            Was: <em>${escapeHtml(prev.risk_level)}</em>
                        </span>
                        <span class="delta-direction">
                            ${getDeltaArrow(delta?.risk_direction)}
                        </span>
                        <span class="delta-score" style="color:${delta?.final_score > 0 ? '#e74c3c' : '#27ae60'}">
                            ${delta?.final_score > 0 ? "+" : ""}${delta?.final_score?.toFixed(4)}
                        </span>
                    ` : '<span class="no-prev">No previous data</span>'}
                </div>`;
        } else {
            // Plain row (from history or no previous run)
            return `
                <div class="barangay-row">
                    <span class="barangay-name">${escapeHtml(row.barangay_name)}</span>
                    <span class="risk-badge ${getRiskClass(row.risk_level)}">
                        ${getRiskEmoji(row.risk_level)} ${escapeHtml(row.risk_level)}
                    </span>
                    <span class="barangay-score">Score: ${row.final_score?.toFixed(4)}</span>
                    <span class="barangay-rule">Rule: ${row.rule_score?.toFixed(4)}</span>
                    <span class="barangay-ml">ML: ${row.ml_score?.toFixed(4)}</span>
                </div>`;
        }
    }).join("");

    const prevInputsNote = comparison?.previous_inputs
        ? `<div class="prev-inputs-note">
               Compared with previous run —
               Rainfall: ${comparison.previous_inputs.rainfall?.toFixed(1)} mm/h |
               Wind: ${comparison.previous_inputs.wind_speed?.toFixed(1)} km/h |
               Humidity: ${comparison.previous_inputs.humidity?.toFixed(1)}%
           </div>`
        : (comparison?.has_previous === false
            ? '<div class="prev-inputs-note">First simulation run — no previous data to compare.</div>'
            : "");

    simulationResults.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <div>
                    <h2>All 15 Barangays — Simulation Results</h2>
                    ${runDate ? `<p>Run: ${formatDate(runDate)}</p>` : "<p>Flood Simulation</p>"}
                </div>
            </div>
            ${inputsHtml}
            ${summaryHtml}
            ${prevInputsNote}
            <div class="barangay-list comparison-list">
                ${barangayRows}
            </div>
        </div>`;

    if (window.lucide) lucide.createIcons();
}

// =============================================================
// RENDER: SINGLE-BARANGAY SIMULATION RESULT
// =============================================================

function renderSingleBarangayResult(result) {
    if (!simulationResults) return;

    const riskClass       = getRiskClass(result.risk_level);
    const recommendations = generateRecommendations(result.risk_level);

    simulationResults.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <div>
                    <h2>${escapeHtml(result.barangay_name)}</h2>
                    <p>Flood Simulation Result</p>
                </div>
                <div class="risk-badge ${riskClass}">
                    ${getRiskEmoji(result.risk_level)} ${escapeHtml(result.risk_level)}
                </div>
            </div>
            <div class="weather-grid">
                <div class="weather-box"><span>Final Score</span><strong>${result.final_score?.toFixed(4)}</strong></div>
                <div class="weather-box"><span>Rule Score</span><strong>${result.rule_score?.toFixed(4)}</strong></div>
                <div class="weather-box"><span>ML Score</span><strong>${result.ml_score?.toFixed(4)}</strong></div>
                <div class="weather-box"><span>Risk Level</span><strong>${escapeHtml(result.risk_level)}</strong></div>
            </div>
            <div class="recommendation-list">
                ${recommendations.map(item => `
                    <div class="recommendation-item">${escapeHtml(item)}</div>
                `).join("")}
            </div>
        </div>`;

    if (window.lucide) lucide.createIcons();
}

// =============================================================
// ANNOUNCEMENT MODAL
// Called when suggest_announcement is returned from simulation
// or live prediction. User can Publish or Cancel.
// =============================================================

function showAnnouncementModal(payload, simulationSnapshot) {
    // Remove any existing modal
    document.getElementById("announcementModal")?.remove();

    const modal = document.createElement("div");
    modal.id    = "announcementModal";
    modal.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.55);
        display:flex; align-items:center; justify-content:center; z-index:9999;
    `;

    modal.innerHTML = `
        <div style="
            background:#fff; border-radius:12px; padding:32px;
            max-width:600px; width:95%; box-shadow:0 8px 32px rgba(0,0,0,0.2);
            max-height:90vh; overflow-y:auto;
        ">
            <h3 style="margin:0 0 6px; color:#e74c3c; font-size:18px;">
                ⚠️ High Risk Detected
            </h3>
            <p style="margin:0 0 16px; color:#555; font-size:13px;">
                Review and edit the announcement before publishing to the News dashboard
                and sending a push notification to all residents.
            </p>

            <label style="display:block; font-size:12px; font-weight:700; color:#64748B; margin-bottom:4px;">
                TITLE
            </label>
            <input
                id="modalTitleInput"
                type="text"
                value="${escapeHtml(payload.title)}"
                style="
                    width:100%; border:1px solid #CBD5E1; border-radius:8px;
                    padding:10px 12px; font-size:13px; margin-bottom:14px;
                    box-sizing:border-box; outline:none;
                "
            >

            <label style="display:block; font-size:12px; font-weight:700; color:#64748B; margin-bottom:4px;">
                MESSAGE <span style="font-weight:400; color:#94A3B8;">(editable)</span>
            </label>
            <textarea
                id="modalMessageTextarea"
                rows="12"
                style="
                    width:100%; border:1px solid #CBD5E1; border-radius:8px;
                    padding:10px 12px; font-size:13px; line-height:1.6;
                    margin-bottom:16px; resize:vertical; box-sizing:border-box;
                    outline:none; font-family:inherit;
                "
            >${escapeHtml(payload.message)}</textarea>

            <label style="
                display:flex; align-items:center; gap:8px;
                margin-bottom:16px; font-size:13px;
                cursor:pointer; color:#374151;
            ">
                <input type="checkbox" id="modalPinCheck" style="
                    width:16px; height:16px; cursor:pointer; accent-color:#FF8C00;
                ">
                📌 Pin this announcement to the top of the News dashboard
            </label>

            <div style="display:flex; gap:12px; justify-content:flex-end;">
                <button id="modalCancelBtn" style="
                    padding:10px 24px; border:1px solid #ddd;
                    border-radius:8px; background:#fff; cursor:pointer;
                    font-size:13px;
                ">
                    Cancel
                </button>
                <button id="modalPublishBtn" style="
                    padding:10px 24px; border:none;
                    border-radius:8px; background:#e74c3c;
                    color:#fff; font-weight:600; cursor:pointer;
                    font-size:13px;
                ">
                    Publish Announcement
                </button>
            </div>
        </div>`;

    document.body.appendChild(modal);

    document.getElementById("modalCancelBtn").addEventListener("click", () => {
        modal.remove();
    });

    document.getElementById("modalPublishBtn").addEventListener("click", async () => {
        document.getElementById("modalPublishBtn").textContent = "Publishing...";
        document.getElementById("modalPublishBtn").disabled    = true;

      try {
    const editedTitle   = document.getElementById("modalTitleInput")?.value.trim() || payload.title;
    const editedMessage = document.getElementById("modalMessageTextarea")?.value.trim() || payload.message;
    const pinned        = document.getElementById("modalPinCheck")?.checked ? "Yes" : "No";
    const body = {
        title:    editedTitle,
        message:  editedMessage,
        category: payload.category || "Emergency",
        priority: payload.priority || "High",
        audience: payload.audience || "All Residents",
        pinned:   pinned,
        date:     payload.date     || new Date().toISOString(),
    };
            // CORRECT — matches POST /news/create in news_routes.py
            const response = await fetch(`${API_BASE_URL}/news/create`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Publish failed");
            const result = await response.json();

            modal.remove();

            // Show success toast
            showToast("✅ Announcement published successfully.", "success");

        } catch (error) {
            console.error("publishAnnouncement:", error);
            document.getElementById("modalPublishBtn").textContent = "Publish Announcement";
            document.getElementById("modalPublishBtn").disabled    = false;
            showToast("❌ Failed to publish announcement.", "error");
        }
    });

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });
}

// =============================================================
// TOAST NOTIFICATION
// =============================================================

function showToast(message, type = "success") {
    document.getElementById("resqToast")?.remove();

    const toast = document.createElement("div");
    toast.id    = "resqToast";
    toast.style.cssText = `
        position:fixed; bottom:24px; right:24px;
        background:${type === "success" ? "#27ae60" : "#e74c3c"};
        color:#fff; padding:14px 20px; border-radius:8px;
        font-size:14px; font-weight:500; z-index:10000;
        box-shadow:0 4px 16px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// =============================================================
// RECOMMENDATIONS
// =============================================================

function generateRecommendations(riskLevel) {
    const level = String(riskLevel).toUpperCase();
    if (level === "VERY HIGH") return [
        "Immediate evacuation is recommended.",
        "Deploy emergency responders immediately.",
        "Activate emergency response operations center.",
        "Send emergency SMS alerts to all residents.",
    ];
    if (level === "HIGH") return [
        "Prepare evacuation facilities.",
        "Coordinate with barangay emergency responders.",
        "Monitor residents in identified danger zones.",
    ];
    if (level === "MODERATE") return [
        "Prepare response teams on standby.",
        "Monitor incoming weather conditions closely.",
        "Advise residents in low-lying areas to remain alert.",
    ];
    return [
        "Continue monitoring weather conditions.",
        "Maintain standard preparedness procedures.",
    ];
}

// =============================================================
// EVENT: VIEW HISTORY BUTTON
// =============================================================

if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener("click", async () => {
        const barangayId = barangaySelect?.value;
        if (!barangayId || barangayId === "ALL") {
            alert("Please select a specific barangay to view its history.");
            return;
        }

        const historySection = document.getElementById("historySection");
        const isHidden = historySection?.classList.contains("hidden");

        if (isHidden) {
            historySection?.classList.remove("hidden");
            viewHistoryBtn.innerHTML = `<i data-lucide="eye-off" size="14"></i> Hide History`;
            if (window.lucide) lucide.createIcons();
            await loadHistory(barangayId);
        } else {
            historySection?.classList.add("hidden");
            viewHistoryBtn.innerHTML = `<i data-lucide="history" size="14"></i> View History`;
            if (window.lucide) lucide.createIcons();
        }
    });
}

// =============================================================
// EVENT: REFRESH BUTTON
// =============================================================

document.getElementById("refreshBtn")?.addEventListener("click", () => {
    const barangayId = barangaySelect?.value;
    if (barangayId && barangayId !== "ALL") {
        loadHistory(barangayId);
    }
});

// =============================================================
// INIT
// =============================================================

await loadBarangays();
loadSimulationHistory();

});