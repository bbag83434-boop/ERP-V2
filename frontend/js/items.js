// =====================================
// Chef Bisu Item Master
// UI Only
// =====================================

const backBtn = document.getElementById("backBtn");

const newTab = document.querySelectorAll(".tab-switch button")[0];
const listTab = document.querySelectorAll(".tab-switch button")[1];

const newPage = document.getElementById("newItemPage");
const listPage = document.getElementById("listPage");

const searchInput = document.getElementById("searchItem");

// ============================
// Back
// ============================

backBtn.onclick = () => {

    window.location.href = "dashboard.html";

};

// ============================
// Tabs
// ============================

newTab.onclick = () => {

    newTab.classList.add("active");
    listTab.classList.remove("active");

    newPage.style.display = "block";
    listPage.style.display = "none";

};

listTab.onclick = () => {

    listTab.classList.add("active");
    newTab.classList.remove("active");

    listPage.style.display = "block";
    newPage.style.display = "none";

};

// ============================
// Search (UI Only)
// ============================

searchInput.addEventListener("keyup", () => {

    const keyword = searchInput.value.toLowerCase();

    document.querySelectorAll(".item-card").forEach(card => {

        const text = card.innerText.toLowerCase();

        card.style.display =
            text.includes(keyword)
            ? "block"
            : "none";

    });

});
// ===========================
// Load Items
// ===========================

async function loadItems() {

    try {

        const res = await fetch("/api/production/items");

        const items = await res.json();

        const itemList = document.getElementById("itemList");

        itemList.innerHTML = "";

        items.forEach(item => {

            itemList.innerHTML += `

            <div class="item-card">

                <div class="d-flex justify-content-between align-items-start">

                    <div>

                        <div class="item-name">

                            ${item.item_name}

                        </div>

                        <div class="item-info">

                            ${item.unit || "PCS"}

                            <span class="mx-2">•</span>

                            <span class="rate">

                                ₹${item.rate || 0}

                            </span>

                        </div>

                    </div>

                    <div>

                        <button
                            class="action-btn edit-btn"
                            data-id="${item.id}">

                            <i class="bi bi-pencil"></i>

                        </button>

                        <button
                            class="action-btn delete-btn"
                            data-id="${item.id}">

                            <i class="bi bi-trash"></i>

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    } catch (err) {

        console.error(err);

    }

}

loadItems();
// ===============================
// Save Item
// ===============================

const saveBtn = document.getElementById("saveItemBtn");

saveBtn.addEventListener("click", saveItem);

async function saveItem() {

    const itemName = document.getElementById("itemName").value.trim();
    const unit = document.getElementById("itemUnit").value;
    const rate = document.getElementById("itemRate").value;

    if (!itemName) {

        alert("Enter Item Name");
        return;

    }

    try {

        const res = await fetch("/api/production/items", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                item_name: itemName,
                unit,
                rate

            })

        });

        const data = await res.json();

        alert(data.message);

        document.getElementById("itemName").value = "";
        document.getElementById("itemUnit").value = "";
        document.getElementById("itemRate").value = "";

        loadItems();

        listTab.click();

    } catch (err) {

        console.error(err);

        alert("Save Failed");

    }

}

       
    
// ===============================
// Delete Item
// ===============================

document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".delete-btn");

    if (!btn) return;

    if (!confirm("Delete this item?")) return;

    const id = btn.dataset.id;

    try {

        const res = await fetch(`/api/production/items/${id}`, {

            method: "DELETE"

        });

        const data = await res.json();

        alert(data.message);

        loadItems();

    } catch (err) {

        console.error(err);

        alert("Delete Failed");

    }

});
// ===============================
// Edit Item
// ===============================

document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".edit-btn");

    if (!btn) return;

    const card = btn.closest(".item-card");

    const currentName =
        card.querySelector(".item-name").innerText;

    const currentUnit =
        card.querySelector(".item-info")
            .childNodes[0]
            .textContent
            .trim();

    const currentRate =
        card.querySelector(".rate")
            .innerText
            .replace("₹", "")
            .trim();

    const newName =
        prompt("Item Name", currentName);

    if (!newName) return;

    const newUnit =
        prompt("Unit", currentUnit);

    if (!newUnit) return;

    const newRate =
        prompt("Rate", currentRate);

    if (!newRate) return;

    try {

        const res = await fetch(

            `/api/production/items/${btn.dataset.id}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    item_name: newName.trim(),

                    unit: newUnit.trim(),

                    rate: Number(newRate)

                })

            }

        );

        const data = await res.json();

        alert(data.message);

        loadItems();

    }

    catch (err) {

        console.error(err);

        alert("Update Failed");

    }

});