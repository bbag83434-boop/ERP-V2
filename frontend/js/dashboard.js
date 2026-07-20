document.getElementById("newMonthBtn").addEventListener("click", function () {
    const form = document.getElementById("newMonthForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
});

document.getElementById("confirmNewMonthBtn").addEventListener("click", async function () {

    const fromMonth = document.getElementById("fromMonthInput").value;
    const toMonth = document.getElementById("toMonthInput").value;

    if (!fromMonth || !toMonth) {
        alert("From এবং To মাস সিলেক্ট করুন");
        return;
    }

    const ok = confirm(`${fromMonth} এর Closing, ${toMonth} এর Opening হিসেবে সেভ হবে। নিশ্চিত?`);
    if (!ok) return;

    const res = await fetch("http://localhost:3000/api/production/create-month", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fromMonth, toMonth })
    });

    const data = await res.json();

    showToast(data.message);

    document.getElementById("newMonthForm").style.display = "none";

});

document.getElementById("lockMonthBtn").addEventListener("click", function () {
    alert("Month Lock");
});

document.getElementById("historyBtn").addEventListener("click", function () {
    alert("Month History");
});

document.getElementById("exportBtn").addEventListener("click", function () {

    const modal = new bootstrap.Modal(
        document.getElementById("exportModal")
    );

    modal.show();

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
async function loadReportBranches() {

    const res = await fetch("/api/production/branches");
    const branches = await res.json();

    const select = document.getElementById("reportBranch");

    select.innerHTML = "";

    branches.forEach(branch => {

        select.innerHTML += `
            <option value="${branch.branch_name}">
                ${branch.branch_name}
            </option>
        `;

    });

}

loadReportBranches();
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
const lockMonthBtn = document.getElementById("lockMonthBtn");

lockMonthBtn.addEventListener("click", async () => {

    const month = prompt("Lock করার মাস লিখুন (YYYY-MM)");

    if (!month) return;

    const res = await fetch("/api/production/lock-month", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ month })
    });

    const data = await res.json();

    showToast(data.message, "success");

});
const historyBtn = document.getElementById("historyBtn");

historyBtn.addEventListener("click", async () => {

    const modal = new bootstrap.Modal(
        document.getElementById("monthHistoryModal")
    );

    modal.show();

    const tbody = document.getElementById("monthHistoryTable");
    tbody.innerHTML = "";

    const res = await fetch("/api/production/locked-months");
    const months = await res.json();

    months.forEach((month, index) => {

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${month}</td>
                <td>
                    <button
                        class="btn btn-danger btn-sm"
                        onclick="unlockMonth('${month}')">
                        Unlock
                    </button>
                </td>
            </tr>
        `;

    });

});
async function unlockMonth(month) {

    if (!confirm(`${month} Unlock করতে চান?`)) return;

    const res = await fetch("/api/production/unlock-month", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ month })
    });

    const data = await res.json();

    showToast(data.message, "success");

   // document.getElementById("historyBtn").click();
   location.reload();

}
function showToast(message, type = "success") {

    const toast = document.getElementById("appToast");
    const toastMessage = document.getElementById("toastMessage");

    toast.classList.remove(
        "text-bg-success",
        "text-bg-danger",
        "text-bg-warning",
        "text-bg-info"
    );

    toast.classList.add(`text-bg-${type}`);

    toastMessage.innerText = message;

    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000
    });

    bsToast.show();
}
document.getElementById("downloadExcelBtn").addEventListener("click", function () {
   
    const selected = document.querySelector(
        'input[name="exportType"]:checked'
    ).value;

    switch (selected) {

        case "production":
            window.location.href = "/api/production/export-excel";
            break;

        case "transfer":
            window.location.href = "/api/transfer/export-excel";
            break;

        case "stock": {
    const month = new Date().toISOString().slice(0, 7);
    window.location.href = `/api/production/export-stock-excel/${month}`;
    break;
}

        case "report":

    new bootstrap.Modal(
        document.getElementById("reportModal")
    ).show();

    break;

        default:
            alert("Please select a report.");
    }

});
//document.getElementById("downloadReportBtn").addEventListener("click", () => {

    //const from = document.getElementById("reportFromDate").value;
    //const to = document.getElementById("reportToDate").value;
   // const type = document.getElementById("reportType").value;

    //if (!from || !to) {
       /// alert("Please select From Date and To Date");
       // return;
    //}

    //if (type === "production") {

        //window.location.href =
           // `/api/production/export-report-excel?from=${from}&to=${to}`;

    //} else {

       // alert(type + " Report is coming in next lesson.");

   // }

//});
document.getElementById("downloadReportBtn").addEventListener("click", () => {

    const from = document.getElementById("reportFromDate").value;
    const to = document.getElementById("reportToDate").value;
    const branch = document.getElementById("reportBranch").value;

    if (!from || !to || !branch) {
        alert("Date এবং Outlet নির্বাচন করুন");
        return;
    }

    window.location.href =
        `/api/transfer/report?from=${from}&to=${to}&branch=${encodeURIComponent(branch)}`;

});