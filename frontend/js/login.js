const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {

    localStorage.setItem("loggedInUser", JSON.stringify(result.user));
console.log(result.user);
console.log(result.user.role);
    if (result.user.role === "admin") {
        window.location.href = "/pages/dashboard.html";
    } else {
        window.location.href = "/pages/user-dashboard.html";
    }

} else {
            alert(result.message);

        }

    } catch (err) {
        console.error(err);
        alert("Server Error");
    }

});