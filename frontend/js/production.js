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

    newTab.classList.remove("active");
    historyTab.classList.remove("active");
    searchTab.classList.remove("active");

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

}

newTab.addEventListener("click", () => showScreen("new"));
historyTab.addEventListener("click", () => showScreen("history"));
searchTab.addEventListener("click", () => showScreen("search"));

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
        const data = await res.json();

        if (!data.length) {

            historyList.innerHTML = `
            <div class="text-center py-5 text-secondary">
                No Production History
            </div>`;

            return;
        }

        historyList.innerHTML = data.map(row => `

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

        <div class="text-end">

            <h3 class="text-warning fw-bold mb-0">
                ${row.qty}
            </h3>

            <small class="text-secondary">
                ${row.unit}
            </small>

        </div>

    </div>

</div>

`).join("");

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

init();