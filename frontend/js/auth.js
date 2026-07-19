// Login check — if no logged in user, send back to login page
const loggedInUserCheck = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUserCheck) {
    window.location.href = "login.html";
}

// Logout — works on any page that includes this script and has a button with id="logoutBtn"
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }
});