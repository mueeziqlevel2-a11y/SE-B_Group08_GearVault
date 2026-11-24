/**
 * GAMEVAULT - Global UI Helpers & Utilities
 * - PKR Currency Formatter
 * - Toast Notification System
 * - URL Parameter Parser
 * - Fallback SVG Placeholder Generator
 * - Star Rating Generator
 * - Quick Search Modal Controller
 */

// Format numbers into PKR Currency (e.g. Rs. 215,000)
function formatPKR(amount) {
  if (isNaN(amount) || amount === null) return "Rs. 0";
  return "Rs. " + Number(amount).toLocaleString('en-PK');
}

// Get URL query parameters
function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

// Global Toast System
function showToast(message, type = 'cyan', duration = 3200) {
  let container = document.getElementById('gv-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gv-toast-container';
    container.className = 'gv-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `gv-toast gv-toast-${type}`;

  let icon = 'bi-info-circle-fill text-cyan';
  if (type === 'success') icon = 'bi-check-circle-fill text-success';
  if (type === 'warning') icon = 'bi-exclamation-triangle-fill text-warning';
  if (type === 'danger') icon = 'bi-x-circle-fill text-danger';

  toast.innerHTML = `
    <div class="gv-toast-content">
      <i class="bi ${icon} fs-5"></i>
      <span>${message}</span>
    </div>
    <button class="gv-toast-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const closeBtn = toast.querySelector('.gv-toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  const timer = setTimeout(() => {
    removeToast(toast);
  }, duration);

  function removeToast(el) {
    clearTimeout(timer);
    el.classList.remove('show');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 400);
  }
}

// Star rating renderer
function renderStars(rating = 5) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let html = '<span class="gv-stars">';
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="bi bi-star-fill"></i> ';
  }
  if (hasHalfStar) {
    html += '<i class="bi bi-star-half"></i> ';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="bi bi-star"></i> ';
  }
  html += `</span> <span class="fw-bold">${Number(rating).toFixed(1)}</span>`;
  return html;
}

// Fallback high-tech SVG generator for broken or slow images
function handleImgError(imgElement, label = 'GAMEVAULT HARDWARE') {
  if (imgElement.dataset.hasFailed) return;
  imgElement.dataset.hasFailed = "true";
  
  const cleanLabel = encodeURIComponent(label.substring(0, 24));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#0c1320"/>
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00D4FF"/>
          <stop offset="100%" stop-color="#7657FF"/>
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="360" height="260" rx="12" fill="#131c2c" stroke="#00D4FF" stroke-width="1.5" stroke-opacity="0.3"/>
      <circle cx="200" cy="120" r="45" fill="none" stroke="url(#g)" stroke-width="3"/>
      <polygon points="190,105 215,120 190,135" fill="#00D4FF"/>
      <text x="200" y="200" fill="#F5F7FA" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">${decodeURIComponent(cleanLabel)}</text>
      <text x="200" y="225" fill="#00D4FF" font-family="sans-serif" font-size="12" letter-spacing="2" text-anchor="middle">AUTHENTIC HARDWARE</text>
    </svg>
  `.trim();
  
  imgElement.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Update navbar badges (Cart & Wishlist)
function updateBadgeCounters() {
  const cartBadge = document.getElementById('gv-cart-badge');
  const wishlistBadge = document.getElementById('gv-wishlist-badge');
  const mobileCartBadge = document.getElementById('gv-mobile-cart-badge');
  const mobileWishlistBadge = document.getElementById('gv-mobile-wishlist-badge');

  if (typeof StorageManager !== 'undefined') {
    const cartCount = StorageManager.getCartCount();
    const wishlistCount = StorageManager.getWishlist().length;

    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    if (mobileCartBadge) {
      mobileCartBadge.textContent = cartCount;
      mobileCartBadge.style.display = cartCount > 0 ? 'inline-flex' : 'none';
    }
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistCount;
      wishlistBadge.style.display = wishlistCount > 0 ? 'flex' : 'none';
    }
    if (mobileWishlistBadge) {
      mobileWishlistBadge.textContent = wishlistCount;
      mobileWishlistBadge.style.display = wishlistCount > 0 ? 'inline-flex' : 'none';
    }
  }
}

// Listen to reactive storage events across tabs & components
window.addEventListener('gamevault_storage_update', () => {
  updateBadgeCounters();
});

// Run badge update on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateBadgeCounters();
  initGlobalSearch();
});

// Quick Search Modal Setup
function initGlobalSearch() {
  const trigger = document.getElementById('gv-search-trigger');
  const modalBackdrop = document.getElementById('gv-search-modal');
  const closeBtn = document.getElementById('gv-search-close');
  const searchInput = document.getElementById('gv-search-input');
  const resultsContainer = document.getElementById('gv-search-results');

  if (!trigger || !modalBackdrop) return;

  function openSearch() {
    modalBackdrop.classList.add('open');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
      renderSearchResults('');
    }
  }

  function closeSearch() {
    modalBackdrop.classList.remove('open');
  }

  trigger.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeSearch();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeSearch();
    }
    // Ctrl + K or Slash to search shortcut
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      openSearch();
    }
  });

  if (searchInput && resultsContainer) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.trim());
    });
  }

  function renderSearchResults(query) {
    if (!resultsContainer) return;
    if (typeof GAMEVAULT_PRODUCTS === 'undefined') {
      resultsContainer.innerHTML = '<div class="p-3 text-muted">Product database loading...</div>';
      return;
    }

    if (!query) {
      // Show top 5 featured items when empty
      const sample = GAMEVAULT_PRODUCTS.slice(0, 5);
      resultsContainer.innerHTML = `
        <div class="px-3 py-2 text-muted small text-uppercase">Trending Gear</div>
        ${sample.map(p => `
          <a href="part-details.html?id=${p.id}" class="gv-search-item">
            <img src="${p.image}" alt="${p.name}" class="gv-search-item-thumb" onerror="handleImgError(this, '${p.name}')">
            <div class="flex-grow-1">
              <div class="fw-bold">${p.name}</div>
              <div class="text-cyan small">${formatPKR(p.price)}</div>
            </div>
            <i class="bi bi-chevron-right text-muted"></i>
          </a>
        `).join('')}
      `;
      return;
    }

    const q = query.toLowerCase();
    const matches = GAMEVAULT_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q)
    ).slice(0, 8);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-4 text-center text-muted">
          <i class="bi bi-search fs-3 d-block mb-2"></i>
          No products found matching "<strong class="text-white">${query}</strong>"
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = matches.map(p => `
      <a href="part-details.html?id=${p.id}" class="gv-search-item">
        <img src="${p.image}" alt="${p.name}" class="gv-search-item-thumb" onerror="handleImgError(this, '${p.name}')">
        <div class="flex-grow-1">
          <div class="fw-bold">${p.name}</div>
          <div class="text-cyan small">${formatPKR(p.price)} &bull; <span class="text-secondary">${p.brand}</span></div>
        </div>
        <span class="badge ${p.inStock ? 'bg-success' : 'bg-danger'}">${p.inStock ? 'In Stock' : 'Out of Stock'}</span>
      </a>
    `).join('');
  }
}
