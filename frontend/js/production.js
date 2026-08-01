// ============================================
// CHEF BISU - PRODUCTION (New UI)
// ============================================

// ---------- Data ----------
let itemList = [];
let productionRows = [];
let historyData = [];

// ---------- New ----------
const itemSelect = document.getElementById("item");
const qtyInput = document.getElementById("qty");
const unitSelect = document.getElementById("unit");

const productionList = document.getElementById("productionList");
const addRowBtn = document.getElementById("addRowBtn");
const saveBtn = document.getElementById("saveBtn");

// ---------- Date ----------
const productionDate = document.getElementById("productionDate");
const productionDateText = document.getElementById("productionDateText");

// ---------- History ----------
const historyList = document.getElementById("historyList");
const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");

// ---------- Search ----------
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");

// ---------- Tabs ----------
const newTab = document.getElementById("newTab");
const historyTab = document.getElementById("historyTab");
const searchTab = document.getElementById("searchTab");

const newScreen = document.getElementById("newScreen");
const historyScreen = document.getElementById("historyScreen");
const searchScreen = document.getElementById("searchScreen");

// ---------- Back ----------
document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "dashboard-new.html";
});
function showScreen(screen) {

    newScreen.style.display = "none";
    historyScreen.style.display = "none";
    searchScreen.style.display = "none";
     whatsappScreen.style.display = "none";
    newTab.classList.remove("active");
    historyTab.classList.remove("active");
    searchTab.classList.remove("active");
   whatsappTab.classList.remove("active");
    if (screen === "new") {
        newScreen.style.display = "block";
        newTab.classList.add("active");
    }

    if (screen === "history") {
        historyScreen.style.display = "block";
        historyTab.classList.add("active");
        loadHistory();
    }

    if (screen === "search") {
        searchScreen.style.display = "block";
        searchTab.classList.add("active");
    }
if (screen === "whatsapp") {
    whatsappScreen.style.display = "block";
    whatsappTab.classList.add("active");
}
}

newTab.addEventListener("click", () => showScreen("new"));
historyTab.addEventListener("click", () => showScreen("history"));
searchTab.addEventListener("click", () => showScreen("search"));
whatsappTab.addEventListener("click", () => showScreen("whatsapp"));
showScreen("new");
// ============================================
// Date
// ============================================

function initDate() {

    const today = new Date();

    productionDate.value = today.toISOString().split("T")[0];

    updateDateText();

    productionDate.addEventListener("change", updateDateText);

    document.querySelector(".date-card").addEventListener("click", () => {

        if (productionDate.showPicker) {
            productionDate.showPicker();
        } else {
            productionDate.click();
        }

    });

}

function updateDateText() {

    const d = new Date(productionDate.value);

    productionDateText.textContent =
        d.toLocaleDateString("en-GB", {

            day: "2-digit",
            month: "short",
            year: "numeric"

        });

}

// ============================================
// Load Items
// ============================================

async function loadItems() {

    try {

        const res = await fetch("/api/production/items");

        itemList = await res.json();

        itemSelect.innerHTML = `
            <option value="">Select Item</option>
        `;

        itemList.forEach(item => {

            itemSelect.innerHTML += `
                <option value="${item.item_name}">
                    ${item.item_name}
                </option>
            `;

        });

    } catch (err) {

        console.error("Item Load Error", err);

    }

}

// ============================================
// Render List
// ============================================

function renderList() {

    if (productionRows.length === 0) {

        productionList.innerHTML = `
            <div id="emptyState"
                class="text-center py-5 rounded-4 border border-secondary">

                <i class="bi bi-inbox fs-1 text-secondary"></i>

                <p class="text-secondary mt-3 mb-0">

                    No production item added

                </p>

            </div>
        `;

        return;

    }

    productionList.innerHTML = "";

    productionRows.forEach((row, index) => {

        productionList.innerHTML += `

        <div class="production-item">

            <div>

                <h6>${row.item}</h6>

                <small>

                    <span class="qty">

                        ${row.qty}

                    </span>

                    ${row.unit}

                </small>

            </div>

            <button
                class="delete-btn"
                onclick="deleteRow(${index})">

                <i class="bi bi-trash"></i>

            </button>

        </div>

        `;

    });

}

// ============================================
// Add Row
// ============================================

function addRow() {

    const item = itemSelect.value;
    const qty = qtyInput.value;
    const unit = unitSelect.value;

    if (!item) {

        alert("Select Item");

        return;

    }

    if (!qty || qty <= 0) {

        alert("Enter Quantity");

        return;

    }

    productionRows.push({

        item,
        qty,
        unit

    });

    itemSelect.selectedIndex = 0;

    qtyInput.value = "";

    renderList();

}

function deleteRow(index) {

    productionRows.splice(index, 1);

    renderList();

}

addRowBtn.addEventListener("click", addRow);
// ============================================
// Save Production
// ============================================

async function saveProduction() {

    if (productionRows.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    try {

        showLoading(
            "Saving Production...",
            "Please wait..."
        );

        const response = await fetch("/api/production/save", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                date: productionDate.value,
                productionData: productionRows

            })

        });

        const result = await response.json();

        if (!response.ok || result.success === false) {

            showError(
                "Save Failed",
                result.message || "Please try again"
            );

            return;

        }

        showSuccess(
            "Production Saved",
            "Successfully Saved"
        );

        productionRows = [];

        renderList();

    } catch (err) {

        console.error(err);

        showError(
            "Save Failed",
            err.message
        );

    }

}

saveBtn.addEventListener("click", saveProduction);
// ============================================
// Initialize
// ============================================

async function init() {
       try {

    const res = await fetch("/session");
    const data = await res.json();

    if (data.loggedIn) {
        loggedInUser = data.user.username;
    }

} catch (err) {

    console.error(err);

}
    initDate();

    await loadItems();

    renderList();

}
// ============================================
// History
// ============================================

async function loadHistory() {

    try {

        historyList.innerHTML = `
        <div class="text-center py-4">
            Loading...
        </div>`;

        const res = await fetch("/api/production/all");
        historyData = await res.json();

        if (!historyData.length) {

            historyList.innerHTML = `
            <div class="text-center py-5 text-secondary">
                No Production History
            </div>`;

            return;
        }

        historyList.innerHTML = historyData.map(row => `

<div class="history-card mb-3 p-3">

    <div class="d-flex justify-content-between align-items-center">

        <div>

            <h5 class="fw-bold text-white mb-1">
                ${row.item}
            </h5>

            <small class="text-secondary">
                ${row.date}
            </small>

        </div>

        <div class="text-end d-flex align-items-center gap-3">

            <div>
                <h3 class="text-warning fw-bold mb-0">
                    ${row.qty}
                </h3>

                <small class="text-secondary">
                    ${row.unit}
                </small>
            </div>

            <div class="d-flex gap-2">
                <button class="delete-btn" style="background:#3a3a3f;" data-edit="${row.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" data-delete="${row.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>

        </div>

    </div>

</div>

`).join("");

        historyList.querySelectorAll("[data-delete]").forEach(btn => {
            btn.addEventListener("click", () => deleteProduction(btn.getAttribute("data-delete")));
        });

        historyList.querySelectorAll("[data-edit]").forEach(btn => {
            btn.addEventListener("click", () => openEditModal(btn.getAttribute("data-edit")));
        });

    } catch (err) {

        console.error(err);

        historyList.innerHTML = `
        <div class="text-danger text-center py-5">
            Failed to Load
        </div>`;

    }

}

if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener("click", loadHistory);
}



// ============================================
// Search
// ============================================

if (searchBtn) {

    searchBtn.addEventListener("click", async () => {

        const from = fromDate.value;
        const to = toDate.value;

        if (!from || !to) {

            alert("From Date এবং To Date দিন");

            return;

        }

        searchResult.innerHTML = `
        <div class="text-center py-4">
            Loading...
        </div>`;

        try {

            const res = await fetch(`/api/production/search?from=${from}&to=${to}`);

            const rows = await res.json();

            if (!rows.length) {

                searchResult.innerHTML = `
                <div class="text-center py-5 text-secondary">
                    No Data Found
                </div>`;

                return;

            }

            searchResult.innerHTML = rows.map(r => `

<div class="history-card mb-3 p-3">

    <div class="d-flex justify-content-between align-items-center">

        <div>

            <h5 class="fw-bold text-white mb-1">
                ${r.item}
            </h5>

            <small class="text-secondary">
                Total Production
            </small>

        </div>

        <div class="text-end">

            <h3 class="text-warning fw-bold mb-0">
                ${r.total_qty}
            </h3>

            <small class="text-secondary">
                ${r.unit}
            </small>

        </div>

    </div>

</div>

`).join("");

        } catch (err) {

            console.error(err);

            searchResult.innerHTML = `
            <div class="text-danger text-center py-5">
                Search Failed
            </div>`;

        }

    });

}

// ================================
// WhatsApp Elements
// ================================
let loggedInUser = "";
const waDateCard = document.getElementById("waDateCard");
const waDate = document.getElementById("waDate");
const waDateText = document.getElementById("waDateText");

const preview = document.getElementById("waPreview");

const copyBtn = document.getElementById("copyMessageBtn");
const sendBtn = document.getElementById("sendWhatsappBtn");
const status = document.getElementById("waStatus");

// Default Date
const today = new Date().toISOString().split("T")[0];

waDate.value = today;
waDateText.textContent = today;
async function generateProductionWhatsappMessage() {

    if (!waDate || !preview) return;

    const date = waDate.value;

    try {

        const response = await fetch(`/api/production/whatsapp/${date}`);
        const data = await response.json();

        if (!data.success || data.rows.length === 0) {

            preview.innerText =
`🍳 CHEF BISU

No Production found for this date.`;

            return;
        }

        const selectedDate = new Date(date);

        const formattedDate = selectedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const formattedTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        let message = "";

        message += "🍳| Production Report\n\n";

message += `📅 ${formattedDate}   |   🕒 ${formattedTime}\n`;

message += "━━━━━━━━━━━━━━━━━━━━\n\n";

        let totalItems = data.rows.length;

data.rows.forEach((row, index) => {

    const no = String(index + 1).padStart(2, "0");

    message += `${no}. ${row.item}\n`;
    message += `    ➜ ${row.qty} ${row.unit}\n\n`;

});
      message += "━━━━━━━━━━━━━━━━━━━━\n\n";

message += `📋 Total Items : ${totalItems}\n\n`;
if (loggedInUser) {
    message += `👤 Prepared By : ${loggedInUser}\n\n`;
}
message += "──────────────\n";


        preview.innerText = message;

    } catch (err) {

        console.error(err);

        preview.innerText = "Failed to load production report.";

    }

}
// Date Card Click
waDateCard.addEventListener("click", () => {
    waDate.showPicker();
});

// Date Change
waDate.addEventListener("change", () => {

    waDateText.textContent = waDate.value;

    generateProductionWhatsappMessage();

});

generateProductionWhatsappMessage();
// Copy Report
copyBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(preview.innerText);

        waStatus.textContent = "Copied";
        waStatus.className = "badge bg-success";

    } catch {

        alert("Copy failed");

    }

});
// Send WhatsApp
sendBtn.addEventListener("click", () => {

    const text = encodeURIComponent(preview.innerText);

    window.open(
        `https://wa.me/?text=${text}`,
        "_blank"
    );

    waStatus.textContent = "WhatsApp Opened";
    waStatus.className = "badge bg-success";

});
// ============================================
// Delete & Edit Production (History)
// ============================================

async function deleteProduction(id) {

    const ok = confirm("এই এন্ট্রি ডিলিট করতে চান?");
    if (!ok) return;

    try {

        const res = await fetch(`/api/production/delete/${id}`, {
            method: "DELETE"
        });

        const result = await res.json();

        alert(result.message || "Deleted");

        loadHistory();

    } catch (err) {

        console.error("Delete Error:", err);
        alert("Delete করা যায়নি");

    }

}

const editModalEl = document.getElementById("editModal");
const editModal = new bootstrap.Modal(editModalEl);

function openEditModal(id) {

    const row = historyData.find(r => String(r.id) === String(id));
    if (!row) return;

    document.getElementById("editId").value = row.id;

    const editItem = document.getElementById("editItem");
    editItem.innerHTML = itemList.map(i =>
        `<option value="${i.item_name}" ${i.item_name === row.item ? "selected" : ""}>${i.item_name}</option>`
    ).join("");

    document.getElementById("editQty").value = row.qty;
    document.getElementById("editUnit").value = row.unit;

    editModal.show();

}

document.getElementById("editSaveBtn").addEventListener("click", async () => {

    const id = document.getElementById("editId").value;
    const item = document.getElementById("editItem").value;
    const qty = document.getElementById("editQty").value;
    const unit = document.getElementById("editUnit").value;

    if (!item || !qty || !unit) {
        alert("সব ফিল্ড পূরণ করুন");
        return;
    }

    try {

        const res = await fetch(`/api/production/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item, qty, unit })
        });

        const result = await res.json();

        alert(result.message || "Updated");

        editModal.hide();

        loadHistory();

    } catch (err) {

        console.error("Update Error:", err);
        alert("Update করা যায়নি");

    }

});
init();
const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "/pages/dashboard.html";
    });
}