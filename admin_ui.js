document.addEventListener('DOMContentLoaded', () => {
    // Navegación del Sidebar
    const sidebarItems = document.querySelectorAll('#adminSidebarNav li');
    const sections = document.querySelectorAll('.admin-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Quitar clase active de todos los tabs
            sidebarItems.forEach(li => li.classList.remove('active'));
            // Añadir clase active al tab clicado
            item.classList.add('active');

            // Ocultar todas las secciones
            sections.forEach(sec => sec.classList.remove('active'));

            // Mostrar la sección correspondiente
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
});

// Utilidad Global para Mostrar Notificaciones Toast
window.showAdminToast = (iconHtml, messageText, durationMs = 3000) => {
    const adminToast = document.getElementById('adminToast');
    if (!adminToast) return;
    
    adminToast.innerHTML = `${iconHtml} ${messageText}`;
    adminToast.classList.add('show');
    
    setTimeout(() => adminToast.classList.remove('show'), durationMs);
};
