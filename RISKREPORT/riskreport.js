// RISKREPORT/riskreport.js

document.addEventListener("DOMContentLoaded", async () => {

    // =========================
    // AUTH
    // =========================

    const API_BASE_URL =
        "https://resq-app-xsb98.ondigitalocean.app/api";

    const loggedIn =
        localStorage.getItem(
            "resq_logged_in"
        );

    if(loggedIn !== "true"){

        window.location.href =
            "/LOGIN/login.html";

        return;

    }

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

    if(window.lucide){
        lucide.createIcons();
    }

    // =========================
    // ELEMENTS
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

    const runSimulationBtn =
        document.getElementById(
            "runSimulationBtn"
        );

    const simulationResults =
        document.getElementById(
            "simulationResults"
        );

    const weatherRiskBtn =
        document.getElementById(
            "weatherRiskBtn"
        );

    const weatherRiskResult =
        document.getElementById(
            "weatherRiskResult"
        );

    // =========================
    // CHART
    // =========================

    const ctx =
        document.getElementById(
            "riskChart"
        );

    const riskChart =
        new Chart(ctx, {

            type:"bar",

            data:{

                labels:[],

                datasets:[{

                    label:"Risk Level",

                    data:[],

                    backgroundColor:[]

                }]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{
                        display:false
                    }

                },

                scales:{

                    y:{

                        beginAtZero:true,

                        max:3,

                        ticks:{

                            callback:function(value){

                                if(value === 1)
                                    return "LOW";

                                if(value === 2)
                                    return "MODERATE";

                                if(value === 3)
                                    return "HIGH";

                                return value;

                            }

                        }

                    }

                }

            }

        });

    // =========================
    // HELPERS
    // =========================

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

        if(level === "LOW") return "low";
        if(level === "MODERATE") return "moderate";
        if(level === "HIGH") return "high";

        return "critical";
    }

    function riskToValue(level){

        if(level === "HIGH")
            return 3;

        if(level === "MODERATE")
            return 2;

        return 1;

    }

    function riskColor(level){

        if(level === "HIGH")
            return "#EF4444";

        if(level === "MODERATE")
            return "#F59E0B";

        return "#22C55E";

    }

    function updateRiskChart(result){

        riskChart.data.labels.push(
            result.barangay_name
        );

        riskChart.data.datasets[0].data.push(

            riskToValue(
                result.risk_level
            )

        );

        riskChart.data.datasets[0]
        .backgroundColor.push(

            riskColor(
                result.risk_level
            )

        );

        riskChart.update();

    }

    // =========================
    // LOAD BARANGAYS
    // =========================

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

    // =========================
    // HISTORY
    // =========================

    async function loadHistory() {

        const barangay = barangaySelect.value;

        try {

            historySection.classList.remove("hidden");

            const endpoint =
                `${API_BASE_URL}/history/${barangay}`;

            const response =
                await fetch(endpoint, {
                    headers: authHeaders()
                });

            const history =
                await response.json();

            if (!history.length) {

                historyTableBody.innerHTML = `
                    <tr>
                        <td colspan="4">
                            No assessment history available
                        </td>
                    </tr>
                `;

                return;
            }

            historyTableBody.innerHTML = "";

            history.forEach(item => {

                historyTableBody.innerHTML += `
                    <tr>

                        <td>
                            ${
                                new Date(item.timestamp)
                                .toLocaleString()
                            }
                        </td>

                        <td>
                            ${item.rainfall}
                        </td>

                        <td>
                            ${item.humidity}
                        </td>

                        <td>
                            ${item.final_risk}
                        </td>

                    </tr>
                `;
            });

        }
        catch(error){

            console.error(error);

            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Failed to load history
                    </td>
                </tr>
            `;

        }

    }

    // =========================
    // WEATHER RISK
    // =========================

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

                    weatherRiskResult.innerHTML = `

                        <div class="result-card">

                            <div class="result-header">

                                <div>

                                    <h2>
                                        ${
                                            barangaySelect.options[
                                                barangaySelect.selectedIndex
                                            ].text
                                        }
                                    </h2>

                                    <p>
                                        ML-Based Disaster Risk Assessment
                                    </p>

                                </div>

                                <div class="risk-badge ${(data.risk_level || "low").toLowerCase()}">

                                    ${data.risk_level || "LOW"}

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
    // SIMULATION
    // =========================

    runSimulationBtn.addEventListener(
        "click",
        async () => {

            const barangay =
                document.getElementById(
                    "simBarangay"
                ).value;

            const disasterType =
                document.getElementById(
                    "simDisasterType"
                ).value;

            const rainfall =
                Number(
                    document.getElementById(
                        "simRainfall"
                    ).value
                );

            const humidity =
                Number(
                    document.getElementById(
                        "simHumidity"
                    ).value
                );

            const wind =
                Number(
                    document.getElementById(
                        "simWind"
                    ).value
                );

            const temp =
                Number(
                    document.getElementById(
                        "simTemp"
                    ).value
                );

            if(!barangay){

                alert(
                    "Barangay is required."
                );

                return;

            }

            try{

                const response =
                    await fetch(

                        `${API_BASE_URL}/simulate/barangay/${barangay}`,

                        {

                            method:"POST",

                            headers:{
                                "Content-Type":"application/json"
                            },

                            body:JSON.stringify({

                                rainfall: rainfall,
                                humidity: humidity,
                                wind_speed: wind,
                                temperature: temp

                            })

                        }

                    );

                const data =
                    await response.json();

                console.log(data);

                const result =
                    data.barangay;

                const riskClass =
                    getRiskClass(
                        result.risk_level
                    );

                const recommendations =
                    generateRecommendations(
                        result.risk_level
                    );

                simulationResults.innerHTML = `

                    <div class="result-card">

                        <div class="result-header">

                            <div>

                                <h2>

                                    ${result.barangay_name}

                                </h2>

                                <p>

                                    ${escapeHtml(disasterType)}
                                    Simulation Result

                                </p>

                            </div>

                            <div class="risk-badge ${riskClass}">

                                ${result.risk_level}

                            </div>

                        </div>

                        <div class="weather-grid">

                            <div class="weather-box">

                                <span>
                                    Final Score
                                </span>

                                <strong>

                                    ${result.final_score.toFixed(2)}

                                </strong>

                            </div>

                            <div class="weather-box">

                                <span>
                                    Rule Score
                                </span>

                                <strong>

                                    ${result.rule_score.toFixed(2)}

                                </strong>

                            </div>

                            <div class="weather-box">

                                <span>
                                    ML Score
                                </span>

                                <strong>

                                    ${result.ml_score.toFixed(2)}

                                </strong>

                            </div>

                            <div class="weather-box">

                                <span>
                                    Risk Level
                                </span>

                                <strong>

                                    ${result.risk_level}

                                </strong>

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

                updateRiskChart(result);

            }

            catch(error){

                console.error(error);

                alert(
                    "Simulation failed."
                );

            }

        }
    );

    // =========================
    // RECOMMENDATIONS
    // =========================

    function generateRecommendations(riskLevel) {

        if(riskLevel === "CRITICAL"){

            return [
                "Immediate evacuation is recommended.",
                "Deploy emergency responders immediately.",
                "Activate emergency response operations center.",
                "Send emergency SMS alerts to residents."
            ];
        }

        if(riskLevel === "HIGH"){

            return [
                "Prepare evacuation facilities.",
                "Coordinate with barangay responders.",
                "Monitor residents in danger zones."
            ];
        }

        if(riskLevel === "MODERATE"){

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

            loadHistory();

        });

    // =========================
    // INIT
    // =========================

    loadBarangays();

    viewHistoryBtn.addEventListener(
        "click",
        loadHistory
    );

});