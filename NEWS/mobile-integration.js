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

        let announcements =
            await response.json();

        /*
            SORT BY DATE
            NEWEST FIRST
        */
        announcements.sort(
            (a,b) =>
                new Date(b.date)
                -
                new Date(a.date)
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
            LATEST ONLY
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

        /*
            GET LATEST
        */
        const latestNews =
            announcements[0];

        const formattedDate =
            latestNews.date
            ? new Date(latestNews.date)
                .toLocaleString()
            : "No date";

        latestContainer.innerHTML = `

            <div class="news-card">

                <div class="news-title-row">

                    <h3>
                        ${latestNews.title || ""}
                    </h3>

                    <span class="badge">
                        ${latestNews.priority || ""}
                    </span>

                </div>

                <p>
                    ${latestNews.message || ""}
                </p>

                <div class="meta-row">

                    <span>
                        ${latestNews.category || ""}
                    </span>

                    <span>
                        • ${latestNews.audience || ""}
                    </span>

                    <span>
                        • ${formattedDate}
                    </span>

                </div>

            </div>

        `;

    }catch(error){

        console.log(error);

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


        /*
            SEND PUSH NOTIFICATION
        */
        await fetch(

            "https://jpovamcznyzoemcnjrgs.supabase.co/functions/v1/send-news-notification",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3ZhbWN6bnl6b2VtY25qcmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODMwMTcsImV4cCI6MjA5MzQ1OTAxN30.1WTdf3j4F6z-attUvvPi5Z7i8Q81hB4hhQtpyrgU8ao"

                },

                body:JSON.stringify({

                    title:
                        news.title,

                    message:
                        news.message,

                    category:
                        news.category,

                    priority:
                        news.priority

                })

            }

        );


form.reset();

loadAnnouncements();





        await fetch(
            "/api/send-sms",
            {

                method:"POST",

                headers:{
                    "Content-Type":
                        "application/json"
                },

                body:JSON.stringify({

                    number:
                        "639976857742",

                    message:
                        news.message

                })

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