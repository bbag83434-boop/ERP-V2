const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser) {
    window.location.href = "login.html";
}
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
${row.request_status === "Approved"
? `<button onclick="editProduction(${row.id})">Edit</button>`
: row.request_status === "Pending"
? `<button disabled>Pending</button>`
: `<button onclick="requestEdit(${row.id})">Request Edit</button>`
}
</td>

</tr>
`;

    });

}

loadHistory();
async function requestEdit(id) {

    const response = await fetch(
        "http://localhost:3000/api/production/request-edit",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                production_id: id,
                requested_by: loggedInUser.username
            })
        }
    );

    const result = await response.json();

    alert(result.message);

}
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
${loggedInUser.role.toLowerCase() === "admin"
? `
<button onclick="editProduction(${row.id})">Edit</button>
<button onclick="deleteProduction(${row.id})">Delete</button>
`
: `
<button onclick="requestEdit(${row.id})">Request Edit</button>
`
}
</td>
        </tr>
        `;

    });

}