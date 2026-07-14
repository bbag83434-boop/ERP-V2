document.getElementById("newMonthBtn").addEventListener("click", function () {
    alert("Create New Month");
});

document.getElementById("lockMonthBtn").addEventListener("click", function () {
    alert("Month Lock");
});

document.getElementById("historyBtn").addEventListener("click", function () {
    alert("Month History");
});

document.getElementById("exportBtn").addEventListener("click", function () {
    alert("Export Excel");
});

document.getElementById("printBtn").addEventListener("click", function () {
    alert("Print Report");
});
async function loadDashboard() {

    const response = await fetch(
        "http://localhost:3000/api/production/count"
    );

    const data = await response.json();

    document.getElementById("productionCount").textContent =
        data.total;

}

loadDashboard();
async function loadTodayProduction() {

    const response = await fetch(
        "http://localhost:3000/api/production/today"
    );

    const data = await response.json();

    document.getElementById("todayProduction").textContent = data.total;

}

loadTodayProduction();
document.getElementById("saveItemBtn").addEventListener("click", async () => {

    const itemName = document.getElementById("itemName").value.trim();

    if (!itemName) {
        alert("Enter Item Name");
        return;
    }

    const res = await fetch("http://localhost:3000/api/production/items", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            item_name: itemName
        })
    });

    const data = await res.json();

    alert(data.message);

    document.getElementById("itemName").value = "";

    loadItemList();

});

async function loadItemList() {

    const res = await fetch("http://localhost:3000/api/production/items");
    const items = await res.json();

    const tbody = document.getElementById("itemListBody");
    tbody.innerHTML = "";

    items.forEach((item) => {
        tbody.innerHTML += `
        <tr>
            <td>${item.item_name}</td>
            <td>
                <button onclick="deleteItem(${item.id})">Delete</button>
            </td>
        </tr>
        `;
    });

}

async function deleteItem(id) {

    const ok = confirm("Are you sure you want to delete this item?");
    if (!ok) return;

    const res = await fetch(`http://localhost:3000/api/production/items/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();

    alert(data.message);

    loadItemList();

}

loadItemList();
document.getElementById("saveBranchBtn").addEventListener("click", async () => {

    const branchName = document.getElementById("branchName").value.trim();

    if (!branchName) {
        alert("Enter Branch Name");
        return;
    }

    const res = await fetch("http://localhost:3000/api/production/branches", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            branch_name: branchName
        })
    });

    const data = await res.json();

    alert(data.message);

    document.getElementById("branchName").value = "";

    loadBranchList();

});

async function loadBranchList() {

    const res = await fetch("http://localhost:3000/api/production/branches");
    const branches = await res.json();

    const tbody = document.getElementById("branchListBody");
    tbody.innerHTML = "";

    branches.forEach((branch) => {
        tbody.innerHTML += `
        <tr>
            <td>${branch.branch_name}</td>
            <td>
                <button onclick="deleteBranch(${branch.id})">Delete</button>
            </td>
        </tr>
        `;
    });

}

async function deleteBranch(id) {

    const ok = confirm("Are you sure you want to delete this branch?");
    if (!ok) return;

    const res = await fetch(`http://localhost:3000/api/production/branches/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();

    alert(data.message);

    loadBranchList();

}

loadBranchList();