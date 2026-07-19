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
        "/api/production/count"
    );

    const data = await response.json();

    document.getElementById("productionCount").textContent =
        data.total;

}

loadDashboard();
async function loadTodayProduction() {

    const response = await fetch(
        "/api/production/today"
    );

    const data = await response.json();

    document.getElementById("todayproduction").textContent = data.total;

}

loadTodayProduction();
document.getElementById("saveItemBtn").addEventListener("click", async () => {

    const itemName = document.getElementById("itemName").value.trim();

    if (!itemName) {
        alert("Enter Item Name");
        return;
    }

    const res = await fetch("/api/production/items", {
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

    const res = await fetch("/api/production/items");
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

    const res = await fetch(`/api/production/items/${id}`, {
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

    const res = await fetch("/api/production/branches", {
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

    const res = await fetch("/api/production/branches");
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

    const res = await fetch(`/api/production/branches/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();

    alert(data.message);

    loadBranchList();

}


loadBranchList();
document.getElementById("saveUserBtn").addEventListener("click", async () => {

    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const role = document.getElementById("newUserRole").value;

    if (!username || !password) {
        alert("Username এবং Password দিন");
        return;
    }

    const res = await fetch("/api/production/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();

    alert(data.message);

    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";

    loadUserList();

});

async function loadUserList() {

    const res = await fetch("/api/production/users");
    const users = await res.json();

    const tbody = document.getElementById("userListBody");
    tbody.innerHTML = "";

    users.forEach((user) => {
        tbody.innerHTML += `
        <tr>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <button onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
        `;
    });

}

async function deleteUser(id) {

    const ok = confirm("এই User টি ডিলিট করতে চান?");
    if (!ok) return;

    const res = await fetch(`/api/production/users/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();

    alert(data.message);

    loadUserList();

}

loadUserList();
// Login check
const user = JSON.parse(localStorage.getItem("loggedInUser"));

if (!user) {
    window.location.href = "login.html";
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("loggedInUser");

    window.location.href = "login.html";

});