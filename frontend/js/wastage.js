/* ==========================================
   CHEF BISU
   WASTAGE MODULE
========================================== */

"use strict";

/* ==========================================
   API
========================================== */

const API_URL = "/api/wastage";

/* ==========================================
   DOM
========================================== */

const wastageDate = document.getElementById("wastageDate");
const wastageItem = document.getElementById("wastageItem");
const wastageQty = document.getElementById("wastageQty");
const wastageUnit = document.getElementById("wastageUnit");
const wastageReason = document.getElementById("wastageReason");

const addRowBtn = document.getElementById("addRowBtn");
const saveBtn = document.getElementById("saveWastageBtn");

const wastageList = document.getElementById("wastageList");
const historyList = document.getElementById("historyList");
const searchItem = document.getElementById("searchItem");
const searchDate = document.getElementById("searchDate");
const searchBtn = document.getElementById("searchBtn");
/* ==========================================
   DATA
========================================== */

let wastageRows = [];

/* ==========================================
   INIT
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    setTodayDate();

    loadItems();

    bindEvents();

});
/* ==========================================
   SET TODAY DATE
========================================== */

function setTodayDate() {

    if (!wastageDate) return;

    const today = new Date().toISOString().split("T")[0];

    wastageDate.value = today;

}


/* ==========================================
   LOAD ITEMS
========================================== */

async function loadItems() {

    try {

        const res = await fetch("/api/production/items");

        const itemList = await res.json();
        const searchItem = document.getElementById("searchItem");

if (searchItem) {
    searchItem.innerHTML = `
        <option value="">All Items</option>
    `;
      }
        wastageItem.innerHTML = `
            <option value="">Select Item</option>
        `;

        itemList.forEach(item => {

            wastageItem.innerHTML += `
                <option value="${item.item_name}">
                    ${item.item_name}
                </option>
            `;
if (searchItem) {

    searchItem.innerHTML += `
        <option value="${item.item_name}">
            ${item.item_name}
        </option>
    `;

}     
        });

    } catch (err) {

        console.error("Item Load Error", err);

    }

}


/* ==========================================
   BIND EVENTS
========================================== */

function bindEvents() {

    addRowBtn.addEventListener("click", addRow);

    saveBtn.addEventListener("click", saveWastage);
  const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");

refreshHistoryBtn.addEventListener("click", loadHistory);
}
/* ==========================================
   ADD ROW
========================================== */

function addRow() {

    const item = wastageItem.value.trim();
    const qty = wastageQty.value.trim();
    const unit = wastageUnit.value;
    const reason = wastageReason.value;

    if (!item) {
        alert("Please select item.");
        return;
    }

    if (!qty || Number(qty) <= 0) {
        alert("Enter valid quantity.");
        return;
    }

    if (!reason) {
        alert("Please select reason.");
        return;
    }

    const row = {
        item,
        qty,
        unit,
        reason
    };

    wastageRows.push(row);

    renderRows();

    wastageQty.value = "";
    wastageReason.selectedIndex = 0;

}


/* ==========================================
   RENDER ROWS
========================================== */

function renderRows() {

    wastageList.innerHTML = "";

    wastageRows.forEach((row, index) => {

        wastageList.innerHTML += `

        <div class="card border-0 mb-3"
             style="background:#23253A;border-radius:18px;">

            <div class="card-body d-flex justify-content-between align-items-center">

                <div>

                    <h6 class="mb-1 text-white fw-bold">${row.item}</h6>

                    <small class="text-secondary">

                        ${row.qty} ${row.unit} • ${row.reason}

                    </small>

                </div>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="removeRow(${index})">

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        </div>

        `;

    });

}


/* ==========================================
   REMOVE ROW
========================================== */

function removeRow(index) {

    wastageRows.splice(index, 1);

    renderRows();

}
/* ==========================================
   SAVE WASTAGE
========================================== */

async function saveWastage() {

    if (wastageRows.length === 0) {

        alert("Please add at least one item.");

        return;

    }

    const payload = {

        date: wastageDate.value,

        wastageData: wastageRows

    };

    try {
        showLoading();

        saveBtn.disabled = true;

        saveBtn.innerHTML = "Saving...";

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(payload)

        });

        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message || "Save failed");

        }

        showSuccess(
            "success",
            "Wastage saved successfully."
        );

        wastageRows = [];

        renderRows();

        loadHistory();

    } catch (error) {

        console.error(error);

        alert(error.message);

    } finally {
        hideLoading();
        saveBtn.disabled = false;

        saveBtn.innerHTML = "Save Wastage";

    }

}
/* ==========================================
   LOAD HISTORY
========================================== */

async function loadHistory() {

    try {

        const response = await fetch(API_URL);

        const history = await response.json();

        historyList.innerHTML = "";

        if (!history.length) {

            historyList.innerHTML = `

            <div class="text-center py-5 text-secondary">

                <i class="bi bi-clock-history fs-1"></i>

                <p class="mt-3 mb-0">

                    No Wastage History Found

                </p>

            </div>

            `;

            return;

        }

        history.forEach(entry => {

            historyList.innerHTML += `

            <div class="card border-0 mb-3"
                 style="background:#23253A;border-radius:18px;">

                <div class="card-body">

                    <div class="d-flex justify-content-between">

                        <div>

                            <h6 class="mb-1">${entry.item}</h6>

                            <small class="text-secondary">

                                ${entry.qty} ${entry.unit} • ${entry.reason}

                            </small>

                        </div>

                        <small class="text-warning">

                            ${entry.date}

                        </small>

                    </div>

                </div>

            </div>

            `;

        });

    } catch (error) {

        console.error("History Error:", error);

    }

}
/* ==========================================
   SEARCH WASTAGE
========================================== */

async function searchWastage() {
//alert("Search Clicked")
console.log(searchItem.value);
console.log(searchDate.value);
//alert("After Values");
    try {

        const item = searchItem.value;
        const date = searchDate.value;

        const response = await fetch(
            `${API_URL}?item=${encodeURIComponent(item)}&date=${encodeURIComponent(date)}`
        );

        const result = await response.json();
        //console.log(result);
///alert(result.length);
       const searchResult = document.getElementById("searchResult");
searchResult.innerHTML = "";

        if (!result.length) {

            searchResul.innerHTML = `
                <div class="text-center py-5 text-secondary">
                    No Record Found
                </div>
            `;

            return;
        }

        result.forEach(entry => {

            searchResult.innerHTML += `
                <div class="card border-0 mb-3"
                style="background:#23253A;border-radius:18px;">

                    <div class="card-body">

                        <div class="d-flex justify-content-between">

                            <div>

                                <h6 class="text-white">${entry.item}</h6>

                                <small class="text-secondary">
                                    ${entry.qty} ${entry.unit} • ${entry.reason}
                                </small>

                            </div>

                            <small class="text-warning">
                                ${entry.date}
                            </small>

                        </div>

                    </div>

                </div>
            `;

        });

    } catch (err) {

        console.error(err);

        alert("Search Failed");

    }

}