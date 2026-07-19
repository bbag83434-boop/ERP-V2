async function loadEditRequests() {

    const response = await fetch(
        "http://localhost:3000/api/production/edit-requests"
    );

    const data = await response.json();

    const tbody = document.getElementById("requestTable");

    tbody.innerHTML = "";

    data.forEach((row) => {

        tbody.innerHTML += `
        <tr>
            <td>${row.id}</td>
            <td>${row.production_id}</td>
            <td>${row.requested_by}</td>
            <td>${row.status}</td>
            <td>${row.created_at}</td>
            <td>
    <button onclick="approveRequest(${row.id})">
        Approve
    </button>

    <button onclick="rejectRequest(${row.id})">
        Reject
    </button>
</td>
        </tr>
        `;

    });

}

loadEditRequests();
async function approveRequest(id) {

    const response = await fetch(
        `http://localhost:3000/api/production/approve-request/${id}`,
        {
            method: "PUT"
        }
    );

    const result = await response.json();

    alert(result.message);

    loadEditRequests();

}