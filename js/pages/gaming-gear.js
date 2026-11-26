/**
 * GEARVAULT - Gaming Gear Catalog Controller (pages/gaming-gear.html)
 * Dynamically renders gaming peripherals (mice, mechanical keyboards, headsets, monitors)
 * from a JS data array with live product-name search, category & price-range filters,
 * price sorting, empty state, and localStorage persistence for:
 * - gearvault_cart
 * - gearvault_wishlist
 * - gearvault_compare
 */

const GEARVAULT_CART_KEY = 'gearvault_cart';
const GEARVAULT_WISHLIST_KEY = 'gearvault_wishlist';
const GEARVAULT_COMPARE_KEY = 'gearvault_compare';
const MAX_COMPARE_ITEMS = 4;

/**
 * Peripheral catalog data array (mice, mechanical keyboards, headsets, monitors).
 * Preserves canonical IDs & pricing for items present in GAMEVAULT_PRODUCTS and adds
 * budget & mid-range options across all four peripheral categories.
 */
const GAMING_GEAR_PERIPHERALS = [
  // ==================== MICE ====================
  {
    id: 'gear-logitech-g305-lightspeed',
    name: 'Logitech G305 LIGHTSPEED Wireless Gaming Mouse',
    category: 'gaming-gear',
    subCategory: 'mice',
    brand: 'Logitech',
    price: 13500,
    originalPrice: 15500,
    discountPercentage: 13,
    rating: 4.8,
    reviewCount: 214,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 28,
    isFlashDeal: false,
    specs: {
      sensor: 'HERO 12K Optical',
      weight: '99 grams',
      connectivity: 'LIGHTSPEED Wireless (1ms)',
      batteryLife: '250 Hours (1x AA)'
    },
    shortDescription: 'Dependable LIGHTSPEED wireless esports mouse with zero-smoothing HERO sensor tracking.',
    featured: false
  },
  {
    id: 'gear-razer-viper-v3-hyperspeed',
    name: 'Razer Viper V3 HyperSpeed Wireless Esports Mouse',
    category: 'gaming-gear',
    subCategory: 'mice',
    brand: 'Razer',
    price: 24500,
    originalPrice: 28000,
    discountPercentage: 13,
    rating: 4.8,
    reviewCount: 86,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 16,
    isFlashDeal: false,
    specs: {
      sensor: 'Focus Pro 30K Optical',
      weight: '82 grams',
      connectivity: 'HyperSpeed Wireless',
      batteryLife: 'Up to 280 Hours'
    },
    shortDescription: 'Symmetrical claw-grip competitive mouse engineered for crisp micro-adjustments.',
    featured: false
  },
  {
    id: 'gear-razer-deathadder-v3-pro',
    name: 'Razer DeathAdder V3 Pro Ultra-lightweight Wireless Mouse',
    category: 'gaming-gear',
    subCategory: 'mice',
    brand: 'Razer',
    price: 39500,
    originalPrice: 45000,
    discountPercentage: 12,
    rating: 4.9,
    reviewCount: 104,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 19,
    isFlashDeal: true,
    specs: {
      weight: '63 grams',
      sensor: 'Focus Pro 30K Optical Sensor',
      connectivity: 'Razer HyperSpeed Wireless + USB-C',
      pollingRate: 'Up to 8000 Hz supported'
    },
    shortDescription: 'Refined ergonomic esports shape favored by competitive FPS pros worldwide.',
    featured: true
  },
  {
    id: 'gear-logitech-g-pro-x-superlight-2',
    name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
    category: 'gaming-gear',
    subCategory: 'mice',
    brand: 'Logitech',
    price: 43500,
    originalPrice: 48000,
    discountPercentage: 9,
    rating: 5.0,
    reviewCount: 130,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 15,
    isFlashDeal: false,
    specs: {
      weight: '60 grams',
      sensor: 'HERO 2 Sensor (32,000 DPI)',
      switches: 'LIGHTFORCE Hybrid Optical-Mechanical',
      batteryLife: '95 Hours Continuous Motion'
    },
    shortDescription: 'Tournament-standard 60g wireless precision featuring LIGHTFORCE hybrid switches.',
    featured: true
  },

  // ==================== MECHANICAL KEYBOARDS ====================
  {
    id: 'gear-redragon-k552-kumara-rgb',
    name: 'Redragon K552 Kumara TKL Mechanical Gaming Keyboard',
    category: 'gaming-gear',
    subCategory: 'keyboards',
    brand: 'Redragon',
    price: 11500,
    originalPrice: 13500,
    discountPercentage: 15,
    rating: 4.7,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 34,
    isFlashDeal: false,
    specs: {
      layout: 'TKL (87 Keys)',
      switches: 'Outemu Red Mechanical (Hot-Swap)',
      build: 'Metal Alloy Top Plate',
      lighting: 'Per-Key Rainbow RGB'
    },
    shortDescription: 'Compact tenkeyless mechanical chassis built for reliable linear actuation on a budget.',
    featured: false
  },
  {
    id: 'gear-hyperx-alloy-origins-core',
    name: 'HyperX Alloy Origins Core TKL Mechanical Keyboard',
    category: 'gaming-gear',
    subCategory: 'keyboards',
    brand: 'HyperX',
    price: 29500,
    originalPrice: 34000,
    discountPercentage: 13,
    rating: 4.8,
    reviewCount: 118,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 21,
    isFlashDeal: false,
    specs: {
      layout: 'TKL Compact Form Factor',
      switches: 'HyperX Red Linear Mechanical',
      body: 'Full Aircraft-Grade Aluminum',
      connectivity: 'Detachable Braided USB-C'
    },
    shortDescription: 'Solid aluminum frame with custom HyperX mechanical switches rated for 80M clicks.',
    featured: false
  },
  {
    id: 'gear-keychron-q1-pro-wireless',
    name: 'Keychron Q1 Pro Custom QMK/VIA Wireless Mechanical Keyboard',
    category: 'gaming-gear',
    subCategory: 'keyboards',
    brand: 'Keychron',
    price: 58000,
    originalPrice: 65000,
    discountPercentage: 11,
    rating: 5.0,
    reviewCount: 77,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 11,
    isFlashDeal: false,
    specs: {
      layout: '75% Exploded Layout',
      body: 'Full CNC Machined Aluminum Frame',
      switches: 'Gateron Jupiter Red (Hot-Swap)',
      mount: 'Double Gasket Mount System'
    },
    shortDescription: 'Custom gasket-mounted aluminum mechanical board with full QMK/VIA remapping.',
    featured: true
  },
  {
    id: 'gear-steelseries-apex-pro-tkl',
    name: 'SteelSeries Apex Pro TKL Wireless (2023) Hall Effect',
    category: 'gaming-gear',
    subCategory: 'keyboards',
    brand: 'SteelSeries',
    price: 69000,
    originalPrice: 76000,
    discountPercentage: 9,
    rating: 4.8,
    reviewCount: 61,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 9,
    isFlashDeal: true,
    specs: {
      switches: 'OmniPoint 2.0 Adjustable HyperMagnetic',
      actuation: '0.1mm to 4.0mm Rapid Trigger',
      features: 'OLED Smart Display',
      connectivity: 'Quantum 2.0 Dual Wireless'
    },
    shortDescription: 'Rapid Trigger magnetic switches deliver instant counter-strafing resets for esports.',
    featured: true
  },

  // ==================== HEADSETS ====================
  {
    id: 'gear-logitech-g435-lightspeed',
    name: 'Logitech G435 LIGHTSPEED & Bluetooth Wireless Headset',
    category: 'gaming-gear',
    subCategory: 'headsets',
    brand: 'Logitech',
    price: 18500,
    originalPrice: 21500,
    discountPercentage: 14,
    rating: 4.7,
    reviewCount: 164,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 25,
    isFlashDeal: false,
    specs: {
      weight: '165 grams Ultralight',
      drivers: '40mm Audio Drivers',
      microphone: 'Dual Beamforming Mics',
      batteryLife: '18 Hours Wireless'
    },
    shortDescription: 'Featherweight wireless headset with dual-mode LIGHTSPEED and low-latency Bluetooth.',
    featured: false
  },
  {
    id: 'gear-hyperx-cloud-iii-wireless',
    name: 'HyperX Cloud III Wireless Gaming Headset 7.1',
    category: 'gaming-gear',
    subCategory: 'headsets',
    brand: 'HyperX',
    price: 44000,
    originalPrice: 49000,
    discountPercentage: 10,
    rating: 4.8,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 20,
    isFlashDeal: false,
    specs: {
      drivers: '53mm Angled Neodymium Drivers',
      batteryLife: 'Up to 120 Hours Battery',
      audio: 'DTS Headphone:X Spatial Audio',
      microphone: '10mm Noise-Canceling Boom Mic'
    },
    shortDescription: 'Signature HyperX memory foam comfort paired with a massive 120-hour battery.',
    featured: true
  },
  {
    id: 'gear-razer-blackshark-v2-pro',
    name: 'Razer BlackShark V2 Pro (2023 Edition) Esports Headset',
    category: 'gaming-gear',
    subCategory: 'headsets',
    brand: 'Razer',
    price: 52000,
    originalPrice: 58000,
    discountPercentage: 10,
    rating: 4.8,
    reviewCount: 83,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 17,
    isFlashDeal: false,
    specs: {
      drivers: 'TriForce Titanium 50mm Drivers',
      microphone: 'HyperClear Super Wideband Mic',
      batteryLife: 'Up to 70 Hours',
      connectivity: '2.4GHz HyperSpeed + Bluetooth 5.2'
    },
    shortDescription: 'Tournament-tuned directional acoustics and broadcast-grade team voice clarity.',
    featured: false
  },
  {
    id: 'gear-steelseries-arctis-nova-pro',
    name: 'SteelSeries Arctis Nova Pro Wireless Multi-System Headset',
    category: 'gaming-gear',
    subCategory: 'headsets',
    brand: 'SteelSeries',
    price: 98000,
    originalPrice: 108000,
    discountPercentage: 9,
    rating: 4.9,
    reviewCount: 59,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 8,
    isFlashDeal: false,
    specs: {
      anc: 'Active Noise Cancellation (4-Mic Hybrid)',
      battery: 'Infinity Power Dual Hot-Swap Batteries',
      audio: '360° Spatial Audio + Parametric EQ',
      hub: 'OLED Wireless Base Station (Dual USB)'
    },
    shortDescription: 'Flagship wireless audiophile gaming headset with non-stop hot-swappable battery system.',
    featured: true
  },

  // ==================== MONITORS ====================
  {
    id: 'gear-aoc-24g2sp-165hz',
    name: 'AOC 24G2SP 24" FHD 165Hz 1ms IPS Gaming Monitor',
    category: 'gaming-gear',
    subCategory: 'monitors',
    brand: 'AOC',
    price: 54000,
    originalPrice: 60000,
    discountPercentage: 10,
    rating: 4.7,
    reviewCount: 148,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 14,
    isFlashDeal: false,
    specs: {
      panel: '24-inch 1920x1080 IPS',
      refreshRate: '165 Hz',
      responseTime: '1ms MPRT',
      sync: 'Adaptive-Sync & Low Input Lag'
    },
    shortDescription: 'Vivid 1080p IPS esports display with ergonomic height-adjustable stand and 165Hz fluidity.',
    featured: false
  },
  {
    id: 'gear-asus-tuf-vg27aq-165hz',
    name: 'ASUS TUF Gaming VG27AQ 27" QHD 165Hz HDR Monitor',
    category: 'gaming-gear',
    subCategory: 'monitors',
    brand: 'ASUS',
    price: 92000,
    originalPrice: 102000,
    discountPercentage: 10,
    rating: 4.8,
    reviewCount: 102,
    image: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 11,
    isFlashDeal: false,
    specs: {
      panel: '27-inch 2560x1440 QHD IPS',
      refreshRate: '165 Hz (OC)',
      responseTime: '1ms MPRT (ELMB Sync)',
      sync: 'G-SYNC Compatible'
    },
    shortDescription: 'Sharp 1440p IPS sweet-spot panel combining ELMB motion-blur reduction with Adaptive-Sync.',
    featured: false
  },
  {
    id: 'gear-sony-inzone-m9',
    name: 'Sony INZONE M9 27" 4K HDR 144Hz Full Array Local Dimming',
    category: 'gaming-gear',
    subCategory: 'monitors',
    brand: 'Sony',
    price: 245000,
    originalPrice: 275000,
    discountPercentage: 11,
    rating: 4.8,
    reviewCount: 36,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 5,
    isFlashDeal: false,
    specs: {
      panel: '27" 4K (3840x2160) IPS',
      dimming: 'Full Array Local Dimming (HDR 600)',
      refreshRate: '144 Hz',
      ports: 'HDMI 2.1, DP 1.4, USB-C'
    },
    shortDescription: 'Ultra-crisp 4K HDR monitor with 96 local dimming zones for PC and console setups.',
    featured: false
  },
  {
    id: 'gear-asus-rog-swift-oled-pg27aqdm',
    name: 'ASUS ROG Swift OLED PG27AQDM 27" 240Hz 0.03ms Gaming Monitor',
    category: 'gaming-gear',
    subCategory: 'monitors',
    brand: 'ASUS',
    price: 285000,
    originalPrice: 310000,
    discountPercentage: 8,
    rating: 5.0,
    reviewCount: 43,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    stockCount: 6,
    isFlashDeal: true,
    specs: {
      panel: '27-inch 2560x1440 QHD OLED',
      refreshRate: '240 Hz',
      responseTime: '0.03ms (GTG)',
      gamut: '99% DCI-P3 & G-SYNC Compatible'
    },
    shortDescription: 'Infinite OLED contrast and near-instantaneous 0.03ms pixel response at 240Hz.',
    featured: true
  }
];

const CATEGORY_LABELS = {
  mice: 'Mice',
  keyboards: 'Mechanical Keyboards',
  headsets: 'Headsets',
  monitors: 'Monitors'
};

const NESTED_SIBLING_PAGES = new Set([
  'cart.html',
  'checkout.html',
  'order-tracking.html',
  'flash-deals.html',
  'gaming-gear.html'
]);

const filterState = {
  category: 'all',
  search: '',
  pricePreset: 'all',
  minPrice: null,
  maxPrice: null,
  sort: 'featured'
};

/**
 * Escape HTML special characters for safe rendering.
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
    renderGameVaultNavbar('gaming-gear');
  }
  if (typeof renderGameVaultFooter === 'function') {
    renderGameVaultFooter();
  }
  normalizeNestedPageLinks('#gv-navbar-container');
  normalizeNestedPageLinks('#gv-footer-container');
  observeQuickSearchLinks();

  // 2. Sync GearVault / GameVault localStorage keys on load
  syncStorageKeysOnLoad();
  if (typeof updateBadgeCounters === 'function') {
    updateBadgeCounters();
  }

  // 3. Support URL query params (?sub=mice, ?category=monitors, etc.)
  applyInitialUrlFilters();

  // 4. Populate hero stats, category counts, bind controls, and render
  updateHeroMetrics();
  updateCategoryTabCounts();
  bindFilterControls();
  renderCompareBar();
  renderGamingGearGrid();
});

// React to storage updates across tabs/components
window.addEventListener('gamevault_storage_update', () => {
  mirrorStorageToGearVaultKeys();
  syncAllCardButtonStates();
  renderCompareBar();
});

window.addEventListener('storage', (e) => {
  if (
    [
      GEARVAULT_CART_KEY,
      GEARVAULT_WISHLIST_KEY,
      GEARVAULT_COMPARE_KEY,
      'gamevault_cart',
      'gamevault_wishlist',
      'gamevault_compare'
    ].includes(e.key)
  ) {
    syncStorageKeysOnLoad();
    if (typeof updateBadgeCounters === 'function') {
      updateBadgeCounters();
    }
    syncAllCardButtonStates();
    renderCompareBar();
  }
});

/**
 * Rewrite root-relative links inside navbar/footer when served from /pages/.
 */
function normalizeNestedPageLinks(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('javascript:') ||
      href.startsWith('../')
    ) {
      return;
    }

    const baseFile = href.split('?')[0];
    if (NESTED_SIBLING_PAGES.has(baseFile)) {
      link.setAttribute('href', href);
    } else {
      link.setAttribute('href', `../${href}`);
    }
  });
}

function observeQuickSearchLinks() {
  const resultsEl = document.getElementById('gv-search-results');
  if (!resultsEl || typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver(() => {
    normalizeNestedPageLinks('#gv-search-results');
  });
  observer.observe(resultsEl, { childList: true });
}

/**
 * Read optional ?sub= or ?category= URL parameters on load.
 */
function applyInitialUrlFilters() {
  if (typeof getQueryParam !== 'function') return;
  const subParam = (getQueryParam('sub') || getQueryParam('category') || '').toLowerCase();
  if (['mice', 'keyboards', 'headsets', 'monitors'].includes(subParam)) {
    filterState.category = subParam;
  }
}

/**
 * Look up a peripheral by ID from GAMING_GEAR_PERIPHERALS.
 */
function getPeripheralById(productId) {
  return GAMING_GEAR_PERIPHERALS.find((item) => item.id === productId) || null;
}

/**
 * Update Hero catalog metrics.
 */
function updateHeroMetrics() {
  const totalEl = document.getElementById('gear-total-count');
  const spectrumEl = document.getElementById('gear-price-spectrum');

  if (totalEl) {
    totalEl.textContent = String(GAMING_GEAR_PERIPHERALS.length);
  }
  if (spectrumEl && GAMING_GEAR_PERIPHERALS.length > 0) {
    const prices = GAMING_GEAR_PERIPHERALS.map((p) => p.price);
    const minVal = Math.min(...prices);
    const maxVal = Math.max(...prices);
    const fmt = typeof formatPKR === 'function' ? formatPKR : (v) => `Rs. ${Number(v).toLocaleString('en-PK')}`;
    spectrumEl.textContent = `${fmt(minVal)} – ${fmt(maxVal)}`;
  }
}

/**
 * Update category tab badge counts.
 */
function updateCategoryTabCounts() {
  document.querySelectorAll('#gear-category-tabs [data-count-for]').forEach((badge) => {
    const cat = badge.getAttribute('data-count-for');
    const count = cat === 'all'
      ? GAMING_GEAR_PERIPHERALS.length
      : GAMING_GEAR_PERIPHERALS.filter((p) => p.subCategory === cat).length;
    badge.textContent = String(count);
  });
}

/**
 * Wire up category tabs, live product name search, price range presets, min/max inputs, and sorting.
 */
function bindFilterControls() {
  const tabs = document.querySelectorAll('#gear-category-tabs .gv-category-tab');
  tabs.forEach((tab) => {
    const cat = tab.getAttribute('data-category');
    const isActive = cat === filterState.category;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');

    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      filterState.category = cat || 'all';
      renderGamingGearGrid();
    });
  });

  const searchInput = document.getElementById('gear-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterState.search = e.target.value.trim().toLowerCase();
      renderGamingGearGrid();
    });
  }

  const priceRangeSelect = document.getElementById('gear-price-range');
  const minInput = document.getElementById('gear-min-price');
  const maxInput = document.getElementById('gear-max-price');

  if (priceRangeSelect) {
    priceRangeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      filterState.pricePreset = val;

      if (val === 'all') {
        filterState.minPrice = null;
        filterState.maxPrice = null;
        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';
      } else if (val !== 'custom') {
        const [minStr, maxStr] = val.split('-');
        const minNum = Number(minStr);
        const maxNum = Number(maxStr);
        filterState.minPrice = Number.isFinite(minNum) ? minNum : null;
        filterState.maxPrice = Number.isFinite(maxNum) ? maxNum : null;
        if (minInput) minInput.value = minNum > 0 ? String(minNum) : '';
        if (maxInput) maxInput.value = maxNum < 9999999 ? String(maxNum) : '';
      }

      renderGamingGearGrid();
    });
  }

  const handleCustomPriceInput = () => {
    const rawMin = minInput ? minInput.value.trim() : '';
    const rawMax = maxInput ? maxInput.value.trim() : '';

    filterState.minPrice = rawMin !== '' && !isNaN(Number(rawMin)) ? Math.max(0, Number(rawMin)) : null;
    filterState.maxPrice = rawMax !== '' && !isNaN(Number(rawMax)) ? Math.max(0, Number(rawMax)) : null;

    if (priceRangeSelect) {
      priceRangeSelect.value = filterState.minPrice !== null || filterState.maxPrice !== null ? 'custom' : 'all';
      filterState.pricePreset = priceRangeSelect.value;
    }

    renderGamingGearGrid();
  };

  if (minInput) minInput.addEventListener('input', handleCustomPriceInput);
  if (maxInput) maxInput.addEventListener('input', handleCustomPriceInput);

  const sortSelect = document.getElementById('gear-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filterState.sort = e.target.value;
      renderGamingGearGrid();
    });
  }

  const resetBtn = document.getElementById('gear-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }

  const clearCompareBtn = document.getElementById('gear-clear-compare-btn');
  if (clearCompareBtn) {
    clearCompareBtn.addEventListener('click', () => {
      writeCompareList([]);
      syncAllCardButtonStates();
      renderCompareBar();
      if (typeof showToast === 'function') {
        showToast('Cleared all items from Compare list.', 'warning');
      }
    });
  }
}

/**
 * Filter and sort peripherals from GAMING_GEAR_PERIPHERALS.
 */
function getFilteredAndSortedPeripherals() {
  const filtered = GAMING_GEAR_PERIPHERALS.filter((item) => {
    if (filterState.category !== 'all' && item.subCategory !== filterState.category) {
      return false;
    }

    if (filterState.search && !item.name.toLowerCase().includes(filterState.search)) {
      return false;
    }

    if (filterState.minPrice !== null && item.price < filterState.minPrice) {
      return false;
    }

    if (filterState.maxPrice !== null && item.price > filterState.maxPrice) {
      return false;
    }

    return true;
  });

  if (filterState.sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filterState.sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    filtered.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }

  return filtered;
}

function hasActiveFilters() {
  return (
    filterState.category !== 'all' ||
    filterState.search !== '' ||
    filterState.minPrice !== null ||
    filterState.maxPrice !== null ||
    filterState.sort !== 'featured'
  );
}

/**
 * Render the peripheral cards grid or the "No matching peripherals found" empty state.
 */
function renderGamingGearGrid() {
  const grid = document.getElementById('gaming-gear-grid');
  const countEl = document.getElementById('gear-showing-count');
  const resetBtn = document.getElementById('gear-reset-btn');
  if (!grid) return;

  const items = getFilteredAndSortedPeripherals();

  if (countEl) {
    countEl.textContent = `Showing ${items.length} of ${GAMING_GEAR_PERIPHERALS.length} peripherals`;
  }
  if (resetBtn) {
    resetBtn.classList.toggle('d-none', !hasActiveFilters());
  }

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="gv-empty-state" role="status" aria-live="polite">
          <div class="gv-empty-icon"><i class="bi bi-search" aria-hidden="true"></i></div>
          <h3 class="gv-empty-title">No matching peripherals found</h3>
          <p class="text-secondary mx-auto mb-4" style="max-width: 480px;">
            Try adjusting your product search, switching peripheral categories, or widening your PKR price range.
          </p>
          <button type="button" class="gv-btn gv-btn-cyan" onclick="resetAllFilters()">
            <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Reset All Filters
          </button>
        </div>
      </div>
    `;
    return;
  }

  const wishlist = readWishlist();
  const compareList = readCompareList();

  grid.innerHTML = items.map((product) => {
    const isWishlisted = wishlist.includes(product.id);
    const isCompared = compareList.includes(product.id);
    const safeId = escapeHtml(product.id);
    const safeName = escapeHtml(product.name);
    const categoryLabel = CATEGORY_LABELS[product.subCategory] || product.subCategory;
    const specValues = product.specs ? Object.values(product.specs).slice(0, 3) : [];
    const starsHtml = typeof renderStars === 'function' ? renderStars(product.rating) : `${product.rating}`;
    const priceStr = typeof formatPKR === 'function' ? formatPKR(product.price) : `Rs. ${product.price.toLocaleString('en-PK')}`;
    const origPriceStr = product.originalPrice && product.originalPrice > product.price
      ? (typeof formatPKR === 'function' ? formatPKR(product.originalPrice) : `Rs. ${product.originalPrice.toLocaleString('en-PK')}`)
      : '';
    const savings = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0;
    const savingsStr = savings > 0
      ? (typeof formatPKR === 'function' ? formatPKR(savings) : `Rs. ${savings.toLocaleString('en-PK')}`)
      : '';

    return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <article class="gv-product-card" data-product-id="${safeId}">
          <div class="gv-product-badge-group">
            ${product.isFlashDeal ? `<span class="gv-badge gv-badge-deal"><i class="bi bi-lightning-charge-fill" aria-hidden="true"></i> -${product.discountPercentage}%</span>` : ''}
            <span class="gv-badge ${product.inStock ? 'gv-badge-instock' : 'gv-badge-lowstock'}">
              ${product.inStock ? 'In Stock' : 'Limited'}
            </span>
          </div>

          <div class="gv-product-actions-floating">
            <button type="button"
                    class="gv-btn-icon ${isWishlisted ? 'wishlist-active' : ''}"
                    data-wishlist-icon="${safeId}"
                    onclick="handleGearWishlist('${safeId}')"
                    title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                    aria-label="${isWishlisted ? `Remove ${safeName} from Wishlist` : `Add ${safeName} to Wishlist`}">
              <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>
            </button>
            <button type="button"
                    class="gv-btn-icon ${isCompared ? 'compare-active' : ''}"
                    data-compare-icon="${safeId}"
                    onclick="handleGearCompare('${safeId}')"
                    title="${isCompared ? 'Remove from Compare' : 'Add to Compare'}"
                    aria-label="${isCompared ? `Remove ${safeName} from Compare` : `Add ${safeName} to Compare`}">
              <i class="bi bi-arrow-left-right" aria-hidden="true"></i>
            </button>
          </div>

          <div class="gv-product-thumb">
            <img src="${escapeHtml(product.image)}"
                 alt="${safeName}"
                 data-fallback-label="${safeName}"
                 loading="lazy"
                 onerror="handleImgError(this, this.dataset.fallbackLabel)">
          </div>

          <div class="gv-product-body">
            <div class="gv-product-category">${escapeHtml(product.brand)} &bull; ${escapeHtml(categoryLabel)}</div>
            <h3 class="gv-product-title" title="${safeName}">${safeName}</h3>

            <div class="gv-rating-wrap">
              ${starsHtml}
              <span class="text-muted ms-1">(${product.reviewCount})</span>
            </div>

            ${specValues.length > 0 ? `
              <div class="gv-product-specs-list">
                ${specValues.map((val) => `<span class="gv-spec-pill">${escapeHtml(val)}</span>`).join('')}
              </div>
            ` : ''}

            <div class="gv-product-footer flex-column align-items-stretch">
              <div class="d-flex justify-content-between align-items-end">
                <div class="gv-price-wrap">
                  <span class="gv-price-current text-cyan">${priceStr}</span>
                  ${origPriceStr ? `<span class="gv-price-original">${origPriceStr}</span>` : ''}
                </div>
                ${savingsStr ? `<span class="gv-savings-tag">Save ${savingsStr}</span>` : ''}
              </div>

              <div class="gv-gear-actions">
                <button type="button"
                        class="gv-btn gv-btn-cyan gv-btn-sm w-100"
                        data-add-cart="${safeId}"
                        onclick="handleGearAddToCart('${safeId}', this)">
                  <i class="bi bi-cart-plus" aria-hidden="true"></i> Add to Cart
                </button>
              </div>

              <div class="gv-gear-secondary-actions">
                <button type="button"
                        class="gv-btn gv-btn-wishlist gv-btn-sm ${isWishlisted ? 'wishlist-active' : ''}"
                        data-wishlist-btn="${safeId}"
                        onclick="handleGearWishlist('${safeId}')"
                        aria-pressed="${isWishlisted ? 'true' : 'false'}">
                  <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>
                  <span>${isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
                <button type="button"
                        class="gv-btn gv-btn-compare gv-btn-sm ${isCompared ? 'compare-active' : ''}"
                        data-compare-btn="${safeId}"
                        onclick="handleGearCompare('${safeId}')"
                        aria-pressed="${isCompared ? 'true' : 'false'}">
                  <i class="bi bi-arrow-left-right" aria-hidden="true"></i>
                  <span>${isCompared ? 'In Compare' : 'Compare'}</span>
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
 * Reset all active filters back to default state.
 */
function resetAllFilters() {
  filterState.category = 'all';
  filterState.search = '';
  filterState.pricePreset = 'all';
  filterState.minPrice = null;
  filterState.maxPrice = null;
  filterState.sort = 'featured';

  const searchInput = document.getElementById('gear-search-input');
  if (searchInput) searchInput.value = '';

  const priceRangeSelect = document.getElementById('gear-price-range');
  if (priceRangeSelect) priceRangeSelect.value = 'all';

  const minInput = document.getElementById('gear-min-price');
  if (minInput) minInput.value = '';

  const maxInput = document.getElementById('gear-max-price');
  if (maxInput) maxInput.value = '';

  const sortSelect = document.getElementById('gear-sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  document.querySelectorAll('#gear-category-tabs .gv-category-tab').forEach((tab) => {
    const isAll = tab.getAttribute('data-category') === 'all';
    tab.classList.toggle('active', isAll);
    tab.setAttribute('aria-selected', isAll ? 'true' : 'false');
  });

  renderGamingGearGrid();
}

/* ==================== LOCALSTORAGE HELPERS ==================== */

function readJsonArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeJsonArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[GearVault] Failed writing ${key}:`, e);
    return false;
  }
}

function readCart() {
  return readJsonArray(GEARVAULT_CART_KEY);
}

function writeCart(cart) {
  writeJsonArray(GEARVAULT_CART_KEY, cart);
  if (typeof StorageManager !== 'undefined') {
    StorageManager.saveCart(cart);
  }
  if (typeof updateBadgeCounters === 'function') {
    updateBadgeCounters();
  }
}

function readWishlist() {
  return readJsonArray(GEARVAULT_WISHLIST_KEY);
}

function writeWishlist(wishlist) {
  writeJsonArray(GEARVAULT_WISHLIST_KEY, wishlist);
  if (typeof StorageManager !== 'undefined') {
    StorageManager.saveWishlist(wishlist);
  }
  if (typeof updateBadgeCounters === 'function') {
    updateBadgeCounters();
  }
}

function readCompareList() {
  return readJsonArray(GEARVAULT_COMPARE_KEY);
}

function writeCompareList(list) {
  writeJsonArray(GEARVAULT_COMPARE_KEY, list);
  if (typeof StorageManager !== 'undefined') {
    StorageManager.saveCompareList(list);
  }
}

function syncStorageKeysOnLoad() {
  if (typeof StorageManager === 'undefined') return;

  const gvCart = readCart();
  const smCart = StorageManager.getCart();
  if (gvCart.length > 0 && smCart.length === 0) {
    StorageManager.saveCart(gvCart);
  } else if (gvCart.length === 0 && smCart.length > 0) {
    writeJsonArray(GEARVAULT_CART_KEY, smCart);
  }

  const gvWishlist = readWishlist();
  const smWishlist = StorageManager.getWishlist();
  if (gvWishlist.length > 0 && smWishlist.length === 0) {
    StorageManager.saveWishlist(gvWishlist);
  } else if (gvWishlist.length === 0 && smWishlist.length > 0) {
    writeJsonArray(GEARVAULT_WISHLIST_KEY, smWishlist);
  }

  const gvCompare = readCompareList();
  const smCompare = StorageManager.getCompareList();
  if (gvCompare.length > 0 && smCompare.length === 0) {
    StorageManager.saveCompareList(gvCompare);
  } else if (gvCompare.length === 0 && smCompare.length > 0) {
    writeJsonArray(GEARVAULT_COMPARE_KEY, smCompare);
  }
}

function mirrorStorageToGearVaultKeys() {
  if (typeof StorageManager === 'undefined') return;
  writeJsonArray(GEARVAULT_CART_KEY, StorageManager.getCart());
  writeJsonArray(GEARVAULT_WISHLIST_KEY, StorageManager.getWishlist());
  writeJsonArray(GEARVAULT_COMPARE_KEY, StorageManager.getCompareList());
}

/* ==================== BUTTON ACTION HANDLERS ==================== */

function handleGearAddToCart(productId, btnElement) {
  const product = getPeripheralById(productId);
  if (!product) return;

  const cart = readCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity = (parseInt(existing.quantity ?? existing.qty ?? 1, 10) || 1) + 1;
    delete existing.qty;
  } else {
    cart.push({
      id: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      brand: product.brand,
      category: product.subCategory,
      options: {}
    });
  }

  writeCart(cart);

  if (btnElement) {
    const defaultHtml = '<i class="bi bi-cart-plus" aria-hidden="true"></i> Add to Cart';
    btnElement.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Added!';
    setTimeout(() => {
      btnElement.innerHTML = defaultHtml;
    }, 1100);
  }

  if (typeof showToast === 'function') {
    showToast(`Added <strong>${escapeHtml(product.name)}</strong> to Cart!`, 'success');
  }
}

function handleGearWishlist(productId) {
  const product = getPeripheralById(productId);
  let wishlist = readWishlist();
  const exists = wishlist.includes(productId);

  if (exists) {
    wishlist = wishlist.filter((id) => id !== productId);
  } else {
    wishlist.push(productId);
  }

  writeWishlist(wishlist);
  syncWishlistUIForProduct(productId, !exists);

  const label = product ? escapeHtml(product.name) : 'Peripheral';
  if (typeof showToast === 'function') {
    if (!exists) {
      showToast(`Saved <strong>${label}</strong> to Wishlist!`, 'cyan');
    } else {
      showToast(`Removed <strong>${label}</strong> from Wishlist.`, 'warning');
    }
  }
}

function handleGearCompare(productId) {
  const product = getPeripheralById(productId);
  let compareList = readCompareList();
  const exists = compareList.includes(productId);

  if (exists) {
    compareList = compareList.filter((id) => id !== productId);
    writeCompareList(compareList);
    syncCompareUIForProduct(productId, false);
    renderCompareBar();
    if (typeof showToast === 'function') {
      const label = product ? escapeHtml(product.name) : 'Peripheral';
      showToast(`Removed <strong>${label}</strong> from Compare.`, 'warning');
    }
    return;
  }

  if (compareList.length >= MAX_COMPARE_ITEMS) {
    if (typeof showToast === 'function') {
      showToast(`Maximum ${MAX_COMPARE_ITEMS} items can be compared at once.`, 'warning');
    }
    return;
  }

  compareList.push(productId);
  writeCompareList(compareList);
  syncCompareUIForProduct(productId, true);
  renderCompareBar();

  if (typeof showToast === 'function') {
    const label = product ? escapeHtml(product.name) : 'Peripheral';
    showToast(`Added <strong>${label}</strong> to Compare (${compareList.length}/${MAX_COMPARE_ITEMS})!`, 'cyan');
  }
}

function syncWishlistUIForProduct(productId, isAdded) {
  document.querySelectorAll(`[data-wishlist-icon="${productId}"]`).forEach((btn) => {
    btn.classList.toggle('wishlist-active', isAdded);
    btn.title = isAdded ? 'Remove from Wishlist' : 'Add to Wishlist';
    btn.innerHTML = `<i class="bi ${isAdded ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>`;
  });

  document.querySelectorAll(`[data-wishlist-btn="${productId}"]`).forEach((btn) => {
    btn.classList.toggle('wishlist-active', isAdded);
    btn.setAttribute('aria-pressed', isAdded ? 'true' : 'false');
    btn.innerHTML = `<i class="bi ${isWishlistedIcon(isAdded)}" aria-hidden="true"></i> <span>${isAdded ? 'Wishlisted' : 'Wishlist'}</span>`;
  });
}

function isWishlistedIcon(isAdded) {
  return isAdded ? 'bi-heart-fill' : 'bi-heart';
}

function syncCompareUIForProduct(productId, isCompared) {
  document.querySelectorAll(`[data-compare-icon="${productId}"]`).forEach((btn) => {
    btn.classList.toggle('compare-active', isCompared);
    btn.title = isCompared ? 'Remove from Compare' : 'Add to Compare';
  });

  document.querySelectorAll(`[data-compare-btn="${productId}"]`).forEach((btn) => {
    btn.classList.toggle('compare-active', isCompared);
    btn.setAttribute('aria-pressed', isCompared ? 'true' : 'false');
    btn.innerHTML = `<i class="bi bi-arrow-left-right" aria-hidden="true"></i> <span>${isCompared ? 'In Compare' : 'Compare'}</span>`;
  });
}

function syncAllCardButtonStates() {
  const wishlist = readWishlist();
  const compareList = readCompareList();

  document.querySelectorAll('[data-wishlist-btn]').forEach((btn) => {
    const id = btn.getAttribute('data-wishlist-btn');
    if (id) syncWishlistUIForProduct(id, wishlist.includes(id));
  });

  document.querySelectorAll('[data-compare-btn]').forEach((btn) => {
    const id = btn.getAttribute('data-compare-btn');
    if (id) syncCompareUIForProduct(id, compareList.includes(id));
  });
}

/**
 * Render the active Compare Queue bar & update hero compare counter.
 */
function renderCompareBar() {
  const compareList = readCompareList();
  const bar = document.getElementById('gear-compare-bar');
  const barCount = document.getElementById('gear-compare-bar-count');
  const heroCount = document.getElementById('gear-compare-hero-count');
  const chipsContainer = document.getElementById('gear-compare-chips');

  if (heroCount) {
    heroCount.textContent = `${compareList.length} / ${MAX_COMPARE_ITEMS}`;
  }
  if (barCount) {
    barCount.textContent = String(compareList.length);
  }
  if (!bar || !chipsContainer) return;

  if (compareList.length === 0) {
    bar.classList.add('d-none');
    chipsContainer.innerHTML = '';
    return;
  }

  bar.classList.remove('d-none');
  chipsContainer.innerHTML = compareList.map((id) => {
    const product = getPeripheralById(id) || (typeof getProductById === 'function' ? getProductById(id) : null);
    const label = product ? product.name : id;
    const safeId = escapeHtml(id);
    return `
      <span class="gv-compare-chip">
        <span>${escapeHtml(label)}</span>
        <button type="button" onclick="handleGearCompare('${safeId}')" aria-label="Remove ${escapeHtml(label)} from compare">
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </span>
    `;
  }).join('');
}
