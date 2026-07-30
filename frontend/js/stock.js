document.addEventListener("DOMContentLoaded", () => {

    const monthInput = document.getElementById("stockMonth");

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    monthInput.value = `${year}-${month}`;

    loadStock();

});
document.getElementById("loadStockBtn").addEventListener("click", loadStock);

async function loadStock() {

    const month = document.getElementById("stockMonth").value;

    if (!month) {
        alert("মাস সিলেক্ট করুন");
        return;
    }

    try {

        const res = await fetch(`/api/production/stock/${month}`);
        const data = await res.json();

        const tbody = document.getElementById("stockTableBody");
        tbody.innerHTML = "";
                let totalOpening = 0;
                let totalProduction = 0;
                let totalTransfer = 0;
                let totalWastage = 0;
                let totalClosing = 0; 
        data.forEach(row => {

            totalOpening += Number(row.opening);
            totalProduction += Number(row.in);
            totalTransfer += Number(row.out);
            totalClosing += Number(row.closing);
            totalWastage += Number(row.wastage || 0);
    tbody.innerHTML += `  
<tr>
    <td>${row.item}</td>
    <td>${row.opening}</td>
    <td>${row.in}</td>
    <td>${row.out}</td>
    <td>${row.wastage ?? 0}</td>
    <td>${row.closing}</td>
</tr>
           `;

        });

        document.getElementById("totalOpening").textContent = totalOpening;
        document.getElementById("totalProduction").textContent = totalProduction;
        document.getElementById("totalTransfer").textContent = totalTransfer;
        document.getElementById("totalWastage").textContent = totalWastage;
        document.getElementById("totalClosing").textContent = totalClosing;

    } catch (err) {

        console.error(err);
        alert("Stock Load Failed");

    }

}
document
.getElementById("stockMonth")
.addEventListener("change", loadStock);