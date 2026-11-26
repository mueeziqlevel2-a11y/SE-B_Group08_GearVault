/**
 * GEARVAULT - Pre-Built Gaming Rigs Controller
 * University Semester Project - Group 08
 * 
 * Features:
 * - Dynamic rendering of curated tiered battlestations from GAMEVAULT_PREBUILTS
 * - Filter tabs: All, Budget, Mid-Range, Enthusiast (with count badges)
 * - Search by keyword and price sorting (Featured, Low-to-High, High-to-Low, Top Rated)
 * - Empty-filter state with 1-click reset
 * - Interactive Specs Modal / Drawer with component table and FPS metrics
 * - Working "Add to Cart" saving to gearvault_cart & syncing navbar badges
 */

const GEARVAULT_CART_KEY = 'gearvault_cart';

let activeTierFilter = 'all';
let activeSortOption = 'featured';
let activeSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Navbar & Footer with nested relative links
  if (typeof GearVaultPages !== 'undefined' && typeof GearVaultPages.initNestedLayout === 'function') {
    GearVaultPages.initNestedLayout('prebuilt-pcs');
  } else {
    if (typeof renderGameVaultNavbar === 'function') {
      renderGameVaultNavbar('prebuilt-pcs');
    }
    if (typeof renderGameVaultFooter === 'function') {
      renderGameVaultFooter();
    }
    normalizeNestedLinks();
  }

  // 2. Read optional URL query parameters (e.g. ?tier=budget or ?id=prebuilt-apex-phantom)
  if (typeof getQueryParam === 'function') {
    const tierParam = getQueryParam('tier');
    if (tierParam && ['budget', 'mid-range', 'enthusiast'].includes(tierParam.toLowerCase())) {
      activeTierFilter = tierParam.toLowerCase();
    }
  }

  // 3. Bind controls (filter tabs, sorting, search)
  bindPrebuiltsEvents();

  // 4. Update tab counts & render grid
  updateTierTabBadges();
  renderPrebuiltsGrid();

  // 5. Check if an item id was requested to open modal directly
  if (typeof getQueryParam === 'function') {
    const directId = getQueryParam('id');
    if (directId) {
      setTimeout(() => openPrebuiltSpecModal(directId), 200);
    }
  }
});

/**
 * Normalizes relative URLs for pages inside /pages/
 */
function normalizeNestedLinks() {
  const containers = [
    document.getElementById('gv-navbar-container'),
    document.getElementById('gv-footer-container')
  ];
  containers.forEach(container => {
    if (!container) return;
    container.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) return;
      if (['cart.html', 'flash-deals.html', 'pc-builder.html', 'prebuilt-pcs.html', 'benchmarks.html', 'checkout.html'].includes(href)) {
        // Keep sibling link
      } else if (!href.startsWith('../')) {
        link.setAttribute('href', `../${href}`);
      }
    });
  });
}

/**
 * Determine tier for a rig based on tier attribute or price brackets
 */
function getRigTier(rig) {
  if (rig.tier) return rig.tier.toLowerCase();
  if (rig.price < 350000) return 'budget';
  if (rig.price <= 650000) return 'mid-range';
  return 'enthusiast';
}

/**
 * Update counts in the filter tab buttons
 */
function updateTierTabBadges() {
  const rigs = (typeof GAMEVAULT_PREBUILTS !== 'undefined') ? GAMEVAULT_PREBUILTS : [];
  
  const allCount = rigs.length;
  const budgetCount = rigs.filter(r => getRigTier(r) === 'budget').length;
  const midCount = rigs.filter(r => getRigTier(r) === 'mid-range').length;
  const enthCount = rigs.filter(r => getRigTier(r) === 'enthusiast').length;

  const countAllEl = document.getElementById('tab-count-all');
  const countBudgetEl = document.getElementById('tab-count-budget');
  const countMidEl = document.getElementById('tab-count-mid-range');
  const countEnthEl = document.getElementById('tab-count-enthusiast');

  if (countAllEl) countAllEl.textContent = allCount;
  if (countBudgetEl) countBudgetEl.textContent = budgetCount;
  if (countMidEl) countMidEl.textContent = midCount;
  if (countEnthEl) countEnthEl.textContent = enthCount;
}

/**
 * Bind filter tabs, sorting, search, and reset buttons
 */
function bindPrebuiltsEvents() {
  // Filter tabs
  document.querySelectorAll('[data-tier-filter]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('[data-tier-filter]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTierFilter = tab.dataset.tierFilter;
      renderPrebuiltsGrid();
    });
  });

  // Sorting
  const sortSelect = document.getElementById('gv-prebuilts-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSortOption = e.target.value;
      renderPrebuiltsGrid();
    });
  }

  // Search input
  const searchInput = document.getElementById('gv-prebuilts-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value.toLowerCase().trim();
      renderPrebuiltsGrid();
    });
  }

  // Clear search button if present
  const clearSearchBtn = document.getElementById('gv-clear-search-btn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      activeSearchQuery = '';
      renderPrebuiltsGrid();
    });
  }
}

/**
 * Filter, sort, and render pre-built gaming rigs
 */
function renderPrebuiltsGrid() {
  const container = document.getElementById('gv-prebuilts-grid');
  if (!container) return;

  const rawRigs = (typeof GAMEVAULT_PREBUILTS !== 'undefined') ? [...GAMEVAULT_PREBUILTS] : [];

  // 1. Filter by Tier
  let filtered = rawRigs.filter(rig => {
    if (activeTierFilter === 'all') return true;
    return getRigTier(rig) === activeTierFilter;
  });

  // 2. Filter by Search Query
  if (activeSearchQuery) {
    filtered = filtered.filter(rig => {
      const searchTarget = `${rig.name} ${rig.tagline || ''} ${rig.badge || ''} ${rig.targetResolution || ''} ${JSON.stringify(rig.specs || {})}`.toLowerCase();
      return searchTarget.includes(activeSearchQuery);
    });
  }

  // 3. Sort
  filtered.sort((a, b) => {
    if (activeSortOption === 'price-asc') return a.price - b.price;
    if (activeSortOption === 'price-desc') return b.price - a.price;
    if (activeSortOption === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (activeSortOption === 'name') return a.name.localeCompare(b.name);
    // 'featured' default: preserve flagship & popular top
    return 0;
  });

  // 4. Update showing counter
  const counterEl = document.getElementById('prebuilts-counter');
  if (counterEl) {
    counterEl.textContent = `Showing ${filtered.length} of ${rawRigs.length} Battlestations`;
  }

  // 5. Render Empty State if no rigs match
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="gv-empty-filter-state text-center py-5">
          <div class="gv-empty-icon mb-3">
            <i class="bi bi-pc-display text-muted" style="font-size: 3.5rem;"></i>
          </div>
          <h3 class="text-white mb-2" style="font-family: var(--gv-font-heading);">No Battlestations Found</h3>
          <p class="text-secondary mb-4 mx-auto" style="max-width: 480px;">
            We couldn't find any pre-built rigs matching your active filter 
            ${activeTierFilter !== 'all' ? `<strong>"${activeTierFilter.toUpperCase()}"</strong>` : ''} 
            ${activeSearchQuery ? `with keyword <strong>"${activeSearchQuery}"</strong>` : ''}.
          </p>
          <button type="button" class="gv-btn gv-btn-cyan gv-btn-sm" onclick="resetPrebuiltFilters()">
            <i class="bi bi-arrow-counterclockwise"></i> Reset All Filters
          </button>
        </div>
      </div>
    `;
    return;
  }

  // 6. Render Rig Cards
  container.innerHTML = filtered.map(rig => renderRigCardHtml(rig)).join('');
}

/**
 * Reset all filters back to default
 */
function resetPrebuiltFilters() {
  activeTierFilter = 'all';
  activeSearchQuery = '';
  activeSortOption = 'featured';

  const searchInput = document.getElementById('gv-prebuilts-search');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('gv-prebuilts-sort');
  if (sortSelect) sortSelect.value = 'featured';

  document.querySelectorAll('[data-tier-filter]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tierFilter === 'all');
  });

  renderPrebuiltsGrid();
}

/**
 * Generate card HTML for a single pre-built gaming rig
 */
function renderRigCardHtml(rig) {
  const tier = getRigTier(rig);
  let tierBadgeClass = 'gv-tier-badge-mid';
  let tierLabel = 'Mid-Range';

  if (tier === 'budget') {
    tierBadgeClass = 'gv-tier-badge-budget';
    tierLabel = 'Budget 1080p';
  } else if (tier === 'enthusiast') {
    tierBadgeClass = 'gv-tier-badge-enthusiast';
    tierLabel = 'Enthusiast 4K';
  }

  const formattedPrice = typeof formatPKR === 'function' ? formatPKR(rig.price) : `Rs. ${rig.price.toLocaleString()}`;
  const formattedOriginalPrice = rig.originalPrice ? (typeof formatPKR === 'function' ? formatPKR(rig.originalPrice) : `Rs. ${rig.originalPrice.toLocaleString()}`) : null;

  return `
    <div class="col-md-6 col-xl-6">
      <div class="gv-card gv-rig-card h-100 position-relative p-0 overflow-hidden">
        
        <!-- Rig Image Container & Badges -->
        <div class="gv-rig-media position-relative">
          <img src="${rig.image}" alt="${rig.name}" class="gv-rig-img"
               onerror="if(typeof handleImgError === 'function') handleImgError(this, '${rig.name}')">
          
          <div class="gv-rig-badges position-absolute top-0 start-0 m-3 d-flex flex-wrap gap-2">
            <span class="gv-tier-badge ${tierBadgeClass}">
              <i class="bi bi-award-fill me-1"></i> ${tierLabel}
            </span>
            ${rig.badge ? `
              <span class="gv-badge gv-badge-deal">
                <i class="bi bi-fire me-1"></i> ${rig.badge}
              </span>
            ` : ''}
          </div>

          <div class="gv-rig-target-res position-absolute bottom-0 start-0 m-3">
            <span class="badge bg-dark bg-opacity-75 border border-cyan text-cyan">
              <i class="bi bi-display me-1"></i> ${rig.targetResolution || 'Gaming Battlestation'}
            </span>
          </div>
        </div>

        <!-- Rig Body -->
        <div class="p-4 d-flex flex-column flex-grow-1">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="gv-rig-rating text-warning small">
              <i class="bi bi-star-fill"></i>
              <strong class="text-white ms-1">${rig.rating ? Number(rig.rating).toFixed(1) : '5.0'}</strong>
              <span class="text-muted ms-1">(${rig.reviewCount || 24} reviews)</span>
            </div>
            <span class="badge bg-success-subtle text-success border border-success small">
              <i class="bi bi-shield-check me-1"></i> Ready to Ship
            </span>
          </div>

          <h3 class="gv-rig-title mb-2 text-white">
            ${rig.name}
          </h3>

          <p class="gv-rig-tagline text-secondary small mb-3">
            ${rig.tagline || 'Engineered with premium components for high-refresh competitive gaming.'}
          </p>

          <!-- Key Hardware Highlights Grid -->
          <div class="gv-rig-specs-grid mb-3">
            <div class="gv-rig-spec-item">
              <i class="bi bi-cpu text-cyan"></i>
              <div class="min-w-0">
                <div class="small text-muted">Processor</div>
                <div class="text-white small fw-bold text-truncate" title="${rig.specs?.cpu || ''}">${rig.specs?.cpu || 'High-End CPU'}</div>
              </div>
            </div>

            <div class="gv-rig-spec-item">
              <i class="bi bi-gpu-card text-violet"></i>
              <div class="min-w-0">
                <div class="small text-muted">Graphics</div>
                <div class="text-white small fw-bold text-truncate" title="${rig.specs?.gpu || ''}">${rig.specs?.gpu || 'Discrete GPU'}</div>
              </div>
            </div>

            <div class="gv-rig-spec-item">
              <i class="bi bi-memory text-cyan"></i>
              <div class="min-w-0">
                <div class="small text-muted">RAM</div>
                <div class="text-white small fw-bold text-truncate" title="${rig.specs?.ram || ''}">${rig.specs?.ram || '32GB DDR5'}</div>
              </div>
            </div>

            <div class="gv-rig-spec-item">
              <i class="bi bi-device-hdd text-violet"></i>
              <div class="min-w-0">
                <div class="small text-muted">Storage</div>
                <div class="text-white small fw-bold text-truncate" title="${rig.specs?.storage || ''}">${rig.specs?.storage || '1TB NVMe'}</div>
              </div>
            </div>
          </div>

          <!-- Price & Action Buttons -->
          <div class="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <div>
              <div class="small text-muted">Complete Rig PKR:</div>
              <div class="d-flex align-items-baseline gap-2">
                <span class="gv-rig-price fs-4 fw-bold text-cyan font-monospace">${formattedPrice}</span>
                ${formattedOriginalPrice ? `
                  <span class="text-decoration-line-through text-muted small">${formattedOriginalPrice}</span>
                ` : ''}
              </div>
            </div>

            <div class="d-flex gap-2">
              <button type="button" class="gv-btn gv-btn-sm gv-btn-glass" onclick="openPrebuiltSpecModal('${rig.id}')" title="Inspect full hardware specifications">
                <i class="bi bi-info-circle"></i> View Specs
              </button>
              <button type="button" class="gv-btn gv-btn-sm gv-btn-cyan" onclick="addPrebuiltToCart('${rig.id}')" title="Add pre-built system to shopping cart">
                <i class="bi bi-cart-plus-fill"></i> Add to Cart
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

/**
 * Open Prebuilt Spec Modal / Drawer with full component breakdown
 */
function openPrebuiltSpecModal(rigId) {
  const rig = (typeof getPrebuiltById === 'function') 
    ? getPrebuiltById(rigId) 
    : (typeof GAMEVAULT_PREBUILTS !== 'undefined' ? GAMEVAULT_PREBUILTS.find(r => r.id === rigId) : null);

  if (!rig) return;

  const modalTitle = document.getElementById('rig-modal-title');
  const modalBody = document.getElementById('rig-modal-body');
  const modalCartBtn = document.getElementById('rig-modal-cart-btn');

  if (modalTitle) {
    modalTitle.innerHTML = `<i class="bi bi-pc-display-horizontal text-cyan me-2"></i> ${rig.name}`;
  }

  if (modalCartBtn) {
    modalCartBtn.onclick = () => {
      addPrebuiltToCart(rig.id);
      const modalEl = document.getElementById('rigSpecModal');
      if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
      }
    };
  }

  const formattedPrice = typeof formatPKR === 'function' ? formatPKR(rig.price) : `Rs. ${rig.price.toLocaleString()}`;
  const formattedOriginalPrice = rig.originalPrice ? (typeof formatPKR === 'function' ? formatPKR(rig.originalPrice) : `Rs. ${rig.originalPrice.toLocaleString()}`) : null;

  if (modalBody) {
    const specs = rig.specs || {};
    modalBody.innerHTML = `
      <div class="row g-4">
        <!-- Rig Visual Header -->
        <div class="col-md-5 text-center">
          <div class="p-3 rounded mb-3" style="background: #090e18; border: 1px solid var(--gv-border-subtle);">
            <img src="${rig.image}" alt="${rig.name}" class="img-fluid rounded" style="max-height: 240px; object-fit: contain;"
                 onerror="if(typeof handleImgError === 'function') handleImgError(this, '${rig.name}')">
          </div>
          
          <div class="p-3 rounded text-start" style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2);">
            <div class="small text-muted mb-1">Target Gaming Tier:</div>
            <div class="text-white fw-bold mb-2"><i class="bi bi-display text-cyan me-1"></i> ${rig.targetResolution || 'High-FPS Gaming'}</div>
            <div class="small text-muted mb-1">FPS Benchmarks:</div>
            <div class="small text-cyan font-monospace">${rig.fpsSummary || 'Tested across modern AAA titles'}</div>
          </div>
        </div>

        <!-- Hardware Specs Table -->
        <div class="col-md-7">
          <div class="d-flex align-items-baseline justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
            <div>
              <span class="badge bg-dark border border-cyan text-cyan mb-1">${rig.badge || 'Curated Battlestation'}</span>
              <h4 class="text-white mb-0 fs-5">${rig.name}</h4>
            </div>
            <div class="text-end">
              <div class="text-cyan fs-4 fw-bold font-monospace">${formattedPrice}</div>
              ${formattedOriginalPrice ? `<div class="text-decoration-line-through text-muted small">${formattedOriginalPrice}</div>` : ''}
            </div>
          </div>

          <h5 class="text-secondary fs-6 mb-2 text-uppercase tracking-wider">
            <i class="bi bi-cpu-fill text-cyan me-1"></i> Factory Verified Component Architecture
          </h5>

          <div class="table-responsive">
            <table class="table table-dark table-sm gv-spec-modal-table mb-0">
              <tbody>
                <tr>
                  <th class="text-secondary"><i class="bi bi-cpu me-1 text-cyan"></i> CPU</th>
                  <td class="text-white fw-semibold">${specs.cpu || 'N/A'}</td>
                </tr>
                <tr>
                  <th class="text-secondary"><i class="bi bi-gpu-card me-1 text-violet"></i> GPU</th>
                  <td class="text-white fw-semibold">${specs.gpu || 'N/A'}</td>
                </tr>
                <tr>
                  <th class="text-secondary"><i class="bi bi-motherboard me-1 text-cyan"></i> Motherboard</th>
                  <td class="text-white fw-semibold">${specs.motherboard || 'N/A'}</td>
                </tr>
                <tr>
                  <th class="text-secondary"><i class="bi bi-memory me-1 text-violet"></i> RAM</th>
                  <td class="text-white fw-semibold">${specs.ram || 'N/A'}</td>
                </tr>
                <tr>
                  <th class="text-secondary"><i class="bi bi-device-hdd me-1 text-cyan"></i> Storage</th>
                  <td class="text-white fw-semibold">${specs.storage || 'N/A'}</td>
                </tr>
                <tr>
                  <th class="text-secondary"><i class="bi bi-lightning-charge me-1 text-warning"></i> Power Supply</th>
                  <td class="text-white fw-semibold">${specs.psu || 'N/A'}</td>
                </tr>
                <tr>
                  <th class="text-secondary"><i class="bi bi-fan me-1 text-info"></i> Cooler</th>
                  <td class="text-white fw-semibold">${specs.cooler || 'N/A'}</td>
                </tr>
                <tr>
                  <th class="text-secondary"><i class="bi bi-box me-1 text-secondary"></i> Case / Chassis</th>
                  <td class="text-white fw-semibold">${specs.case || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 p-2 rounded small text-secondary" style="background: #090e18; border: 1px solid var(--gv-border-subtle);">
            <i class="bi bi-shield-check text-success me-1"></i> Assembled, cable-managed, thermal-tested, and covered with 2-year GearVault warranty.
          </div>
        </div>
      </div>
    `;
  }

  const modalEl = document.getElementById('rigSpecModal');
  if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();
  }
}

/**
 * Add Pre-Built Rig to Cart (gearvault_cart)
 */
function addPrebuiltToCart(rigId) {
  const rig = (typeof getPrebuiltById === 'function')
    ? getPrebuiltById(rigId)
    : (typeof GAMEVAULT_PREBUILTS !== 'undefined' ? GAMEVAULT_PREBUILTS.find(r => r.id === rigId) : null);

  if (!rig) return;

  // 1. Read existing cart
  let cart = [];
  try {
    const rawCart = localStorage.getItem(GEARVAULT_CART_KEY) || localStorage.getItem('gamevault_cart');
    if (rawCart) {
      cart = JSON.parse(rawCart);
      if (!Array.isArray(cart)) cart = [];
    }
  } catch (e) {
    cart = [];
  }

  // 2. Add or increment item
  const existingIndex = cart.findIndex(item => item.id === rig.id);
  if (existingIndex > -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
  } else {
    cart.push({
      id: rig.id,
      name: rig.name,
      price: rig.price,
      image: rig.image,
      quantity: 1,
      options: { type: 'prebuilt' }
    });
  }

  // 3. Write back to localStorage
  try {
    localStorage.setItem(GEARVAULT_CART_KEY, JSON.stringify(cart));
    localStorage.setItem('gamevault_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('[Prebuilts] Error saving to cart:', e);
  }

  // Sync with StorageManager if available
  if (typeof StorageManager !== 'undefined' && typeof StorageManager.addToCart === 'function') {
    StorageManager.addToCart(rig.id, 1, { type: 'prebuilt' });
  }

  // 4. Update navbar badge counters
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartBadge = document.getElementById('gv-cart-badge');
  const mobileCartBadge = document.getElementById('gv-mobile-cart-badge');

  if (cartBadge) {
    cartBadge.textContent = totalCount;
    cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
  if (mobileCartBadge) {
    mobileCartBadge.textContent = totalCount;
    mobileCartBadge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  }

  // 5. Fire global storage event
  window.dispatchEvent(new CustomEvent('gamevault_storage_update', {
    detail: { key: GEARVAULT_CART_KEY, value: cart }
  }));

  // 6. Toast Notification
  if (typeof showToast === 'function') {
    showToast(
      `<strong>${rig.name}</strong> added to cart! ` +
      `<a href="cart.html" class="text-cyan text-decoration-underline fw-bold ms-2">View Cart &rarr;</a>`,
      'success',
      4200
    );
  }
}
