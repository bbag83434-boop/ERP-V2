// ============================================
// CHEF BISU - TRANSFER (New UI)
// New Transfer tab wired to existing backend APIs
// APIs kept exactly same as old working version:
//   GET  /api/production/items
//   GET  /api/production/branches
//   POST /api/transfer/save
// ============================================

let itemList = [];
let transferRows = []; // { item, qty, unit }

const outletSelect = document.getElementById("outlet");
const itemSelect = document.getElementById("item");
const qtyInput = document.getElementById("qty");
const unitSelect = document.getElementById("unit");
const transferListEl = document.getElementById("transferList");
const emptyState = document.getElementById("emptyState");
const dateInput = document.getElementById("transferDate");
const dateText = document.getElementById("transferDateText");

// ---------- Load Items ----------
async function loadItems() {
    try {
        const res = await fetch("/api/production/items");
        itemList = await res.json();

        itemSelect.innerHTML = `<option value="">Select Item</option>` +
            itemList.map(item => `<option value="${item.item_name}">${item.item_name}</option>`).join("");
    } catch (err) {
        console.error("Item Load Error:", err);
    }
}

let branchList = [];

// ---------- Load Branches (shown as Outlet) ----------
async function loadOutlets() {
    try {
        const res = await fetch("/api/production/branches");
        branchList = await res.json();

        outletSelect.innerHTML = `<option value="">Select Outlet</option>` +
            branchList.map(b => `<option value="${b.branch_name}">${b.branch_name}</option>`).join("");
    } catch (err) {
        console.error("Branch Load Error:", err);
    }
}

// ---------- Date Setup ----------
function initDate() {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
    updateDateText();

    dateInput.addEventListener("change", updateDateText);

    document.querySelector(".date-card").addEventListener("click", () => {
        dateInput.showPicker ? dateInput.showPicker() : dateInput.focus();
    });
}

function updateDateText() {
    const val = dateInput.value;
    if (!val) return;
    const d = new Date(val);
    dateText.textContent = d.toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

// ---------- Add Row ----------
document.getElementById("addRowBtn").addEventListener("click", () => {
    const item = itemSelect.value;
    const qty = qtyInput.value;
    const unit = unitSelect.value;

    if (!item) {
        alert("Item সিলেক্ট করুন");
        return;
    }
    if (!qty || qty <= 0) {
        alert("সঠিক Quantity দিন");
        return;
    }

    transferRows.push({ item, qty, unit });
    renderList();

    // reset entry fields only (outlet stays selected)
    itemSelect.selectedIndex = 0;
    qtyInput.value = "";
});

// ---------- Render Transfer List ----------
function renderList() {
    if (transferRows.length === 0) {
        transferListEl.innerHTML = "";
        transferListEl.appendChild(emptyState);
        return;
    }

    transferListEl.innerHTML = transferRows.map((row, index) => `
        <div class="transfer-item">
            <div>
                <h6>${row.item}</h6>
                <small class="qty">${row.qty} ${row.unit}</small>
            </div>
            <button class="delete-btn" data-index="${index}">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join("");

    transferListEl.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.getAttribute("data-index"));
            transferRows.splice(idx, 1);
            renderList();
        });
    });
}

// ---------- Save Transfer ----------
document.getElementById("saveBtn").addEventListener("click", async () => {
    const date = dateInput.value;
    const branch = outletSelect.value;

    if (!date || !branch) {
        alert("Date এবং Outlet সিলেক্ট করুন");
        return;
    }
    if (transferRows.length === 0) {
        alert("অন্তত একটি Item যোগ করুন");
        return;
    }

    showLoadingOverlay();

    try {
        const response = await fetch("/api/transfer/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date,
                branch,
                transferData: transferRows
            })
        });

        const result = await response.json();

        hideLoadingOverlay();

        if (response.ok) {
            showSuccessOverlay();
            setTimeout(() => {
                hideSuccessOverlay();
                transferRows = [];
                renderList();
                outletSelect.selectedIndex = 0;
            }, 1500);
        } else {
            alert(result.message || "Save করা যায়নি");
        }

    } catch (err) {
        hideLoadingOverlay();
        console.error(err);
        alert("Server Error");
    }
});

// ---------- Overlay Helpers ----------
function showLoadingOverlay() {
    document.getElementById("loadingOverlay").style.display = "flex";
}
function hideLoadingOverlay() {
    document.getElementById("loadingOverlay").style.display = "none";
}
function showSuccessOverlay() {
    document.getElementById("successOverlay").style.display = "flex";
}
function hideSuccessOverlay() {
    document.getElementById("successOverlay").style.display = "none";
}

// ============================================
// HISTORY TAB
// CONFIRMED real backend routes:
//   GET    /api/transfer/all
//   DELETE /api/transfer/delete/:id
//   PUT    /api/transfer/update/:id   body: { branch, item, qty, unit }
// Row shape: { id, date, branch, item, qty, unit }
// ============================================

const historyListEl = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const historyFilterRow = document.getElementById("historyFilterRow");

let historyData = [];
let historyFilterBranch = "";

async function loadHistory() {
    try {
        const res = await fetch("/api/transfer/all");
        historyData = await res.json();
        renderHistoryFilters();
        renderHistory();
    } catch (err) {
        console.error("History Load Error:", err);
    }
}

// ---------- Refresh Transfer Data ----------
async function refreshTransferData() {
    const refreshBtn = document.getElementById("refreshBtn");

    if (refreshBtn?.disabled) return;

    refreshBtn.disabled = true;
    refreshBtn.classList.add("is-loading");

    try {
        await Promise.all([
            loadItems(),
            loadOutlets(),
            loadSearchBranches(),
            loadHistory()
        ]);

        if (document.getElementById("whatsappPane").classList.contains("active")) {
            await generateWhatsappMessage();
        }
    } catch (err) {
        console.error("Transfer Refresh Error:", err);
        alert("Refresh করতে সমস্যা হয়েছে");
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.classList.remove("is-loading");
    }
}

// Build filter chips dynamically from real branch list (loaded for Outlet dropdown)
function renderHistoryFilters() {
    const chips = [`<button class="chip ${historyFilterBranch === "" ? "active" : ""}" data-branch="">All Outlets</button>`]
        .concat(branchList.map(b => `
            <button class="chip ${historyFilterBranch === b.branch_name ? "active" : ""}" data-branch="${b.branch_name}">
                ${b.branch_name}
            </button>
        `));

    historyFilterRow.innerHTML = chips.join("");

    historyFilterRow.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            historyFilterBranch = chip.getAttribute("data-branch");
            renderHistoryFilters();
            renderHistory();
        });
    });
}

function renderHistory() {
    const rows = historyFilterBranch
        ? historyData.filter(r => r.branch === historyFilterBranch)
        : historyData;

    if (!rows || rows.length === 0) {
        historyListEl.innerHTML = "";
        historyListEl.appendChild(emptyHistory);
        emptyHistory.style.display = "flex";
        return;
    }

    historyListEl.innerHTML = rows.map(row => `
        <div class="transfer-item mb-2">
            <div>
                <h6>${row.item}</h6>
                <small>${row.branch} &middot; <span class="qty">${row.qty} ${row.unit}</span></small><br>
                <small class="h-date">${formatDate(row.date)}</small>
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
    `).join("");

    historyListEl.querySelectorAll("[data-delete]").forEach(btn => {
        btn.addEventListener("click", () => deleteTransfer(btn.getAttribute("data-delete")));
    });

    historyListEl.querySelectorAll("[data-edit]").forEach(btn => {
        btn.addEventListener("click", () => openEditModal(btn.getAttribute("data-edit")));
    });
}

function formatDate(val) {
    if (!val) return "";
    const d = new Date(val);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

async function deleteTransfer(id) {
    const ok = confirm("এই এন্ট্রি ডিলিট করতে চান?");
    if (!ok) return;

    try {
        const res = await fetch(`/api/transfer/delete/${id}`, { method: "DELETE" });
        const result = await res.json();
        alert(result.message || "Deleted");
        loadHistory();
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Delete করা যায়নি");
    }
}

// ---------- Edit Modal ----------
const editModalEl = document.getElementById("editModal");
const editModal = new bootstrap.Modal(editModalEl);

function openEditModal(id) {
    console.log("Edit Click:", id)
    const row = historyData.find(r => String(r.id) === String(id));
    if (!row) return;

    document.getElementById("editId").value = row.id;

    const editBranch = document.getElementById("editBranch");
    editBranch.innerHTML = branchList.map(b =>
        `<option value="${b.branch_name}" ${b.branch_name === row.branch ? "selected" : ""}>${b.branch_name}</option>`
    ).join("");

    const editItem = document.getElementById("editItem");
    editItem.innerHTML = itemList.map(i =>
        `<option value="${i.item_name}" ${i.item_name === row.item ? "selected" : ""}>${i.item_name}</option>`
    ).join("");

    document.getElementById("editQty").value = row.qty;
    document.getElementById("editUnit").value = row.unit;
    console.log(editModalEl);
console.log(bootstrap);
    editModal.show();
}

document.getElementById("editSaveBtn").addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    const branch = document.getElementById("editBranch").value;
    const item = document.getElementById("editItem").value;
    const qty = document.getElementById("editQty").value;
    const unit = document.getElementById("editUnit").value;

    if (!branch || !item || !qty || !unit) {
        alert("সব ফিল্ড পূরণ করুন");
        return;
    }

    try {
        const res = await fetch(`/api/transfer/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ branch, item, qty, unit })
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

// ============================================
// SEARCH TAB
// CONFIRMED: /api/transfer/report generates an Excel file (not JSON),
// so a NEW additive JSON route was added: /api/transfer/search-json
// Response shape: [{ branch, item, total_qty, unit }, ...]
// ============================================

const searchResultList = document.getElementById("searchResultList");
const emptySearch = document.getElementById("emptySearch");
const searchBranchSelect = document.getElementById("searchBranch");

async function loadSearchBranches() {
    try {
        const res = await fetch("/api/production/branches");
        const branches = await res.json();
        searchBranchSelect.innerHTML = `<option value="">All Branches</option>` +
            branches.map(b => `<option value="${b.branch_name}">${b.branch_name}</option>`).join("");
    } catch (err) {
        console.error("Search Branch Load Error:", err);
    }
}

document.getElementById("searchBtn").addEventListener("click", async () => {
    const from = document.getElementById("searchFrom").value;
    const to = document.getElementById("searchTo").value;
    const branch = searchBranchSelect.value;

    if (!from || !to) {
        alert("From এবং To তারিখ দিন");
        return;
    }

    try {
        const res = await fetch(`/api/transfer/search-json?from=${from}&to=${to}&branch=${branch}`);
        const rows = await res.json();
        renderSearchResults(rows);
    } catch (err) {
        console.error("Search Error:", err);
        alert("Search করতে সমস্যা হয়েছে");
    }
});

function renderSearchResults(rows) {
    if (!rows || rows.length === 0) {
        searchResultList.innerHTML = "";
        searchResultList.appendChild(emptySearch);
        emptySearch.style.display = "flex";
        return;
    }

    searchResultList.innerHTML = rows.map(row => `
        <div class="history-card">
            <div class="h-top">
                <h6>${row.branch}</h6>
            </div>
            <div class="h-items">
                <span class="h-chip">${row.item} — ${row.total_qty} ${row.unit}</span>
            </div>
        </div>
    `).join("");
}

// ---------- Init ----------
Promise.all([loadItems(), loadOutlets(), loadSearchBranches()]).then(() => {
    initDate();
    loadHistory();
});

document.getElementById("refreshBtn").addEventListener("click", refreshTransferData);

const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "/pages/dashboard.html";
    });
}
