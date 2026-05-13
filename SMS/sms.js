// ── CONFIG ──
const API_BASE = "http://localhost:8000"; // Change to your FastAPI base URL

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const name = localStorage.getItem("resq_user") || "Admin";
    document.getElementById("sidebarName").innerText = name;

    loadUsers();
    bindCharCounters();
});

// ── LOGOUT ──
function logout() {
    localStorage.removeItem("resq_logged_in");
    localStorage.removeItem("resq_user");
    window.location.href = "/LOGIN/login.html";
}

// ── CHAR COUNTERS ──
function bindCharCounters() {
    document.getElementById("testMessage").addEventListener("input", function () {
        document.getElementById("testCharCount").innerText = this.value.length;
    });

    document.getElementById("bulkMessage").addEventListener("input", function () {
        document.getElementById("bulkCharCount").innerText = this.value.length;
    });
}

// ── LOAD USERS ──
let allUsers = [];

async function loadUsers() {
    const list = document.getElementById("userList");

    try {
        const res = await fetch(`${API_BASE}/users?status=verified`);
        const data = await res.json();

        allUsers = data;
        renderUsers(allUsers);
    } catch (err) {
        list.innerHTML = `
            <div class="user-list-loading" style="color:#EF4444;">
                <i data-lucide="alert-circle" style="width:15px;height:15px;"></i>
                Failed to load users
            </div>`;
        lucide.createIcons();
    }
}

function renderUsers(users) {
    const list = document.getElementById("userList");

    if (users.length === 0) {
        list.innerHTML = `<div class="user-list-loading">No verified users found.</div>`;
        return;
    }

    list.innerHTML = users.map(user => `
        <label class="user-item">
            <input
                type="checkbox"
                class="user-checkbox"
                value="${user.id}"
                onchange="updateSelectedCount()"
            >
            <div class="user-item-info">
                <span class="user-item-name">${user.name || "Unknown"}</span>
                <span class="user-item-phone">${user.phone || "No phone"}</span>
            </div>
            <span class="user-item-badge">Verified</span>
        </label>
    `).join("");

    lucide.createIcons();
}

function filterUsers() {
    const query = document.getElementById("userSearch").value.toLowerCase();
    const filtered = allUsers.filter(u =>
        (u.name || "").toLowerCase().includes(query) ||
        (u.phone || "").includes(query)
    );
    renderUsers(filtered);
    updateSelectedCount();
}

function updateSelectedCount() {
    const checked = document.querySelectorAll(".user-checkbox:checked").length;
    document.getElementById("selectedCount").innerText = checked;
}

function getSelectedUserIds() {
    return [...document.querySelectorAll(".user-checkbox:checked")].map(el => el.value);
}

// ── SEND TEST SMS ──
async function sendTestSMS() {
    const phone   = document.getElementById("testPhone").value.trim();
    const message = document.getElementById("testMessage").value.trim();
    const resultBox = document.getElementById("testResult");
    const btn = document.querySelector(".card:first-child .btn-primary");

    if (!phone || !message) {
        showResult(resultBox, "error", "Please fill in both phone number and message.");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" style="width:15px;height:15px;"></i> Sending...`;
    lucide.createIcons();

    try {
        const res = await fetch(`${API_BASE}/sms/test`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, message })
        });

        const data = await res.json();

        if (res.ok) {
            showResult(resultBox, "success", "✓ SMS sent successfully!");
            document.getElementById("testPhone").value = "";
            document.getElementById("testMessage").value = "";
            document.getElementById("testCharCount").innerText = "0";
        } else {
            showResult(resultBox, "error", `Error: ${data.detail || "Failed to send SMS."}`);
        }
    } catch (err) {
        showResult(resultBox, "error", "Network error. Check your connection.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="send" style="width:15px;height:15px;"></i> Send Test SMS`;
        lucide.createIcons();
    }
}

// ── SEND BULK SMS ──
async function sendBulkSMS() {
    const user_ids = getSelectedUserIds();
    const message  = document.getElementById("bulkMessage").value.trim();
    const resultBox = document.getElementById("bulkResult");
    const btn = document.querySelector(".btn-primary--full");

    if (user_ids.length === 0) {
        showResult(resultBox, "error", "Please select at least one recipient.");
        return;
    }

    if (!message) {
        showResult(resultBox, "error", "Please type a message.");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" style="width:15px;height:15px;"></i> Sending...`;
    lucide.createIcons();

    try {
        const res = await fetch(`${API_BASE}/sms/send-selected`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_ids, message })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            showResult(resultBox, "success", `✓ SMS sent to ${data.sent_to} recipient(s).`);
            document.getElementById("bulkMessage").value = "";
            document.getElementById("bulkCharCount").innerText = "0";
            document.querySelectorAll(".user-checkbox:checked").forEach(cb => cb.checked = false);
            updateSelectedCount();
        } else {
            showResult(resultBox, "error", `Error: ${data.detail || "Failed to send SMS."}`);
        }
    } catch (err) {
        showResult(resultBox, "error", "Network error. Check your connection.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="send" style="width:15px;height:15px;"></i> Send to Selected`;
        lucide.createIcons();
    }
}

// ── HELPERS ──
function showResult(box, type, message) {
    box.className = `result-box ${type}`;
    box.innerText = message;

    // Auto-hide after 5s
    clearTimeout(box._timer);
    box._timer = setTimeout(() => {
        box.className = "result-box hidden";
    }, 5000);
}
