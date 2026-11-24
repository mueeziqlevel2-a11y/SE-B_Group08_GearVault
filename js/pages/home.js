/**
 * GAMEVAULT - Home Page Controller
 * Handles hero countdown, dynamic featured products rendering,
 * flash deal previews, and interactive cart/wishlist handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Navigation and Footer
  if (typeof renderGameVaultNavbar === 'function') {
    renderGameVaultNavbar('home');
  }
  if (typeof renderGameVaultFooter === 'function') {
    renderGameVaultFooter();
  }

  // 2. Initialize Hero Flash Deal Countdown
  initHeroCountdown();

  // 3. Render Flash Deals Preview
  renderHomeFlashDeals();

  // 4. Render Featured Products
  renderFeaturedProducts('all');

  // 5. Setup Category Filter Tabs for Featured Products
  setupCategoryTabs();
});

// Simulated Flash Deal Countdown Timer (Ticking downwards)
function initHeroCountdown() {
  const countdownEl = document.getElementById('hero-countdown');
  if (!countdownEl) return;

  // Set simulated end time to 8 hours and 45 minutes from now
  let totalSeconds = (8 * 3600) + (45 * 60) + 18;

  function updateTimer() {
    if (totalSeconds <= 0) {
      totalSeconds = 24 * 3600; // Reset
    }
    totalSeconds--;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    countdownEl.innerHTML = `
      <span class="badge bg-dark border border-cyan text-cyan px-2 py-1">${pad(hours)}h</span> :
      <span class="badge bg-dark border border-cyan text-cyan px-2 py-1">${pad(minutes)}m</span> :
      <span class="badge bg-dark border border-cyan text-cyan px-2 py-1">${pad(seconds)}s</span>
    `;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Render Top 4 Flash Deals on Home Page
function renderHomeFlashDeals() {
  const container = document.getElementById('home-flash-deals-grid');
  if (!container || typeof GAMEVAULT_PRODUCTS === 'undefined') return;

  const deals = GAMEVAULT_PRODUCTS.filter(p => p.isFlashDeal).slice(0, 4);

  container.innerHTML = deals.map(product => {
    const isWishlisted = typeof StorageManager !== 'undefined' && StorageManager.isInWishlist(product.id);
    return `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="gv-product-card">
          <div class="gv-product-badge-group">
            <span class="gv-badge gv-badge-deal">
              <i class="bi bi-lightning-charge-fill"></i> -${product.discountPercentage}%
            </span>
          </div>

          <div class="gv-product-actions-floating">
            <button class="gv-btn-icon ${isWishlisted ? 'wishlist-active' : ''}" 
                    title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}" 
                    onclick="handleWishlistToggle('${product.id}', this)"
                    aria-label="Toggle Wishlist">
              <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}"></i>
            </button>
          </div>

          <a href="part-details.html?id=${product.id}" class="gv-product-thumb">
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="handleImgError(this, '${product.name}')">
          </a>

          <div class="gv-product-body">
            <div class="gv-product-category">${product.brand} &bull; ${product.subCategory.toUpperCase()}</div>
            <h3 class="gv-product-title">
              <a href="part-details.html?id=${product.id}">${product.name}</a>
            </h3>

            <div class="gv-rating-wrap">
              ${renderStars(product.rating)}
              <span class="text-muted ms-1">(${product.reviewCount})</span>
            </div>

            <div class="gv-product-footer">
              <div class="gv-price-wrap">
                <span class="gv-price-current text-cyan">${formatPKR(product.price)}</span>
                <span class="gv-price-original">${formatPKR(product.originalPrice)}</span>
              </div>
              <button class="gv-btn gv-btn-cyan gv-btn-sm" 
                      onclick="handleAddToCart('${product.id}', 1)"
                      title="Add to Cart">
                <i class="bi bi-cart-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Featured Products based on category tab
function renderFeaturedProducts(category = 'all') {
  const container = document.getElementById('featured-products-grid');
  if (!container || typeof GAMEVAULT_PRODUCTS === 'undefined') return;

  let products = GAMEVAULT_PRODUCTS.filter(p => p.featured);
  if (category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  // Display top 8 featured
  products = products.slice(0, 8);

  container.innerHTML = products.map(product => {
    const isWishlisted = typeof StorageManager !== 'undefined' && StorageManager.isInWishlist(product.id);
    return `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="gv-product-card">
          <div class="gv-product-badge-group">
            ${product.isFlashDeal ? `<span class="gv-badge gv-badge-deal">-${product.discountPercentage}%</span>` : ''}
            <span class="gv-badge ${product.inStock ? 'gv-badge-instock' : 'gv-badge-sale'}">
              ${product.inStock ? 'In Stock' : 'Pre-Order'}
            </span>
          </div>

          <div class="gv-product-actions-floating">
            <button class="gv-btn-icon ${isWishlisted ? 'wishlist-active' : ''}" 
                    title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}" 
                    onclick="handleWishlistToggle('${product.id}', this)"
                    aria-label="Toggle Wishlist">
              <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}"></i>
            </button>
          </div>

          <a href="part-details.html?id=${product.id}" class="gv-product-thumb">
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="handleImgError(this, '${product.name}')">
          </a>

          <div class="gv-product-body">
            <div class="gv-product-category">${product.brand} &bull; ${product.subCategory.toUpperCase()}</div>
            <h3 class="gv-product-title">
              <a href="part-details.html?id=${product.id}">${product.name}</a>
            </h3>

            <div class="gv-rating-wrap">
              ${renderStars(product.rating)}
              <span class="text-muted ms-1">(${product.reviewCount})</span>
            </div>

            <div class="gv-product-footer">
              <div class="gv-price-wrap">
                <span class="gv-price-current">${formatPKR(product.price)}</span>
                ${product.originalPrice ? `<span class="gv-price-original">${formatPKR(product.originalPrice)}</span>` : ''}
              </div>
              <button class="gv-btn gv-btn-cyan gv-btn-sm" 
                      onclick="handleAddToCart('${product.id}', 1)"
                      title="Add to Cart">
                <i class="bi bi-cart-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Category filter tabs
function setupCategoryTabs() {
  const tabs = document.querySelectorAll('.gv-category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-category');
      renderFeaturedProducts(cat);
    });
  });
}

// Global action helpers
function handleAddToCart(productId, qty = 1) {
  if (typeof StorageManager === 'undefined') return;
  StorageManager.addToCart(productId, qty);
  const product = getProductById(productId);
  const name = product ? product.name : 'Item';
  showToast(`Added <strong>${name}</strong> to your Cart!`, 'success');
}

function handleWishlistToggle(productId, btnElement) {
  if (typeof StorageManager === 'undefined') return;
  const result = StorageManager.toggleWishlist(productId);
  const product = getProductById(productId);
  const name = product ? product.name : 'Item';

  if (result.isAdded) {
    btnElement.classList.add('wishlist-active');
    btnElement.innerHTML = '<i class="bi bi-heart-fill"></i>';
    showToast(`Saved <strong>${name}</strong> to your Wishlist!`, 'cyan');
  } else {
    btnElement.classList.remove('wishlist-active');
    btnElement.innerHTML = '<i class="bi bi-heart"></i>';
    showToast(`Removed <strong>${name}</strong> from your Wishlist.`, 'warning');
  }
}
