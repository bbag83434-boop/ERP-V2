const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser) {
    window.location.href = "login.html";
} else {
    document.getElementById("userNameDisplay").textContent = "👤 " + loggedInUser.username;
}

document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
});