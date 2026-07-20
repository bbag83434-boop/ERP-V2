document.getElementById("saveUserBtn").addEventListener("click", async () => {

    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const role = document.getElementById("newUserRole").value;

    if (!username || !password) {
        alert("Username এবং Password দিন");
        return;
    }

    const res = await fetch("/api/production/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();

    alert(data.message);

    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";

    loadUserList();

});

async function loadUserList() {

    const res = await fetch("/api/production/users");
    const users = await res.json();

    const tbody = document.getElementById("userListBody");
    tbody.innerHTML = "";

    users.forEach((user) => {
        tbody.innerHTML += `
        <tr>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
        `;
    });

}

async function deleteUser(id) {

    const ok = confirm("এই User টি ডিলিট করতে চান?");
    if (!ok) return;

    const res = await fetch(`/api/production/users/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();

    alert(data.message);

    loadUserList();

}

loadUserList();