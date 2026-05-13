
lucide.createIcons();

/*
=========================================================
AUTH
=========================================================
*/

const loggedIn = localStorage.getItem("resq_logged_in");

if (loggedIn !== "true") {
    window.location.href = "/LOGIN/login.html";
}

/*
=========================================================
ELEMENTS
=========================================================
*/

const form = document.getElementById("newsForm");

const pinnedContainer =
    document.getElementById("pinnedAnnouncement");

const latestContainer =
    document.getElementById("latestAnnouncements");

/*
=========================================================
API
=========================================================
*/

const API_URL =
    "https://resq-app-xsb98.ondigitalocean.app/api/news";



/*
=========================================================
LOAD ANNOUNCEMENTS
=========================================================
*/

async function loadAnnouncements() {

    try {

        const response = await fetch(
            `${API_URL}/all`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch announcements"
            );
        }

        let announcements =
            await response.json();

        /*
        -----------------------------------------
        CHECK IF ARRAY
        -----------------------------------------
        */

        if (!Array.isArray(announcements)) {
            announcements = [];
        }

        /*
        -----------------------------------------
        SORT NEWEST FIRST
        -----------------------------------------
        */

        announcements.sort((a, b) =>
            new Date(
                b.createdAt || b.date
            ) -
            new Date(
                a.createdAt || a.date
            )
        );

        /*
        -----------------------------------------
        CLEAR CONTAINERS
        -----------------------------------------
        */

        pinnedContainer.innerHTML = "";
        latestContainer.innerHTML = "";

        /*
        -----------------------------------------
        EMPTY STATE
        -----------------------------------------
        */

        if (announcements.length === 0) {

            pinnedContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No pinned announcement</h3>
                </div>
            `;

            latestContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No announcements yet</h3>
                </div>
            `;

            return;
        }

        /*
        -----------------------------------------
        PINNED ANNOUNCEMENT
        -----------------------------------------
        */

        const pinned = announcements.find(
            item => item.pinned === "Yes"
        );

        if (pinned) {

            pinnedContainer.innerHTML = `
                <div class="news-card">

                    <div class="news-title-row">

                        <h3>
                            ${pinned.title || ""}
                        </h3>

                        <span class="badge">
                            PINNED
                        </span>

                    </div>

                    <p>
                        ${pinned.message || ""}
                    </p>

                    <div class="meta-row">

                        <span>
                            ${pinned.category || ""}
                        </span>

                        <span>
                            • ${pinned.priority || ""}
                        </span>

                        <span>
                            • ${pinned.audience || ""}
                        </span>

                    </div>

                </div>
            `;

        } else {

            pinnedContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No pinned announcement</h3>
                </div>
            `;
        }

        /*
        -----------------------------------------
        DISPLAY ALL ANNOUNCEMENTS
        -----------------------------------------
        */

        announcements.forEach(news => {

            const formattedDate = news.date
                ? new Date(news.date).toLocaleString()
                : "No date";

            const card = document.createElement("div");

            card.className = "news-card";

            card.innerHTML = `
                <div class="news-title-row">

                    <h3>
                        ${news.title || ""}
                    </h3>

                    <span class="badge">
                        ${news.priority || ""}
                    </span>

                </div>

                <p>
                    ${news.message || ""}
                </p>

                <div class="meta-row">

                    <span>
                        ${news.category || ""}
                    </span>

                    <span>
                        • ${news.audience || ""}
                    </span>

                    <span>
                        • ${formattedDate}
                    </span>

                </div>
            `;

            latestContainer.appendChild(card);

        });

    } catch (error) {

        console.log("LOAD NEWS ERROR:");
        console.log(error);

        latestContainer.innerHTML = `
            <div class="empty-state">
                <h3>
                    Failed to load announcements
                </h3>
            </div>
        `;
    }
}

/*
=========================================================
INITIAL LOAD
=========================================================
*/

loadAnnouncements();

/*
=========================================================
SUBMIT NEWS
=========================================================
*/

form.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();

        const news = {

            title:
                document.getElementById("f-title")
                .value.trim(),

            category:
                document.getElementById("f-category")
                .value,

            priority:
                document.getElementById("f-priority")
                .value,

            date:
                document.getElementById("f-date")
                .value,

            audience:
                document.getElementById("f-audience")
                .value,

            pinned:
                document.getElementById("f-pin")
                .value,

            message:
                document.getElementById("f-message")
                .value.trim()
        };

        try {

            const response = await fetch(
                `${API_URL}/create`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(news)
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to create announcement"
                );
            }

            const result =
                await response.json();

            console.log(result);


            alert(
                "Announcement published successfully"
            );

            form.reset();

            loadAnnouncements();

        } catch (error) {

            console.log("SUBMIT ERROR:");
            console.log(error);

            alert(
                "Server error while publishing announcement"
            );
        }
    }
);

/*
=========================================================
SCROLL TO CREATE
=========================================================
*/

const newAnnouncementBtn =
    document.getElementById(
        "newAnnouncementBtn"
    );

if (newAnnouncementBtn) {

    newAnnouncementBtn.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "createAnnouncementSection"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });
        }
    );
}

