document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const adminProductsList = document.getElementById('adminProductsList');
    const productModalOverlay = document.getElementById('productModalOverlay');
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const closeProductModal = document.getElementById('closeProductModal');
    const productForm = document.getElementById('productForm');
    
    const fileInput = document.getElementById('prodImage');
    const base64Input = document.getElementById('prodImgBase64');
    
    // Variables de Estado
    let productos = [];
    let editingId = null; // En Firebase usamos el ID del documento, no el index del array
    const modalTitle = document.querySelector('#productModalOverlay h3');
    const submitBtn = document.querySelector('.save-prod-btn');

    // 1. Cargar productos desde Firestore en Tiempo Real
    db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        productos = [];
        snapshot.forEach(doc => {
            productos.push({ id: doc.id, ...doc.data() });
        });
        renderAdminTable();
    }, (error) => {
        console.error("Error cargando inventario Admin", error);
        window.showAdminToast('<i class="fa-solid fa-triangle-exclamation"></i>', 'Error de conexión a DB.');
    });

    // 2. Renderizar tabla de productos
    const renderAdminTable = () => {
        if (!adminProductsList) return;
        adminProductsList.innerHTML = '';
        
        if (productos.length === 0) {
            adminProductsList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">Cargando inventario o vacío.</td></tr>';
            return;
        }

        productos.forEach((prod) => {
            const tagSpan = prod.tagClase && prod.tagTexto ? 
                `<span class="tag ${prod.tagClase}">${prod.tagTexto}</span>` : '-';
                
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${prod.img}" alt="${prod.nombre}" class="prod-tb-img"></td>
                <td class="prod-tb-name">${prod.nombre}</td>
                <td class="prod-tb-price">${prod.precio}</td>
                <td>${tagSpan}</td>
                <td>
                    <button class="action-btn edit" data-id="${prod.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete" data-id="${prod.id}" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            adminProductsList.appendChild(tr);
        });
    };

    // 3. Convertir Imagen a Base64
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    base64Input.value = reader.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 4. Modal Handlers
    const openModal = () => {
        productModalOverlay.classList.add('show');
    };

    const closeModal = () => {
        productModalOverlay.classList.remove('show');
        productForm.reset();
        base64Input.value = 'https://images.unsplash.com/photo-1546252923-d34e9e04bbde?auto=format&fit=crop&w=400&q=80';
        editingId = null;
        if(modalTitle) modalTitle.textContent = 'Añadir Nuevo Producto';
        if(submitBtn) submitBtn.textContent = 'Guardar Producto';
    };

    if(openAddModalBtn) openAddModalBtn.addEventListener('click', openModal);
    if(closeProductModal) closeProductModal.addEventListener('click', closeModal);

    // 5. Agregar / Editar Producto en Firestore
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('prodName').value;
            const precio = document.getElementById('prodPrice').value;
            const precioAntiguo = document.getElementById('prodOldPrice').value;
            const img = base64Input.value;
            const tagClase = document.getElementById('prodTagClass').value;
            const tagTexto = document.getElementById('prodTagText').value;
            const desc = document.getElementById('prodDesc').value;

            submitBtn.disabled = true;
            submitBtn.textContent = "Procesando...";

            try {
                if (editingId) {
                    await db.collection('products').doc(editingId).update({
                        nombre, desc, precio, precioAntiguo, img, tagClase, tagTexto,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    window.showAdminToast('<i class="fa-solid fa-check-circle"></i>', 'Producto actualizado en la nube.');
                } else {
                    await db.collection('products').add({
                        nombre, desc, precio, precioAntiguo, img, tagClase, tagTexto,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    window.showAdminToast('<i class="fa-solid fa-cloud-arrow-up"></i>', 'Producto sincronizado a la nube.');
                }
                closeModal();
            } catch (error) {
                console.error("Error guardando producto", error);
                alert("Hubo un error al guardar. Verifica tu conexión.");
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // 6. Acciones en la Tabla (Editar / Eliminar) de Firestore
    if (adminProductsList) {
        adminProductsList.addEventListener('click', async (e) => {
            const delBtn = e.target.closest('.delete');
            const editBtn = e.target.closest('.edit');
            
            if (delBtn) {
                const id = delBtn.getAttribute('data-id');
                if(confirm("¿Seguro que quieres borrar este producto globalmente?")) {
                    try {
                        await db.collection('products').doc(id).delete();
                        window.showAdminToast('<i class="fa-solid fa-trash-can"></i>', 'Producto borrado de la nube.');
                    } catch (error) {
                        console.error("Error al borrar", error);
                    }
                }
            }
            
            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                editingId = id;
                const prod = productos.find(p => p.id === id);

                document.getElementById('prodName').value = prod.nombre;
                document.getElementById('prodPrice').value = prod.precio;
                document.getElementById('prodOldPrice').value = prod.precioAntiguo || '';
                document.getElementById('prodDesc').value = prod.desc;
                base64Input.value = prod.img;
                document.getElementById('prodTagClass').value = prod.tagClase || '';
                document.getElementById('prodTagText').value = prod.tagTexto || '';

                if(modalTitle) modalTitle.textContent = 'Editar Producto';
                if(submitBtn) submitBtn.textContent = 'Actualizar Producto';
                
                openModal();
            }
        });
    }
});
