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
      // যদি Data না থাকে
if (!data.success || !data.rows || data.rows.length === 0) {

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

waPreview.textContent = waText;
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