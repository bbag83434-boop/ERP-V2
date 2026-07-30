// ===============================
// Chef Bisu ERP
// Opening Stock
// ===============================

const monthInput = document.getElementById("openingMonth");
const searchInput = document.getElementById("searchItem");

const tableBody = document.getElementById("openingStockTable");

const totalItems = document.getElementById("totalItems");
const totalQty = document.getElementById("totalQty");
const stockStatus = document.getElementById("stockStatus");

const saveBtn = document.getElementById("saveOpeningStock");


let openingItems = [];

document.addEventListener("DOMContentLoaded", () => {

    loadCurrentMonth();

    loadItems();

});

function loadCurrentMonth() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    monthInput.value = `${year}-${month}`;

}
// ===============================
// Load Items
// ===============================

async function loadItems() {

    try {

        const res = await fetch("/api/production/items");

        const data = await res.json();

        openingItems = data;

        renderTable(openingItems);
        loadOpeningStock();

    } catch (err) {

        console.error(err);

        alert("Failed to load items.");

    }

}

// ===============================
// Render Table
// ===============================

function renderTable(items) {

    tableBody.innerHTML = "";

    totalItems.textContent = items.length;

    let qty = 0;

    items.forEach(item => {

        tableBody.innerHTML += `

        <tr>

            <td>${item.item_name}</td>

            <td>PCS</td>

            <td>

                <input
                    type="number"
                    min="0"
                    value="0"
                    class="form-control qty-input">

            </td>

        </tr>

        `;

    });

    totalQty.textContent = qty;

}
// ===============================
// Search Item
// ===============================

searchInput.addEventListener("keyup", () => {

    const keyword = searchInput.value.toLowerCase();

    const filtered = openingItems.filter(item =>
        item.item_name.toLowerCase().includes(keyword)
    );

    renderTable(filtered);

});
// ===============================
// Save Opening Stock
// ===============================

saveBtn.addEventListener("click", saveOpeningStock);

async function saveOpeningStock() {

    const month = monthInput.value;

    const rows = document.querySelectorAll("#openingStockTable tr");

    const items = [];

    rows.forEach(row => {

        const item = row.children[0].textContent.trim();

        const unit = row.children[1].textContent.trim();

        const qty = Number(
            row.querySelector(".qty-input").value
        );

        items.push({
            item,
            qty,
            unit
        });

    });

    try {

        const res = await fetch("/api/opening-stock/save", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                month,
                items
            })

        });

        const data = await res.json();

        alert(data.message);

    } catch (err) {

        console.error(err);

        alert("Save Failed");

    }

}
async function loadOpeningStock() {

    try {

        const res = await fetch(`/api/opening-stock/${monthInput.value}`);

        const data = await res.json();

        data.forEach(saved => {

            const rows = document.querySelectorAll("#openingStockTable tr");

            rows.forEach(row => {

                const itemName = row.children[0].textContent.trim();

                if (itemName === saved.item) {

                    row.querySelector(".qty-input").value = saved.opening_qty;

                }

            });

        });

    } catch (err) {

        console.error(err);

    }

}
// ===============================
// Month Change
// ===============================

monthInput.addEventListener("change", () => {

    loadOpeningStock();

});