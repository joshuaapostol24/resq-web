// RISKREPORT/riskreport.js

document.addEventListener("DOMContentLoaded", async () => {

    // =========================
    // AUTH
    // =========================

const API_BASE_URL =
    "https://resq-app-xsb98.ondigitalocean.app/api";
    /*
    NEW AUTH SYSTEM
*/
const loggedIn =
    localStorage.getItem(
        "resq_logged_in"
    );

if(loggedIn !== "true"){

    window.location.href =
        "/LOGIN/login.html";

    return;

}

/*
    LOGOUT
*/
const logoutButton =
    document.querySelector(
        '[data-action="logout"]'
    );

if(logoutButton){

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "resq_logged_in"
            );

            localStorage.removeItem(
                "resq_user"
            );

            window.location.href =
                "/LOGIN/login.html";

        }
    );

}

    if (window.lucide) {
        lucide.createIcons();
    }

    // =========================

    const barangaySelect =
    document.getElementById(
        "barangaySelect"
    );

    const historySection =
    document.getElementById(
        "historySection"
    );

    const historyTableBody =
    document.getElementById(
        "historyTableBody"
    );

    const viewHistoryBtn =
    document.getElementById(
        "viewHistoryBtn"
    );

    async function loadBarangays(){

        try{

            const response =
                await fetch(
                    `${API_BASE_URL}/barangays`
                );

            const data =
                await response.json();

            barangaySelect.innerHTML =
                `<option value="">
                    Select Barangay
                </option>`;

            data.forEach((barangay)=>{

                barangaySelect.innerHTML += `

                    <option value="${barangay.barangay_id}">

                        ${barangay.name}

                    </option>

                `;

            });

    }
    catch(error){

        console.error(error);

    }

}

    async function loadHistory(){

        try{

            const barangay =
                barangaySelect.value;

            if(!barangay){

                alert(
                    "Select a barangay first"
                );

                return;

            }

            historySection.classList.remove(
                "hidden"
            );

            const response =
                await fetch(

                    `${API_BASE_URL}/history/${barangay}`

                );

            const data =
                await response.json();

            historyTableBody.innerHTML = "";

            if(data.length === 0){

                historyTableBody.innerHTML = `

                    <tr>

                        <td colspan="4">

                            No history data

                        </td>

                    </tr>

                `;

                return;

            }

            data.forEach(item => {

                historyTableBody.innerHTML += `

                    <tr>

                        <td>
                            ${item.timestamp || ""}
                        </td>

                        <td>
                            ${item.rainfall || ""}
                        </td>

                        <td>
                            ${item.humidity || ""}
                        </td>

                        <td>
                            ${item.risk_level || ""}
                        </td>

                    </tr>

                `;

            });

        }catch(error){

            console.log(error);

        }

    }



    const generateRiskBtn = document.getElementById("generateRiskBtn");

    const runSimulationBtn = document.getElementById("runSimulationBtn");

    const riskResultContainer = document.getElementById("riskResultContainer");
    const simulationResults = document.getElementById("simulationResults");

    const historyContainer = document.getElementById("historyContainer");

    const totalAssessments = document.getElementById("totalAssessments");
    const highRiskCount = document.getElementById("highRiskCount");
    const moderateRiskCount = document.getElementById("moderateRiskCount");
    const safeCount = document.getElementById("safeCount");



    function escapeHtml(value = "") {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function authHeaders() {

        const token = localStorage.getItem("token");

        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    function getRiskClass(level = "") {

        level = String(level).toUpperCase();

        if (level === "LOW") return "low";
        if (level === "MODERATE") return "moderate";
        if (level === "HIGH") return "high";

        return "critical";
    }

    function showLoading(container, message = "Loading...") {

        container.innerHTML = `
            <div class="loading">
                ${escapeHtml(message)}
            </div>
        `;
    }


    // =========================
    // HISTORY
    // =========================

    async function loadHistory() {

        const barangay = barangaySelect.value;

        try {

            showLoading(historyContainer, "Loading assessment history...");

            const endpoint = barangay
                ? `/api/risk-report/history/${encodeURIComponent(barangay)}`
                : `/api/risk-report/history`;

            const response = await fetch(endpoint, {
                headers: authHeaders()
            });

            const history = await response.json();

            if (!history.length) {

                historyContainer.innerHTML = `
                    <div class="empty-state">
                        No assessment history available
                    </div>
                `;

                return;
            }

            historyContainer.innerHTML = history.map(item => `

                <div class="history-item">

                    <div>

                        <h4>
                            ${escapeHtml(item.barangay)}
                        </h4>

                        <p>
                            ${new Date(item.calculatedAt).toLocaleString()}
                        </p>

                    </div>

                    <div class="risk-badge ${getRiskClass(item.riskLevel)}">
                        ${escapeHtml(item.riskLevel)}
                    </div>

                </div>

            `).join("");

        } catch (error) {

            console.error(error);

            historyContainer.innerHTML = `
                <div class="empty-state">
                    Failed to load history
                </div>
            `;
        }

    }


    // =========================
    // SAVE REPORT
    // =========================

    async function saveRiskReport(data) {

        try {

            await fetch("/api/risk-report", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(data)
            });

        } catch (error) {

            console.error(error);

        }

    }

    // =========================
    // RENDER RESULT
    // =========================

    function renderRiskResult(data) {

        const riskClass = getRiskClass(data.risk_level);

        riskResultContainer.innerHTML = `

            <div class="result-card">

                <div class="result-header">

                    <div>

                        <h2>
                            ${escapeHtml(data.barangay)}
                        </h2>

                        <p>
                            ML-Based Disaster Risk Assessment
                        </p>

                    </div>

                    <div class="risk-badge ${riskClass}">
                        ${escapeHtml(data.risk_level)}
                    </div>

                </div>

                <div class="weather-grid">

                    <div class="weather-box">
                        <span>Rainfall</span>
                        <strong>${data.rainfall ?? 0} mm</strong>
                    </div>

                    <div class="weather-box">
                        <span>Humidity</span>
                        <strong>${data.humidity ?? 0}%</strong>
                    </div>

                    <div class="weather-box">
                        <span>Wind Speed</span>
                        <strong>${data.wind_speed ?? 0} km/h</strong>
                    </div>

                    <div class="weather-box">
                        <span>Risk Score</span>
                        <strong>${data.risk_score ?? 0}</strong>
                    </div>

                </div>

                <div class="recommendation-list">

                    ${(data.recommendations || []).map(item => `

                        <div class="recommendation-item">
                            ${escapeHtml(item)}
                        </div>

                    `).join("")}

                </div>

            </div>

        `;

        if (window.lucide) {
            lucide.createIcons();
        }

    }

    // =========================
    // SIMULATION
    // =========================

    runSimulationBtn.addEventListener("click", () => {

        const barangay = document.getElementById("simBarangay").value;

        const disasterType =
            document.getElementById("simDisasterType").value;

        const rainfall =
            Number(document.getElementById("simRainfall").value);

        const humidity =
            Number(document.getElementById("simHumidity").value);

        const wind =
            Number(document.getElementById("simWind").value);

        const temp =
            Number(document.getElementById("simTemp").value);

        if (!barangay) {

            alert("Barangay is required.");

            return;
        }

        let score = 0;

        score += rainfall * 2;
        score += humidity * 0.5;
        score += wind * 1.2;

        let riskLevel = "LOW";
        let severity = "Minor";

        if (score >= 160) {

            riskLevel = "CRITICAL";
            severity = "Extreme";

        } else if (score >= 100) {

            riskLevel = "HIGH";
            severity = "Severe";

        } else if (score >= 60) {

            riskLevel = "MODERATE";
            severity = "Moderate";
        }

        const riskClass = getRiskClass(riskLevel);

        const recommendations =
            generateRecommendations(riskLevel);

        simulationResults.innerHTML = `

            <div class="result-card">

                <div class="result-header">

                    <div>

                        <h2>
                            ${escapeHtml(barangay)}
                        </h2>

                        <p>
                            ${escapeHtml(disasterType)} Simulation Result
                        </p>

                    </div>

                    <div class="risk-badge ${riskClass}">
                        ${riskLevel}
                    </div>

                </div>

                <div class="weather-grid">

                    <div class="weather-box">
                        <span>Estimated Severity</span>
                        <strong>${severity}</strong>
                    </div>

                    <div class="weather-box">
                        <span>Flood Probability</span>
                        <strong>
                            ${Math.min(
                                100,
                                Math.floor(score / 2)
                            )}%
                        </strong>
                    </div>

                    <div class="weather-box">
                        <span>Evacuation Need</span>
                        <strong>
                            ${riskLevel === "HIGH" || riskLevel === "CRITICAL"
                                ? "YES"
                                : "MONITOR"}
                        </strong>
                    </div>

                    <div class="weather-box">
                        <span>Temperature</span>
                        <strong>${temp}°C</strong>
                    </div>

                </div>

                <div class="recommendation-list">

                    ${recommendations.map(item => `

                        <div class="recommendation-item">
                            ${escapeHtml(item)}
                        </div>

                    `).join("")}

                </div>

            </div>

        `;

    });

    // =========================
    // RECOMMENDATIONS
    // =========================

    function generateRecommendations(riskLevel) {

        if (riskLevel === "CRITICAL") {

            return [
                "Immediate evacuation is recommended.",
                "Deploy emergency responders immediately.",
                "Activate emergency response operations center.",
                "Send emergency SMS alerts to residents."
            ];
        }

        if (riskLevel === "HIGH") {

            return [
                "Prepare evacuation facilities.",
                "Coordinate with barangay responders.",
                "Monitor residents in danger zones."
            ];
        }

        if (riskLevel === "MODERATE") {

            return [
                "Prepare response teams.",
                "Monitor incoming weather conditions.",
                "Advise residents to remain alert."
            ];
        }

        return [
            "Continue monitoring weather conditions.",
            "Maintain preparedness procedures."
        ];
    }

    // =========================
// REFRESH
// =========================

document.getElementById("refreshBtn")
    .addEventListener("click", () => {

        loadSummary();

        loadHistory();

    });

/*
    getRisk()
*/

// =========================
// WEATHER RISK
// =========================

const weatherRiskBtn =
    document.getElementById(
        "weatherRiskBtn"
    );

if(weatherRiskBtn){

    weatherRiskBtn.addEventListener(
        "click",
        async () => {

            try{

                const city =
                    barangaySelect.value;

                if(!city){

                    alert(
                        "Please select a barangay"
                    );

                    return;

                }

                

               const response =
                await fetch(

                    `${API_BASE_URL}/predict-risk`,

                {

                        method:"POST",

                        headers:{
                            "Content-Type":"application/json"
                        },

                        body:JSON.stringify({

                            barangay_id:
                                Number(city),

                            hazard_type:
                                "Flood"

                        })

                }

            );

                const data =
                    await response.json();

                console.log(data);


                document.getElementById(
                    "weatherRiskResult"
                ).innerHTML = `

                    <div class="result-card">

                        <div class="result-header">

                            <div>

                                <h2>
                                    ${data.city}
                                </h2>

                                <p>
                                    ${data.weather}
                                </p>

                            </div>

                            <div class="risk-badge ${data.risk_level.toLowerCase()}">

                                ${data.risk_level}

                            </div>

                        </div>

                        <div class="weather-grid">

                            <div class="weather-box">

                                <span>
                                    Temperature
                                </span>

                                <strong>
                                    ${data.temperature}°C
                                </strong>

                            </div>

                            <div class="weather-box">

                                <span>
                                    Rainfall
                                </span>

                                <strong>
                                    ${data.rainfall}
                                </strong>

                            </div>

                            <div class="weather-box">

                                <span>
                                    Wind Speed
                                </span>

                                <strong>
                                    ${data.wind_speed}
                                </strong>

                            </div>

                            <div class="weather-box">

                                <span>
                                    Humidity
                                </span>

                                <strong>
                                    ${data.humidity}%
                                </strong>

                            </div>

                        </div>

                    </div>

                `;

            }
            catch(error){

                console.error(error);

                alert(error);

            }

        }
    );

}

// =========================
// INIT
// =========================
loadBarangays();

viewHistoryBtn.addEventListener(
    "click",
    loadHistory
);

});

