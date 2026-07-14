const transferRows = document.getElementById("transferRows");
let rowCount = 0;
let itemList = [];

async function loadItems() {
    try {
        const res = await fetch("http://localhost:3000/api/production/items");
        itemList = await res.json();
    } catch (err) {
        console.error("Item Load Error:", err);
    }
}

async function loadBranches() {
    try {
        const res = await fetch("http://localhost:3000/api/production/branches");
        const branches = await res.json();

        const branchSelect = document.getElementById("branch");

        branches.forEach((b) => {
            branchSelect.innerHTML += `<option value="${b.branch_name}">${b.branch_name}</option>`;
        });

    } catch (err) {
        console.error("Branch Load Error:", err);
    }
}

function addRow() {
    rowCount++;
    const row = document.createElement("tr");

    row.innerHTML = `
<td class="serial">${rowCount}</td>

<td>
    <select class="item">
        <option value="">Select Item</option>
        ${itemList.map(item => `
            <option value="${item.item_name}">
                ${item.item_name}
            </option>
        `).join("")}
    </select>
</td>

<td>
    <input type="number" class="qty" min="1">
</td>

<td>
    <select class="unit">
        <option>PCS</option>
        <option>KG</option>
    </select>
</td>

<td>
    <button class="removeBtn">🗑</button>
</td>
`;

    transferRows.appendChild(row);

    row.querySelector(".removeBtn").addEventListener("click", () => {
        row.remove();
        updateSerialNumbers();
    });
}

function updateSerialNumbers() {
    const rows = transferRows.querySelectorAll("tr");
    rows.forEach((row, index) => {
        row.querySelector(".serial").textContent = index + 1;
    });
    rowCount = rows.length;
}

document.getElementById("addRowBtn").addEventListener("click", addRow);

document.getElementById("saveBtn").addEventListener("click", async () => {

    const date = document.getElementById("transferDate").value;
    const branch = document.getElementById("branch").value;

    if (!date || !branch) {
        alert("Date এবং Branch দিন");
        return;
    }

    const rows = document.querySelectorAll("#transferRows tr");
    const transferData = [];

    rows.forEach(row => {
        const item = row.querySelector(".item").value;
        const qty = row.querySelector(".qty").value;
        const unit = row.querySelector(".unit").value;

        transferData.push({ item, qty, unit });
    });

    try {
        const response = await fetch("http://localhost:3000/api/transfer/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                date,
                branch,
                transferData
            })
        });

        const result = await response.json();

        alert(result.message);

        document.getElementById("transferDate").value = "";
        document.getElementById("branch").selectedIndex = 0;

    } catch (err) {
        console.error(err);
        alert("Server Error");
    }

});

Promise.all([loadItems(), loadBranches()]).then(() => {
    addRow();
});