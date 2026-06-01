lucide.createIcons();

/*
=========================================================
AUTH
=========================================================
*/

const loggedIn = localStorage.getItem("resq_logged_in");

if (loggedIn !== "true") {
    window.location.href = "/LOGIN/login.html";
}

/*
=========================================================
ELEMENTS
=========================================================
*/

const form               = document.getElementById("newsForm");
const pinnedContainer    = document.getElementById("pinnedAnnouncement");
const latestContainer    = document.getElementById("latestAnnouncements");
const editModalOverlay   = document.getElementById("editModalOverlay");
const editForm           = document.getElementById("editForm");
const closeEditModalBtn  = document.getElementById("closeEditModal");
const cancelEditBtn      = document.getElementById("cancelEditBtn");

/*
=========================================================
API
=========================================================
*/

const API_URL = "https://resq-app-xsb98.ondigitalocean.app/api/news";

/*
=========================================================
LOAD ANNOUNCEMENTS
=========================================================
*/

async function loadAnnouncements() {
    try {
        const response = await fetch(`${API_URL}/all`);

        if (!response.ok) {
            throw new Error("Failed to fetch announcements");
        }

        let announcements = await response.json();

        if (!Array.isArray(announcements)) {
            announcements = [];
        }

        // Sort newest first
        announcements.sort((a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );

        // Clear containers
        pinnedContainer.innerHTML = "";
        latestContainer.innerHTML = "";

        if (announcements.length === 0) {
            pinnedContainer.innerHTML = `
                <div class="empty-state"><h3>No pinned announcement</h3></div>
            `;
            latestContainer.innerHTML = `
                <div class="empty-state"><h3>No announcements yet</h3></div>
            `;
            return;
        }

        // Pinned announcement
        const pinned = announcements.find(item => item.pinned === "Yes");

        if (pinned) {
            pinnedContainer.innerHTML = buildPinnedCard(pinned);
            pinnedContainer
                .querySelector(".btn-unpin")
                ?.addEventListener("click", () => unpinAnnouncement(pinned.id));
            pinnedContainer
                .querySelector(".btn-edit")
                ?.addEventListener("click", () => openEditModal(pinned));
            pinnedContainer
                .querySelector(".btn-danger")
                ?.addEventListener("click", () => deleteAnnouncement(pinned.id));
        } else {
            pinnedContainer.innerHTML = `
                <div class="empty-state"><h3>No pinned announcement</h3></div>
            `;
        }

        // Latest announcements (exclude pinned)
        const latest = announcements.filter(item => item.pinned !== "Yes");

        if (latest.length === 0) {
            latestContainer.innerHTML = `
                <div class="empty-state"><h3>No other announcements</h3></div>
            `;
        } else {
            latest.forEach(news => {
                const card = buildNewsCard(news);
                latestContainer.appendChild(card);
            });
        }

        // Re-init lucide icons for dynamically added content
        lucide.createIcons();

    } catch (error) {
        console.error("Load announcements error:", error);
        latestContainer.innerHTML = `
            <div class="empty-state"><h3>Failed to load announcements</h3></div>
        `;
    }
}

/*
=========================================================
BUILD PINNED CARD HTML
=========================================================
*/

function buildPinnedCard(item) {
    const formattedDate = item.date
        ? new Date(item.date).toLocaleString()
        : "No date";

    return `
        <div class="news-card">
            <div class="news-title-row">
                <h3>${item.title || ""}</h3>
                <span class="badge-pinned">📌 PINNED</span>
            </div>
            <p>${item.message || ""}</p>
            <div class="meta-row">
                <span>${item.category || ""}</span>
                <span>• ${item.priority || ""}</span>
                <span>• ${item.audience || ""}</span>
                <span>• ${formattedDate}</span>
            </div>
            <div class="card-actions">
                <button class="btn-unpin" data-id="${item.id}">
                    <i data-lucide="pin-off"></i> Unpin
                </button>
                <button class="btn-edit btn-secondary" data-id="${item.id}">
                    <i data-lucide="pencil"></i> Edit
                </button>
                <button class="btn-danger" data-id="${item.id}">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
        </div>
    `;
}

/*
=========================================================
BUILD LATEST CARD ELEMENT
=========================================================
*/

function buildNewsCard(news) {
    const formattedDate = news.date
        ? new Date(news.date).toLocaleString()
        : "No date";

    const card = document.createElement("div");
    card.className = "news-card";

    card.innerHTML = `
        <div class="news-title-row">
            <h3>${news.title || ""}</h3>
            <span class="badge">${news.priority || ""}</span>
        </div>
        <p>${news.message || ""}</p>
        <div class="meta-row">
            <span>${news.category || ""}</span>
            <span>• ${news.audience || ""}</span>
            <span>• ${formattedDate}</span>
        </div>
        <div class="card-actions">
            <button class="btn-pin" data-id="${news.id}">
                <i data-lucide="pin"></i> Pin
            </button>
            <button class="btn-edit btn-secondary" data-id="${news.id}">
                <i data-lucide="pencil"></i> Edit
            </button>
            <button class="btn-danger" data-id="${news.id}">
                <i data-lucide="trash-2"></i> Delete
            </button>
        </div>
    `;

    card.querySelector(".btn-pin")
        .addEventListener("click", () => pinAnnouncement(news.id));
    card.querySelector(".btn-edit")
        .addEventListener("click", () => openEditModal(news));
    card.querySelector(".btn-danger")
        .addEventListener("click", () => deleteAnnouncement(news.id));

    return card;
}

/*
=========================================================
INITIAL LOAD
=========================================================
*/

loadAnnouncements();

/*
=========================================================
DELETE ANNOUNCEMENT
=========================================================
*/

async function deleteAnnouncement(id) {
    if (!id) {
        alert("Cannot delete: ID is missing.");
        return;
    }

    if (!confirm("Delete this announcement?")) return;

    try {
        const response = await fetch(`${API_URL}/delete/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert("Announcement deleted successfully.");
            loadAnnouncements();
        } else {
            alert(result.message || "Failed to delete announcement.");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("Server error while deleting.");
    }
}

/*
=========================================================
PIN ANNOUNCEMENT
=========================================================
*/

async function pinAnnouncement(id) {
    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/pin/${id}`, {
            method: "PATCH"
        });

        const result = await response.json();

        if (response.ok && result.success) {
            loadAnnouncements();
        } else {
            alert(result.detail || result.message || "Failed to pin announcement.");
        }
    } catch (error) {
        console.error("Pin error:", error);
        alert("Server error while pinning.");
    }
}

/*
=========================================================
UNPIN ANNOUNCEMENT
=========================================================
*/

async function unpinAnnouncement(id) {
    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/unpin/${id}`, {
            method: "PATCH"
        });

        const result = await response.json();

        if (response.ok && result.success) {
            loadAnnouncements();
        } else {
            alert(result.detail || result.message || "Failed to unpin announcement.");
        }
    } catch (error) {
        console.error("Unpin error:", error);
        alert("Server error while unpinning.");
    }
}

/*
=========================================================
EDIT MODAL — OPEN
=========================================================
*/

function openEditModal(news) {
    document.getElementById("edit-id").value       = news.id || "";
    document.getElementById("edit-title").value    = news.title || "";
    document.getElementById("edit-message").value  = news.message || "";

    setSelectValue("edit-category", news.category);
    setSelectValue("edit-priority",  news.priority);
    setSelectValue("edit-audience",  news.audience);
    setSelectValue("edit-pin",       news.pinned);

    // Normalize datetime-local value (strip timezone offset if present)
    if (news.date) {
        const localDate = news.date.slice(0, 16); // "YYYY-MM-DDTHH:MM"
        document.getElementById("edit-date").value = localDate;
    } else {
        document.getElementById("edit-date").value = "";
    }

    editModalOverlay.classList.remove("hidden");
}

function setSelectValue(selectId, value) {
    const select = document.getElementById(selectId);
    if (!value) return;
    for (const option of select.options) {
        if (option.value === value || option.text === value) {
            select.value = option.value;
            return;
        }
    }
}

/*
=========================================================
EDIT MODAL — CLOSE
=========================================================
*/

function closeEditModal() {
    editModalOverlay.classList.add("hidden");
    editForm.reset();
}

closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditBtn.addEventListener("click", closeEditModal);

editModalOverlay.addEventListener("click", (e) => {
    if (e.target === editModalOverlay) closeEditModal();
});

/*
=========================================================
EDIT FORM — SUBMIT  →  PATCH /edit/{id}
=========================================================
*/

editForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("edit-id").value;
    if (!id) {
        alert("Cannot update: ID is missing.");
        return;
    }

    // Only send fields that have a value (backend ignores null fields)
    const updates = {};

    const title    = document.getElementById("edit-title").value.trim();
    const message  = document.getElementById("edit-message").value.trim();
    const category = document.getElementById("edit-category").value;
    const priority = document.getElementById("edit-priority").value;
    const audience = document.getElementById("edit-audience").value;
    const pinned   = document.getElementById("edit-pin").value;
    const date     = document.getElementById("edit-date").value;

    if (title)    updates.title    = title;
    if (message)  updates.message  = message;
    if (category) updates.category = category;
    if (priority) updates.priority = priority;
    if (audience) updates.audience = audience;
    if (pinned)   updates.pinned   = pinned;
    if (date)     updates.date     = date;

    try {
        const response = await fetch(`${API_URL}/edit/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            closeEditModal();
            loadAnnouncements();
        } else {
            alert(result.detail || result.message || "Failed to update announcement.");
        }
    } catch (error) {
        console.error("Edit error:", error);
        alert("Server error while updating.");
    }
});

/*
=========================================================
CREATE FORM — SUBMIT  →  POST /create
=========================================================
*/

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const news = {
        title:    document.getElementById("f-title").value.trim(),
        category: document.getElementById("f-category").value,
        priority: document.getElementById("f-priority").value,
        date:     document.getElementById("f-date").value,
        audience: document.getElementById("f-audience").value,
        pinned:   document.getElementById("f-pin").value,
        message:  document.getElementById("f-message").value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(news)
        });

        if (!response.ok) {
            throw new Error("Failed to create announcement");
        }

        await response.json();

        alert("Announcement published successfully.");
        form.reset();
        loadAnnouncements();

    } catch (error) {
        console.error("Submit error:", error);
        alert("Server error while publishing announcement.");
    }
});

/*
=========================================================
SCROLL TO CREATE
=========================================================
*/

document.getElementById("newAnnouncementBtn")
    .addEventListener("click", () => {
        document.getElementById("createAnnouncementSection")
            .scrollIntoView({ behavior: "smooth" });
    });