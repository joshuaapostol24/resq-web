document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
            AUTH
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
            SUPABASE
        */
        const SUPABASE_URL =
            "https://jpovamcznyzoemcnjrgs.supabase.co";

        const SUPABASE_KEY =
            "sb_publishable_kJmAZtcu7dO2aLdPwWYclg_I7y5kq3G";

        const supabaseClient =
            supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

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

        /*
            ICONS
        */
        if(window.lucide){

            lucide.createIcons();

        }

        /*
            ELEMENTS
        */
        const reportList =
            document.querySelector(
                ".report-items"
            );

        const detailPanel =
            document.querySelector(
                ".report-detail"
            );

        const resultCount =
            document.getElementById(
                "resultCount"
            );

        const summaryTotal =
            document.getElementById(
                "summaryTotal"
            );

        const summaryReceived =
            document.getElementById(
                "summaryReceived"
            );

        const summaryCritical =
            document.getElementById(
                "summaryCritical"
            );

        const typeFilter =
            document.getElementById(
                "typeFilter"
            );

        const searchInput =
            document.getElementById(
                "reportSearch"
            );

        const reportModal =
            document.getElementById(
                "reportModal"
            );

        const createForm =
            document.getElementById(
                "createReportForm"
            );

        let reports = [];
        
        let reportMap;

        let reportMarker;

        let selectedReport =
            null;

        /*
            SUMMARY
        */
        function renderSummary(){

            summaryTotal.textContent =
                reports.length;

            summaryReceived.textContent =
                reports.filter(
                    report =>
                        report.status ===
                        "received"
                ).length;

            summaryCritical.textContent =
                reports.filter(
                    report =>
                        report.priority ===
                        "critical"
                ).length;

        }

        /*
            FILTER
        */
        function getFilteredReports(){

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const type =
                typeFilter.value;

            return reports.filter(report => {

                const searchable = `
                    ${report.title}
                    ${report.location}
                    ${report.reporter}
                    ${report.type}
                `
                .toLowerCase();

                const matchesSearch =
                    searchable.includes(search);

                const matchesType =
                    type === "all"
                    ||
                    report.type === type;

                return (
                    matchesSearch
                    &&
                    matchesType
                );

            });

        }

        /*
            STATUS BADGE
        */
        function getStatusBadge(status){

            return `
                <span class="status-badge status-${status}">
                    ${status}
                </span>
            `;

        }

        /*
            LIST
        */
        function renderList(){

            const filtered =
                getFilteredReports();

            resultCount.textContent =
                `${filtered.length} found`;

            if(!filtered.length){

                reportList.innerHTML = `
                    <div class="empty-state">

                        <h2>
                            No reports found
                        </h2>

                    </div>
                `;

                return;

            }

            reportList.innerHTML = "";

            filtered.forEach(report => {

                const item =
                    document.createElement(
                        "button"
                    );

                item.className =
                    "report-item";

                if(
                    selectedReport
                    &&
                    selectedReport.id === report.id
                ){

                    item.classList.add(
                        "active"
                    );

                }

                item.innerHTML = `

                    <div class="item-header">

                        <span class="report-id">
                            #${report.id}
                        </span>

                        ${getStatusBadge(report.status)}

                    </div>

                    <strong>
                        ${report.title}
                    </strong>

                    <div class="item-meta">

                        <p>
                            ${report.location}
                        </p>

                        <span class="type-badge">
                            ${report.type}
                        </span>

                    </div>

                `;

                item.addEventListener(
                    "click",
                    () => {

                        selectedReport =
                            report;

                        renderList();

                        renderDetail();

                    }
                );

                reportList.appendChild(
                    item
                );

            });

        }

        /*
            DETAIL
        */
        function renderDetail(){

            if(!selectedReport){

                detailPanel.innerHTML = `

                    <div class="empty-state">

                        <h2>
                            Select a report
                        </h2>

                        <p>
                            Choose a report from the list.
                        </p>

                    </div>

                `;

                return;

            }

            detailPanel.innerHTML = `

                <div class="detail-header">

                    <div>

                        <h2>
                            ${selectedReport.title}
                        </h2>

                        <p>
                            ${selectedReport.location}
                        </p>

                    </div>

                    ${getStatusBadge(
                        selectedReport.status
                    )}
                                
                <div class="detail-actions">

                    <button
                        class="action-btn btn-approve"
                        onclick="approveReport('${selectedReport.id}')"
                    >

                        Approve

                    </button>

                    <button
                        class="action-btn btn-reject"
                        onclick="rejectReport('${selectedReport.id}')"
                    >

                        Reject

                    </button>

                </div>

                                    
                </div>

                <div class="detail-body">

                    <div>

                        <section class="panel">

                            <h3>
                                Description
                            </h3>

                            <p class="description">
                                ${selectedReport.description}
                            </p>

                            ${selectedReport.image
                            ? `
                                 <img
                                    src="${selectedReport.image}"
                                    class="report-image"
                                    alt="Report Image"
                                >
                            `
                            : ""}

                        </section>

                        <section class="panel">

                            <h3>
                                Reporter Information
                            </h3>

                            <div class="meta-grid">

                                <div class="meta-item">

                                    <span>
                                        Reporter
                                    </span>

                                    <strong>
                                        ${selectedReport.reporter}
                                    </strong>

                                </div>

                                <div class="meta-item">

                                    <span>
                                        Mobile
                                    </span>

                                    <strong>
                                        ${selectedReport.mobile}
                                    </strong>

                                </div>

                                <div class="meta-item">

                                    <span>
                                        Assigned Unit
                                    </span>

                                    <strong>
                                        ${selectedReport.assignedTo}
                                    </strong>

                                </div>

                                <div class="meta-item">

                                    <span>
                                        ETA
                                    </span>

                                    <strong>
                                        ${selectedReport.dispatch.etaMinutes} mins
                                    </strong>

                                </div>

                            </div>

                        </section>

                    </div>

                    <aside>

                        <section class="panel">

                            <h3>
                                Incident Information
                            </h3>

                            <div class="meta-grid">

                                <div class="meta-item">

                                    <span>
                                        Type
                                    </span>

                                    <strong>
                                        ${selectedReport.type}
                                    </strong>

                                </div>

                                <div class="meta-item">

                                    <span>
                                        Priority
                                    </span>

                                    <strong>
                                        ${selectedReport.priority}
                                    </strong>

                                </div>

                            </div>

                        </section>

                    </aside>

                </div>

            `;

        }

        /*
            LOAD REPORTS
        */
        async function loadReportsFromSupabase(){

            const {
                data,
                error
            } = await supabaseClient

                .from("reports")

                .select("*")

                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );

            if(error){

                console.log(error);

                return;

            }

            reports = data.map(report => ({

                id:
                    report.id || "N/A",

                title:
                    report.title || "Untitled Report",

                type:
                    report.type || "OTHER",

                priority:
                    report.priority || "medium",

                status:
                    report.status || "received",

                reporter:
                    report.reporter || "Anonymous",

                mobile:
                    report.mobile || "Not provided",

                location:
                    report.location || "Unknown location",

                description:
                    report.description || "No description provided.",

            
                image:
                   report.image_url || "",


                assignedTo:
                    report.assigned_to || "Unassigned",

                submittedAt:
                    report.created_at || new Date(),

                coordinates:{
                    lat:
                        report.lat || 13.2233,

                    lng:
                        report.lng || 120.5960
                },

                dispatch:{
                    responder:
                        report.responder || "No responder",

                    etaMinutes:
                        report.eta_minutes || 0
                }

            }));

            renderSummary();

            renderList();

            renderDetail();

        }

        /*
            MODAL
        */
        document
            .querySelectorAll(
                '[data-action="open-create"]'
            )

            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        reportModal.classList.remove(
                            "hidden"
                        );
                        
                        initializeReportMap();

                    }
                );

            });

        document
            .querySelectorAll(
                '[data-action="close-create"]'
            )

            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        reportModal.classList.add(
                            "hidden"
                        );

                    }
                );

            });

        reportModal.addEventListener(
            "click",
            event => {

                if(event.target === reportModal){

                    reportModal.classList.add(
                        "hidden"
                    );

                }

            }
        );

        /*
            CREATE REPORT
        */
        createForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const formData =
                    new FormData(createForm);

                const report = {

                    title:
                        formData.get("type"),

                    type:
                        formData.get("type"),

                    priority:
                        formData.get("priority"),

                    status:
                        "pending",

                    reporter:
                        formData.get("reporter"),

                    mobile:
                        formData.get("mobile"),

                    location:
                        formData.get("location"),

                    description:
                        formData.get("description"),

                    assigned_to:
                        formData.get("assignedTo"),

                    responder:
                        formData.get("responder"),

                    eta_minutes:Number(
                        formData.get("etaMinutes")
                    ),

                    lat:Number(
                        formData.get("lat")
                    ),

                    lng:Number(
                        formData.get("lng")
                    )

                };

                const {
                    data,
                    error
                } = await supabaseClient

                    .from("reports")

                    .insert([report])

                    .select();

                if(error){

                    console.log(error);

                    alert(
                        "Failed to create report"
                    );

                    return;

                }

                alert(
                    "Report created successfully"
                );

                createForm.reset();

                reportModal.classList.add(
                    "hidden"
                );

                loadReportsFromSupabase();

            }
        );

        /*
            SEARCH
        */
        searchInput.addEventListener(
            "input",
            renderList
        );

        /*
            FILTER
        */
        typeFilter.addEventListener(
            "change",
            renderList
        );

        /*
            REFRESH
        */
        document
            .querySelectorAll(
                '[data-action="refresh"]'
            )

            .forEach(button => {

                button.addEventListener(
                    "click",
                    loadReportsFromSupabase
                );

            });

        /*
            WORKSPACE
        */
        document
            .querySelector(
                '[data-action="workspace"]'
            )

            .addEventListener(
                "click",
                () => {

                    window.location.href =
                        "../WORKSPACE/workspace.html";

                }
            );

            window.approveReport = async function(id){

                try{

                    const {
                        error
                    } = await supabaseClient

                        .from("reports")

                        .update({

                            status:"approved"

                        })

                        .eq("id", id);

                    if(error){

                        console.log(error);

                        return;

                    }

                    loadReportsFromSupabase();

                }catch(error){

                    console.log(error);

                }

            };

            window.rejectReport = async function(id){

                try{

                    const {
                        error
                    } = await supabaseClient

                        .from("reports")

                        .update({

                            status:"rejected"

                        })

                        .eq("id", id);

                    if(error){

                        console.log(error);

                        return;

                    }

function initializeReportMap(){

    if(reportMap){

        reportMap.remove();

    }

    reportMap = L.map("reportMap")

        .setView(

            [13.2233, 120.5960],

            14

        );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:
                "© OpenStreetMap"

        }

    ).addTo(reportMap);

    reportMarker = L.marker(

        [13.2233, 120.5960],

        {

            draggable:true

        }

    ).addTo(reportMap);

    const latInput =

        document.querySelector(
            'input[name="lat"]'
        );

    const lngInput =

        document.querySelector(
            'input[name="lng"]'
        );

    latInput.value = 13.2233;

    lngInput.value = 120.5960;

    reportMap.on(

        "click",

        function(event){

            const {
                lat,
                lng
            } = event.latlng;

            reportMarker.setLatLng([
                lat,
                lng
            ]);

            latInput.value =
                lat.toFixed(6);

            lngInput.value =
                lng.toFixed(6);

        }

    );

    reportMarker.on(

        "dragend",

        function(event){

            const position =

                event.target.getLatLng();

            latInput.value =
                position.lat.toFixed(6);

            lngInput.value =
                position.lng.toFixed(6);

        }

    );

    setTimeout(() => {

        reportMap.invalidateSize();

    }, 200);

}


        loadReportsFromSupabase();

    }catch(error){

        console.log(error);

    }

};


        /*
            INIT
        */
        loadReportsFromSupabase();

    }
);