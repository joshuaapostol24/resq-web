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

        const typeFilter =
            document.getElementById(
                "typeFilter"
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

        function firstTextValue(source, fields){

            for(const field of fields){

                const value =
                    source?.[field];

                const normalizedValue =
                    String(value || "").trim();

                const isPlaceholder =
                    [
                        "private user",
                        "not provided",
                        "n/a"
                    ].includes(
                        normalizedValue.toLowerCase()
                    );

                if(
                    value !== undefined
                    &&
                    value !== null
                    &&
                    normalizedValue !== ""
                    &&
                    !isPlaceholder
                ){

                    return normalizedValue;

                }

            }

            return "";

        }

        function getReporterInfo(report, userMap){

            const userId =
                firstTextValue(
                    report,
                    [
                        "user_id",
                        "resident_id",
                        "reporter_id",
                        "userId",
                        "uid"
                    ]
                );

            const user =
                userMap.get(userId)
                ||
                report.user
                ||
                report.users
                ||
                report.profile
                ||
                report.profiles
                ||
                {};

            const reporter =
                firstTextValue(
                    report,
                    [
                        "reporter",
                        "reporter_name",
                        "full_name",
                        "name"
                    ]
                )
                ||
                firstTextValue(
                    user,
                    [
                        "name",
                        "full_name",
                        "fullName",
                        "username"
                    ]
                )
                ||
                "Private User";

            const mobile =
                firstTextValue(
                    report,
                    [
                        "mobile",
                        "mobile_number",
                        "phone",
                        "contact",
                        "contact_number"
                    ]
                )
                ||
                firstTextValue(
                    user,
                    [
                        "mobile_number",
                        "mobile",
                        "phone",
                        "contact",
                        "contact_number"
                    ]
                )
                ||
                "Not provided";

            return {
                reporter,
                mobile
            };

        }

        /*
            SUMMARY
        */
        function renderSummary(){

            summaryTotal.textContent =
                reports.length;

        }

        /*
            FILTER
        */
        function getFilteredReports(){

            const type =
                typeFilter.value;

            return reports.filter(report => {

                const matchesType =
                    type === "all"
                    ||
                    report.type === type;

                return matchesType;

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

        <div class="detail-left">

            <h2>
                ${selectedReport.title}
            </h2>

            <p>
                ${selectedReport.location}
            </p>

            ${getStatusBadge(
                selectedReport.status
            )}

        </div>

        <div class="detail-right">

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

                <button
                    class="action-btn btn-delete"
                    onclick="deleteReport('${selectedReport.id}')"
                >

                    Delete

                </button>

            </div>

        </div>

    </div>

    <div class="detail-content">

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

                <div class="meta-item">

                    <span>
                        Latitude
                    </span>

                    <strong>
                        ${selectedReport.coordinates.lat}
                    </strong>

                </div>

                <div class="meta-item">

                    <span>
                        Longitude
                    </span>

                    <strong>
                        ${selectedReport.coordinates.lng}
                    </strong>

                </div>

            </div>

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

`;

        }

        /*
            LOAD REPORTS
        */
        async function loadReportsFromSupabase(){

            const reportsResult =
                await supabaseClient

                    .from("reports")

                    .select("*")

                    .order(
                        "created_at",
                        {
                            ascending:false
                        }
                    );

            if(reportsResult.error){

                console.log(
                    reportsResult.error
                );

                return;

            }

            const reportRows =
                reportsResult.data || [];

            const userIds =
                [
                    ...new Set(
                        reportRows
                            .map(report =>
                                firstTextValue(
                                    report,
                                    [
                                        "user_id",
                                        "resident_id",
                                        "reporter_id",
                                        "userId",
                                        "uid"
                                    ]
                                )
                            )
                            .filter(Boolean)
                    )
                ];

            let usersResult = {
                data:[],
                error:null
            };

            if(userIds.length){

                usersResult =
                    await supabaseClient

                        .from("users")

                        .select("*")

                        .in(
                            "id",
                            userIds
                        );

            }

            if(usersResult.error){

                console.log(
                    usersResult.error
                );

            }

            const userMap =
                new Map();

            (usersResult.data || []).forEach(user => {

                if(user.id){

                    userMap.set(
                        String(user.id),
                        user
                    );

                }

            });

            reports = reportRows.map(report => {

                const reporterInfo =
                    getReporterInfo(
                        report,
                        userMap
                    );

                return {

                id:
                    report.id || "N/A",

                title:
                    report.title || report.type || "Untitled Report",

                type:
                    report.type || "OTHER",

                priority:
                    report.priority || "medium",

                status:
                    report.status || "received",

                reporter:

                    reporterInfo.reporter,

                mobile:

                    reporterInfo.mobile,

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
                        report.lat,

                    lng:
                        report.lng
                },

                dispatch:{
                    responder:
                        report.responder || "No responder",

                    etaMinutes:
                        report.eta_minutes || 0
                }

                };

            });

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

                        setTimeout(() => {

                            initializeReportMap();
                        }, 200);
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

                    user_id: null,

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
            FILTER
        */
        typeFilter.addEventListener(
            "change",
            renderList
        );


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



        loadReportsFromSupabase();

    }catch(error){

        console.log(error);

    }

};

window.deleteReport = async function(id){

    const confirmed = confirm(
        "Delete this report permanently?"
    );

    if(!confirmed){
        return;
    }

    try{

        const {
            error
        } = await supabaseClient

            .from("reports")

            .delete()

            .eq("id", id);

        if(error){

            console.log(error);

            alert("Failed to delete report");

            return;

        }

        selectedReport = null;

        loadReportsFromSupabase();

    }catch(error){

        console.log(error);

    }

};


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

                }, 300);

            }

            /*

                INIT

            */

            loadReportsFromSupabase();


        

    });

