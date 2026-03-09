document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener los productos y configuración
    let productos = JSON.parse(localStorage.getItem('techstore_products')) || [];
    
    // UI Elements
    const adminProductsList = document.getElementById('adminProductsList');
    const productModalOverlay = document.getElementById('productModalOverlay');
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const closeProductModal = document.getElementById('closeProductModal');
    const productForm = document.getElementById('productForm');
    
    const fileInput = document.getElementById('prodImage');
    const base64Input = document.getElementById('prodImgBase64');
    
    // Variables de Estado
    let editingIndex = null;
    const modalTitle = document.querySelector('#productModalOverlay h3');
    const submitBtn = document.querySelector('.save-prod-btn');

    // 2. Renderizar tabla de productos
    const renderAdminTable = () => {
        if (!adminProductsList) return;
        adminProductsList.innerHTML = '';
        
        if (productos.length === 0) {
            adminProductsList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">No hay productos en el inventario.</td></tr>';
            return;
        }

        productos.forEach((prod, idx) => {
            const tagSpan = prod.tagClase && prod.tagTexto ? 
                `<span class="tag ${prod.tagClase}">${prod.tagTexto}</span>` : '-';
                
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${prod.img}" alt="${prod.nombre}" class="prod-tb-img"></td>
                <td class="prod-tb-name">${prod.nombre}</td>
                <td class="prod-tb-price">${prod.precio}</td>
                <td>${tagSpan}</td>
                <td>
                    <button class="action-btn edit" data-index="${idx}" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete" data-index="${idx}" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            adminProductsList.appendChild(tr);
        });
    };

    // Inicializar visualización de tabla
    renderAdminTable();

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
        // Reset base64 hidden al valor por defecto
        base64Input.value = 'https://images.unsplash.com/photo-1546252923-d34e9e04bbde?auto=format&fit=crop&w=400&q=80';
        
        // Resetear estado de edición
        editingIndex = null;
        if(modalTitle) modalTitle.textContent = 'Añadir Nuevo Producto';
        if(submitBtn) submitBtn.textContent = 'Guardar Producto';
    };

    if(openAddModalBtn) openAddModalBtn.addEventListener('click', openModal);
    if(closeProductModal) closeProductModal.addEventListener('click', closeModal);

    // 5. Agregar / Editar Producto
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('prodName').value;
            const precio = document.getElementById('prodPrice').value;
            const precioAntiguo = document.getElementById('prodOldPrice').value;
            const img = base64Input.value;
            const tagClase = document.getElementById('prodTagClass').value;
            const tagTexto = document.getElementById('prodTagText').value;
            const desc = document.getElementById('prodDesc').value;

            const nuevoProducto = { nombre, desc, precio, precioAntiguo, img, tagClase, tagTexto };

            if (editingIndex !== null) {
                productos[editingIndex] = nuevoProducto;
                window.showAdminToast('<i class="fa-solid fa-check-circle"></i>', 'Producto actualizado con éxito.');
            } else {
                productos.unshift(nuevoProducto);
                window.showAdminToast('<i class="fa-solid fa-check-circle"></i>', 'Producto añadido con éxito.');
            }
            
            localStorage.setItem('techstore_products', JSON.stringify(productos));
            renderAdminTable();
            closeModal();
        });
    }

    // 6. Acciones en la Tabla (Editar / Eliminar)
    if (adminProductsList) {
        adminProductsList.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.delete');
            const editBtn = e.target.closest('.edit');
            
            if (delBtn) {
                const idx = delBtn.getAttribute('data-index');
                if(confirm("¿Estás seguro de que quieres eliminar este producto del inventario?")) {
                    productos.splice(idx, 1);
                    localStorage.setItem('techstore_products', JSON.stringify(productos));
                    renderAdminTable();
                    window.showAdminToast('<i class="fa-solid fa-trash-can"></i>', 'Producto eliminado.');
                }
            }
            
            if (editBtn) {
                const idx = editBtn.getAttribute('data-index');
                editingIndex = idx;
                const prod = productos[idx];

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
