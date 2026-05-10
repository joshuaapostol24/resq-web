const loggedIn =
    localStorage.getItem(
        "resq_logged_in"
    );

if(loggedIn !== "true"){

    window.location.href =
        "/LOGIN/login.html";

}

if(window.lucide){

    lucide.createIcons();

}

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

const SUPABASE_URL =
    "https://jpovamcznyzoemcnjrgs.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_kJmAZtcu7dO2aLdPwWYclg_I7y5kq3G";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const table =
    document.getElementById(
        "usersTable"
    );

const totalUsers =
    document.getElementById(
        "totalUsers"
    );

const pendingUsers =
    document.getElementById(
        "pendingUsers"
    );

const approvedUsers =
    document.getElementById(
        "approvedUsers"
    );

const rejectedUsers =
    document.getElementById(
        "rejectedUsers"
    );

const tableCount =
    document.getElementById(
        "tableCount"
    );

const searchInput =
    document.getElementById(
        "userSearch"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const toast =
    document.getElementById(
        "toast"
    );

let users = [];

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    },2500);

}

function renderSummary(){

    totalUsers.textContent =
        users.length;

    pendingUsers.textContent =
        users.filter(
            user =>
                user.status === "pending"
        ).length;

    approvedUsers.textContent =
        users.filter(
            user =>
                user.status === "approved"
        ).length;

    rejectedUsers.textContent =
        users.filter(
            user =>
                user.status === "rejected"
        ).length;

}

function getFilteredUsers(){

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const status =
        statusFilter.value;

    return users.filter(user => {

        const searchable = `
            ${user.name || ""}
            ${user.address || ""}
            ${user.email || ""}
            ${user.mobile_number || ""}
        `
        .toLowerCase();

        const matchesSearch =
            searchable.includes(search);

        const matchesStatus =
            status === "all"
            ||
            user.status === status;

        return matchesSearch && matchesStatus;

    });

}

function renderTable(){

    const filteredUsers =
        getFilteredUsers();

    tableCount.textContent =
        `Showing ${filteredUsers.length} of ${users.length} users`;

    if(!filteredUsers.length){

        table.innerHTML = `

            <tr>

                <td colspan="9" class="empty-row">
                    No users found
                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML = "";

    filteredUsers.forEach(user => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${user.name || ""}</td>

            <td>${user.address || ""}</td>

            <td>${user.email || ""}</td>

            <td>${user.mobile_number || ""}</td>

            <td>${user.id_type || "N/A"}</td>

            <td>${user.id_number || "N/A"}</td>

            <td>

                ${
                    user.id_image_url

                    ?

                    `
                    <a
                        href="${user.id_image_url}"
                        target="_blank"
                        class="view-link"
                    >
                        View ID
                    </a>
                    `

                    :

                    "No Image"

                }

            </td>

            <td>

                <span class="badge b-${user.status || "pending"}">

                    ${user.status || "pending"}

                </span>

            </td>

            <td class="text-right">

                <div class="row-actions">

                    <button
                        class="btn-action btn-approve"
                        onclick="updateStatus('${user.id}','approved')"
                    >
                        Approve
                    </button>

                    <button
                        class="btn-action btn-reject"
                        onclick="updateStatus('${user.id}','rejected')"
                    >
                        Reject
                    </button>

                </div>

            </td>

        `;

        table.appendChild(row);

    });

}

async function loadUsers(){

    table.innerHTML = `

        <tr>

            <td colspan="9" class="empty-row">
                Loading users...
            </td>

        </tr>

    `;

    const {
        data,
        error
    } = await supabaseClient

        .from("users")

        .select("*")

        .order(
            "name",
            {
                ascending:true
            }
        );

    if(error){

        console.log(error);

        table.innerHTML = `

            <tr>

                <td colspan="9" class="empty-row">
                    Failed to load users
                </td>

            </tr>

        `;

        return;

    }

    users = data || [];

    renderSummary();

    renderTable();

}

async function updateStatus(id,status){

    const {
        error
    } = await supabaseClient

        .from("users")

        .update({
            status:status
        })

        .eq("id",id);

    if(error){

        console.log(error);

        showToast(
            "Failed to update status"
        );

        return;

    }

    showToast(
        `User ${status}`
    );

    loadUsers();

}

searchInput.addEventListener(
    "input",
    renderTable
);

statusFilter.addEventListener(
    "change",
    renderTable
);

document
    .querySelectorAll(
        '[data-action="refresh"]'
    )

    .forEach(button => {

        button.addEventListener(
            "click",
            loadUsers
        );

    });

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

loadUsers();