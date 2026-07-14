document.addEventListener("DOMContentLoaded", async () => {

    const canvas = document.getElementById("productionChart");

    if (!canvas) return;

    const response = await fetch("http://localhost:3000/api/production/chart");

    const rows = await response.json();

    const labels = rows.map(row => row.date);

    const data = rows.map(row => row.total);

    new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Production",
                data: data,
                borderWidth: 3,
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

});