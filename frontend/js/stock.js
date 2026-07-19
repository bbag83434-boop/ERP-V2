document.getElementById("loadStockBtn").addEventListener("click", loadStock);

async function loadStock() {

    const month = document.getElementById("stockMonth").value;

    if (!month) {
        alert("মাস সিলেক্ট করুন");
        return;
    }

    const res = await fetch(`/api/production/stock/${month}`);
    const data = await res.json();

    const tbody = document.getElementById("stockTableBody");
    tbody.innerHTML = "";

    data.forEach((row) => {
        tbody.innerHTML += `
        <tr>
            <td>${row.item}</td>
            <td>${row.opening}</td>
            <td>${row.in}</td>
            <td>${row.out}</td>
            <td>${row.closing}</td>
        </tr>
        `;
    });

}