document.addEventListener('DOMContentLoaded', () => {
    // Session Guard for Admin Panel
    const currentUser = JSON.parse(localStorage.getItem('techstore_currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html'; // Kick out intruders
    }
});
