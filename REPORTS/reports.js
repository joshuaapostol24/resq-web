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
            SAMPLE REPORTS
        */
        let reports = [

            {
                id:"RPT-001",

                title:"Residential Fire",

                type:"FIRE",

                priority:"critical",

                status:"received",

                reporter:"Juan Dela Cruz",

                mobile:"09123456789",

                location:"Poblacion 1, Mamburao",

                description:
                    "Fire reported near the public market area.",

                assignedTo:"MDRRMO",

                submittedAt:new Date(),

                coordinates:{
                    lat:13.2233,
                    lng:120.5960
                },

                dispatch:{
                    responder:"Fire Unit Alpha",
                    etaMinutes:10
                }

            },

            {
                id:"RPT-002",

                title:"Flooded Road",

                type:"FLOOD",

                priority:"high",

                status:"verified",

                reporter:"Maria Santos",

                mobile:"09987654321",

                location:"Balansay, Mamburao",

                description:
                    "Heavy rain caused road flooding.",

                assignedTo:"Rescue Team Bravo",

                submittedAt:new Date(),

                coordinates:{
                    lat:13.2100,
                    lng:120.6100
                },

                dispatch:{
                    responder:"Water Rescue Team",
                    etaMinutes:15
                }

            }

        ];

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
            RENDER LIST
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
                    () => {

                        renderSummary();

                        renderList();

                        renderDetail();

                    }
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

        /*
            INIT
        */
        renderSummary();

        renderList();

        renderDetail();
/*
    MODAL
*/
const reportModal =
    document.getElementById(
        "reportModal"
    );

const createForm =
    document.getElementById(
        "createReportForm"
    );

/*
    OPEN MODAL
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

            }
        );

    });

/*
    CLOSE MODAL
*/
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

/*
    CLICK OUTSIDE
*/
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
    event => {

        event.preventDefault();

        const formData =
            new FormData(createForm);

        const report = {

            id:
                "RPT-" +
                String(
                    reports.length + 1
                ).padStart(3,"0"),

            title:
                formData.get("title"),

            type:
                formData.get("type"),

            priority:
                formData.get("priority"),

            status:
                "received",

            reporter:
                formData.get("reporter"),

            mobile:
                formData.get("mobile"),

            location:
                formData.get("location"),

            description:
                formData.get("description"),

            assignedTo:
                formData.get("assignedTo"),

            submittedAt:
                new Date(),

            coordinates:{
                lat:Number(
                    formData.get("lat")
                ),
                lng:Number(
                    formData.get("lng")
                )
            },

            dispatch:{
                responder:
                    formData.get("responder"),

                etaMinutes:Number(
                    formData.get("etaMinutes")
                )
            }

        };

        reports.unshift(report);

        selectedReport =
            report;

        renderSummary();

        renderList();

        renderDetail();

        createForm.reset();

        reportModal.classList.add(
            "hidden"
        );

    }
);
    }
);