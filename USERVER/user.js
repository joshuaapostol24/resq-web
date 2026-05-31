const loggedIn = localStorage.getItem("resq_logged_in");
if (loggedIn !== "true") {
    window.location.href = "/LOGIN/login.html";
}

if (window.lucide) lucide.createIcons();

const logoutButton = document.querySelector('[data-action="logout"]');
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("resq_logged_in");
        localStorage.removeItem("resq_user");
        window.location.href = "/LOGIN/login.html";
    });
}

/*
=========================================================
SUPABASE
=========================================================
*/
const SUPABASE_URL = "https://jpovamcznyzoemcnjrgs.supabase.co";
const SUPABASE_KEY = "sb_publishable_kJmAZtcu7dO2aLdPwWYclg_I7y5kq3G";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/*
=========================================================
ELEMENTS
=========================================================
*/
const table        = document.getElementById("usersTable");
const totalUsers   = document.getElementById("totalUsers");
const pendingUsers = document.getElementById("pendingUsers");
const approvedUsers= document.getElementById("approvedUsers");
const rejectedUsers= document.getElementById("rejectedUsers");
const bannedUsers  = document.getElementById("bannedUsers");
const tableCount   = document.getElementById("tableCount");
const searchInput  = document.getElementById("userSearch");
const statusFilter = document.getElementById("statusFilter");
const toast        = document.getElementById("toast");

let users = [];

/*
=========================================================
TOAST
=========================================================
*/
function showToast(message, type = "default") {
    toast.textContent = message;
    toast.className = "toast show";
    if (type === "success") toast.style.background = "#16A34A";
    else if (type === "error") toast.style.background = "#DC2626";
    else toast.style.background = "#0F172A";
    setTimeout(() => toast.classList.remove("show"), 2500);
}

/*
=========================================================
SUMMARY
=========================================================
*/
function renderSummary() {
    totalUsers.textContent    = users.length;
    pendingUsers.textContent  = users.filter(u => u.status === "pending").length;
    approvedUsers.textContent = users.filter(u => u.status === "approved").length;
    rejectedUsers.textContent = users.filter(u => u.status === "rejected").length;
    bannedUsers.textContent   = users.filter(u => u.status === "banned").length;
}

/*
=========================================================
FILTER
=========================================================
*/
function getFilteredUsers() {
    const search = searchInput.value.toLowerCase().trim();
    const status = statusFilter.value;
    return users.filter(user => {
        const searchable = `${user.name || ""} ${user.address || ""} ${user.email || ""} ${user.mobile_number || ""}`.toLowerCase();
        return searchable.includes(search) && (status === "all" || user.status === status);
    });
}

/*
=========================================================
ACTION BUTTONS BY STATUS
=========================================================
*/
function getActionButtons(user) {
    const status = user.status || "pending";
    if (status === "pending") {
        return `
            <button class="btn-action btn-approve" onclick="updateStatus('${user.id}', 'approved')">Approve</button>
            <button class="btn-action btn-reject"  onclick="updateStatus('${user.id}', 'rejected')">Reject</button>
        `;
    }
    if (status === "approved") {
        return `<button class="btn-action btn-ban" onclick="updateStatus('${user.id}', 'banned')">Ban</button>`;
    }
    if (status === "banned") {
        return `<button class="btn-action btn-unban" onclick="updateStatus('${user.id}', 'approved')">Unban</button>`;
    }
    // rejected — no buttons
    return `<span class="no-action">—</span>`;
}

/*
=========================================================
RENDER TABLE
=========================================================
*/
function renderTable() {
    const filtered = getFilteredUsers();
    tableCount.textContent = `Showing ${filtered.length} of ${users.length} users`;

    if (!filtered.length) {
        table.innerHTML = `<tr><td colspan="9" class="empty-row">No users found</td></tr>`;
        return;
    }

    table.innerHTML = "";
    filtered.forEach(user => {
        const status = user.status || "pending";
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.name || ""}</td>
            <td>${user.address || ""}</td>
            <td>${user.email || ""}</td>
            <td>${user.mobile_number || ""}</td>
            <td>${user.id_type || "N/A"}</td>
            <td>${user.id_number || "N/A"}</td>
            <td>
                ${user.id_image_url
                    ? `<a href="${user.id_image_url}" target="_blank" class="view-link">View ID</a>`
                    : "No Image"}
            </td>
            <td><span class="badge b-${status}">${status}</span></td>
            <td class="text-right">
                <div class="row-actions">${getActionButtons(user)}</div>
            </td>
        `;
        table.appendChild(row);
    });
}

/*
=========================================================
NOTIFICATIONS
=========================================================
*/
const NOTIFICATION_MESSAGES = {
    approved: "Your identity verification has been approved. You now have full access to the ResQ Resident Dashboard.",
    rejected: "Your identity verification was rejected. Please review your submitted information and upload a valid government-issued ID to resubmit your verification request.",
    banned:   "Your account has been restricted by the administrator. Please contact the Municipal Disaster Risk Reduction and Management Office for assistance.",
};

async function sendNotification(userId, status) {
    const message = NOTIFICATION_MESSAGES[status];
    if (!message) return;

    try {
        // Insert in-app notification into Supabase notifications table
        await supabaseClient
            .from("notifications")
            .insert([{
                user_id:    userId,
                message:    message,
                type:       "verification",
                status:     status,
                is_read:    false,
                created_at: new Date().toISOString(),
            }]);
    } catch (err) {
        // Notifications are best-effort — don't block the main action
        console.warn("Notification insert failed:", err);
    }
}

/*
=========================================================
UPDATE STATUS
=========================================================
*/
async function updateStatus(id, status) {
    const { error } = await supabaseClient
        .from("users")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("Failed to update status", "error");
        return;
    }

    // Send notification for relevant status changes
    if (["approved", "rejected", "banned"].includes(status)) {
        await sendNotification(id, status);
    }

    const labels = {
        approved: "User approved ✓",
        rejected: "User rejected",
        banned:   "User banned",
        unbanned: "User unbanned",
    };
    showToast(labels[status] || `Status set to ${status}`, "success");
    loadUsers();
}

window.updateStatus = updateStatus;

/*
=========================================================
LOAD USERS
=========================================================
*/
async function loadUsers() {
    table.innerHTML = `<tr><td colspan="9" class="empty-row">Loading users...</td></tr>`;

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error(error);
        table.innerHTML = `<tr><td colspan="9" class="empty-row">Failed to load users</td></tr>`;
        return;
    }

    users = data || [];
    renderSummary();
    renderTable();
}

/*
=========================================================
EVENTS
=========================================================
*/
searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);

document.querySelectorAll('[data-action="refresh"]').forEach(btn => {
    btn.addEventListener("click", loadUsers);
});

document.querySelector('[data-action="workspace"]').addEventListener("click", () => {
    window.location.href = "../WORKSPACE/workspace.html";
});

loadUsers();