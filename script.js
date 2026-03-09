document.addEventListener('DOMContentLoaded', () => {
    // Formularios y secciones
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Enlaces de navegación
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    
    // Botones
    const submitBtn = document.getElementById('submitBtn');
    const regSubmitBtn = document.getElementById('regSubmitBtn');
    
    // Notificaciones
    const notification = document.getElementById('notification');

    // Asegurar que el Admin por defecto siempre exista
    let currentUsers = JSON.parse(localStorage.getItem('users')) || [];
    const hasAdmin = currentUsers.some(u => u.email === 'admin');
    
    if (!hasAdmin) {
        currentUsers.unshift({ 
            name: 'Administrador Principal', 
            email: 'admin', 
            password: 'admin123', 
            role: 'admin', 
            status: 'active', 
            lastLogin: 'Nunca' 
        });
        localStorage.setItem('users', JSON.stringify(currentUsers));
    }

    // Cambiar entre Login y Registro
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    // Toggle password visibility dinámico
    const togglePasswords = document.querySelectorAll('.toggle-password');
    togglePasswords.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Función para mostrar notificaciones Toast
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Manejo del Registro
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        
        if (name && email && password) {
            regSubmitBtn.classList.add('loading');
            regSubmitBtn.disabled = true;
            
            setTimeout(() => {
                regSubmitBtn.classList.remove('loading');
                regSubmitBtn.disabled = false;
                
                // Verificar si el usuario ya existe
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userExists = users.some(u => u.email === email);
                
                if (userExists) {
                    showNotification('El correo ya está registrado.', 'error');
                } else {
                    // Guardar nuevo usuario
                    const today = new Date().toLocaleString();
                    users.push({ name, email, password, role: 'user', status: 'active', lastLogin: 'Nuevo' });
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    showNotification('¡Registro exitoso! Por favor inicia sesión.', 'success');
                    registerForm.reset();
                    
                    // Limpiar clases de animación de label
                    registerForm.querySelectorAll('.input-group input').forEach(input => {
                        input.classList.remove('has-val');
                    });
                    
                    // Cambiar a la vista de login automáticamente
                    setTimeout(() => {
                        registerSection.classList.add('hidden');
                        loginSection.classList.remove('hidden');
                        // Pre-rellenar el email
                        document.getElementById('email').value = email;
                        document.getElementById('email').classList.add('has-val');
                        document.getElementById('password').focus();
                    }, 1500);
                }
            }, 1000); // Simulando conexión a backend
        }
    });

    // Manejo del Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email && password) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Obtener usuarios guardados
                const users = JSON.parse(localStorage.getItem('users')) || [];
                
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    if (user.status !== 'active') {
                        showNotification('Tu cuenta está suspendida o inactiva.', 'error');
                        submitBtn.style.backgroundColor = 'var(--error)';
                        submitBtn.querySelector('.btn-text').textContent = 'Error';
                        setTimeout(() => {
                            submitBtn.style.backgroundColor = '';
                            submitBtn.querySelector('.btn-text').textContent = 'Iniciar Sesión';
                        }, 2000);
                        return;
                    }

                    // Éxito al iniciar sesión
                    submitBtn.style.backgroundColor = 'var(--success)';
                    submitBtn.querySelector('.btn-text').textContent = '¡Ingresando!';
                    
                    showNotification(`¡Bienvenido de nuevo, ${user.name}!`, 'success');
                    
                    // Update Last Login
                    user.lastLogin = new Date().toLocaleString();
                    localStorage.setItem('users', JSON.stringify(users));

                    // Establecer sesión activa
                    localStorage.setItem('techstore_currentUser', JSON.stringify(user));
                    
                    setTimeout(() => {
                        window.location.href = 'tienda.html';
                    }, 1500);
                } else {
                    // Fallo al iniciar sesión (contraseña incorrecta o usuario no encontrado)
                    showNotification('Correo o contraseña incorrectos.', 'error');
                    submitBtn.style.backgroundColor = 'var(--error)';
                    submitBtn.querySelector('.btn-text').textContent = 'Error';
                    
                    setTimeout(() => {
                        submitBtn.style.backgroundColor = '';
                        submitBtn.querySelector('.btn-text').textContent = 'Iniciar Sesión';
                    }, 2000);
                }
            }, 1000); // Simulando conexión a backend
        }
    });
    
    // Manejo de clase 'has-val' para animación de inputs
    document.addEventListener('focusout', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type !== 'submit' && e.target.type !== 'checkbox') {
            if (e.target.value !== '') {
                e.target.classList.add('has-val');
            } else {
                e.target.classList.remove('has-val');
            }
        }
    });

    // Inicializar inputs que puedan tener datos previamente cacheados por el navegador
    document.querySelectorAll('.input-group input').forEach(input => {
        if (input.value !== '') {
            input.classList.add('has-val');
        }
    });
});
