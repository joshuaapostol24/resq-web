document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
            AUTH CHECK
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
            LOGOUT BUTTON
        */
        const logoutButton =
            document.querySelector(
                ".btn-primary"
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
            LOAD ICONS
        */
        if(window.lucide){

            window.lucide.createIcons();

        }

        /*
            FETCH DASHBOARD DATA
        */
        try{

            const response =
                await fetch(
                    "/api/dashboard"
                );

            const data =
                await response.json();
            
            console.log(data);
            /*
                TOTAL RESIDENTS
            */
            document.getElementById(
                "totalResidents"
            ).textContent =
                data.users?.total || 0;

            /*
                ACTIVE ALERTS
            */
            document.getElementById(
                "activeAlerts"
            ).textContent =
                data.reports?.total || 0;

            /*
                RELOAD ICONS
            */
            if(window.lucide){

                window.lucide.createIcons();

            }

        }

        catch(error){

            console.log(error);

            document.getElementById(
                "totalResidents"
            ).textContent =
                "0";

            document.getElementById(
                "activeAlerts"
            ).textContent =
                "0";

        }

    }
);