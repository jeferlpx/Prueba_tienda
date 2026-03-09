document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('container');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const togglePasswords = document.querySelectorAll('.toggle-password');
    const notification = document.getElementById('notification');

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'error') => {
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    // Intercambiar vistas
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        setTimeout(() => {
            loginSection.style.display = 'none';
            registerSection.style.display = 'block';
            setTimeout(() => registerSection.classList.remove('hidden'), 50);
        }, 300);
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.add('hidden');
        setTimeout(() => {
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
            setTimeout(() => loginSection.classList.remove('hidden'), 50);
        }, 300);
    });

    // Alternar visibilidad de contraseña
    togglePasswords.forEach(icon => {
        icon.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);

            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });

    // Registro Exitoso con Firebase Auth
    const registerForm = document.getElementById('registerForm');
    const regSubmitBtn = document.getElementById('regSubmitBtn');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;

            if (password.length < 6) {
                showNotification('Firebase exige mínimo 6 caracteres para contraseñas.');
                return;
            }

            regSubmitBtn.classList.add('loading');

            try {
                // 1. Crear usuario en Firebase Auth
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // 2. Guardar datos adicionales (nombre, rol) en Firestore 'users'
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    name: name,
                    email: email,
                    role: 'user', // Por defecto cliente
                    status: 'active',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });

                showNotification('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
                
                // OnAuthStateChanged manejará la redirección

            } catch (error) {
                console.error(error);
                if (error.code === 'auth/email-already-in-use') {
                    showNotification('El correo electrónico ya está registrado.');
                } else if (error.code === 'auth/weak-password') {
                     showNotification('La contraseña es demasiado débil (min. 6 caracteres).');
                } else {
                    showNotification('Error al crear la cuenta: ' + error.message);
                }
            } finally {
                regSubmitBtn.classList.remove('loading');
            }
        });
    }

    // Inicio de Sesión con Firebase Auth
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let emailInputValue = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            submitBtn.classList.add('loading');

            try {
                // Easter Egg: Permitir login con la palabra "admin" 
                // mapeándola a un correo falso para Firebase Auth
                if (emailInputValue.toLowerCase() === 'admin') {
                    emailInputValue = 'admin@techstore.com';
                }

                // Intentar SignIn normal
                let userCredential;
                try {
                    userCredential = await auth.signInWithEmailAndPassword(emailInputValue, password);
                } catch(loginErr) {
                    // Si el admin default no existe en Auth, crearlo auto. (Solo para admin@techstore.com)
                    if (loginErr.code === 'auth/user-not-found' && emailInputValue === 'admin@techstore.com' && password === 'admin123') {
                         userCredential = await auth.createUserWithEmailAndPassword(emailInputValue, password);
                         await db.collection('users').doc(userCredential.user.uid).set({
                             uid: userCredential.user.uid,
                             name: "Administrador Principal",
                             email: emailInputValue,
                             role: "admin",
                             status: "active",
                             createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                             lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                         });
                    } else {
                        throw loginErr; // Re-lanzar si es otro error
                    }
                }

                const user = userCredential.user;

                // Verificar estado activo en Firestore antes de dejarlo pasar
                const userDoc = await db.collection('users').doc(user.uid).get();
                if(userDoc.exists && userDoc.data().status === 'inactive') {
                    await auth.signOut();
                    showNotification('Tu cuenta ha sido suspendida. Contacta a soporte.');
                    submitBtn.classList.remove('loading');
                    return;
                }

                // Actualizar último inicio de sesión en BD
                await db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });

                showNotification('¡Bienvenido de vuelta!', 'success');
                // OnAuthStateChanged manejará la redirección

            } catch (error) {
                console.error(error);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    showNotification('Correo o contraseña incorrectos.');
                } else if(error.code === 'auth/network-request-failed') {
                    showNotification('Error de red. Revisa tu conexión.');
                } else {
                    showNotification('Error de autenticación.');
                }
            } finally {
                submitBtn.classList.remove('loading');
            }
        });
    }

    // Redirigir a la tienda si ya hay un usuario logueado en Firebase
    auth.onAuthStateChanged((user) => {
        if (user) {
             // Si el login form existe, estamos en index.html pero logueados -> ir a tienda
             if(document.getElementById('loginForm')){
                 window.location.href = 'tienda.html';
             }
        }
    });

    // Asegurarse de quitar las barreras de autenticación locales para evitar conflictos posteriores
    localStorage.removeItem('techstore_currentUser');
});
