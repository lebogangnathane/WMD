// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.querySelector('#navigation a[href="shopping cart.html"]');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = `Cart (${totalItems})`;
    }
}

// Add to cart function
function addToCart(productId, name, price, image) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Item added to cart!');
}

// Remove from cart function
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Item removed from cart!');
    // Remove the item from the DOM immediately
    const itemElement = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
    if (itemElement) {
        itemElement.remove();
    }
    // Update order summary immediately
    updateOrderSummary();
    // If cart is empty now, show empty message
    if (cart.length === 0) {
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="cta-button">Continue Shopping</a>
                </div>
            `;
        }
    }
}

// Update quantity function
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            // Update the quantity display immediately
            const quantityElement = document.querySelector(`.cart-item[data-product-id="${productId}"] .quantity`);
            if (quantityElement) {
                quantityElement.textContent = item.quantity;
            }
            updateOrderSummary();
        }
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <p>Your cart is empty</p>
                <a href="shop.html" class="cta-button">Continue Shopping</a>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p><strong>Price:</strong> P${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn">+</button>
                </div>
            </div>
            <button class="remove-btn">Remove</button>
        </div>
    `).join('');

    updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    if (!subtotalElement || !totalElement) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 500;
    const total = subtotal + shipping;

    subtotalElement.textContent = `P${subtotal.toFixed(2)}`;
    totalElement.textContent = `P${total.toFixed(2)}`;
}

// Place order function
async function placeOrder() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartItems.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    // Show loading state
    const checkoutButton = document.querySelector('.checkout-button');
    const originalText = checkoutButton.textContent;
    checkoutButton.textContent = 'Processing...';
    checkoutButton.disabled = true;

    try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        showNotification('Payment received! Order placed successfully!', 'success');
        
        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();
        displayCartItems();
        
        // Redirect to order confirmation page after 2 seconds
        setTimeout(() => {
            window.location.href = 'order-confirmation.html';
        }, 2000);
    } catch (error) {
        // Show error message
        showNotification('Something went wrong. Please try again.', 'error');
        
        // Reset button
        checkoutButton.textContent = originalText;
        checkoutButton.disabled = false;
    }
}

// Display order summary on checkout page
function displayCheckoutSummary() {
    const orderItemsContainer = document.querySelector('.order-items');
    const subtotalElement = document.querySelector('.summary-row:nth-child(1) span:last-child');
    const shippingElement = document.querySelector('.summary-row:nth-child(2) span:last-child');
    const totalElement = document.querySelector('.summary-row.total span:last-child');
    
    if (!orderItemsContainer || !subtotalElement || !shippingElement || !totalElement) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        window.location.href = 'shopping cart.html';
        return;
    }

    // Display cart items
    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>BWP ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 500;
    const total = subtotal + shipping;

    // Update summary
    subtotalElement.textContent = `BWP ${subtotal.toFixed(2)}`;
    shippingElement.textContent = `BWP ${shipping.toFixed(2)}`;
    totalElement.textContent = `BWP ${total.toFixed(2)}`;
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    displayCartItems();
    displayCheckoutSummary();
    
    // Add event listeners to quantity buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.productId;
            const change = e.target.textContent === '+' ? 1 : -1;
            updateQuantity(productId, change);
        }
        
        if (e.target.classList.contains('remove-btn')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.productId;
            removeFromCart(productId);
        }
    });
}); 

//  Accessibility

// Font Size Control
let currentFontScale = 1;

function increaseFontSize() {
  if (currentFontScale < 1.4) {
    currentFontScale += 0.2;
    updateFontSize();
  }
}

function resetFontSize() {
  currentFontScale = 1;
  updateFontSize();
}

function updateFontSize() {
  document.documentElement.style.setProperty('--font-scale', currentFontScale);
  document.body.classList.add('font-resize-active');
  localStorage.setItem('fontScale', currentFontScale);
}

// High Contrast Toggle
function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');
  localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

// Load saved settings
document.addEventListener('DOMContentLoaded', function() {
  // Font size
  const savedScale = parseFloat(localStorage.getItem('fontScale'));
  if (savedScale) {
    currentFontScale = savedScale;
    updateFontSize();
  }
  
  // High contrast
  if (localStorage.getItem('highContrast') === 'true') {
    document.body.classList.add('high-contrast');
  }
});