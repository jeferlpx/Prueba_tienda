document.addEventListener('DOMContentLoaded', () => {
    
    const adminUsersList = document.getElementById('adminUsersList');
    let usuarios = [];
    let currentUserUid = null;

    // Conocer el UID logueado para evitar autobloqueo
    auth.onAuthStateChanged((user) => {
        if(user) currentUserUid = user.uid;
    });

    // 1. Escuchar la colección 'users' para pintar la tabla en vivo
    db.collection('users').onSnapshot((snapshot) => {
        usuarios = [];
        snapshot.forEach(doc => {
            usuarios.push({ documentId: doc.id, ...doc.data() });
        });
        renderUsersTable();
    }, (error) => {
        console.error("Error cargando usuarios: ", error);
    });

    const renderUsersTable = () => {
        if (!adminUsersList) return;
        adminUsersList.innerHTML = '';
        
        if (usuarios.length === 0) {
            adminUsersList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">Cargando base de datos...</td></tr>';
            return;
        }

        usuarios.forEach((user) => {
            const roleClass = user.role === 'admin' ? 'admin' : 'seller';
            const roleText = user.role === 'admin' ? 'Administrador' : 'Cliente';
            const statusClass = user.status === 'active' ? 'active' : 'inactive';
            const statusText = user.status === 'active' ? 'Activo' : 'Suspendido';

            // Convertir Timestamp a String de forma segura
            let dateStr = user.lastLogin;
            if(dateStr && typeof dateStr !== 'string') {
                if(dateStr.toDate) {
                    dateStr = dateStr.toDate().toLocaleString();
                } else {
                    dateStr = "Reciente";
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${user.name}</strong><br><small>${user.email}</small></td>
                <td><span class="role-badge ${roleClass}">${roleText}</span></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${dateStr || 'Nunca'}</td>
                <td>
                    <button class="action-btn edit toggle-role" data-id="${user.documentId}" title="Cambiar Rol"><i class="fa-solid fa-user-shield"></i></button>
                    <button class="action-btn edit toggle-status" data-id="${user.documentId}" title="Suspender/Activar"><i class="fa-solid fa-power-off"></i></button>
                </td>
            `;
            // Quitamos el botón de borrar por ahora, borrar la cuenta requiere el SDK Admin (NodeJS).
            // Con Suspender es suficiente para cortar el acceso al servicio frontal gracias a Firestore.
            adminUsersList.appendChild(tr);
        });
    };

    if (adminUsersList) {
        adminUsersList.addEventListener('click', async (e) => {
            const toggleRoleBtn = e.target.closest('.toggle-role');
            const toggleStatusBtn = e.target.closest('.toggle-status');

            if (toggleRoleBtn) {
                const id = toggleRoleBtn.getAttribute('data-id');
                const user = usuarios.find(u => u.documentId === id);
                
                if (currentUserUid === user.uid) {
                    alert("Por seguridad no puedes quitarte de administrador a ti mismo.");
                    return;
                }
                const newRole = user.role === 'admin' ? 'user' : 'admin';
                await db.collection('users').doc(id).update({ role: newRole });
                window.showAdminToast('<i class="fa-solid fa-user-shield"></i>', 'Rol actualizado en Firestore.');
            }

            if (toggleStatusBtn) {
                const id = toggleStatusBtn.getAttribute('data-id');
                const user = usuarios.find(u => u.documentId === id);
                
                if (currentUserUid === user.uid) {
                    alert("No puedes suspender tu propia sesión activa.");
                    return;
                }
                const newStatus = user.status === 'active' ? 'inactive' : 'active';
                await db.collection('users').doc(id).update({ status: newStatus });
                window.showAdminToast('<i class="fa-solid fa-power-off"></i>', 'Estado actualizado en Firestore.');
            }
        });
    }

    // 2. Invitar Usuario Modal (No recomendado en v8 sin backend function, 
    // pero simularemos un hack cerrando sesión, creando y volviendo a la sessión)
    const adminUserForm = document.getElementById('adminUserForm');
    const userModalOverlay = document.getElementById('userModalOverlay');
    const closeUserModalBtn = document.getElementById('closeUserModalBtn');
    
    if (adminUserForm) {
        adminUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Firebase Auth Client SDK does not let us create another user without signing them in and logging us out.
            // Para un sistema real, se usaría un Cloud Function o Firebase Admin SDK (requiere backend de Node).
            // Al ser VanillaJS y un laboratorio lo notificaremos elegantemente para este prototipo.
            alert("⚠️ Creación Múltiple Restringida: En prototipos sin servidor backend NodeJS, por reglas de seguridad global de Firebase Auth Client SDK, no puedes crear otras cuentas sin que se cierre tu propia sesión de administrador. Para añadir colaboradores, deben registrarse en la página principal y luego tú les editas el rol a 'Admin' y su estado desde esta tabla.");
            userModalOverlay.classList.remove('show');
            adminUserForm.reset();
        });
    }
});
