// ======================================
// Purchase Entry
// ======================================

const tableBody = document.getElementById("purchase_items");

document
.getElementById("addRowBtn")
.addEventListener("click", addRow);

// প্রথম Row
addRow();
loadSuppliers();
loadItems();
loadBranches();
function addRow() {

    const row = document.createElement("tr");

    row.innerHTML = `

        <td>

            <select class="item">

                <option value="">Select Item</option>

            </select>

        </td>

        <td>

            <input
            type="number"
            class="qty"
            value="0">

        </td>

        <td>

            <input
            type="text"
            class="unit"
            readonly>

        </td>

        <td>

            <input
            type="number"
            class="rate"
            value="0">

        </td>

        <td>

            <input
            type="number"
            class="gst"
            value="0">

        </td>

        <td>

            <input
            type="number"
            class="amount"
            readonly>

        </td>

        <td>

            <button
            class="deleteRow">

            Delete

            </button>

        </td>

    `;

    tableBody.appendChild(row);
    loadItems();
    const itemSelect = row.querySelector(".item");

itemSelect.addEventListener("change", () => {

    const option = itemSelect.options[itemSelect.selectedIndex];

    row.querySelector(".unit").value =
        option.dataset.unit || "";

    row.querySelector(".rate").value =
        option.dataset.rate || 0;

    row.querySelector(".gst").value =
        option.dataset.gst || 0;

    calculateRow({
        target: row.querySelector(".qty")
    });

});

    row
    .querySelector(".deleteRow")
    .addEventListener("click", () => {

        row.remove();

        calculateTotal();

    });

    row
    .querySelector(".qty")
    .addEventListener("input", calculateRow);

    row
    .querySelector(".rate")
    .addEventListener("input", calculateRow);

    row
    .querySelector(".gst")
    .addEventListener("input", calculateRow);

}
function calculateRow(e){

    const row =
    e.target.closest("tr");

    const qty =
    Number(row.querySelector(".qty").value);

    const rate =
    Number(row.querySelector(".rate").value);

    const gst =
    Number(row.querySelector(".gst").value);

    const basic = qty * rate;

    const gstAmount =
    basic * gst / 100;

    row.querySelector(".amount").value =
    (basic + gstAmount).toFixed(2);

    calculateTotal();

}
function calculateTotal(){

    let total = 0;

    document
    .querySelectorAll(".amount")
    .forEach(input=>{

        total += Number(input.value);

    });

    document.getElementById("grand_Total")
    .innerText = total.toFixed(2);

}
async function loadSuppliers() {

    const res =
    await fetch("/api/purchase/suppliers");

    const suppliers =
    await res.json();

    const supplier =
    document.getElementById("supplier");

    supplier.innerHTML =
    `<option value="">Select Supplier</option>`;

    suppliers.forEach(row => {

        supplier.innerHTML += `

        <option
            value="${row.id}"
            data-gst="${row.gstin}"
            data-mobile="${row.mobile}"
            data-address="${row.address}">

            ${row.supplier_name}

        </option>

        `;

    });

}
async function loadItems() {

    const res = await fetch("/api/store-items");

    const result = await res.json();

    const selects = document.querySelectorAll(".item");

    selects.forEach(select => {

        select.innerHTML = `<option value="">Select Item</option>`;

        result.data.forEach(item => {

            select.innerHTML += `
                <option
                    value="${item.id}"
                    data-unit="${item.unit}"
                    data-rate="${item.purchase_rate}"
                    data-gst="${item.gst}">
                    ${item.item_name}
                </option>
            `;

        });

    });

}
async function loadBranches() {
    try {
        const res = await fetch("/api/production/branches");
        const branches = await res.json();

        const branchSelect = document.getElementById("branch");

        branchSelect.innerHTML = `<option value="">Select Branch</option>`;

        branches.forEach((b) => {
            branchSelect.innerHTML += `
                <option value="${b.branch_name}">
                    ${b.branch_name}
                </option>
            `;
        });

    } catch (err) {
        console.error("Branch Load Error:", err);
    }
}
async function savePurchase() {

    const res = await fetch("/api/purchase/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            test: true
        })
    });

    const result = await res.json();

    alert(result.message);

}
document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    loadBranches();
});