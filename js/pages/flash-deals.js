/**
 * GAMEVAULT / GEARVAULT - Flash Deals Page Controller
 * Renders discounted PC parts and gaming gear dynamically from GAMEVAULT_PRODUCTS,
 * runs a live ticking countdown timer (Hours: Minutes: Seconds), provides category
 * filter tabs + sorting, stock progress bars, and working Add to Cart (gearvault_cart)
 * & Save to Wishlist (gearvault_wishlist) buttons synced with StorageManager.
 */

const GEARVAULT_CART_KEY = 'gearvault_cart';
const GEARVAULT_WISHLIST_KEY = 'gearvault_wishlist';
const FLASH_TIMER_KEY = 'gearvault_flash_deal_end';

let currentDealCategory = 'all';
let currentDealSort = 'featured';
let currentDealSearch = '';
let countdownIntervalId = null;

/**
 * Escape HTML special characters for safe attribute and text interpolation.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize shared Navbar & Footer
  if (typeof renderGameVaultNavbar === 'function') {
    renderGameVaultNavbar('flash-deals');
  }
  if (typeof renderGameVaultFooter === 'function') {
    renderGameVaultFooter();
  }
  normalizeNestedPageLinks();

  // 2. Sync GearVault / GameVault localStorage keys on load
  syncStorageKeysOnLoad();
  if (typeof updateBadgeCounters === 'function') {
    updateBadgeCounters();
  }

  // 3. Support optional ?category= query param
  const initialCat = typeof getQueryParam === 'function' ? getQueryParam('category') : null;
  if (initialCat) {
    currentDealCategory = initialCat;
  }

  // 4. Initialize Countdown, Hero Stats, Filter Tabs, Search, Sort & Grid
  initFlashCountdown();
  updateHeroDealMetrics();
  updateCategoryTabCounts();
  setupCategoryTabs();
  setupSearchFilter();
  setupSortSelect();
  renderFlashDealsGrid();
});

// React to storage updates across components without tearing down active DOM nodes
window.addEventListener('gamevault_storage_update', () => {
  mirrorStorageToGearVaultKeys();
  syncAllWishlistButtonsUI();
});

/**
 * Fix root-relative index.html links inside navbar/footer when running under /pages/.
 */
function normalizeNestedPageLinks() {
  if (!window.location.pathname.includes('/pages/')) return;
  const containers = [
    document.getElementById('gv-navbar-container'),
    document.getElementById('gv-footer-container')
  ];
  containers.forEach(container => {
    if (!container) return;
    container.querySelectorAll('a[href="index.html"]').forEach(link => {
      link.setAttribute('href', '../index.html');
    });
  });
}

/**
 * Retrieve all discounted flash deal items from products database.
 */
function getDiscountedDeals() {
  if (typeof GAMEVAULT_PRODUCTS === 'undefined') return [];
  if (typeof getFlashDeals === 'function') {
    const deals = getFlashDeals();
    if (deals.length > 0) return deals;
  }
  return GAMEVAULT_PRODUCTS.filter(
    p => p.isFlashDeal || (p.originalPrice && p.originalPrice > p.price)
  );
}

/**
 * Check whether a product matches a category filter tab.
 */
function matchesDealCategory(product, category) {
  if (!category || category === 'all') return true;
  if (category === 'pc-parts' || category === 'gaming-gear') {
    return product.category === category;
  }
  if (category === 'cpu' || category === 'gpu') {
    return product.subCategory === category;
  }
  if (category === 'memory-storage') {
    return ['ram', 'storage'].includes(product.subCategory);
  }
  if (category === 'power-cooling') {
    return ['psu', 'cooling', 'case'].includes(product.subCategory);
  }
  return product.subCategory === category;
}

/**
 * Compute discount percentage safely from product fields.
 */
function getDiscountPercent(product) {
  if (product.discountPercentage && product.discountPercentage > 0) {
    return Math.round(product.discountPercentage);
  }
  if (product.originalPrice && product.originalPrice > product.price) {
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
  return 0;
}

/**
 * Update Hero Deal KPI Metrics (total deals, max discount %, total savings).
 */
function updateHeroDealMetrics() {
  const deals = getDiscountedDeals();
  const totalEl = document.getElementById('deals-total-count');
  const maxDiscEl = document.getElementById('deals-max-discount');
  const savingsEl = document.getElementById('deals-total-savings');

  if (totalEl) {
    totalEl.textContent = String(deals.length);
  }

  const maxDiscount = deals.reduce((max, p) => Math.max(max, getDiscountPercent(p)), 0);
  if (maxDiscEl) {
    maxDiscEl.textContent = `${maxDiscount}%`;
  }

  const totalSavings = deals.reduce((sum, p) => {
    const orig = p.originalPrice || p.price;
    return sum + Math.max(0, orig - p.price);
  }, 0);
  if (savingsEl && typeof formatPKR === 'function') {
    savingsEl.textContent = formatPKR(totalSavings);
  }
}

/**
 * Populate badge counts inside each category filter tab.
 */
function updateCategoryTabCounts() {
  const deals = getDiscountedDeals();
  document.querySelectorAll('[data-count-for]').forEach(badge => {
    const cat = badge.getAttribute('data-count-for');
    const count = deals.filter(p => matchesDealCategory(p, cat)).length;
    badge.textContent = String(count);
  });
}

/**
 * Live Ticking Countdown Timer (Hours : Minutes : Seconds).
 * Persists target end timestamp in localStorage so reloads remain consistent.
 */
function initFlashCountdown() {
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  const DEFAULT_DURATION_MS = ((8 * 3600) + (45 * 60) + 18) * 1000;
  const RESET_DURATION_MS = 24 * 3600 * 1000;

  let endTime = parseInt(localStorage.getItem(FLASH_TIMER_KEY), 10);
  if (isNaN(endTime) || endTime <= Date.now()) {
    endTime = Date.now() + DEFAULT_DURATION_MS;
    try {
      localStorage.setItem(FLASH_TIMER_KEY, String(endTime));
    } catch (e) {
      // Ignore storage quota errors
    }
  }

  const pad = (n) => String(n).padStart(2, '0');

  function updateTick() {
    let remainingMs = endTime - Date.now();
    if (remainingMs <= 0) {
      endTime = Date.now() + RESET_DURATION_MS;
      remainingMs = RESET_DURATION_MS;
      try {
        localStorage.setItem(FLASH_TIMER_KEY, String(endTime));
      } catch (e) {
        // Ignore storage errors
      }
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  updateTick();
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  countdownIntervalId = setInterval(updateTick, 1000);
}

/**
 * Wire up category filter tabs.
 */
function setupCategoryTabs() {
  const tabs = document.querySelectorAll('#flash-category-tabs .gv-category-tab');
  tabs.forEach(tab => {
    const cat = tab.getAttribute('data-category');
    if (cat === currentDealCategory) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    } else {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    }

    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentDealCategory = cat || 'all';
      renderFlashDealsGrid();
    });
  });
}

/**
 * Wire up keyword search input for filtering deals.
 */
function setupSearchFilter() {
  const searchInput = document.getElementById('deals-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    currentDealSearch = e.target.value.trim().toLowerCase();
    renderFlashDealsGrid();
  });
}

/**
 * Wire up sort dropdown.
 */
function setupSortSelect() {
  const sortSelect = document.getElementById('deals-sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (e) => {
    currentDealSort = e.target.value;
    renderFlashDealsGrid();
  });
}

/**
 * Sort filtered deals according to selected sort option.
 */
function sortDeals(deals, sortMode) {
  const list = [...deals];
  switch (sortMode) {
    case 'discount-desc':
      return list.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'stock-asc':
      return list.sort((a, b) => (a.stockCount || 0) - (b.stockCount || 0));
    case 'featured':
    default:
      return list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

/**
 * Compute deterministic stock progress metrics for a deal card.
 */
function getStockProgress(product) {
  const remaining = Math.max(0, Number(product.stockCount ?? 10));
  const batchSize = Math.max(remaining + 14, Math.ceil(remaining * 2.2), 25);
  const claimed = Math.max(1, batchSize - remaining);
  const claimedPercent = Math.min(96, Math.max(25, Math.round((claimed / batchSize) * 100)));

  let statusClass = '';
  let labelText = `${remaining} units remaining`;
  let labelColorClass = 'text-cyan';

  if (remaining <= 8) {
    statusClass = 'urgent';
    labelText = `Only ${remaining} left!`;
    labelColorClass = 'text-danger';
  } else if (remaining <= 15) {
    statusClass = 'medium';
    labelText = `Low Stock: ${remaining} left`;
    labelColorClass = 'text-warning';
  }

  return {
    remaining,
    claimedPercent,
    statusClass,
    labelText,
    labelColorClass
  };
}

/**
 * Extract up to 2 short highlight spec pills for a product card.
 */
function getTopSpecPills(product) {
  if (!product.specs || typeof product.specs !== 'object') return [];
  return Object.values(product.specs).slice(0, 2);
}

/**
 * Render filtered and sorted flash deal cards into #flash-deals-grid.
 */
function renderFlashDealsGrid() {
  const grid = document.getElementById('flash-deals-grid');
  const countEl = document.getElementById('deals-showing-count');
  if (!grid) return;

  const allDeals = getDiscountedDeals();
  const filtered = sortDeals(
    allDeals.filter(p => {
      if (!matchesDealCategory(p, currentDealCategory)) return false;
      if (!currentDealSearch) return true;
      const haystack = `${p.name} ${p.brand} ${p.subCategory} ${p.category}`.toLowerCase();
      return haystack.includes(currentDealSearch);
    }),
    currentDealSort
  );

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'deal' : 'deals'}`;
  }

  if (filtered.length === 0) {
    const filterDesc = currentDealSearch
      ? `matching "<strong>${escapeHtml(currentDealSearch)}</strong>"`
      : 'in this category';
    grid.innerHTML = `
      <div class="col-12">
        <div class="gv-empty-state" role="status" aria-live="polite">
          <div class="gv-empty-icon"><i class="bi bi-lightning-charge" aria-hidden="true"></i></div>
          <h3 class="gv-empty-title">No Flash Deals Found</h3>
          <p class="text-secondary mb-4">No discounted hardware drops were found ${filterDesc}. Reset filters to browse all active deals.</p>
          <button type="button" class="gv-btn gv-btn-cyan" onclick="resetDealFilters()">
            <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Reset All Filters
          </button>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const discountPct = getDiscountPercent(product);
    const savings = Math.max(0, (product.originalPrice || product.price) - product.price);
    const isWishlisted = isProductInWishlist(product.id);
    const stockInfo = getStockProgress(product);
    const specPills = getTopSpecPills(product);
    const starsHtml = typeof renderStars === 'function' ? renderStars(product.rating) : `${product.rating}`;
    const currentPriceStr = typeof formatPKR === 'function' ? formatPKR(product.price) : `Rs. ${product.price}`;
    const originalPriceStr = typeof formatPKR === 'function' ? formatPKR(product.originalPrice) : `Rs. ${product.originalPrice}`;
    const savingsStr = typeof formatPKR === 'function' ? formatPKR(savings) : `Rs. ${savings}`;
    const safeName = escapeHtml(product.name);
    const safeAlt = escapeHtml(`${product.brand} ${product.name} - ${product.subCategory.toUpperCase()} flash deal`);

    return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <article class="gv-product-card" data-product-id="${escapeHtml(product.id)}">
          <!-- Discount & Stock Badges -->
          <div class="gv-product-badge-group">
            <span class="gv-badge gv-badge-deal">
              <i class="bi bi-lightning-charge-fill" aria-hidden="true"></i> -${discountPct}% OFF
            </span>
            <span class="gv-badge ${stockInfo.remaining <= 10 ? 'gv-badge-lowstock' : 'gv-badge-instock'}">
              ${stockInfo.remaining <= 10 ? 'Selling Fast' : 'In Stock'}
            </span>
          </div>

          <!-- Floating Wishlist Icon -->
          <div class="gv-product-actions-floating">
            <button type="button"
                    class="gv-btn-icon ${isWishlisted ? 'wishlist-active' : ''}"
                    data-wishlist-icon="${escapeHtml(product.id)}"
                    onclick="handleFlashWishlist('${escapeHtml(product.id)}')"
                    title="${isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}"
                    aria-label="${isWishlisted ? `Remove ${safeName} from Wishlist` : `Save ${safeName} to Wishlist`}">
              <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Product Image -->
          <a href="part-details.html?id=${encodeURIComponent(product.id)}" class="gv-product-thumb">
            <img src="${escapeHtml(product.image)}"
                 alt="${safeAlt}"
                 data-fallback-label="${safeName}"
                 loading="lazy"
                 onerror="handleImgError(this, this.dataset.fallbackLabel)">
          </a>

          <!-- Card Body -->
          <div class="gv-product-body">
            <div class="gv-product-category">${escapeHtml(product.brand)} &bull; ${escapeHtml(product.subCategory.toUpperCase())}</div>
            <h3 class="gv-product-title">
              <a href="part-details.html?id=${encodeURIComponent(product.id)}">${safeName}</a>
            </h3>

            <div class="gv-rating-wrap">
              ${starsHtml}
              <span class="text-muted ms-1">(${product.reviewCount})</span>
            </div>

            ${specPills.length > 0 ? `
              <div class="gv-product-specs-list">
                ${specPills.map(val => `<span class="gv-spec-pill">${escapeHtml(val)}</span>`).join('')}
              </div>
            ` : ''}

            <!-- Stock Progress Bar -->
            <div class="gv-stock-wrap">
              <div class="gv-stock-meta">
                <span class="${stockInfo.labelColorClass}">${stockInfo.labelText}</span>
                <span class="text-secondary">${stockInfo.claimedPercent}% Claimed</span>
              </div>
              <div class="gv-stock-track" role="progressbar" aria-valuenow="${stockInfo.claimedPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="Deal stock claimed for ${safeName}">
                <div class="gv-stock-fill ${stockInfo.statusClass}" style="width: ${stockInfo.claimedPercent}%;"></div>
              </div>
            </div>

            <!-- Pricing & Actions -->
            <div class="gv-product-footer flex-column align-items-stretch">
              <div class="d-flex justify-content-between align-items-end">
                <div class="gv-price-wrap">
                  <span class="gv-price-current text-cyan">${currentPriceStr}</span>
                  ${product.originalPrice && product.originalPrice > product.price ? `<span class="gv-price-original">${originalPriceStr}</span>` : ''}
                </div>
                ${savings > 0 ? `<span class="gv-savings-tag">Save ${savingsStr}</span>` : ''}
              </div>

              <div class="gv-deal-actions">
                <button type="button"
                        class="gv-btn gv-btn-cyan gv-btn-sm"
                        data-add-cart="${escapeHtml(product.id)}"
                        onclick="handleFlashAddToCart('${escapeHtml(product.id)}', this)"
                        ${!product.inStock ? 'disabled' : ''}>
                  <i class="bi bi-cart-plus" aria-hidden="true"></i> Add to Cart
                </button>
                <button type="button"
                        class="gv-btn gv-btn-wishlist gv-btn-sm ${isWishlisted ? 'wishlist-active' : ''}"
                        data-wishlist-btn="${escapeHtml(product.id)}"
                        onclick="handleFlashWishlist('${escapeHtml(product.id)}')"
                        aria-pressed="${isWishlisted ? 'true' : 'false'}">
                  <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>
                  <span>${isWishlisted ? 'Saved' : 'Save to Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
  }).join('');
}

/**
 * Reset category, search, and sort filters back to All Deals.
 */
function resetDealFilters() {
  currentDealCategory = 'all';
  currentDealSearch = '';
  currentDealSort = 'featured';

  const searchInput = document.getElementById('deals-search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('deals-sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  const tabs = document.querySelectorAll('#flash-category-tabs .gv-category-tab');
  tabs.forEach(t => {
    const isAll = t.getAttribute('data-category') === 'all';
    t.classList.toggle('active', isAll);
    t.setAttribute('aria-selected', isAll ? 'true' : 'false');
  });
  renderFlashDealsGrid();
}

/**
 * Check wishlist membership across StorageManager and gearvault_wishlist.
 */
function isProductInWishlist(productId) {
  if (typeof StorageManager !== 'undefined' && StorageManager.isInWishlist(productId)) {
    return true;
  }
  try {
    const gvWishlist = JSON.parse(localStorage.getItem(GEARVAULT_WISHLIST_KEY) || '[]');
    return Array.isArray(gvWishlist) && gvWishlist.includes(productId);
  } catch (e) {
    return false;
  }
}

/**
 * Sync initial gearvault_* and gamevault_* localStorage keys without losing items.
 */
function syncStorageKeysOnLoad() {
  if (typeof StorageManager === 'undefined') return;
  try {
    const gvCart = JSON.parse(localStorage.getItem(GEARVAULT_CART_KEY) || '[]');
    const smCart = StorageManager.getCart();
    if (Array.isArray(gvCart) && gvCart.length > 0 && smCart.length === 0) {
      StorageManager.saveCart(gvCart);
    }

    const gvWishlist = JSON.parse(localStorage.getItem(GEARVAULT_WISHLIST_KEY) || '[]');
    const smWishlist = StorageManager.getWishlist();
    if (Array.isArray(gvWishlist) && gvWishlist.length > 0 && smWishlist.length === 0) {
      StorageManager.saveWishlist(gvWishlist);
    }
  } catch (e) {
    // Ignore malformed localStorage entries
  }
  mirrorStorageToGearVaultKeys();
}

/**
 * Mirror StorageManager cart & wishlist into gearvault_cart and gearvault_wishlist.
 */
function mirrorStorageToGearVaultKeys() {
  if (typeof StorageManager === 'undefined') return;
  try {
    localStorage.setItem(GEARVAULT_CART_KEY, JSON.stringify(StorageManager.getCart()));
    localStorage.setItem(GEARVAULT_WISHLIST_KEY, JSON.stringify(StorageManager.getWishlist()));
  } catch (e) {
    console.warn('[GearVault Flash Deals] Unable to mirror storage keys:', e);
  }
}

/**
 * Add product to cart (updates StorageManager + gearvault_cart) and show feedback.
 */
function handleFlashAddToCart(productId, btnElement) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;

  if (typeof StorageManager !== 'undefined') {
    StorageManager.addToCart(productId, 1);
    mirrorStorageToGearVaultKeys();
  } else {
    try {
      const cart = JSON.parse(localStorage.getItem(GEARVAULT_CART_KEY) || '[]');
      const existing = cart.find(item => item.id === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id: productId, quantity: 1, options: {} });
      }
      localStorage.setItem(GEARVAULT_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('[GearVault Flash Deals] Cart update failed:', e);
    }
  }

  if (typeof updateBadgeCounters === 'function') {
    updateBadgeCounters();
  }

  if (btnElement) {
    const originalHtml = '<i class="bi bi-cart-plus"></i> Add to Cart';
    btnElement.innerHTML = '<i class="bi bi-check2"></i> Added!';
    setTimeout(() => {
      btnElement.innerHTML = originalHtml;
    }, 1100);
  }

  const name = product ? product.name : 'Deal Item';
  if (typeof showToast === 'function') {
    showToast(`Added <strong>${name}</strong> to your Cart!`, 'success');
  }
}

/**
 * Toggle product in wishlist (updates StorageManager + gearvault_wishlist) and sync UI.
 */
function handleFlashWishlist(productId) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  let isAdded = false;

  if (typeof StorageManager !== 'undefined') {
    const result = StorageManager.toggleWishlist(productId);
    isAdded = result.isAdded;
    mirrorStorageToGearVaultKeys();
  } else {
    try {
      let wishlist = JSON.parse(localStorage.getItem(GEARVAULT_WISHLIST_KEY) || '[]');
      if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        isAdded = false;
      } else {
        wishlist.push(productId);
        isAdded = true;
      }
      localStorage.setItem(GEARVAULT_WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('[GearVault Flash Deals] Wishlist update failed:', e);
    }
  }

  if (typeof updateBadgeCounters === 'function') {
    updateBadgeCounters();
  }

  syncWishlistButtonUI(productId, isAdded);

  const name = product ? product.name : 'Deal Item';
  if (typeof showToast === 'function') {
    if (isAdded) {
      showToast(`Saved <strong>${name}</strong> to your Wishlist!`, 'cyan');
    } else {
      showToast(`Removed <strong>${name}</strong> from your Wishlist.`, 'warning');
    }
  }
}

/**
 * Update floating heart icon and full wishlist button state for a single product.
 */
function syncWishlistButtonUI(productId, isAdded) {
  document.querySelectorAll(`[data-wishlist-icon="${productId}"]`).forEach(iconBtn => {
    iconBtn.classList.toggle('wishlist-active', isAdded);
    iconBtn.title = isAdded ? 'Remove from Wishlist' : 'Save to Wishlist';
    iconBtn.setAttribute('aria-label', isAdded ? 'Remove from Wishlist' : 'Save to Wishlist');
    iconBtn.innerHTML = `<i class="bi ${isAdded ? 'bi-heart-fill' : 'bi-heart'}"></i>`;
  });

  document.querySelectorAll(`[data-wishlist-btn="${productId}"]`).forEach(btn => {
    btn.classList.toggle('wishlist-active', isAdded);
    btn.setAttribute('aria-pressed', isAdded ? 'true' : 'false');
    btn.innerHTML = `<i class="bi ${isAdded ? 'bi-heart-fill' : 'bi-heart'}"></i> <span>${isAdded ? 'Saved' : 'Save to Wishlist'}</span>`;
  });
}

/**
 * Sync wishlist button UI across all rendered cards from storage.
 */
function syncAllWishlistButtonsUI() {
  document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
    const productId = btn.getAttribute('data-wishlist-btn');
    if (productId) {
      syncWishlistButtonUI(productId, isProductInWishlist(productId));
    }
  });
}
