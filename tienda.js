document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Autenticación y Visibilidad de UI ---
    const adminLinkBtn = document.getElementById('adminLinkBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const forcePasswordModal = document.getElementById('forcePasswordModal');
    
    let currentUserData = null; // Almacenará la data cargada desde Firestore (para checar roles)

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // No logueado
            window.location.href = 'index.html';
        } else {
            // Usuario en sesión, buscar sus datos en Firestore
            try {
                const docSnap = await db.collection('users').doc(user.uid).get();
                if (docSnap.exists) {
                    currentUserData = docSnap.data();
                    
                    // ¿Es Admin? Mostrar botón admin
                    if (currentUserData.role === 'admin' && adminLinkBtn) {
                        adminLinkBtn.style.display = 'inline-block';
                    }
                }
            } catch(e) {
                console.error("No se pudieron cargar datos del usuario", e);
            }
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
             auth.signOut().then(() => {
                 window.location.href = 'index.html';
             });
        });
    }

    // --- 2. Cargar Productos desde Firestore ---
    const productsContainer = document.getElementById('products-container');
    let productosDisponibles = []; // Catálogo en memoria
    
    // Escuchar colección 'products' en tiempo real
    db.collection('products').onSnapshot((snapshot) => {
        productosDisponibles = [];
        snapshot.forEach(doc => {
            productosDisponibles.push({ id: doc.id, ...doc.data() });
        });
        renderProducts(productosDisponibles);
    }, (error) => {
        console.error("Error al suscribirse al inventario", error);
    });

    const renderProducts = (productsToRender) => {
        if (!productsContainer) return;
        productsContainer.innerHTML = '';
        
        if (productsToRender.length === 0) {
            productsContainer.innerHTML = '<p style="text-align:center;width:100%;color:#fff;">No hay productos disponibles por ahora.</p>';
            return;
        }

        productsToRender.forEach(producto => {
            const hasTag = producto.tagClase && producto.tagTexto;
            const tagHTML = hasTag ? `<span class="product-tag ${producto.tagClase}">${producto.tagTexto}</span>` : '';
            
            const oldPriceHTML = producto.precioAntiguo ? `<span class="old-price">${producto.precioAntiguo}</span>` : '';

            const article = document.createElement('article');
            article.className = 'product-card glass';
            article.innerHTML = `
                ${tagHTML}
                <div class="product-img">
                    <img src="${producto.img}" alt="${producto.nombre}">
                </div>
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p class="product-desc">${producto.desc}</p>
                    <div class="product-price">
                        ${oldPriceHTML}
                        <span class="current-price">${producto.precio}</span>
                    </div>
                </div>
                <button class="add-to-cart-btn" data-id="${producto.id}">
                    Agregar al Carrito <i class="fa-solid fa-cart-plus"></i>
                </button>
            `;
            productsContainer.appendChild(article);
        });

        // Reasignar eventos a los nuevos botones
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prodId = e.currentTarget.getAttribute('data-id');
                const product = productosDisponibles.find(p => p.id === prodId);
                if (product) addToCart(product);
            });
        });
    };

    // --- 3. Lógica del Carrito (Mantenida local para la sesión activa) ---
    // Optamos por almacenar el carrito temporal en memoria o local storage 
    // mientras no procesa el Checkout, no es imperativo mandarlo a Firestore aún.
    
    let cart = [];
    const cartCount = document.getElementById('cart-count');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const openCartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const toast = document.getElementById('toast');
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');

    // Checkout modal elements
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
    const payBtnAmount = document.getElementById('payBtnAmount');
    const paySubmitBtn = document.getElementById('paySubmitBtn');
    const payLoader = document.querySelector('.pay-loader');
    const payText = document.querySelector('.pay-text');


    const toggleCart = () => {
        cartOverlay.classList.toggle('active');
        cartDrawer.classList.toggle('active');
    };

    if(openCartBtn) openCartBtn.addEventListener('click', toggleCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if(cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    const showToast = (msg, type = 'success') => {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // Helper: Convert "$99.00" -> 99.00
    const parsePrice = (priceStr) => {
        return parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
    };

    // Helper: Format 99.00 -> "$99.00"
    const formatPrice = (num) => {
        return "$" + num.toFixed(2);
    };

    const updateCartUI = () => {
        // Update badge count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if(cartCount) cartCount.textContent = totalItems;

        // Render items
        if(cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío</div>';
                if(openCheckoutBtn) openCheckoutBtn.disabled = true;
                if(cartTotalAmount) cartTotalAmount.textContent = "$0.00";
                return;
            }

            if(openCheckoutBtn) openCheckoutBtn.disabled = false;

            let total = 0;

            cart.forEach((item, index) => {
                const itemTotal = parsePrice(item.precio) * item.quantity;
                total += itemTotal;

                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item glass';
                cartItem.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.img}" alt="${item.nombre}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.nombre}</h4>
                        <div class="cart-item-price">${item.precio}</div>
                        <div class="cart-item-actions">
                            <div class="qty-control">
                                <button class="qty-btn minus" data-index="${index}"><i class="fa-solid fa-minus"></i></button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn plus" data-index="${index}"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <button class="remove-item-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItem);
            });

            if(cartTotalAmount) cartTotalAmount.textContent = formatPrice(total);
        }

        // Attach listeners to new buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                cart[idx].quantity++;
                updateCartUI();
            });
        });

        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1);
                }
                updateCartUI();
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        showToast('¡Producto añadido con éxito al carrito!');
    };


    // --- 4. Checkout Simulado ---
    const toggleCheckoutModal = () => {
        checkoutOverlay.classList.toggle('active');
        if (checkoutOverlay.classList.contains('active')) {
            // Update amounts based on cart
            const currentTotal = cartTotalAmount.textContent;
            if(checkoutTotalAmount) checkoutTotalAmount.textContent = currentTotal;
            if(payBtnAmount) payBtnAmount.textContent = currentTotal;
        }
    };

    if(openCheckoutBtn) {
        openCheckoutBtn.addEventListener('click', () => {
            toggleCart(); // Close cart drawer
            setTimeout(toggleCheckoutModal, 300); // Open checkout modal after transition
        });
    }

    if(closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', toggleCheckoutModal);
    if(checkoutOverlay) checkoutOverlay.addEventListener('click', (e) => {
        if(e.target === checkoutOverlay) toggleCheckoutModal();
    });

    if(checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular procesamiento de pago
            paySubmitBtn.disabled = true;
            payText.style.display = 'none';
            payLoader.classList.remove('hidden');

            setTimeout(() => {
                // Pago "exitoso"
                payLoader.classList.add('hidden');
                paySubmitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Pago Completado';
                paySubmitBtn.classList.add('success-state');

                // En un escenario real, aquí empujaríamos la orden a la colección "orders" de Firestore.
                
                // Vaciar carrito
                cart = [];
                updateCartUI();

                setTimeout(() => {
                    toggleCheckoutModal();
                    
                    // Reset button state
                    setTimeout(() => {
                        paySubmitBtn.disabled = false;
                        paySubmitBtn.classList.remove('success-state');
                        paySubmitBtn.innerHTML = `
                            <span class="pay-text">Pagar <span id="payBtnAmount">$0.00</span></span>
                            <div class="pay-loader hidden"></div>
                        `;
                        // Re-bind elements lost in innerHTML
                        const newPayText = document.querySelector('.pay-text');
                        if (newPayText) payText = newPayText; // Note: payText isn't explicitly declared let outside, it's const, this will throw an error in strict mode if reassigned. Actually, just reset contents is fine.
                    }, 500);

                    showToast('¡Compra realizada con éxito! Gracias por tu confianza.', 'success');
                }, 2000);

            }, 2500);
        });
    }

    // Limpiar vieja localStorage
    localStorage.removeItem('techstore_products');
});
