// ========== DYNAMIC LOGIN SYSTEM ==========
// Each email gets its password set on first login attempt

// ========== PRODUCTS DATA ==========
const products = [
    { id: 1, name: "Puppy Growth Formula", price: 469, category: "dogs", img: "https://up.yimg.com/ib/th/id/OIP.k1U-SFSZlXTccE5WvQzDFQHaEo?pid=Api&rs=1&c=1&qlt=95&w=151&h=94" },
    { id: 2, name: "Adult Dog Protein Meal", price: 499, category: "dogs", img: "https://www.dogpackapp.com/blog/wp-content/uploads/2024/11/rottweiler-strongest-dog-breed.webp" },
    { id: 3, name: "Kitten Starter Formula", price: 299, category: "cats", img: "https://up.yimg.com/ib/th/id/OIP.B1eOv1f8_UVXwdWasvhTMQHaGB?pid=Api&rs=1&c=1&qlt=95&w=139&h=113" },
    { id: 4, name: "Hairball Control Mix", price: 399, category: "cats", img: "https://tse2.mm.bing.net/th/id/OIP.JDDUPUCe11FnNsLqmTFw6QHaGv?pid=Api&P=0&h=180" },
    { id: 5, name: "Premium Seed Mix", price: 349, category: "birds", img: "https://tse1.mm.bing.net/th/id/OIP.xRGS4A9vXQ5oaBGPfiI4IgHaE7?pid=Api&P=0&h=180" },
    { id: 6, name: "Hamster Daily Mix", price: 249, category: "hamsters", img: "https://tse1.mm.bing.net/th/id/OIP.V8yssyCidQ0GqzREUW9HFgAAAA?pid=Api&P=0&h=180" }
];
/*{ id: 7, name: "Premium Fish Tank Food", price: 199, category: "fish", img: "https://tse3.mm.bing.net/th/id/OIP.8H1234_Premium_Fish_Food?pid=Api&P=0&h=180", discountProduct: true },
    { id: 8, name: "Rabbit Hay Deluxe Pack", price: 279, category: "rabbits", img: "https://tse2.mm.bing.net/th/id/OIP.Rabbit_Hay_Deluxe?pid=Api&P=0&h=180", discountProduct: true }*/

let currentCategory = "all";

// ========== LOGIN LOGIC ==========
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("loginError");

    // Validate email format
    if (!email.includes("@")) {
        errorEl.textContent = "❌ Please enter a valid email address";
        errorEl.style.display = "block";
        return;
    }

    // Validate password length
    if (password.length < 6) {
        errorEl.textContent = "❌ Password must be at least 6 characters";
        errorEl.style.display = "block";
        return;
    }

    // Get stored credentials
    const storedCredentials = JSON.parse(localStorage.getItem("credentials")) || {};

    // If email already exists, check password
    if (storedCredentials[email]) {
        if (storedCredentials[email] !== password) {
            errorEl.textContent = "❌ Invalid password. Try again!";
            errorEl.style.display = "block";
            return;
        }
    } else {
        // First time login: set this password for this email
        storedCredentials[email] = password;
        localStorage.setItem("credentials", JSON.stringify(storedCredentials));
        showNotification("✅ Account created with this email & password!");
    }

    errorEl.style.display = "none";
    localStorage.setItem("user", email);
    showPage("homePage");
    loadProducts();
    updateCartCount();
    loadReviews();
    showNotification("✅ Login successful!");
});

// ========== PAGE NAVIGATION ==========
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
}

function closePage(pageId) {
    document.getElementById(pageId).classList.remove("active");
    document.getElementById("homePage").classList.add("active");
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    showPage("loginPage");
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").style.display = "none";
    showNotification("👋 Logged out successfully!");
}

function goToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

// ========== CART FUNCTIONS ==========
function showCart() {
    showPage("cartPage");
    loadCart();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cartCount").textContent = count;
}

function addToCart(btn) {
    const card = btn.closest(".product-card");
    const name = card.querySelector("h3").textContent;
    const price = parseInt(card.dataset.price);
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.name === name);
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification("✅ " + name + " added to cart!");
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("cartItemsList");
    const empty = document.getElementById("cartEmpty");
    
    if (cart.length === 0) {
        empty.style.display = "block";
        container.innerHTML = "";
        document.getElementById("checkoutBtn").disabled = true;
        updateSummary();
        return;
    }
    
    empty.style.display = "none";
    document.getElementById("checkoutBtn").disabled = false;
    
    container.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <div class="item-name">${item.name}</div>
            <div class="item-price">₹${item.price}</div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
            </div>
            <div class="item-total">₹${item.price * item.qty}</div>
            <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
        </div>
    `).join("");
    
    updateSummary();
}

function updateQty(index, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart[index].qty += change;
    
    if (cart[index].qty < 1) {
        cart.splice(index, 1);
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemName = cart[index].name;
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCart();
    showNotification("🗑️ " + itemName + " removed from cart");
}

function updateSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let discount = 0;
    if (subtotal >= 1000) {
        discount = Math.round(subtotal * 0.10);
        subtotal = subtotal - discount;
    }

    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = "₹" + subtotal;
    document.getElementById("tax").textContent = "₹" + tax;
    document.getElementById("total").textContent = "₹" + total;
}
/*function updateSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Check if BOTH discount products (Fish & Rabbit) are in cart
    const hasDiscountProduct7 = cart.some(item => item.id === 7); // Fish Tank Food
    const hasDiscountProduct8 = cart.some(item => item.id === 8); // Rabbit Hay

    // ✅ CALCULATE REGULAR AND DISCOUNT PRODUCTS SEPARATELY
    let subtotal = 0;
    let discountProductsSubtotal = 0;
    
    cart.forEach(item => {
        if (item.id === 7 || item.id === 8) {
            discountProductsSubtotal += item.price * item.qty;  // ✅ Fish & Rabbit
        } else {
            subtotal += item.price * item.qty;  // ✅ All other products
        }
    });

    let discount = 0;
    let discountMsg = "";
    
    // ✅ APPLY 15% DISCOUNT ONLY ON THE 2 SPECIAL PRODUCTS
    if (hasDiscountProduct7 || hasDiscountProduct8) {
        discount = Math.round(discountProductsSubtotal * 0.15);  // ✅ Only on 2 products
        discountProductsSubtotal = discountProductsSubtotal - discount;
        discountMsg = " ✅ 15% COMBO DISCOUNT ON THESE 2 ITEMS!";
    }
    
    // ✅ TOTAL SUBTOTAL (regular + discounted products)
    const totalSubtotal = subtotal + discountProductsSubtotal;
    const tax = Math.round(totalSubtotal * 0.05);
    const total = totalSubtotal + tax;

    document.getElementById("subtotal").textContent = "₹" + totalSubtotal + discountMsg;
    document.getElementById("tax").textContent = "₹" + tax;
    document.getElementById("total").textContent = "₹" + total;
}*/
function checkout() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let total = subtotal;
    
    if (subtotal >= 1000) {
        total = subtotal * 0.90;
    }
    
    const tax = Math.round(total * 0.05);
    total = total + tax;
    
    showNotification(`✅ Order placed! Total: ₹${total} 🎉`);
    localStorage.removeItem("cart");
    updateCartCount();
    
    setTimeout(() => {
        showPage("homePage");
        loadProducts();
    }, 2000);
}

// ========== PRODUCTS FUNCTIONS ==========
function loadProducts() {
    const grid = document.getElementById("productGrid");
    let filtered = products;
    
    if (currentCategory !== "all") {
        filtered = products.filter(p => p.category === currentCategory);
    }
    
    grid.innerHTML = filtered.map(product => `
        <div class="product-card" data-price="${product.price}">
            <div class="product-image">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <h3>${product.name}</h3>
            <p>Premium quality pet food</p>
            <div class="product-footer">
                <span class="price">₹${product.price}</span>
                <button class="add-to-cart" onclick="addToCart(this)">Add to Cart</button>
            </div>
        </div>
    `).join("");
}

function filterCat(category) {
    currentCategory = category;
    
    document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    
    loadProducts();
}

// ========== REVIEWS LOGIC ==========
document.getElementById("reviewForm").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const review = {
        id: Date.now(),
        name: document.getElementById("reviewName").value,
        email: document.getElementById("reviewEmail").value,
        product: document.getElementById("reviewProduct").value,
        rating: document.getElementById("reviewRating").value,
        text: document.getElementById("reviewText").value,
        date: new Date().toLocaleDateString()
    };
    
    let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.push(review);
    localStorage.setItem("reviews", JSON.stringify(reviews));
    
    document.getElementById("reviewForm").reset();
    document.getElementById("reviewRating").value = "5";
    updateStarUI();
    loadReviews();
    showNotification("⭐ Thank you for your review!");
});

// Star rating interaction
document.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", () => {
        const rating = star.dataset.rating;
        document.getElementById("reviewRating").value = rating;
        updateStarUI();
    });
});

function updateStarUI() {
    const rating = document.getElementById("reviewRating").value;
    document.querySelectorAll(".star").forEach(star => {
        star.classList.toggle("active", star.dataset.rating <= rating);
    });
}

function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    const container = document.getElementById("reviewsList");
    
    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-reviews">No reviews yet. Be the first to share! ⭐</div>';
        return;
    }
    
    container.innerHTML = reviews.reverse().map(review => `
        <div class="review-card">
            <div class="review-header">
                <div>
                    <div class="review-name">${review.name}</div>
                    <div class="review-rating">${"⭐".repeat(review.rating)}</div>
                </div>
            </div>
            <span class="review-product">${review.product}</span>
            <p class="review-text">"${review.text}"</p>
            <div class="review-date">${review.date}</div>
        </div>
    `).join("");
}

// ========== NOTIFICATION ==========
function showNotification(text) {
    const notif = document.getElementById("notification");
    notif.textContent = text;
    notif.classList.add("show");
    
    setTimeout(() => notif.classList.remove("show"), 3000);
}

// ========== INITIALIZE ON PAGE LOAD ==========
window.addEventListener("load", () => {
    const user = localStorage.getItem("user");
    
    // Load reviews and star UI
    updateStarUI();
    loadReviews();
    
    if (user) {
        showPage("homePage");
        loadProducts();
        updateCartCount();
    } else {
        showPage("loginPage");
    }
}); 
/*

 COUPON CODE STYLING 

.coupon-section {
    background: var(--white);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    margin-bottom: 25px;
}

.coupon-input-group {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    margin-bottom: 15px;
}

.coupon-input-group input {
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    transition: border-color 0.3s;
}

.coupon-input-group input:focus {
    outline: none;
    border-color: var(--primary);
}

.coupon-input-group button {
    padding: 12px 24px;
    background: var(--primary);
    color: var(--white);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s;
    white-space: nowrap;
}

.coupon-input-group button:hover {
    background: #e55a2b;
    transform: translateY(-2px);
}

.coupon-message {
    min-height: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    text-align: center;
}

.coupon-message.error {
    background: #fee;
    color: #c33;
    display: block;
}

.coupon-message.success {
    background: #efe;
    color: #3c3;
    display: block;
}

.coupon-discount {
    background: #e8f5e9;
    border: 2px solid #4caf50;
    color: #2e7d32;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    margin-top: 10px;
}

.coupon-discount span {
    font-weight: 700;
    color: #1565c0;
}

 ========== RESPONSIVE COUPON ========== 

@media (max-width: 768px) {
    .coupon-input-group {
        grid-template-columns: 1fr;
    }

    .coupon-input-group button {
        width: 100%;
    }

    .coupon-section {
        padding: 15px;
        margin-bottom: 20px;
    }
}
*/