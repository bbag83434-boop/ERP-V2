async function loadHistory() {

    const response = await fetch("http://localhost:3000/api/production/all");

    const data = await response.json();

    const searchItem = document
    .getElementById("searchItem")
    .value
    .toLowerCase();

const filteredData = data.filter(row =>
    row.item.toLowerCase().includes(searchItem)
);

    const tbody = document.getElementById("historyTableBody");

    tbody.innerHTML = "";

    filteredData.forEach((row) => {

        tbody.innerHTML += `
<tr>
    <td>${row.id}</td>
    <td>${row.date}</td>
    <td>${row.item}</td>
    <td>${row.qty}</td>
    <td>${row.unit}</td>

    <td>
        <button onclick="deleteProduction(${row.id})">
            Delete
        </button>
        <button onclick="editProduction(${row.id})">
    Edit
</button>
    </td>

</tr>
`;

    });

}

loadHistory();
async function deleteProduction(id) {

    const ok = confirm("Are you sure?");

    if (!ok) return;

    const response = await fetch(
        `http://localhost:3000/api/production/delete/${id}`,
        {
            method: "DELETE"
        }
    );

    const result = await response.json();

    alert(result.message);

    loadHistory();

}
async function editProduction(id) {

    const item = prompt("Enter Item Name");

    const qty = prompt("Enter Quantity");

    const unit = prompt("Enter Unit (PCS/KG)");

    if (!item || !qty || !unit) return;

    const response = await fetch(
        `http://localhost:3000/api/production/update/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                item,
                qty,
                unit
            })
        }
    );

    const result = await response.json();

    alert(result.message);

    loadHistory();

}
async function searchByDate() {

    const date = document.getElementById("searchDate").value;
    const searchItem = document
        .getElementById("searchItem")
        .value
        .toLowerCase();

    if (!date) {
        alert("Select Date");
        return;
    }

    const response = await fetch(
        `http://localhost:3000/api/production/date/${date}`
    );

    let data = await response.json();

    // Item name দিয়ে filter করা হচ্ছে
    if (searchItem) {
        data = data.filter(row =>
            row.item.toLowerCase().includes(searchItem)
        );
    }

    document.getElementById("totalRecords").textContent = data.length;
    const tbody = document.getElementById("historyTableBody");

    tbody.innerHTML = "";

    data.forEach((row) => {

        tbody.innerHTML += `
        <tr>
            <td>${row.id}</td>
            <td>${row.date}</td>
            <td>${row.item}</td>
            <td>${row.qty}</td>
            <td>${row.unit}</td>
            <td>
                <button onclick="deleteProduction(${row.id})">Delete</button>
                <button onclick="editProduction(${row.id})">Edit</button>
            </td>
        </tr>
        `;

    });

}