/*
    NEW AUTH SYSTEM
*/
const loggedIn =
    localStorage.getItem(
        "resq_logged_in"
    );

if(loggedIn !== "true"){

    window.location.href =
        "/LOGIN/login.html";

    throw new Error(
        "Authentication required"
    );

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
    LOAD ICONS
*/
if(window.lucide){

    lucide.createIcons();

}

/*
    ENTER WORKSPACE
*/
document.querySelectorAll(
    ".btn-enter"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "../DASHBOARD/dashboard.html";

        }
    );

});