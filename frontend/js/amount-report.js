// =========================================
// Chef Bisu Amount Report
// =========================================

// Tabs
const newTab = document.getElementById("newTab");
const reportTab = document.getElementById("reportTab");
const whatsappTab = document.getElementById("whatsappTab");

// Screens
const newScreen = document.getElementById("newScreen");
const reportScreen = document.getElementById("reportScreen");
const whatsappScreen = document.getElementById("whatsappScreen");

// Buttons
const generateBtn = document.getElementById("generateBtn");
const backBtn = document.getElementById("backBtn");

// Inputs
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const branch = document.getElementById("branch");

// Output
const reportContainer = document.getElementById("reportContainer");
const waPreview = document.getElementById("waPreview");

// ===============================
// Back Button
// ===============================

backBtn.addEventListener("click", () => {

    window.location.href = "dashboard.html";

});

// ===============================
// Today's Date
// ===============================

const today = new Date().toISOString().split("T")[0];

fromDate.value = today;
toDate.value = today;

// ===============================
// Tabs
// ===============================

function showScreen(screen){

    newScreen.style.display = "none";
    reportScreen.style.display = "none";
    whatsappScreen.style.display = "none";

    newTab.classList.remove("active");
    reportTab.classList.remove("active");
    whatsappTab.classList.remove("active");

    screen.style.display = "block";

}

newTab.onclick = ()=>{

    showScreen(newScreen);

    newTab.classList.add("active");

};

reportTab.onclick = ()=>{

    showScreen(reportScreen);

    reportTab.classList.add("active");

};

whatsappTab.onclick = ()=>{

    showScreen(whatsappScreen);

    whatsappTab.classList.add("active");

};

// প্রথমে New Screen
showScreen(newScreen);
newTab.classList.add("active");
// =========================================
// Load Outlet
// =========================================

async function loadBranches(){

    try{

        const res = await fetch("/api/production/branches");

        const data = await res.json();

        branch.innerHTML = `
            <option value="All">
                All Outlet
            </option>
        `;

        data.forEach(row=>{

            branch.innerHTML += `
                <option value="${row.branch_name}">
                    ${row.branch_name}
                </option>
            `;

        });

    }catch(err){

        console.error(err);

    }

}

loadBranches();

function escapeReportHtml(value) {

    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;

}

function formatReportAmount(value) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(value) || 0);

}

function getStockAmount(row, key) {

    return (Number(row[key]) || 0) * (Number(row.rate) || 0);

}

function renderEnhancedAmountReport(data, from, to) {

    const transferRows = data.rows || [];
    const productionRows = data.production_rows || [];
    const stockRows = data.stock_rows || [];

    let transferGrandTotal = 0;
    const groupedTransfers = transferRows.reduce((groups, row) => {

        if (!groups[row.branch]) groups[row.branch] = [];
        groups[row.branch].push(row);
        return groups;

    }, {});

    const transferHtml = Object.keys(groupedTransfers).length === 0
        ? `<div class="card mb-3"><div class="card-body text-center text-secondary py-4">No transfer data found for this date range.</div></div>`
        : Object.entries(groupedTransfers).map(([outlet, rows]) => {

            const outletTotal = rows.reduce((total, row) => total + (Number(row.amount) || 0), 0);
            transferGrandTotal += outletTotal;

            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="text-warning mb-3"><i class="bi bi-building me-2"></i>${escapeReportHtml(outlet)}</h5>
                        <div class="table-responsive">
                            <table class="table table-dark table-borderless align-middle mb-2">
                                <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                                <tbody>${rows.map((row) => `
                                    <tr>
                                        <td>${escapeReportHtml(row.item)}</td>
                                        <td>${Number(row.qty) || 0} ${escapeReportHtml(row.unit)}</td>
                                        <td>${formatReportAmount(row.rate)}</td>
                                        <td class="text-warning">${formatReportAmount(row.amount)}</td>
                                    </tr>
                                `).join("")}</tbody>
                            </table>
                        </div>
                        <div class="d-flex justify-content-between border-top pt-3"><strong>Outlet Total</strong><strong class="text-warning">${formatReportAmount(outletTotal)}</strong></div>
                    </div>
                </div>
            `;

        }).join("");

    const productionTotal = productionRows.reduce((total, row) => total + (Number(row.amount) || 0), 0);
    const productionHtml = productionRows.length === 0
        ? `<div class="card"><div class="card-body text-center text-secondary py-4">No production data found for this date range.</div></div>`
        : `
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-dark table-borderless align-middle mb-2">
                            <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                            <tbody>${productionRows.map((row) => `
                                <tr>
                                    <td>${escapeReportHtml(row.item)}</td>
                                    <td>${Number(row.qty) || 0} ${escapeReportHtml(row.unit)}</td>
                                    <td>${formatReportAmount(row.rate)}</td>
                                    <td class="text-warning">${formatReportAmount(row.amount)}</td>
                                </tr>
                            `).join("")}</tbody>
                        </table>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-3"><strong>Production Total</strong><strong class="text-warning">${formatReportAmount(productionTotal)}</strong></div>
                </div>
            </div>
        `;

    const stockHtml = stockRows.length === 0
        ? `<div class="card"><div class="card-body text-center text-secondary py-4">No stock movement found for this date range.</div></div>`
        : stockRows.map((row) => {

            const unit = escapeReportHtml(row.unit || "PCS");
            const metrics = [
                ["Opening", "opening_qty"],
                ["Production In", "production_qty"],
                ["Transfer Out", "transfer_qty"],
                ["Wastage", "wastage_qty"],
                ["Closing", "closing_qty"]
            ];

            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="mb-0">${escapeReportHtml(row.item)}</h6>
                            <small class="text-secondary">Rate: ${formatReportAmount(row.rate)}</small>
                        </div>
                        <div class="row g-2">
                            ${metrics.map(([label, key]) => `
                                <div class="col-6">
                                    <div class="border rounded-3 p-2 h-100">
                                        <small class="text-secondary d-block">${label}</small>
                                        <strong>${Number(row[key]) || 0} ${unit}</strong>
                                        <small class="text-warning d-block mt-1">${formatReportAmount(getStockAmount(row, key))}</small>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            `;

        }).join("");

    reportContainer.innerHTML = `
        <div class="mb-4"><h4 class="text-warning mb-3"><i class="bi bi-arrow-left-right me-2"></i>Transfer Report</h4>${transferHtml}<div class="card"><div class="card-body d-flex justify-content-between"><strong>Transfer Grand Total</strong><strong class="text-warning">${formatReportAmount(transferGrandTotal)}</strong></div></div></div>
        <div class="mb-4"><h4 class="text-warning mb-3"><i class="bi bi-building-gear me-2"></i>Production Report</h4>${productionHtml}</div>
        <div><h4 class="text-warning mb-3"><i class="bi bi-box-seam me-2"></i>Stock Report</h4><p class="text-secondary small">Opening for ${from.slice(0, 7)} · Movement from ${from} to ${to}</p>${stockHtml}</div>
    `;

    let whatsappText = `*CHEF BISU AMOUNT REPORT*\nDate: ${from} to ${to}\n\n*TRANSFER REPORT*\n`;

    if (Object.keys(groupedTransfers).length === 0) {
        whatsappText += "No transfer data found.\n";
    } else {
        Object.entries(groupedTransfers).forEach(([outlet, rows]) => {
            const outletTotal = rows.reduce((total, row) => total + (Number(row.amount) || 0), 0);
            whatsappText += `\n*${outlet}*\n`;
            rows.forEach((row) => {
                whatsappText += `- ${row.item}: ${row.qty} ${row.unit} x ${formatReportAmount(row.rate)} = ${formatReportAmount(row.amount)}\n`;
            });
            whatsappText += `Outlet Total: ${formatReportAmount(outletTotal)}\n`;
        });
        whatsappText += `\n*Transfer Grand Total: ${formatReportAmount(transferGrandTotal)}*\n`;
    }

    whatsappText += "\n*PRODUCTION REPORT*\n";
    if (productionRows.length === 0) {
        whatsappText += "No production data found.\n";
    } else {
        productionRows.forEach((row) => {
            whatsappText += `- ${row.item}: ${row.qty} ${row.unit} x ${formatReportAmount(row.rate)} = ${formatReportAmount(row.amount)}\n`;
        });
        whatsappText += `*Production Total: ${formatReportAmount(productionTotal)}*\n`;
    }

    whatsappText += "\n*STOCK REPORT*\n";
    if (stockRows.length === 0) {
        whatsappText += "No stock movement found.\n";
    } else {
        stockRows.forEach((row) => {
            const unit = row.unit || "PCS";
            whatsappText += `\n*${row.item}*\n`;
            whatsappText += `Opening: ${row.opening_qty} ${unit} (${formatReportAmount(getStockAmount(row, "opening_qty"))})\n`;
            whatsappText += `Production In: ${row.production_qty} ${unit} (${formatReportAmount(getStockAmount(row, "production_qty"))})\n`;
            whatsappText += `Transfer Out: ${row.transfer_qty} ${unit} (${formatReportAmount(getStockAmount(row, "transfer_qty"))})\n`;
            whatsappText += `Wastage: ${row.wastage_qty} ${unit} (${formatReportAmount(getStockAmount(row, "wastage_qty"))})\n`;
            whatsappText += `Closing: ${row.closing_qty} ${unit} (${formatReportAmount(getStockAmount(row, "closing_qty"))})\n`;
        });
    }

    waPreview.textContent = whatsappText;

}


// =========================================
// Generate Report
// =========================================

generateBtn.addEventListener("click",async()=>{

    const from = fromDate.value;
    const to = toDate.value;
    const outlet = branch.value;

    if(!from || !to){

        alert("Select Date");

        return;

    }

    reportTab.click();

    reportContainer.innerHTML=`

        <div class="text-center py-5">

            <div class="spinner-border text-warning"></div>

            <p class="mt-3 text-secondary">

                Loading Report...

            </p>

        </div>

    `;

    try{

        const res = await fetch(

            `/api/amount-report?from=${from}&to=${to}&branch=${outlet}`

        );

        const data = await res.json();

        console.log(data);
        data.rows = data.rows || [];
        data.production_rows = data.production_rows || [];
        data.stock_rows = data.stock_rows || [];
      // যদি Data না থাকে
if (!data.success || (data.rows.length === 0 && data.production_rows.length === 0 && data.stock_rows.length === 0)) {

    reportContainer.innerHTML = `

        <div class="card">

            <div class="card-body text-center py-5">

                <i class="bi bi-inbox fs-1 text-secondary"></i>

                <h5 class="mt-3">

                    No Data Found

                </h5>

            </div>

        </div>

    `;

    return;

}

// Report Render
let html = "";

let currentBranch = "";
let outletTotal = 0;
let grandTotal = 0;

data.rows.forEach(row => {

    if (currentBranch !== row.branch) {

    if (currentBranch !== "") {

        html += `

                </tbody>

            </table>

            <hr>

            <div class="d-flex justify-content-between">

                <strong>Outlet Total</strong>

                <strong class="text-warning">

                    ₹${outletTotal.toFixed(2)}

                </strong>

            </div>

        </div>

    </div>

        `;

        outletTotal = 0;

    }

    currentBranch = row.branch;

    html += `

        <div class="card mb-3">

            <div class="card-body">

                <h5 class="text-warning mb-3">

                    🏪 ${row.branch}

                </h5>

                <table class="table table-dark table-borderless">

                    <thead>

                        <tr>

                            <th>Item</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>

                        </tr>

                    </thead>

                    <tbody>

    `;

}
    const amount = Number(row.amount);

grandTotal += amount;

outletTotal += amount;

    html += `

        <tr>

            <td>${row.item}</td>

           <td>${parseFloat(row.qty)} ${row.unit}</td>

           <td>₹${Number(row.rate).toFixed(2)}</td>

           <td>₹${Number(row.amount).toFixed(2)}</td>

        </tr>

    `;

});

html += `

        </tbody>

    </table>

    <hr>

    <div class="d-flex justify-content-between">

        <strong>Outlet Total</strong>

        <strong class="text-warning">

            ₹${outletTotal.toFixed(2)}

        </strong>

    </div>

</div>

</div>

<hr class="my-4">

<div class="card">

    <div class="card-body">

        <div class="d-flex justify-content-between">

            <h4>Grand Total</h4>

            <h4 class="text-warning">

                ₹${grandTotal.toFixed(2)}

            </h4>

        </div>

    </div>

</div>

`;

reportContainer.innerHTML = html;
// =========================================
// WhatsApp Preview
// =========================================

let waText = `📊 *CHEF BISU AMOUNT REPORT*\n`;
waText += `📅 ${from} To ${to}\n\n`;

let waBranch = "";
let waTotal = 0;

data.rows.forEach(row => {

    if (waBranch !== row.branch) {

        if (waBranch !== "") {

            waText += `\n💰 Outlet Total : ₹${waTotal.toFixed(2)}\n\n`;

            waTotal = 0;

        }

        waBranch = row.branch;

        waText += `🏪 *${row.branch}*\n`;

    }

    waText += `• ${row.item}\n`;
    waText += `  ${row.qty} ${row.unit} × ₹${row.rate} = ₹${Number(row.amount).toFixed(2)}\n`;

    waTotal += Number(row.amount);

});

waText += `\n💰 Outlet Total : ₹${waTotal.toFixed(2)}\n`;
waText += `\n━━━━━━━━━━━━━━\n`;
waText += `💵 *Grand Total : ₹${grandTotal.toFixed(2)}*`;

renderEnhancedAmountReport(data, from, to);
    }catch(err){

        console.error(err);

    }

});
document.getElementById("sendWhatsappBtn").addEventListener("click", () => {

    const message = waPreview.textContent;

    if (!message.trim()) {

        alert("Generate report first");

        return;

    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");

});
