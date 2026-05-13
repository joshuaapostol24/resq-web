
// ─────────────────────────────
// CONFIG
// ─────────────────────────────

const API_BASE =
    "https://resq-app-xsb98.ondigitalocean.app";


// ─────────────────────────────
// INIT
// ─────────────────────────────

document.addEventListener(
    "DOMContentLoaded",
    () => {

        lucide.createIcons();

        //loadUsers();

        bindCounters();

    }
);


// ─────────────────────────────
// COUNTERS
// ─────────────────────────────

function bindCounters(){

    const testMessage =
        document.getElementById(
            "testMessage"
        );

    const bulkMessage =
        document.getElementById(
            "bulkMessage"
        );

    if(testMessage){

        testMessage.addEventListener(
            "input",
            function(){

                document.getElementById(
                    "testCharCount"
                ).innerText =
                    this.value.length;

            }
        );

    }

    if(bulkMessage){

        bulkMessage.addEventListener(
            "input",
            function(){

                document.getElementById(
                    "bulkCharCount"
                ).innerText =
                    this.value.length;

            }
        );

    }

}


// ─────────────────────────────
// LOAD USERS
// ─────────────────────────────

let allUsers = [];

async function loadUsers(){

    try{

        const res =
            await fetch(
                `${API_BASE}/users`
            );

        const data =
            await res.json();

        allUsers = data;

        renderUsers(allUsers);

    }catch(error){

        console.log(error);

    }

}


// ─────────────────────────────
// RENDER USERS
// ─────────────────────────────

function renderUsers(users){

    const list =
        document.getElementById(
            "userList"
        );

    if(!list) return;

    if(users.length === 0){

        list.innerHTML = `
            <div class="user-list-loading">
                No verified users found.
            </div>
        `;

        return;

    }

    list.innerHTML =
        users.map(user => `

            <label class="user-item">

                <input
                    type="checkbox"
                    class="user-checkbox"
                    value="${user.id}"
                    onchange="updateSelectedCount()"
                >

                <div class="user-item-info">

                    <span class="user-item-name">
                        ${user.name || "Unknown"}
                    </span>

                    <span class="user-item-phone">
                        ${user.phone || "No phone"}
                    </span>

                </div>

            </label>

        `).join("");

}


// ─────────────────────────────
// FILTER USERS
// ─────────────────────────────

function filterUsers(){

    const query =
        document.getElementById(
            "userSearch"
        ).value.toLowerCase();

    const filtered =
        allUsers.filter(user =>

            (user.name || "")
            .toLowerCase()
            .includes(query)

            ||

            (user.phone || "")
            .includes(query)

        );

    renderUsers(filtered);

}


// ─────────────────────────────
// SELECTED COUNT
// ─────────────────────────────

function updateSelectedCount(){

    const checked =
        document.querySelectorAll(
            ".user-checkbox:checked"
        ).length;

    document.getElementById(
        "selectedCount"
    ).innerText =
        checked;

}


// ─────────────────────────────
// GET SELECTED IDS
// ─────────────────────────────

function getSelectedUserIds(){

    return [

        ...document.querySelectorAll(
            ".user-checkbox:checked"
        )

    ].map(el => el.value);

}


// ─────────────────────────────
// SINGLE SMS
// ─────────────────────────────

async function sendTestSMS(){

    const phone =
        document.getElementById(
            "testPhone"
        ).value.trim();

    const message =
        document.getElementById(
            "testMessage"
        ).value.trim();

    const resultBox =
        document.getElementById(
            "testResult"
        );

    if(!phone || !message){

        showResult(

            resultBox,

            "error",

            "Please enter phone and message."

        );

        return;

    }

    try{

        const res =
            await fetch(

                `${API_BASE}/api/send-sms`,

                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:JSON.stringify({

                        phone:
                            phone,

                        message:
                            message

                    })

                }

            );

        const data =
            await res.json();

        console.log(data);

        if(res.ok){

            showResult(

                resultBox,

                "success",

                "SMS sent successfully."

            );

        }else{

            showResult(

                resultBox,

                "error",

                "Failed to send SMS."

            );

        }

    }catch(error){

        console.log(error);

        showResult(

            resultBox,

            "error",

            "Network error."

        );

    }

}


// ─────────────────────────────
// BULK SMS
// ─────────────────────────────

async function sendBulkSMS(){

    const user_ids =
        getSelectedUserIds();

    const message =
        document.getElementById(
            "bulkMessage"
        ).value.trim();

    const resultBox =
        document.getElementById(
            "bulkResult"
        );

    if(user_ids.length === 0){

        showResult(

            resultBox,

            "error",

            "Select at least one user."

        );

        return;

    }

    if(!message){

        showResult(

            resultBox,

            "error",

            "Please enter message."

        );

        return;

    }

    try{

        const res =
            await fetch(

                `${API_BASE}/sms/send-selected`,

                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:JSON.stringify({

                        user_ids:
                            user_ids,

                        message:
                            message

                    })

                }

            );

        const data =
            await res.json();

        console.log(data);

        if(res.ok){

            showResult(

                resultBox,

                "success",

                `SMS sent to ${data.sent_to} users.`

            );

        }else{

            showResult(

                resultBox,

                "error",

                "Failed to send bulk SMS."

            );

        }

    }catch(error){

        console.log(error);

        showResult(

            resultBox,

            "error",

            "Network error."

        );

    }

}


// ─────────────────────────────
// RESULT UI
// ─────────────────────────────

function showResult(
    element,
    type,
    message
){

    if(!element) return;

    element.className =
        `result-box ${type}`;

    element.innerText =
        message;

    setTimeout(() => {

        element.className =
            "result-box hidden";

    }, 5000);

}

