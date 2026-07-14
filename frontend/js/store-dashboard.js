// =======================================
// ERP V2 - Store Management Dashboard
// store-dashboard.js
// =======================================

// Purchase
document.getElementById("newPurchaseBtn").addEventListener("click", () => {
    window.location.href = "purchase.html";
});

// Menu Buttons
const menuButtons = document.querySelectorAll(".menu-grid button");

menuButtons[0].onclick = () => location.href = "purchase.html";
menuButtons[1].onclick = () => location.href = "purchase-history.html";
menuButtons[2].onclick = () => location.href = "stock-ledger.html";
menuButtons[3].onclick = () => location.href = "opening-stock.html";
menuButtons[4].onclick = () => location.href = "closing-stock.html";
menuButtons[5].onclick = () => location.href = "supplier-master.html";
menuButtons[6].onclick = () => location.href = "supplier-ledger.html";
menuButtons[7].onclick = () => location.href = "damage-stock.html";
menuButtons[8].onclick = () => location.href = "transfer-stock.html";
menuButtons[9].onclick = () => location.href = "store-reports.html";
menuButtons[10].onclick = () => alert("Excel Export Coming Soon");
menuButtons[11].onclick = () => window.print();