const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {

    const date = document.getElementById("productionDate").value;
   // const item = document.getElementById("item").value;
    //const qty = document.getElementById("qty").value;
    //const unit = document.getElementById("unit").value;

    //if (!date || item === "Select Item" || !qty) {
      //  alert("সব তথ্য পূরণ করুন");
      //  return;
    //}
    const rows = document.querySelectorAll("#productionRows tr");

const productionData = [];
rows.forEach(row => {

    const item = row.querySelector(".item").value;
    const qty = row.querySelector(".qty").value;
    const unit = row.querySelector(".unit").value;

    productionData.push({
        item,
        qty,
        unit
    });

});
console.log(productionData);
    try {

        const response = await fetch("http://localhost:3000/api/production/save", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
      date,
      productionData
    })

        });

        const result = await response.json();

        alert(result.message);

        document.getElementById("productionDate").value = "";
        //document.getElementById("item").selectedIndex = 0;
        //document.getElementById("qty").value = "";
       // document.getElementById("unit").selectedIndex = 0;

    } catch (err) {

        console.error(err);

        alert("Server Error");

    }

});

    const productionRows = document.getElementById("productionRows");
     let rowCount = 0;
     let itemList = [];
     async function loadItems() {
    try {
        const res = await fetch("http://localhost:3000/api/production/items");
        itemList = await res.json();

        console.log(itemList);

    } catch (err) {
        console.error("Item Load Error:", err);
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

    productionRows.appendChild(row);
    row.querySelector(".removeBtn").addEventListener("click", () => {

    row.remove();

    updateSerialNumbers();

});

}

document
    .getElementById("addRowBtn")
    .addEventListener("click", addRow);

    function updateSerialNumbers() {

    const rows = productionRows.querySelectorAll("tr");

    rows.forEach((row, index) => {
        row.querySelector(".serial").textContent = index + 1;
    });

    rowCount = rows.length;

}
loadItems().then(()=>{
    addRow();
});