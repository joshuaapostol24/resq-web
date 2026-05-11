lucide.createIcons();

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

}

/*
    FORM
*/
const form =
    document.getElementById(
        "newsForm"
    );

/*
    CONTAINERS
*/
const pinnedContainer =
    document.getElementById(
        "pinnedAnnouncement"
    );

const latestContainer =
    document.getElementById(
        "latestAnnouncements"
    );

/*
    LOAD ANNOUNCEMENTS
*/
async function loadAnnouncements(){

    try{

        const response =
            await fetch(
                "/api/news/all"
            );

        if(!response.ok){

            throw new Error(
                "Failed to fetch news"
            );

        }

        let announcements =
            await response.json();

        /*
            SORT NEWEST FIRST
        */
        announcements.sort(
            (a,b) =>
                new Date(b.createdAt)
                -
                new Date(a.createdAt)
        );

        /*
            PINNED
        */
        const pinned =
            announcements.find(
                item =>
                    item.pinned === "Yes"
            );

        if(pinned){

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

        }else{

            pinnedContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No pinned announcement
                    </h3>

                </div>

            `;

        }

        /*
            ALL NEWS
        */
        latestContainer.innerHTML = "";

        if(announcements.length === 0){

            latestContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No announcements yet
                    </h3>

                </div>

            `;

            return;

        }

        announcements.forEach(news => {

            const formattedDate =
                news.date
                ? new Date(news.date)
                    .toLocaleString()
                : "No date";

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "news-card";

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

            latestContainer.appendChild(
                card
            );

        });

    }catch(error){

        console.log(
            "Load News Error:"
        );

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
    INITIAL LOAD
*/
loadAnnouncements();

/*
    SUBMIT NEWS
*/
form.addEventListener(
    "submit",
    async function(e){

        e.preventDefault();

        const news = {

            title:
                document.getElementById(
                    "f-title"
                ).value,

            category:
                document.getElementById(
                    "f-category"
                ).value,

            priority:
                document.getElementById(
                    "f-priority"
                ).value,

            date:
                document.getElementById(
                    "f-date"
                ).value,

            audience:
                document.getElementById(
                    "f-audience"
                ).value,

            pinned:
                document.getElementById(
                    "f-pin"
                ).value,

            message:
                document.getElementById(
                    "f-message"
                ).value

        };

        try{

            const response =
                await fetch(
                    "/api/news/create",
                    {
                        method:"POST",

                        headers:{
                            "Content-Type":
                            "application/json"
                        },

                        body:
                            JSON.stringify(news)
                    }
                );

            const result =
                await response.json();

            console.log(result);

            if(result.success){

                alert(
                    "Announcement published successfully"
                );

                form.reset();

                loadAnnouncements();

            }else{

                alert(
                    "Failed to publish announcement"
                );

            }

        }catch(error){

            console.log(
                "Submit Error:"
            );

            console.log(error);

            alert(
                "Server error while publishing announcement"
            );

        }

    }
);

/*
    SCROLL TO CREATE
*/
const newAnnouncementBtn =
    document.getElementById(
        "newAnnouncementBtn"
    );

if(newAnnouncementBtn){

    newAnnouncementBtn.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "createAnnouncementSection"
                )

                .scrollIntoView({

                    behavior:"smooth"

                });

        }
    );

}