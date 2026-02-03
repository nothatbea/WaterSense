document.addEventListener('DOMContentLoaded', () => {
    /* =============================
       CONSTANTS & DOM ELEMENTS
    ============================= */
    const API_BASE_URL = 'https://steelblue-skunk-833121.hostingersite.com/api/users';
    
    const modal = document.getElementById("userModal");
    const userForm = document.getElementById("userForm");
    const addUserBtn = document.getElementById("addUserBtn");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");
    
    let currentUserId = null;

    /* =============================
       API FUNCTIONS
    ============================= */
    async function loadStaffUsers() {
        try {
            const res = await fetch(`${API_BASE_URL}/list.php`);
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
        } catch (err) {
            console.error("Failed to load users:", err);
        }
    }

    async function loadUserData(userId) {
        try {
            const res = await fetch(`${API_BASE_URL}/read.php?id=${userId}`);
            const user = await res.json();

            document.getElementById("modalTitle").textContent = "Edit User";
            document.getElementById("fullName").value = user.name;
            document.getElementById("username").value = user.username;
            document.getElementById("email").value = user.email;
            document.getElementById("role").value = user.role;
            document.getElementById("status").value = user.status;

            document.getElementById("passwordSection").style.display = "none";
            modal.classList.add("active");
        } catch (err) {
            console.error("Failed to load user data:", err);
        }
    }

    async function saveUser(payload) {
        try {
            const url = currentUserId
                ? `${API_BASE_URL}/update.php`
                : `${API_BASE_URL}/create.php`;

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            
            if (result.success || res.ok) {
                closeModal();
                loadStaffUsers();
            } else {
                alert("Failed to save user: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Failed to save user:", err);
            alert("Error saving user");
        }
    }

    async function deleteUser(userId) {
        try {
            const formData = new FormData();
            formData.append("id", userId);

            const res = await fetch(`${API_BASE_URL}/delete.php`, {
                method: "POST",
                body: formData
            });

            loadStaffUsers();
        } catch (err) {
            console.error("Failed to delete user:", err);
        }
    }

    /* =============================
       MODAL FUNCTIONS
    ============================= */
    function openAddUserModal() {
        currentUserId = null;
        document.getElementById("modalTitle").textContent = "Add User";
        userForm.reset();
        document.getElementById("passwordSection").style.display = "block";
        modal.classList.add("active");
    }

    function closeModal() {
        modal.classList.remove("active");
        userForm.reset();
        currentUserId = null;
    }

    /* =============================
       EVENT HANDLERS
    ============================= */
    function handleEditUser(e) {
        if (e.target.classList.contains("edit-user")) {
            currentUserId = e.target.dataset.id;
            loadUserData(currentUserId);
        }
    }

    function handleDeleteUser(e) {
        if (e.target.classList.contains("delete-user")) {
            const id = e.target.dataset.id;

            if (!confirm("Are you sure you want to delete this user?")) return;

            deleteUser(id);
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const payload = {
            id: currentUserId,
            name: document.getElementById("fullName").value.trim(),
            username: document.getElementById("username").value.trim(),
            email: document.getElementById("email").value.trim(),
            role: document.getElementById("role").value,
            status: document.getElementById("status").value
        };

        // Add password only when creating new user
        if (!currentUserId) {
            const password = document.getElementById("password")?.value;
            if (password) {
                payload.password = password;
            }
        }

        saveUser(payload);
    }

    /* =============================
       EVENT LISTENERS
    ============================= */
    addUserBtn?.addEventListener("click", openAddUserModal);
    
    closeModalBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    
    userForm?.addEventListener("submit", handleFormSubmit);
    
    document.addEventListener("click", handleEditUser);
    document.addEventListener("click", handleDeleteUser);

    /* =============================
       INITIALIZATION
    ============================= */
    loadStaffUsers();
});