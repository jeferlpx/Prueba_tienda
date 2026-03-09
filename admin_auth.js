document.addEventListener('DOMContentLoaded', () => {
    // Session Guard for Admin Panel con Firebase
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // No está logueado
            window.location.href = 'index.html';
            return;
        }

        try {
            // Verificar rol en Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.role !== 'admin' || userData.status !== 'active') {
                    // Si no es admin o está suspendido, pa' fuera
                    auth.signOut().then(() => {
                        window.location.href = 'index.html';
                    });
                } else {
                    // Es admin válido. El panel puede cargar.
                    console.log("Acceso concedido a panel Admin.");
                }
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error("Error validando permisos:", error);
            window.location.href = 'index.html';
        }
    });

    // Cleanup de localStorage obsoleta (por seguridad adicional)
    localStorage.removeItem('techstore_currentUser');
});
