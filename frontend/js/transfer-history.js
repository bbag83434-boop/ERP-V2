async function loadHistory() {

    const response = await fetch("/api/transfer/all");
    const data = await response.json();

    const tbody = document.getElementById("historyTableBody");
    tbody.innerHTML = "";

    data.forEach((row) => {

        tbody.innerHTML += `
<tr>
    <td>${row.id}</td>
    <td>${row.date}</td>
    <td>${row.branch}</td>
    <td>${row.item}</td>
    <td>${row.qty}</td>
    <td>${row.unit}</td>
    <td>
        <button onclick="deleteTransfer(${row.id})">Delete</button>
        <button onclick="editTransfer(${row.id})">Edit</button>
    </td>
</tr>
`;

    });

}

loadHistory();

async function deleteTransfer(id) {

    const ok = confirm("Are you sure?");
    if (!ok) return;

    const response = await fetch(
        `/api/transfer/delete/${id}`,
        { method: "DELETE" }
    );

    const result = await response.json();

    alert(result.message);

    loadHistory();

}

async function editTransfer(id) {

    const branch = prompt("Enter Branch Name");
    const item = prompt("Enter Item Name");
    const qty = prompt("Enter Quantity");
    const unit = prompt("Enter Unit (PCS/KG)");

    if (!branch || !item || !qty || !unit) return;

    const response = await fetch(
        `/api/transfer/update/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ branch, item, qty, unit })
        }
    );

    const result = await response.json();

    alert(result.message);

    loadHistory();

}