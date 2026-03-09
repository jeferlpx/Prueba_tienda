document.addEventListener('DOMContentLoaded', () => {
    // Session Guard
    const currentUser = JSON.parse(localStorage.getItem('techstore_currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Configuración del Admin
    const adminLinkBtn = document.getElementById('adminLinkBtn');
    const forcePasswordModal = document.getElementById('forcePasswordModal');
    const forcePasswordForm = document.getElementById('forcePasswordForm');

    if (currentUser.role === 'admin') {
        if (adminLinkBtn) adminLinkBtn.style.display = 'inline-block';
        
        // Forzar cambio de contraseña si es la por defecto
        if (currentUser.password === 'admin123' && forcePasswordModal) {
            forcePasswordModal.classList.add('show');
            
            forcePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newPass = document.getElementById('newAdminPassword').value;
                if (newPass.length < 5) {
                    alert('La contraseña debe tener al menos 5 caracteres.');
                    return;
                }
                
                // Actualizar en currentUser
                currentUser.password = newPass;
                localStorage.setItem('techstore_currentUser', JSON.stringify(currentUser));
                
                // Actualizar en el array global de usuarios
                let allUsers = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    allUsers[userIndex].password = newPass;
                    localStorage.setItem('users', JSON.stringify(allUsers));
                }
                
                // Ocultar modal y notificar
                forcePasswordModal.classList.remove('show');
                showToast('Contraseña actualizada de forma segura.', 'success');
            });
        }
    }

    // Catálogo inicial por defecto
    const productosDefault = [
        { nombre: 'Laptop UltraPro 15"', desc: 'Procesador M2, 16GB RAM, 512GB SSD. Potencia absoluta para creadores.', precio: '$1,299.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tagClase: 'new', tagTexto: 'Nuevo' },
        { nombre: 'Smartphone Alpha X', desc: 'Cámara 108MP, Pantalla OLED 120Hz. Captura y vive en su máximo esplendor.', precio: '$849.00', precioAntiguo: '$999.00', img: 'https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tagClase: 'discount', tagTexto: '-15%' },
        { nombre: 'Auriculares Studio Z', desc: 'Cancelación de ruido activa, 40h de batería. Sumérgete en cada nota.', precio: '$249.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tagClase: null, tagTexto: null },
        { nombre: 'Smartwatch Fit Pro', desc: 'Monitor cardíaco, sumergible 50m. Tu salud al alcance de tu muñeca.', precio: '$199.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tagClase: 'hot', tagTexto: 'Hot' },
        { nombre: 'Monitor Curvo 34" 144Hz', desc: 'Resolución UWQHD, panel VA con colores vibrantes y respuesta de 1ms ideal para escritorio y gaming.', precio: '$499.00', precioAntiguo: '$549.00', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d4aff?auto=format&fit=crop&w=400&q=80', tagClase: 'discount', tagTexto: '-9%' },
        { nombre: 'Teclado Mecánico K-Red', desc: 'Switches mecánicos lineales silenciosos, chasis de aluminio y retroiluminación RGB por tecla.', precio: '$89.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80', tagClase: null, tagTexto: null },
        { nombre: 'Ratón Pro Hero', desc: 'Sensor óptico de 25K DPI, peso ultraligero y botones programables para máxima precisión laboral.', precio: '$69.00', precioAntiguo: '$85.00', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80', tagClase: 'discount', tagTexto: '-18%' },
        { nombre: 'Tablet Infinity 11"', desc: 'Pantalla Liquid Retina, procesador octa-core y batería de larga duración para productividad.', precio: '$329.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80', tagClase: 'new', tagTexto: 'Nuevo' },
        { nombre: 'Cámara Mirrorless Z', desc: 'Sensor APS-C de 24MP, grabación de video en 4K 60fps con enfoque ocular en tiempo real para creadores.', precio: '$949.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80', tagClase: 'hot', tagTexto: 'Hot' },
        { nombre: 'Lente Profesional 50mm f/1.8', desc: 'Objetivo de focal fija extraordinariamente nítido, ideal para retratos con un hermoso desenfoque.', precio: '$199.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1620216669931-15fe10892881?auto=format&fit=crop&w=400&q=80', tagClase: null, tagTexto: null },
        { nombre: 'Tarjeta Gráfica RTX 4070', desc: 'Rendimiento bestial en renderizado GPU y DLSS 3.0 para la próxima generación de desarrollo visual.', precio: '$599.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1591488320449-011701b59a47?auto=format&fit=crop&w=400&q=80', tagClase: 'hot', tagTexto: 'Deseado' },
        { nombre: 'SSD NVMe Gen4 2TB', desc: 'Velocidades de lectura de hasta 7000MB/s, optimiza drásticamente los flujos de trabajo en tu estación.', precio: '$149.00', precioAntiguo: '$179.00', img: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80', tagClase: 'discount', tagTexto: '-16%' },
        { nombre: 'Procesador Core i9 14th', desc: '24 núcleos y 32 hilos, frecuencias turbo imparables para compilar y procesar sin demoras.', precio: '$549.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80', tagClase: 'new', tagTexto: 'Nuevo' },
        { nombre: 'Memoria RAM 32GB DDR5', desc: 'Kit dual channel a 6000MHz con latencia ínfima para potenciar con fiabilidad altas cargas de trabajo.', precio: '$129.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=400&q=80', tagClase: null, tagTexto: null },
        { nombre: 'Altavoces Estéreo Pro', desc: 'Monitores de estudio de respuesta plana, imprescindibles para edición de video y audio comercial.', precio: '$199.00', precioAntiguo: '$230.00', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80', tagClase: 'discount', tagTexto: '-13%' },
        { nombre: 'Micrófono Condensador USB', desc: 'Patrón polar cardioide, salida de auriculares sin latencia y cápsula afinada para conferencias claras.', precio: '$99.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1590602847861-f357a91629dd?auto=format&fit=crop&w=400&q=80', tagClase: null, tagTexto: null },
        { nombre: 'Hub Multipuerto USB-C', desc: 'Expande tu conectividad: HDMI 4K, 3x USB 3.0, lector SD y carga Power Delivery de 100W en un solo cable.', precio: '$35.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80', tagClase: 'hot', tagTexto: 'Hot' },
        { nombre: 'Luz Anillo LED Profesional', desc: 'Iluminación equilibrada con temperatura de color ajustable para streaming, vlogs o teletrabajo formal.', precio: '$59.00', precioAntiguo: '$79.00', img: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&w=400&q=80', tagClase: 'discount', tagTexto: '-25%' },
        { nombre: 'Gafas Visor XR Enterprise', desc: 'Mundo virtual sin cables enfocado a profesionales, con pantallas micro-OLED para desarrollo espacial en 3D.', precio: '$899.00', precioAntiguo: null, img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=400&q=80', tagClase: 'new', tagTexto: 'Lanzamiento' },
        { nombre: 'Impresora 3D de Resina 8K', desc: 'Precisión milimétrica para prototipado rápido industrial y modelado detallado. Resolución y velocidad increíbles.', precio: '$349.00', precioAntiguo: '$399.00', img: 'https://images.unsplash.com/photo-1581092336214-419b673ab1d3?auto=format&fit=crop&w=400&q=80', tagClase: 'discount', tagTexto: '-12%' }
    ];

    if (!localStorage.getItem('techstore_products')) {
        localStorage.setItem('techstore_products', JSON.stringify(productosDefault));
    }

    const productosEnVenta = JSON.parse(localStorage.getItem('techstore_products'));
    const productsContainer = document.getElementById('products-container');

    // Función para renderizar los productos dinámicamente
    const renderProducts = () => {
        if (!productsContainer) return;
        productsContainer.innerHTML = '';
        
        productosEnVenta.forEach((prod, index) => {
            const tagHTML = prod.tagClase ? `<div class="tag ${prod.tagClase}">${prod.tagTexto}</div>` : '';
            const oldPriceHTML = prod.precioAntiguo ? `<span class="old-price">${prod.precioAntiguo}</span>` : '';
            
            const cardHTML = `
                <div class="product-card glass">
                    <div class="card-img-wrapper">
                        <img src="${prod.img}" alt="${prod.nombre}" loading="lazy">
                        ${tagHTML}
                    </div>
                    <div class="card-info">
                        <h3>${prod.nombre}</h3>
                        <p class="desc">${prod.desc}</p>
                        <div class="card-footer">
                            <span class="price">${prod.precio} ${oldPriceHTML}</span>
                            <button class="add-to-cart" data-id="${index}" aria-label="Añadir al carrito"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    };

    // Renderizar al inicio
    renderProducts();

    // --- Elementos del Carrito y Checkout ---
    const cartBtn = document.querySelector('.cart-btn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');
    
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
    const payBtnAmount = document.getElementById('payBtnAmount');
    const checkoutForm = document.getElementById('checkoutForm');
    const paySubmitBtn = document.getElementById('paySubmitBtn');
    
    const cartCount = document.getElementById('cart-count');
    const toast = document.getElementById('toast');
    
    let cart = []; // Array que almacenará {producto, cantidad}

    // Funciones Auxiliares
    const parsePrice = (priceStr) => parseFloat(priceStr.replace(/[^0-9.-]+/g,""));
    const formatPrice = (num) => '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    const updateCartUI = () => {
        // Actualizar contador
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Animacion badge
        cartCount.style.transform = 'scale(1.5)';
        setTimeout(() => cartCount.style.transform = 'scale(1)', 150);

        // Actualizar Interior Carrito
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío</div>';
            openCheckoutBtn.disabled = true;
        } else {
            cart.forEach((item, index) => {
                const itemPrice = parsePrice(item.product.precio);
                total += itemPrice * item.quantity;

                const itemHTML = `
                    <div class="cart-item">
                        <img src="${item.product.img}" alt="${item.product.nombre}" class="cart-item-img">
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.product.nombre}</div>
                            <div class="cart-item-price">${formatPrice(itemPrice * item.quantity)}</div>
                            <div class="cart-qty-controls">
                                <button class="cart-qty-btn dec" data-index="${index}"><i class="fa-solid fa-minus"></i></button>
                                <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" data-index="${index}">
                                <button class="cart-qty-btn inc" data-index="${index}"><i class="fa-solid fa-plus"></i></button>
                            </div>
                        </div>
                        <button class="cart-item-remove" data-index="${index}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
            openCheckoutBtn.disabled = false;
        }

        const formattedTotal = formatPrice(total);
        cartTotalAmount.textContent = formattedTotal;
        checkoutTotalAmount.textContent = formattedTotal;
        payBtnAmount.textContent = formattedTotal;
    };

    // Agregar al carrito
    if (productsContainer) {
        productsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart');
            if (!btn) return;
            
            const productId = btn.getAttribute('data-id');
            const product = productosEnVenta[productId];
            
            const existingItem = cart.find(item => item.product.nombre === product.nombre);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ product, quantity: 1 });
            }

            updateCartUI();

            const icon = btn.querySelector('i');
            if (icon && icon.classList.contains('fa-plus')) {
                icon.classList.replace('fa-plus', 'fa-check');
                Object.assign(btn.style, {
                    background: '#10b981', borderColor: '#10b981',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)', transform: 'rotate(0deg) scale(1.1)'
                });
                
                toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Producto añadido con éxito al carrito!';
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        icon.classList.replace('fa-check', 'fa-plus');
                        Object.assign(btn.style, { background: '', borderColor: '', boxShadow: '', transform: '' });
                    }, 400); 
                }, 2000);
            }
        });
    }

    // Controles Carrito
    cartItemsContainer.addEventListener('click', (e) => {
        const decBtn = e.target.closest('.dec');
        const incBtn = e.target.closest('.inc');
        const removeBtn = e.target.closest('.cart-item-remove');

        if (decBtn) {
            const idx = decBtn.getAttribute('data-index');
            if(cart[idx].quantity > 1) cart[idx].quantity--;
            updateCartUI();
        }
        if (incBtn) {
            const idx = incBtn.getAttribute('data-index');
            cart[idx].quantity++;
            updateCartUI();
        }
        if (removeBtn) {
            const idx = removeBtn.getAttribute('data-index');
            cart.splice(idx, 1);
            updateCartUI();
        }
    });

    cartItemsContainer.addEventListener('change', (e) => {
        if(e.target.classList.contains('cart-qty-input')) {
            const idx = e.target.getAttribute('data-index');
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            cart[idx].quantity = val;
            updateCartUI();
        }
    });

    // Abrir/Cerrar Carrito
    cartBtn.addEventListener('click', () => {
        cartOverlay.classList.add('show');
        cartDrawer.classList.add('open');
    });

    const closeCart = () => {
        cartOverlay.classList.remove('show');
        cartDrawer.classList.remove('open');
    }
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Abrir/Cerrar Checkout
    openCheckoutBtn.addEventListener('click', () => {
        closeCart();
        setTimeout(() => {
            checkoutOverlay.classList.add('show');
        }, 300); // Wait for cart to close
    });

    const closeCheckout = () => {
        checkoutOverlay.classList.remove('show');
    };
    closeCheckoutBtn.addEventListener('click', closeCheckout);
    
    // Simular procesamiento Checkout
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        paySubmitBtn.classList.add('processing');
        paySubmitBtn.querySelector('.pay-text').style.opacity = '0';
        paySubmitBtn.querySelector('.pay-loader').classList.remove('hidden');

        setTimeout(() => {
            paySubmitBtn.classList.remove('processing');
            paySubmitBtn.style.background = '#10b981';
            paySubmitBtn.querySelector('.pay-text').innerHTML = '<i class="fa-solid fa-check"></i> Pago Exitoso';
            paySubmitBtn.querySelector('.pay-text').style.opacity = '1';
            paySubmitBtn.querySelector('.pay-loader').classList.add('hidden');
            
            // Vaciar y resetear tras exito
            setTimeout(() => {
                cart = [];
                updateCartUI();
                closeCheckout();
                checkoutForm.reset();
                paySubmitBtn.style.background = '';
                paySubmitBtn.querySelector('.pay-text').innerHTML = `Pagar <span id="payBtnAmount">${checkoutTotalAmount.textContent}</span>`;
                
                toast.innerHTML = '<i class="fa-solid fa-box-open"></i> ¡Orden procesada! Gracias por tu compra.';
                toast.className = 'toast show';
                toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                setTimeout(() => { 
                    toast.classList.remove('show'); 
                    setTimeout(() => toast.style.background = '', 400);
                }, 4000);
            }, 1500);

        }, 2000);
    });

    // Funcionalidad de Salida/Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('techstore_currentUser');
            window.location.href = 'index.html';
        });
    }

    // Efecto 3D / parallax para escritorio aplicado a los elementos autogenerados
    if(window.innerWidth > 768) {
        const apply3DHover = () => {
             document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((centerX - x) / centerX) * -10;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
                });
            });
        };
        apply3DHover();
    }
});
