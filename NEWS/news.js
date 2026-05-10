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

const resultCount =
    document.getElementById(
        "resultCount"
    );

/*
    LOAD ANNOUNCEMENTS
*/
async function loadAnnouncements(){

    const response =
        await fetch(
            "/api/news/all"
        );

    const announcements =
        await response.json();

    /*
        COUNT
    */
    if(resultCount){

        resultCount.innerText =
            announcements.length +
            " found";

    }

    /*
        PINNED
    */
    const pinned =
        announcements.find(
            item =>
                item.pinned === "Yes"
        );

    if(pinnedContainer){

        if(pinned){

            pinnedContainer.innerHTML = `

                <div class="news-card">

                    <div class="news-title-row">

                        <h3>
                            ${pinned.title}
                        </h3>

                        <span class="badge">
                            PINNED
                        </span>

                    </div>

                    <p>
                        ${pinned.message}
                    </p>

                    <div class="meta-row">

                        <span>
                            ${pinned.category}
                        </span>

                        <span>
                            • ${pinned.priority}
                        </span>

                        <span>
                            • ${pinned.audience}
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

    }

    /*
        LATEST
    */
    if(latestContainer){

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

        announcements
            .slice()
            .reverse()
            .forEach(news => {

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
                            ${news.title}
                        </h3>

                        <span class="badge">
                            ${news.priority}
                        </span>

                    </div>

                    <p>
                        ${news.message}
                    </p>

                    <div class="meta-row">

                        <span>
                            ${news.category}
                        </span>

                        <span>
                            • ${news.audience}
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

    }

}

/*
    INITIAL LOAD
*/
loadAnnouncements();

/*
    SUBMIT
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
//fetch

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

        await response.json();

        form.reset();

        loadAnnouncements();

    }
);