// ===============================
// Chef Bisu Reports
// ===============================

const reportFrom = document.getElementById("reportFrom");
const reportTo = document.getElementById("reportTo");
const reportBranch = document.getElementById("reportBranch");
const showReportBtn = document.getElementById("showReportBtn");

// Summary Cards
const totalProduction = document.getElementById("totalProduction");
const totalTransfer = document.getElementById("totalTransfer");
const totalStock = document.getElementById("totalStock");
const totalWaste = document.getElementById("totalWaste");

// Tables
const prodReportBody = document.getElementById("prodReportBody");
const transReportBody = document.getElementById("transReportBody");
const wastageBody = document.getElementById("wastageBody");

// Loading States
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
let productionChartInstance = null;
async function loadBranches() {

    try {

        const res = await fetch("/api/production/branches");
        const branches = await res.json();

        reportBranch.innerHTML =
            `<option value="All">All Branches</option>`;

        branches.forEach(branch => {

            reportBranch.innerHTML += `
                <option value="${branch.branch_name}">
                    ${branch.branch_name}
                </option>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}

loadBranches();
// ======================================
// Generate Report
// ======================================

showReportBtn.addEventListener("click", showReport);

async function showReport() {

    const from = reportFrom.value;
    const to = reportTo.value;
    const branch = reportBranch.value;

    if (!from || !to) {

        alert("From এবং To Date নির্বাচন করুন");
        return;

    }

    loadingState.classList.remove("d-none");
    emptyState.classList.add("d-none");
    errorState.classList.add("d-none");

    try {

        await Promise.all([

            loadProduction(from, to),
            loadTransfer(from, to, branch),
            loadStock(from),
            loadWastage(from, to)

        ]);

    } catch (err) {

        console.error(err);

        errorState.classList.remove("d-none");

    } finally {

        loadingState.classList.add("d-none");

    }

}
// ======================================
// Load Production Report
// ======================================

async function loadProduction(from, to) {

    const res = await fetch(
        `/api/production/report?from=${from}&to=${to}`
    );

    const data = await res.json();

    prodReportBody.innerHTML = "";

    let grandTotal = 0;

    if (data.length === 0) {

        prodReportBody.innerHTML = `
            <tr>
                <td colspan="3"
                    class="text-center py-4">

                    No Production Data

                </td>
            </tr>
        `;

        totalProduction.textContent = 0;
        renderProductionChart(data);

        return;

    }

    data.forEach(row => {

        grandTotal += Number(row.total_qty);

        prodReportBody.innerHTML += `
            <tr>

                <td>${row.item}</td>

                <td class="text-center">

                    ${row.total_qty}

                </td>

                <td class="text-center">

                    ${row.unit}

                </td>

            </tr>
        `;

    });

    totalProduction.textContent = grandTotal;
    renderProductionChart(data);

}
// ======================================
// Load Transfer Report
// ======================================

async function loadTransfer(from, to, branch) {

    const res = await fetch(
        `/api/transfer/search-json?from=${from}&to=${to}&branch=${branch}`
    );

    const data = await res.json();

    transReportBody.innerHTML = "";

    let grandTotal = 0;

    if (data.length === 0) {

        transReportBody.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center py-4">

                    No Transfer Data

                </td>
            </tr>
        `;

        totalTransfer.textContent = 0;

        return;

    }

    data.forEach(row => {

        grandTotal += Number(row.total_qty);

        transReportBody.innerHTML += `
            <tr>

                <td>${row.branch}</td>

                <td>${row.item}</td>

                <td class="text-center">

                    ${row.total_qty}

                </td>

                <td class="text-center">

                    ${row.unit}

                </td>

            </tr>
        `;

    });

    totalTransfer.textContent = grandTotal;

}
// ======================================
// Load Stock Summary
// ======================================

async function loadStock(from) {

    // YYYY-MM বের করা
    const month = from.substring(0, 7);

    const res = await fetch(
        `/api/production/stock/${month}`
    );

    const data = await res.json();

    let opening = 0;
    let stockIn = 0;
    let stockOut = 0;
    let closing = 0;

    data.forEach(row => {

        opening += Number(row.opening);
        stockIn += Number(row.in);
        stockOut += Number(row.out);
        closing += Number(row.closing);

    });

    document.getElementById("openingStock").textContent = opening;

    document.getElementById("stockIn").textContent = stockIn;

    document.getElementById("stockOut").textContent = stockOut;

    document.getElementById("currentStock").textContent = closing;

    // Top Summary Card
    totalStock.textContent = closing;

}
// ======================================
// Load Wastage Report
// ======================================

async function loadWastage(from, to) {

    const res = await fetch(
        `/api/wastage/report?from=${from}&to=${to}`
    );

    const data = await res.json();

    wastageBody.innerHTML = "";

    let grandTotal = 0;

    if (data.length === 0) {

        wastageBody.innerHTML = `
            <tr>
                <td colspan="3"
                    class="text-center py-4">

                    No Wastage Data

                </td>
            </tr>
        `;

        totalWaste.textContent = 0;

        return;

    }

    data.forEach(row => {

        grandTotal += Number(row.total_qty);

        wastageBody.innerHTML += `
            <tr>

                <td>${row.item}</td>

                <td class="text-center">

                    ${row.total_qty}

                </td>

                <td class="text-center">

                    ${row.unit}

                </td>

            </tr>
        `;

    });

    totalWaste.textContent = grandTotal;

}
// ======================================
// Auto Load Today's Report
// ======================================

window.addEventListener("DOMContentLoaded", () => {

    const today = new Date().toISOString().split("T")[0];

    reportFrom.value = today;
    reportTo.value = today;

    showReport();

});
// ======================================
// Refresh Report
// ======================================

document
.getElementById("refreshBtn")
.addEventListener("click", () => {

    showReport();

});
// ======================================
// Retry
// ======================================

document
.getElementById("retryBtn")
.addEventListener("click", () => {

    showReport();

});
const hasData =
    prodReportBody.children.length > 0 ||
    transReportBody.children.length > 0 ||
    wastageBody.children.length > 0;

if (!hasData) {

    emptyState.classList.remove("d-none");

} else {

    emptyState.classList.add("d-none");

}
// ======================================
// Export Excel
// ======================================

document
    .getElementById("exportExcelBtn")
    .addEventListener("click", () => {

        const from = reportFrom.value;
        const to = reportTo.value;

        if (!from || !to) {

            alert("From এবং To Date নির্বাচন করুন");
            return;

        }

        window.location.href =
            `/api/production/export-report-excel?from=${from}&to=${to}`;

    });
    // ======================================
// Production Chart
// ======================================

function renderProductionChart(data) {

    console.log(data);

}