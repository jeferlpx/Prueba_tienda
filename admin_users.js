document.addEventListener('DOMContentLoaded', () => {
    // 1. Necesitamos el usuario actual para validar que no nos autoborremos
    const currentUser = JSON.parse(localStorage.getItem('techstore_currentUser'));

    // 2. Gestionar Base de Datos de Usuarios y UI
    let usuarios = JSON.parse(localStorage.getItem('users')) || [];
    const adminUsersList = document.getElementById('adminUsersList');

    const renderUsersTable = () => {
        if (!adminUsersList) return;
        adminUsersList.innerHTML = '';
        
        if (usuarios.length === 0) {
            adminUsersList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">No hay usuarios.</td></tr>';
            return;
        }

        usuarios.forEach((user, idx) => {
            const roleClass = user.role === 'admin' ? 'admin' : 'seller';
            const roleText = user.role === 'admin' ? 'Administrador' : 'Cliente';
            const statusClass = user.status === 'active' ? 'active' : 'inactive';
            const statusText = user.status === 'active' ? 'Activo' : 'Suspendido';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${user.name}</strong><br><small>${user.email}</small></td>
                <td><span class="role-badge ${roleClass}">${roleText}</span></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${user.lastLogin || 'Nunca'}</td>
                <td>
                    <button class="action-btn edit toggle-role" data-index="${idx}" title="Cambiar Rol (Admin/User)"><i class="fa-solid fa-user-shield"></i></button>
                    <button class="action-btn edit toggle-status" data-index="${idx}" title="Suspender/Activar"><i class="fa-solid fa-power-off"></i></button>
                    <button class="action-btn delete del-user" data-index="${idx}" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            adminUsersList.appendChild(tr);
        });
    };

    renderUsersTable();

    if (adminUsersList) {
        adminUsersList.addEventListener('click', (e) => {
            const toggleRoleBtn = e.target.closest('.toggle-role');
            const toggleStatusBtn = e.target.closest('.toggle-status');
            const delUserBtn = e.target.closest('.del-user');

            if (toggleRoleBtn) {
                const idx = toggleRoleBtn.getAttribute('data-index');
                if (currentUser && usuarios[idx].email === currentUser.email) {
                    alert("No puedes quitarte el rol de admin a ti mismo para evitar bloquearte del panel.");
                    return;
                }
                usuarios[idx].role = usuarios[idx].role === 'admin' ? 'user' : 'admin';
                localStorage.setItem('users', JSON.stringify(usuarios));
                renderUsersTable();
                
                window.showAdminToast('<i class="fa-solid fa-user-shield"></i>', 'Rol de usuario actualizado.');
            }

            if (toggleStatusBtn) {
                const idx = toggleStatusBtn.getAttribute('data-index');
                if (currentUser && usuarios[idx].email === currentUser.email) {
                    alert("No puedes suspenderte a ti mismo.");
                    return;
                }
                usuarios[idx].status = usuarios[idx].status === 'active' ? 'inactive' : 'active';
                localStorage.setItem('users', JSON.stringify(usuarios));
                renderUsersTable();

                window.showAdminToast('<i class="fa-solid fa-power-off"></i>', 'Estado de usuario actualizado.');
            }

            if (delUserBtn) {
                const idx = delUserBtn.getAttribute('data-index');
                if (currentUser && usuarios[idx].email === currentUser.email) {
                    alert("No puedes borrar tu propia cuenta de administrador en sesión.");
                    return;
                }
                if(confirm("¿Estás seguro de que quieres ELIMINAR a este usuario por completo? Esta acción no se puede deshacer.")) {
                    usuarios.splice(idx, 1);
                    localStorage.setItem('users', JSON.stringify(usuarios));
                    renderUsersTable();
                    
                    window.showAdminToast('<i class="fa-solid fa-trash-can"></i>', 'Usuario eliminado.');
                }
            }
        });
    }

    // 3. Lógica para Agregar Nuevo Usuario Modal
    const userModalOverlay = document.getElementById('userModalOverlay');
    const openAddUserBtn = document.getElementById('openAddUserBtn');
    const closeUserModalBtn = document.getElementById('closeUserModalBtn');
    const adminUserForm = document.getElementById('adminUserForm');

    if (openAddUserBtn && userModalOverlay) {
        openAddUserBtn.addEventListener('click', () => {
            userModalOverlay.classList.add('show');
        });

        closeUserModalBtn.addEventListener('click', () => {
            userModalOverlay.classList.remove('show');
            adminUserForm.reset();
        });

        adminUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('newUserName').value;
            const email = document.getElementById('newUserEmail').value;
            const password = document.getElementById('newUserPassword').value;
            const role = document.getElementById('newUserRole').value;

            const userExists = usuarios.some(u => u.email === email);
            if (userExists) {
                alert("Ya existe un usuario con este correo electrónico/usuario.");
                return;
            }

            const newUser = {
                name,
                email,
                password,
                role,
                status: 'active',
                lastLogin: 'Nunca'
            };

            usuarios.push(newUser);
            localStorage.setItem('users', JSON.stringify(usuarios));
            
            renderUsersTable();
            userModalOverlay.classList.remove('show');
            adminUserForm.reset();

            window.showAdminToast('<i class="fa-solid fa-user-check"></i>', 'Usuario creado exitosamente.');
        });
    }
});
