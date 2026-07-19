// Branch dropdown লোড করা
async function loadBranches() {
    const res = await fetch("/api/production/branches");
    const branches = await res.json();

    const branchSelect = document.getElementById("transBranch");
    branches.forEach((b) => {
        branchSelect.innerHTML += `<option value="${b.branch_name}">${b.branch_name}</option>`;
    });
}
loadBranches();

// Production Report
document.getElementById("prodReportBtn").addEventListener("click", async () => {

    const from = document.getElementById("prodFrom").value;
    const to = document.getElementById("prodTo").value;

    if (!from || !to) {
        alert("From এবং To তারিখ দিন");
        return;
    }

    const res = await fetch(`/api/production/report?from=${from}&to=${to}`);
    const data = await res.json();

    const tbody = document.getElementById("prodReportBody");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3">কোনো ডেটা পাওয়া যায়নি</td></tr>`;
        return;
    }

    data.forEach((row) => {
        tbody.innerHTML += `
        <tr>
            <td>${row.item}</td>
            <td>${row.total_qty}</td>
            <td>${row.unit}</td>
        </tr>
        `;
    });

});

// Transfer Report
document.getElementById("transReportBtn").addEventListener("click", async () => {

    const from = document.getElementById("transFrom").value;
    const to = document.getElementById("transTo").value;
    const branch = document.getElementById("transBranch").value;

    if (!from || !to) {
        alert("From এবং To তারিখ দিন");
        return;
    }

    const res = await fetch(`/api/transfer/report?from=${from}&to=${to}&branch=${branch}`);
    const data = await res.json();

    const tbody = document.getElementById("transReportBody");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">কোনো ডেটা পাওয়া যায়নি</td></tr>`;
        return;
    }

    data.forEach((row) => {
        tbody.innerHTML += `
        <tr>
            <td>${row.branch}</td>
            <td>${row.item}</td>
            <td>${row.total_qty}</td>
            <td>${row.unit}</td>
        </tr>
        `;
    });

});