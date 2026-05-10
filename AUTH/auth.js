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

}

/*
    LOAD USERNAME
*/
window.addEventListener(
    "DOMContentLoaded",
    () => {

        const usernameField =
            document.getElementById(
                "adminName"
            );

        if(usernameField){

            usernameField.innerText =
                localStorage.getItem(
                    "resq_user"
                ) || "Admin";

        }

    }
);

/*
    LOGOUT
*/
function logout(){

    localStorage.removeItem(
        "resq_logged_in"
    );

    localStorage.removeItem(
        "resq_user"
    );

    window.location.href =
        "/LOGIN/login.html";

}