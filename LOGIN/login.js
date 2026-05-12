document.addEventListener(
    "DOMContentLoaded",
    () => {

        if(window.lucide){

            lucide.createIcons();

        }

        /*
            PASSWORD TOGGLE
        */
        const eyeIcon =
            document.querySelector(
                ".eye-icon"
            );

        const passwordInput =
            document.getElementById(
                "password"
            );

        if(eyeIcon){

            eyeIcon.addEventListener(
                "click",
                () => {

                    const hidden =
                        passwordInput.type ===
                        "password";

                    passwordInput.type =
                        hidden
                        ? "text"
                        : "password";

                    eyeIcon.setAttribute(
                        "data-lucide",
                        hidden
                        ? "eye-off"
                        : "eye"
                    );

                    lucide.createIcons();

                }
            );

        }

        /*
            LOGIN
        */
        const form =
            document.getElementById(
                "loginForm"
            );

        const loginMessage =
            document.getElementById(
                "loginMessage"
            );

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                loginMessage.classList.add(
                    "hidden"
                );

                const email =
                    document.getElementById(
                        "username"
                    ).value.trim();

                const password =
                    document.getElementById(
                        "password"
                    ).value;

                try{

                    const response =
                        await fetch(
                            "/api/login",
                            {
                                method:"POST",

                                headers:{
                                    "Content-Type":
                                    "application/json"
                                },

                                body:JSON.stringify({

                                     email:
                                        email,

                                     password:
                                        password


                                })
                            }
                        );

                    const data =
                        await response.json();

                    /*
                        SUCCESS
                    */
                    if(data.success){

                        localStorage.setItem(
                            "resq_logged_in",
                            "true"
                        );

                        localStorage.setItem(
                            "resq_user",
                            username
                        );

                        window.location.href =
                            "/DASHBOARD/dashboard.html";

                        return;

                    }

                    /*
                        INVALID LOGIN
                    */
                    loginMessage.innerText =
                        data.message ||
                        "Invalid login";

                    loginMessage.classList.remove(
                        "hidden"
                    );

                }catch(error){

                    console.log(error);

                    loginMessage.innerText =
                        "Server error";

                    loginMessage.classList.remove(
                        "hidden"
                    );

                }

            }
        );

    }
);