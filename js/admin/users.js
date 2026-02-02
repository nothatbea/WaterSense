const modal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");
const addUserBtn = document.getElementById("addUserBtn");

addUserBtn.addEventListener("click", () => {
    currentUserId = null;
    document.getElementById("modalTitle").textContent = "Add User";
    userForm.reset();
    document.getElementById("passwordSection").style.display = "none";
    modal.classList.add("active");
});

let currentUserId = null;

async function loadStaffUsers() {
    const res = await fetch("../../api/users/list.php");
    const users = await res.json();

    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    users.forEach(user => {
        const roleLabel = user.role === "admin" ? "Admin" : "LGU Staff";

        tbody.insertAdjacentHTML("beforeend", `
            <tr>
                <td class="px-4 py-4">
                    <div class="flex gap-3">
                        <div class="user-avatar">${user.name[0]}</div>
                        <p class="font-medium">${user.name}</p>
                    </div>
                </td>
                <td class="px-4 py-4">${user.email}</td>
                <td class="px-4 py-4"><span class="role-badge">${roleLabel}</span></td>
                <td class="px-4 py-4">
                    <span class="status-badge status-${user.status}">
                        ${user.status}
                    </span>
                </td>
                <td class="px-4 py-4 flex gap-2">
                    <button class="action-btn edit-user" data-id="${user.id}">✏️</button>
                    <button class="action-btn delete-user" data-id="${user.id}">🗑️</button>
                </td>
            </tr>
        `);
    });

    document.getElementById("userCount").textContent = users.length;
    document.getElementById("totalUsers").textContent = users.length;
}

/* ==========================
EDIT USER
========================== */
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-user")) {
        currentUserId = e.target.dataset.id;

        const res = await fetch(`../../api/users/read.php?id=${currentUserId}`);
        const user = await res.json();

        document.getElementById("modalTitle").textContent = "Edit User";
        document.getElementById("fullName").value = user.name;
        document.getElementById("username").value = user.username;
        document.getElementById("email").value = user.email;
        document.getElementById("role").value = user.role;
        document.getElementById("status").value = user.status;

        document.getElementById("passwordSection").style.display = "none";
        modal.classList.add("active");
    }
});


/* ==========================
SAVE EDIT
========================== */
userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        id: currentUserId,
        name: document.getElementById("fullName").value.trim(),
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        role: document.getElementById("role").value,
        status: document.getElementById("status").value
    };

    const url = currentUserId
        ? "../../api/users/update.php"
        : "../../api/users/create.php";

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    modal.classList.remove("active");
    userForm.reset();
    currentUserId = null;
    loadStaffUsers();
});



document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-user")) {
        const id = e.target.dataset.id;

        if (!confirm("Are you sure you want to delete this user?")) return;

        const formData = new FormData();
        formData.append("id", id);

        await fetch("../../api/users/delete.php", {
            method: "POST",
            body: formData
        });

        loadStaffUsers();
    }
});

/* ==========================
MODAL CONTROLS
========================== */
document.getElementById("closeModal").onclick =
document.getElementById("cancelBtn").onclick = () => {
    modal.classList.remove("active");
    userForm.reset();
    currentUserId = null;
};

document.addEventListener("DOMContentLoaded", loadStaffUsers);


