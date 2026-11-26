/**
 * GEARVAULT - Custom PC Builder Controller
 * University Semester Project - Group 08
 * 
 * Features:
 * - 6 Interactive Component Slots (CPU, Motherboard, RAM, GPU, Storage, PSU)
 * - Live Socket & Wattage Compatibility Checks (Green OK badges vs Red Mismatch warnings)
 * - Real-time Total Price (PKR) and System Wattage Calculations
 * - One-click Presets (AM5 Esports, Intel 14th Gen 4K, Budget 1080p)
 * - Component Picker Modal with Search & Brand Filters
 * - Persistent "Save Build" to localStorage (gearvault_builder / gamevault_builder)
 * - "Add Complete Build to Cart" (gearvault_cart) synced with navbar badges & StorageManager
 */

const GEARVAULT_BUILDER_KEY = 'gearvault_builder';
const GEARVAULT_CART_KEY = 'gearvault_cart';

// 6 Core Hardware Component Slots
const BUILDER_SLOTS = [
  {
    key: 'cpu',
    label: 'Processor (CPU)',
    subCategory: 'cpu',
    icon: 'bi-cpu',
    color: 'cyan',
    badge: 'Compute Engine',
    placeholder: 'Select a high-performance processor...'
  },
  {
    key: 'motherboard',
    label: 'Motherboard',
    subCategory: 'motherboard',
    icon: 'bi-motherboard',
    color: 'violet',
    badge: 'System Backbone',
    placeholder: 'Select a compatible motherboard...'
  },
  {
    key: 'ram',
    label: 'Memory (RAM)',
    subCategory: 'ram',
    icon: 'bi-memory',
    color: 'cyan',
    badge: 'System Memory',
    placeholder: 'Select high-speed DDR4 / DDR5 RAM...'
  },
  {
    key: 'gpu',
    label: 'Graphics Card (GPU)',
    subCategory: 'gpu',
    icon: 'bi-gpu-card',
    color: 'violet',
    badge: 'Visual Graphics',
    placeholder: 'Select a dedicated graphics card...'
  },
  {
    key: 'storage',
    label: 'Primary Storage (SSD)',
    subCategory: 'storage',
    icon: 'bi-device-hdd',
    color: 'cyan',
    badge: 'NVMe Storage',
    placeholder: 'Select ultra-fast PCIe Gen 4 SSD...'
  },
  {
    key: 'psu',
    label: 'Power Supply (PSU)',
    subCategory: 'psu',
    icon: 'bi-lightning-charge',
    color: 'violet',
    badge: 'Power Delivery',
    placeholder: 'Select an 80+ Gold certified PSU...'
  }
];

// Active Build State
let currentBuild = {
  cpu: null,
  motherboard: null,
  ram: null,
  gpu: null,
  storage: null,
  psu: null
};

// Modal picker state
let activeModalSlotKey = null;

// Build Presets
const BUILD_PRESETS = {
  am5_esports: {
    name: 'AM5 Competitive 1440p Rig',
    slots: {
      cpu: 'cpu-amd-ryzen-7800x3d',
      motherboard: 'mb-asus-rog-strix-b650-a',
      ram: 'ram-corsair-vengeance-rgb-32gb-ddr5',
      gpu: 'gpu-zotac-rtx-4070-super',
      storage: 'ssd-samsung-990-pro-2tb',
      psu: 'psu-corsair-rm850x-shift'
    }
  },
  intel_titan: {
    name: 'Intel 14th Gen 4K Titan',
    slots: {
      cpu: 'cpu-intel-i7-14700k',
      motherboard: 'mb-msi-mag-z790-tomahawk',
      ram: 'ram-gskill-trident-z5-rgb-32gb-ddr5',
      gpu: 'gpu-asus-rtx-4090-rog-strix',
      storage: 'ssd-samsung-990-pro-2tb',
      psu: 'psu-corsair-rm850x-shift'
    }
  },
  budget_stealth: {
    name: 'Budget 1080p Value Rig',
    slots: {
      cpu: 'cpu-amd-ryzen-7600x',
      motherboard: 'mb-gigabyte-b650-eagle-ax',
      ram: 'ram-corsair-vengeance-rgb-32gb-ddr5',
      gpu: 'gpu-msi-rtx-4060-ventus',
      storage: 'ssd-kingston-kc3000-1tb',
      psu: 'psu-deepcool-pn650m'
    }
  }
};

/**
 * Initialize PC Builder on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Navbar and Footer with nested relative links
  if (typeof GearVaultPages !== 'undefined' && typeof GearVaultPages.initNestedLayout === 'function') {
    GearVaultPages.initNestedLayout('pc-builder');
  } else {
    if (typeof renderGameVaultNavbar === 'function') {
      renderGameVaultNavbar('pc-builder');
    }
    if (typeof renderGameVaultFooter === 'function') {
      renderGameVaultFooter();
    }
    normalizeNestedLinks();
  }

  // 2. Load any saved build from localStorage or pre-populate defaults
  loadInitialBuildState();

  // 3. Render the 6 component slot interfaces
  renderAllComponentSlots();

  // 4. Bind event listeners for actions (save, cart, clear, presets, modal)
  bindBuilderEvents();

  // 5. Run live compatibility checks and calculation
  updateCalculationsAndCompatibility();
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
      if (['cart.html', 'flash-deals.html', 'pc-builder.html', 'checkout.html'].includes(href)) {
        // Keep sibling page link
      } else if (!href.startsWith('../')) {
        link.setAttribute('href', `../${href}`);
      }
    });
  });
}

/**
 * Load initial build state from localStorage or query params
 */
function loadInitialBuildState() {
  // Check URL query param preset (e.g. ?preset=am5_esports)
  if (typeof getQueryParam === 'function') {
    const presetParam = getQueryParam('preset');
    if (presetParam && BUILD_PRESETS[presetParam]) {
      currentBuild = { ...BUILD_PRESETS[presetParam].slots };
      return;
    }
  }

  // Check gearvault_builder key
  try {
    const saved = localStorage.getItem(GEARVAULT_BUILDER_KEY) || localStorage.getItem('gamevault_builder');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        BUILDER_SLOTS.forEach(slot => {
          if (parsed[slot.key]) {
            currentBuild[slot.key] = parsed[slot.key];
          }
        });
        const savedNotice = document.getElementById('builder-saved-notice');
        if (savedNotice) {
          savedNotice.textContent = 'Loaded your previously saved build from local storage.';
          savedNotice.classList.remove('d-none');
        }
        return;
      }
    }
  } catch (e) {
    console.warn('[PC Builder] Failed to load saved build:', e);
  }

  // Default initial configuration: AM5 Esports Battlestation for immediate rich UX
  currentBuild = { ...BUILD_PRESETS.am5_esports.slots };
}

/**
 * Render all 6 component slots in the builder grid
 */
function renderAllComponentSlots() {
  const container = document.getElementById('gv-builder-slots-container');
  if (!container) return;

  container.innerHTML = BUILDER_SLOTS.map(slot => renderSlotHtml(slot)).join('');

  // Attach change event listeners to each slot's <select>
  BUILDER_SLOTS.forEach(slot => {
    const selectEl = document.getElementById(`select-${slot.key}`);
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        setSlotComponent(slot.key, e.target.value || null);
      });
    }

    const clearBtn = document.getElementById(`clear-slot-${slot.key}`);
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        setSlotComponent(slot.key, null);
      });
    }

    const browseBtn = document.getElementById(`browse-slot-${slot.key}`);
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        openComponentPicker(slot.key);
      });
    }
  });
}

/**
 * Generate HTML for an individual component slot
 */
function renderSlotHtml(slot) {
  const selectedId = currentBuild[slot.key];
  const selectedProduct = selectedId && typeof getProductById === 'function' ? getProductById(selectedId) : null;
  const isFilled = Boolean(selectedProduct);

  // Available products for this slot's subCategory
  const availableProducts = (typeof GAMEVAULT_PRODUCTS !== 'undefined')
    ? GAMEVAULT_PRODUCTS.filter(p => p.subCategory === slot.subCategory)
    : [];

  // Specs pill tags
  let specsHtml = '';
  if (selectedProduct && selectedProduct.specs) {
    const specs = selectedProduct.specs;
    if (slot.key === 'cpu') {
      specsHtml = `
        <span class="gv-spec-pill"><i class="bi bi-cpu me-1"></i> Socket: <strong>${specs.socket || 'N/A'}</strong></span>
        <span class="gv-spec-pill"><i class="bi bi-layers me-1"></i> ${specs.cores || ''}</span>
        <span class="gv-spec-pill"><i class="bi bi-memory me-1"></i> ${specs.ramSupport || ''}</span>
      `;
    } else if (slot.key === 'motherboard') {
      specsHtml = `
        <span class="gv-spec-pill"><i class="bi bi-cpu me-1"></i> Socket: <strong>${specs.socket || 'N/A'}</strong></span>
        <span class="gv-spec-pill"><i class="bi bi-memory me-1"></i> RAM: <strong>${specs.ramSupport || ''}</strong></span>
        <span class="gv-spec-pill"><i class="bi bi-motherboard me-1"></i> ${specs.formFactor || 'ATX'}</span>
      `;
    } else if (slot.key === 'ram') {
      specsHtml = `
        <span class="gv-spec-pill"><i class="bi bi-memory me-1"></i> Type: <strong>${specs.type || 'DDR5'}</strong></span>
        <span class="gv-spec-pill"><i class="bi bi-speedometer2 me-1"></i> ${specs.speed || ''}</span>
        <span class="gv-spec-pill"><i class="bi bi-hdd-stack me-1"></i> ${specs.capacity || ''}</span>
      `;
    } else if (slot.key === 'gpu') {
      specsHtml = `
        <span class="gv-spec-pill"><i class="bi bi-gpu-card me-1"></i> VRAM: <strong>${specs.vram || ''}</strong></span>
        <span class="gv-spec-pill"><i class="bi bi-lightning me-1"></i> Rec PSU: <strong>${specs.recommendedPsu || ''}</strong></span>
      `;
    } else if (slot.key === 'storage') {
      specsHtml = `
        <span class="gv-spec-pill"><i class="bi bi-device-hdd me-1"></i> ${specs.formFactor || 'M.2'}</span>
        <span class="gv-spec-pill"><i class="bi bi-speedometer me-1"></i> ${specs.readSpeed || ''}</span>
      `;
    } else if (slot.key === 'psu') {
      specsHtml = `
        <span class="gv-spec-pill"><i class="bi bi-lightning-charge me-1"></i> Output: <strong>${selectedProduct.wattage}W</strong></span>
        <span class="gv-spec-pill"><i class="bi bi-award me-1"></i> ${specs.efficiency || '80+ Gold'}</span>
        <span class="gv-spec-pill"><i class="bi bi-diagram-3 me-1"></i> ${specs.modularity || 'Modular'}</span>
      `;
    }
  }

  const slotWattage = selectedProduct ? (selectedProduct.wattage || 0) : 0;
  const priceDisplay = selectedProduct ? (typeof formatPKR === 'function' ? formatPKR(selectedProduct.price) : `Rs. ${selectedProduct.price.toLocaleString()}`) : 'Rs. 0';

  return `
    <div class="gv-builder-slot ${isFilled ? 'is-filled' : 'is-empty'}" id="slot-card-${slot.key}">
      <div class="gv-slot-header-mobile d-md-none mb-2">
        <span class="gv-slot-category">${slot.label}</span>
      </div>

      <div class="gv-slot-info">
        <div class="gv-slot-icon-wrap" title="${slot.label}">
          <i class="bi ${slot.icon}"></i>
        </div>

        <div class="gv-slot-details flex-grow-1">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <span class="gv-slot-category text-cyan">
              <i class="bi ${slot.icon} me-1"></i> ${slot.label}
            </span>
            ${isFilled ? `
              <span class="gv-slot-wattage-pill ${slot.key === 'psu' ? 'bg-violet' : ''}">
                <i class="bi bi-lightning-charge-fill me-1"></i> ${slot.key === 'psu' ? `${slotWattage}W Rated` : `+${slotWattage}W`}
              </span>
            ` : '<span class="badge bg-dark border border-secondary text-secondary small">Slot Empty</span>'}
          </div>

          ${isFilled ? `
            <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
              <div class="gv-slot-thumbnail">
                <img src="${selectedProduct.image}" alt="${selectedProduct.name}" 
                     onerror="if(typeof handleImgError === 'function') handleImgError(this, '${selectedProduct.name}')">
              </div>
              <div class="flex-grow-1">
                <h4 class="gv-slot-product-name mb-1">
                  <span class="badge bg-dark border border-cyan text-cyan me-1">${selectedProduct.brand || 'GearVault'}</span>
                  ${selectedProduct.name}
                </h4>
                <div class="gv-slot-specs-row mb-2">
                  ${specsHtml}
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="gv-slot-price">${priceDisplay}</span>
                  ${selectedProduct.originalPrice ? `
                    <span class="text-decoration-line-through text-muted small">
                      ${typeof formatPKR === 'function' ? formatPKR(selectedProduct.originalPrice) : `Rs. ${selectedProduct.originalPrice.toLocaleString()}`}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
          ` : `
            <div class="gv-slot-empty-state">
              <div class="text-secondary small mb-2">${slot.placeholder}</div>
            </div>
          `}
        </div>
      </div>

      <!-- Slot Controls (Dropdown & Buttons) -->
      <div class="gv-slot-actions">
        <div class="d-flex flex-column gap-2 w-100">
          <select id="select-${slot.key}" class="gv-select gv-slot-select" aria-label="Select ${slot.label}">
            <option value="">-- Choose ${slot.label} --</option>
            ${availableProducts.map(p => {
              const isSelected = p.id === selectedId;
              const formatted = typeof formatPKR === 'function' ? formatPKR(p.price) : `Rs. ${p.price}`;
              let extra = '';
              if (slot.key === 'cpu' || slot.key === 'motherboard') extra = ` [${p.specs?.socket || ''}]`;
              if (slot.key === 'ram') extra = ` [${p.specs?.type || ''} ${p.specs?.speed || ''}]`;
              if (slot.key === 'psu') extra = ` [${p.wattage}W]`;
              if (slot.key === 'gpu') extra = ` [${p.specs?.vram || ''}]`;
              return `<option value="${p.id}" ${isSelected ? 'selected' : ''}>${p.name}${extra} &bull; ${formatted}</option>`;
            }).join('')}
          </select>

          <div class="d-flex gap-2">
            <button type="button" id="browse-slot-${slot.key}" class="gv-btn gv-btn-sm gv-btn-glass flex-grow-1" title="Browse options">
              <i class="bi bi-grid-3x3-gap"></i> Browse
            </button>
            ${isFilled ? `
              <button type="button" id="clear-slot-${slot.key}" class="gv-btn gv-btn-sm gv-btn-glass text-danger" title="Remove component">
                <i class="bi bi-trash3"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Set component for a slot and refresh UI & calculations
 */
function setSlotComponent(slotKey, productId) {
  currentBuild[slotKey] = productId || null;
  renderAllComponentSlots();
  updateCalculationsAndCompatibility();

  // If StorageManager is available, sync builder slot
  if (typeof StorageManager !== 'undefined' && typeof StorageManager.setBuilderSlot === 'function') {
    if (productId) {
      StorageManager.setBuilderSlot(slotKey, productId);
    } else {
      StorageManager.removeBuilderSlot(slotKey);
    }
  }

  // Hide saved notice if modified
  const savedNotice = document.getElementById('builder-saved-notice');
  if (savedNotice) {
    savedNotice.classList.add('d-none');
  }
}

/**
 * Live Compatibility Engine & Real-Time Price/Wattage Calculation
 */
function updateCalculationsAndCompatibility() {
  // 1. Run CompatibilityEngine check
  let compat = {
    isCompatible: true,
    issues: [],
    warnings: [],
    totalWattage: 50,
    recommendedWattage: 63,
    socketCheck: { isOk: true, evaluated: false, message: 'Select CPU and Motherboard' },
    ramCheck: { isOk: true, evaluated: false, message: 'Select Motherboard and RAM' },
    psuCheck: { isOk: true, evaluated: false, capacity: 0, message: 'Select a PSU' }
  };

  if (typeof CompatibilityEngine !== 'undefined' && typeof CompatibilityEngine.validateBuild === 'function') {
    compat = CompatibilityEngine.validateBuild(currentBuild);
  } else {
    // Fallback internal compatibility logic
    compat = runInternalCompatibilityCheck(currentBuild);
  }

  // 2. Real-time Total Price Calculation
  let totalPrice = 0;
  let filledCount = 0;
  const selectedItems = [];

  BUILDER_SLOTS.forEach(slot => {
    const pId = currentBuild[slot.key];
    if (pId && typeof getProductById === 'function') {
      const prod = getProductById(pId);
      if (prod) {
        totalPrice += Number(prod.price || 0);
        filledCount++;
        selectedItems.push({ slot: slot.label, product: prod });
      }
    }
  });

  // 3. Update Summary Card UI Elements
  // Total Price
  const priceEl = document.getElementById('builder-total-price');
  if (priceEl) {
    priceEl.textContent = typeof formatPKR === 'function' ? formatPKR(totalPrice) : `Rs. ${totalPrice.toLocaleString()}`;
  }

  // Item counter badge
  const countBadge = document.getElementById('builder-slots-count');
  if (countBadge) {
    countBadge.textContent = `${filledCount} / 6 Components`;
  }

  // Wattage number & recommended
  const wattNumEl = document.getElementById('builder-total-wattage');
  if (wattNumEl) {
    wattNumEl.textContent = `${compat.totalWattage}W`;
  }

  const wattRecEl = document.getElementById('builder-rec-wattage');
  if (wattRecEl) {
    wattRecEl.textContent = `${compat.recommendedWattage}W`;
  }

  const psuCapEl = document.getElementById('builder-psu-capacity');
  const psuProd = currentBuild.psu && typeof getProductById === 'function' ? getProductById(currentBuild.psu) : null;
  const psuWatts = psuProd ? (psuProd.wattage || 0) : 0;
  if (psuCapEl) {
    psuCapEl.textContent = psuWatts > 0 ? `${psuWatts}W` : 'Not Selected';
  }

  // Wattage Progress Bar
  const wattBarFill = document.getElementById('builder-wattage-bar-fill');
  const wattPctLabel = document.getElementById('builder-wattage-pct');
  const maxRefWattage = psuWatts > 0 ? psuWatts : Math.max(850, compat.totalWattage * 1.5);
  const wattPct = Math.min(100, Math.round((compat.totalWattage / maxRefWattage) * 100));

  if (wattBarFill) {
    wattBarFill.style.width = `${wattPct}%`;
    if (psuWatts > 0 && psuWatts < compat.totalWattage) {
      wattBarFill.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
      wattBarFill.style.boxShadow = '0 0 14px rgba(239, 68, 68, 0.8)';
    } else if (wattPct > 80) {
      wattBarFill.style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
      wattBarFill.style.boxShadow = '0 0 14px rgba(245, 158, 11, 0.8)';
    } else {
      wattBarFill.style.background = 'linear-gradient(90deg, var(--gv-cyan) 0%, var(--gv-violet) 100%)';
      wattBarFill.style.boxShadow = '0 0 12px rgba(0, 212, 255, 0.6)';
    }
  }

  if (wattPctLabel) {
    wattPctLabel.textContent = psuWatts > 0 ? `${wattPct}% of PSU` : `${compat.totalWattage}W Load`;
  }

  // 4. Update Main Compatibility Banner & Sub-Checks (Green OK badge vs Red mismatch warning)
  renderCompatibilityStatus(compat, currentBuild);

  // 5. Update Breakdown Items List in Summary
  renderSummaryItemsBreakdown(selectedItems);

  // 6. Update action buttons disabled state
  const addCartBtn = document.getElementById('gv-btn-add-build-cart');
  if (addCartBtn) {
    addCartBtn.disabled = filledCount === 0;
  }
}

/**
 * Render the Live Compatibility Badges & Warnings
 */
function renderCompatibilityStatus(compat, build) {
  const bannerContainer = document.getElementById('builder-compat-banner');
  const checksContainer = document.getElementById('builder-compat-checks-list');

  const cpu = build.cpu && typeof getProductById === 'function' ? getProductById(build.cpu) : null;
  const mb = build.motherboard && typeof getProductById === 'function' ? getProductById(build.motherboard) : null;
  const ram = build.ram && typeof getProductById === 'function' ? getProductById(build.ram) : null;
  const psu = build.psu && typeof getProductById === 'function' ? getProductById(build.psu) : null;

  // 1. Overall Status Card
  if (bannerContainer) {
    if (!compat.isCompatible) {
      // RED MISMATCH WARNING
      bannerContainer.innerHTML = `
        <div class="gv-compat-status-card gv-compat-error">
          <div class="d-flex align-items-start gap-3">
            <div class="gv-compat-icon-badge text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-2"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="gv-badge gv-badge-danger">
                  <i class="bi bi-x-octagon-fill me-1"></i> Incompatible Configuration
                </span>
                <span class="text-danger small fw-bold">${compat.issues.length} conflict(s) detected</span>
              </div>
              <h4 class="text-white mb-2 fs-5">Hardware Compatibility Mismatch</h4>
              <ul class="mb-0 text-danger-emphasis small ps-3">
                ${compat.issues.map(iss => `<li class="mb-1">${iss.message}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    } else if (compat.warnings.length > 0) {
      // YELLOW WARNING (Headroom low, etc.)
      bannerContainer.innerHTML = `
        <div class="gv-compat-status-card gv-compat-warning">
          <div class="d-flex align-items-start gap-3">
            <div class="gv-compat-icon-badge text-warning">
              <i class="bi bi-exclamation-circle-fill fs-2"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="gv-badge gv-badge-warning">
                  <i class="bi bi-exclamation-triangle me-1"></i> Configuration Notice
                </span>
              </div>
              <h4 class="text-white mb-1 fs-5">System Compatible with Advisory</h4>
              <ul class="mb-0 text-secondary small ps-3">
                ${compat.warnings.map(w => `<li class="mb-1">${w.message}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    } else {
      // GREEN OK BADGE
      bannerContainer.innerHTML = `
        <div class="gv-compat-status-card gv-compat-ok">
          <div class="d-flex align-items-center gap-3">
            <div class="gv-compat-icon-badge text-success">
              <i class="bi bi-check-circle-fill fs-2"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="gv-badge gv-badge-success">
                  <i class="bi bi-check-all me-1"></i> 100% Compatible
                </span>
                <span class="text-success small fw-bold">Live Verification Passed</span>
              </div>
              <h4 class="text-white mb-0 fs-5">All Selected Components Harmonized</h4>
              <div class="text-secondary small">CPU socket, DDR architecture, and wattage safety limits verified.</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 2. Individual Live Checks List (Socket, RAM, PSU Wattage)
  if (checksContainer) {
    // Socket Check Badge (Green OK vs Red Mismatch)
    const socketOk = compat.socketCheck ? compat.socketCheck.isOk : true;
    const socketEvaluated = Boolean(cpu && mb);
    let socketBadge = '';

    if (socketEvaluated) {
      if (socketOk) {
        socketBadge = `
          <div class="gv-check-item gv-check-pass">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <div>
              <div class="d-flex align-items-center gap-2">
                <strong class="text-white">CPU Socket Compatibility</strong>
                <span class="badge bg-success-subtle text-success border border-success">
                  <i class="bi bi-check me-1"></i> MATCH: ${cpu.specs?.socket}
                </span>
              </div>
              <div class="text-secondary small">Both CPU & Motherboard utilize the ${cpu.specs?.socket} physical interface.</div>
            </div>
          </div>
        `;
      } else {
        socketBadge = `
          <div class="gv-check-item gv-check-fail">
            <i class="bi bi-x-circle-fill text-danger fs-5"></i>
            <div>
              <div class="d-flex align-items-center gap-2">
                <strong class="text-white">CPU Socket Compatibility</strong>
                <span class="badge bg-danger text-white border border-danger">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> SOCKET MISMATCH
                </span>
              </div>
              <div class="text-danger small">
                CPU (${cpu.name}) uses <strong>${cpu.specs?.socket}</strong>, but Motherboard (${mb.name}) is <strong>${mb.specs?.socket}</strong>.
              </div>
            </div>
          </div>
        `;
      }
    } else {
      socketBadge = `
        <div class="gv-check-item gv-check-pending">
          <i class="bi bi-dash-circle text-muted fs-5"></i>
          <div>
            <div class="d-flex align-items-center gap-2">
              <strong class="text-secondary">CPU Socket Compatibility</strong>
              <span class="badge bg-dark border border-secondary text-muted">Awaiting Pair</span>
            </div>
            <div class="text-muted small">Select both CPU and Motherboard to verify socket interface.</div>
          </div>
        </div>
      `;
    }

    // RAM Type Check Badge
    const ramOk = compat.ramCheck ? compat.ramCheck.isOk : true;
    const ramEvaluated = Boolean(mb && ram);
    let ramBadge = '';

    if (ramEvaluated) {
      if (ramOk) {
        ramBadge = `
          <div class="gv-check-item gv-check-pass">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <div>
              <div class="d-flex align-items-center gap-2">
                <strong class="text-white">Memory Standard (DDR)</strong>
                <span class="badge bg-success-subtle text-success border border-success">
                  <i class="bi bi-check me-1"></i> MATCH: ${ram.specs?.type}
                </span>
              </div>
              <div class="text-secondary small">Motherboard fully supports ${ram.specs?.type} modules.</div>
            </div>
          </div>
        `;
      } else {
        ramBadge = `
          <div class="gv-check-item gv-check-fail">
            <i class="bi bi-x-circle-fill text-danger fs-5"></i>
            <div>
              <div class="d-flex align-items-center gap-2">
                <strong class="text-white">Memory Standard (DDR)</strong>
                <span class="badge bg-danger text-white border border-danger">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> RAM TYPE MISMATCH
                </span>
              </div>
              <div class="text-danger small">
                Selected RAM is <strong>${ram.specs?.type}</strong>, but Motherboard requires <strong>${mb.specs?.ramSupport}</strong>.
              </div>
            </div>
          </div>
        `;
      }
    } else {
      ramBadge = `
        <div class="gv-check-item gv-check-pending">
          <i class="bi bi-dash-circle text-muted fs-5"></i>
          <div>
            <div class="d-flex align-items-center gap-2">
              <strong class="text-secondary">Memory Standard (DDR)</strong>
              <span class="badge bg-dark border border-secondary text-muted">Awaiting Pair</span>
            </div>
            <div class="text-muted small">Select both Motherboard and RAM to verify generation compatibility.</div>
          </div>
        </div>
      `;
    }

    // PSU Wattage Check Badge (Green OK vs Red Mismatch)
    let psuBadge = '';
    if (psu) {
      const psuWatts = psu.wattage || 0;
      if (psuWatts < compat.totalWattage) {
        psuBadge = `
          <div class="gv-check-item gv-check-fail">
            <i class="bi bi-x-circle-fill text-danger fs-5"></i>
            <div>
              <div class="d-flex align-items-center gap-2">
                <strong class="text-white">Power Supply Headroom</strong>
                <span class="badge bg-danger text-white border border-danger">
                  <i class="bi bi-lightning-charge-fill me-1"></i> INSUFFICIENT WATTAGE
                </span>
              </div>
              <div class="text-danger small">
                System requires ${compat.totalWattage}W, but PSU provides only ${psuWatts}W. High risk of shutdown.
              </div>
            </div>
          </div>
        `;
      } else if (psuWatts < compat.recommendedWattage) {
        psuBadge = `
          <div class="gv-check-item gv-check-warn">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
            <div>
              <div class="d-flex align-items-center gap-2">
                <strong class="text-white">Power Supply Headroom</strong>
                <span class="badge bg-warning text-dark border border-warning">
                  <i class="bi bi-exclamation me-1"></i> LOW HEADROOM
                </span>
              </div>
              <div class="text-warning-emphasis small">
                PSU (${psuWatts}W) covers estimated ${compat.totalWattage}W, but recommended is ${compat.recommendedWattage}W for transient spikes.
              </div>
            </div>
          </div>
        `;
      } else {
        psuBadge = `
          <div class="gv-check-item gv-check-pass">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <div>
              <div class="d-flex align-items-center gap-2">
                <strong class="text-white">Power Supply Headroom</strong>
                <span class="badge bg-success-subtle text-success border border-success">
                  <i class="bi bi-shield-fill-check me-1"></i> OPTIMAL: +${psuWatts - compat.totalWattage}W BUFFER
                </span>
              </div>
              <div class="text-secondary small">
                ${psuWatts}W rating safely accommodates estimated ${compat.totalWattage}W load with +25% safety buffer.
              </div>
            </div>
          </div>
        `;
      }
    } else {
      psuBadge = `
        <div class="gv-check-item gv-check-pending">
          <i class="bi bi-dash-circle text-muted fs-5"></i>
          <div>
            <div class="d-flex align-items-center gap-2">
              <strong class="text-secondary">Power Supply Headroom</strong>
              <span class="badge bg-dark border border-secondary text-muted">PSU Needed</span>
            </div>
            <div class="text-muted small">Estimated draw: ${compat.totalWattage}W. Select a PSU &ge; ${compat.recommendedWattage}W.</div>
          </div>
        </div>
      `;
    }

    checksContainer.innerHTML = socketBadge + ramBadge + psuBadge;
  }
}

/**
 * Render items breakdown inside the sticky summary card
 */
function renderSummaryItemsBreakdown(selectedItems) {
  const container = document.getElementById('builder-summary-items-list');
  if (!container) return;

  if (selectedItems.length === 0) {
    container.innerHTML = `
      <div class="text-muted small py-3 text-center">
        No components selected yet.<br>Choose items from the 6 slots above.
      </div>
    `;
    return;
  }

  container.innerHTML = selectedItems.map(item => `
    <div class="gv-summary-part-row">
      <div class="d-flex align-items-center gap-2 min-w-0">
        <span class="badge bg-dark border border-secondary text-cyan small">${item.slot}</span>
        <span class="text-truncate text-white small" title="${item.product.name}">${item.product.name}</span>
      </div>
      <span class="text-cyan small fw-bold font-monospace ms-2 text-nowrap">
        ${typeof formatPKR === 'function' ? formatPKR(item.product.price) : `Rs. ${item.product.price}`}
      </span>
    </div>
  `).join('');
}

/**
 * Internal fallback compatibility evaluator
 */
function runInternalCompatibilityCheck(build) {
  const issues = [];
  const warnings = [];

  const cpu = build.cpu && typeof getProductById === 'function' ? getProductById(build.cpu) : null;
  const mb = build.motherboard && typeof getProductById === 'function' ? getProductById(build.motherboard) : null;
  const ram = build.ram && typeof getProductById === 'function' ? getProductById(build.ram) : null;
  const gpu = build.gpu && typeof getProductById === 'function' ? getProductById(build.gpu) : null;
  const psu = build.psu && typeof getProductById === 'function' ? getProductById(build.psu) : null;

  // Socket
  if (cpu && mb) {
    const cpuSocket = cpu.specs?.socket;
    const mbSocket = mb.specs?.socket;
    if (cpuSocket && mbSocket && cpuSocket.toUpperCase() !== mbSocket.toUpperCase()) {
      issues.push({
        type: 'SOCKET_MISMATCH',
        message: `Socket Mismatch: CPU (${cpu.name}) requires ${cpuSocket}, but Motherboard (${mb.name}) has ${mbSocket}.`
      });
    }
  }

  // RAM
  if (mb && ram) {
    const mbRam = mb.specs?.ramSupport || '';
    const ramType = ram.specs?.type || '';
    if (mbRam && ramType && !mbRam.toUpperCase().includes(ramType.toUpperCase())) {
      issues.push({
        type: 'RAM_MISMATCH',
        message: `RAM Mismatch: Motherboard supports ${mbRam}, but RAM is ${ramType}.`
      });
    }
  }

  // Wattage
  let totalWattage = 50;
  const slots = ['cpu', 'gpu', 'ram', 'storage', 'motherboard'];
  slots.forEach(s => {
    if (build[s] && typeof getProductById === 'function') {
      const p = getProductById(build[s]);
      if (p && typeof p.wattage === 'number') totalWattage += p.wattage;
    }
  });

  const recommendedWattage = Math.round(totalWattage * 1.25);

  if (psu) {
    const psuCapacity = psu.wattage || 0;
    if (psuCapacity < totalWattage) {
      issues.push({
        type: 'PSU_INSUFFICIENT',
        message: `PSU Insufficient: Build requires ~${totalWattage}W, but selected PSU is rated for ${psuCapacity}W.`
      });
    } else if (psuCapacity < recommendedWattage) {
      warnings.push({
        type: 'PSU_HEADROOM_LOW',
        message: `Low Headroom: Recommended PSU is ${recommendedWattage}W. Current PSU is ${psuCapacity}W.`
      });
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    warnings,
    totalWattage,
    recommendedWattage,
    socketCheck: {
      isOk: cpu && mb ? (cpu.specs?.socket?.toUpperCase() === mb.specs?.socket?.toUpperCase()) : true,
      cpuSocket: cpu?.specs?.socket,
      mbSocket: mb?.specs?.socket
    },
    ramCheck: {
      isOk: mb && ram ? Boolean(mb.specs?.ramSupport?.toUpperCase().includes(ram.specs?.type?.toUpperCase() || '')) : true,
      mbSupport: mb?.specs?.ramSupport,
      ramType: ram?.specs?.type
    },
    psuCheck: {
      isOk: psu ? (psu.wattage >= totalWattage) : true,
      hasWarning: psu ? (psu.wattage < recommendedWattage) : false,
      capacity: psu?.wattage || 0
    }
  };
}

/**
 * Bind Builder Page Event Listeners
 */
function bindBuilderEvents() {
  // 1. Save Build to localStorage
  const saveBtn = document.getElementById('gv-btn-save-build');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveBuildToLocalStorage);
  }

  // 2. Add Complete Build to Cart (gearvault_cart)
  const addCartBtn = document.getElementById('gv-btn-add-build-cart');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', addCompleteBuildToCart);
  }

  // 3. Clear / Reset Build
  const clearBtn = document.getElementById('gv-btn-clear-build');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      BUILDER_SLOTS.forEach(slot => {
        currentBuild[slot.key] = null;
      });
      renderAllComponentSlots();
      updateCalculationsAndCompatibility();
      if (typeof StorageManager !== 'undefined' && typeof StorageManager.clearBuilder === 'function') {
        StorageManager.clearBuilder();
      }
      try {
        localStorage.removeItem(GEARVAULT_BUILDER_KEY);
      } catch (e) {}

      if (typeof showToast === 'function') {
        showToast('Build cleared. You can start fresh or pick a preset.', 'warning');
      }
    });
  }

  // 4. Preset Buttons
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const presetKey = btn.dataset.preset;
      applyPreset(presetKey);
    });
  });

  // 5. Component Picker Modal Search & Filter
  const pickerSearch = document.getElementById('picker-search-input');
  if (pickerSearch) {
    pickerSearch.addEventListener('input', () => {
      filterPickerModalProducts();
    });
  }

  const pickerBrandFilter = document.getElementById('picker-brand-filter');
  if (pickerBrandFilter) {
    pickerBrandFilter.addEventListener('change', () => {
      filterPickerModalProducts();
    });
  }
}

/**
 * Save Build to localStorage
 */
function saveBuildToLocalStorage() {
  // Count selected
  const filledCount = Object.values(currentBuild).filter(Boolean).length;
  if (filledCount === 0) {
    if (typeof showToast === 'function') {
      showToast('Cannot save an empty build. Please select at least one component.', 'warning');
    }
    return;
  }

  try {
    const payload = {
      ...currentBuild,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(GEARVAULT_BUILDER_KEY, JSON.stringify(payload));
    localStorage.setItem('gamevault_builder', JSON.stringify(payload));

    if (typeof StorageManager !== 'undefined' && typeof StorageManager.saveBuilder === 'function') {
      StorageManager.saveBuilder(payload);
    }

    const savedNotice = document.getElementById('builder-saved-notice');
    if (savedNotice) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      savedNotice.textContent = `Build saved to your browser at ${timeStr}.`;
      savedNotice.classList.remove('d-none');
    }

    if (typeof showToast === 'function') {
      showToast(`Build configuration saved (${filledCount} components)! It will persist on your next visit.`, 'success');
    }
  } catch (err) {
    console.error('[PC Builder] Failed saving build:', err);
    if (typeof showToast === 'function') {
      showToast('Could not save build to local storage.', 'danger');
    }
  }
}

/**
 * Add Complete Build to Cart (gearvault_cart)
 */
function addCompleteBuildToCart() {
  const selectedProductIds = Object.values(currentBuild).filter(Boolean);

  if (selectedProductIds.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Your build is empty. Select components to add to cart.', 'warning');
    }
    return;
  }

  // 1. Read existing cart from gearvault_cart
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

  // 2. Add each selected component (increment if exists, else append)
  selectedProductIds.forEach(id => {
    const existingIndex = cart.findIndex(item => item.id === id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({
        id: id,
        quantity: 1,
        options: { addedFrom: 'pc-builder' }
      });
    }

    // Sync with StorageManager if present
    if (typeof StorageManager !== 'undefined' && typeof StorageManager.addToCart === 'function') {
      StorageManager.addToCart(id, 1);
    }
  });

  // 3. Write back to gearvault_cart and gamevault_cart
  try {
    localStorage.setItem(GEARVAULT_CART_KEY, JSON.stringify(cart));
    localStorage.setItem('gamevault_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('[PC Builder] Error writing cart:', e);
  }

  // 4. Synchronize Navbar Cart Badges
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

  // 5. Fire global storage event for multi-tab updates
  window.dispatchEvent(new CustomEvent('gamevault_storage_update', {
    detail: { key: GEARVAULT_CART_KEY, value: cart }
  }));

  // 6. Notify user with clickable link to cart.html
  if (typeof showToast === 'function') {
    showToast(
      `All ${selectedProductIds.length} build components added to your cart! ` +
      `<a href="cart.html" class="text-cyan text-decoration-underline fw-bold ms-2">View Cart &rarr;</a>`,
      'success',
      4500
    );
  }
}

/**
 * Apply Preset Build
 */
function applyPreset(presetKey) {
  const preset = BUILD_PRESETS[presetKey];
  if (!preset) return;

  currentBuild = { ...preset.slots };
  renderAllComponentSlots();
  updateCalculationsAndCompatibility();

  if (typeof showToast === 'function') {
    showToast(`Loaded preset: "${preset.name}". All 6 slots configured.`, 'cyan');
  }
}

/**
 * Open Component Picker Modal
 */
function openComponentPicker(slotKey) {
  activeModalSlotKey = slotKey;
  const slot = BUILDER_SLOTS.find(s => s.key === slotKey);
  if (!slot) return;

  const modalTitle = document.getElementById('picker-modal-title');
  if (modalTitle) {
    modalTitle.innerHTML = `<i class="bi ${slot.icon} text-cyan me-2"></i> Choose ${slot.label}`;
  }

  // Populate brand filter options
  const brandSelect = document.getElementById('picker-brand-filter');
  const products = (typeof GAMEVAULT_PRODUCTS !== 'undefined')
    ? GAMEVAULT_PRODUCTS.filter(p => p.subCategory === slot.subCategory)
    : [];

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  if (brandSelect) {
    brandSelect.innerHTML = '<option value="all">All Brands</option>' + 
      brands.map(b => `<option value="${b}">${b}</option>`).join('');
    brandSelect.value = 'all';
  }

  // Reset search
  const searchInput = document.getElementById('picker-search-input');
  if (searchInput) searchInput.value = '';

  filterPickerModalProducts();

  // Show Bootstrap modal
  const modalEl = document.getElementById('componentPickerModal');
  if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();
  }
}

/**
 * Filter and render products inside the picker modal
 */
function filterPickerModalProducts() {
  if (!activeModalSlotKey) return;
  const slot = BUILDER_SLOTS.find(s => s.key === activeModalSlotKey);
  if (!slot) return;

  const searchInput = document.getElementById('picker-search-input');
  const brandSelect = document.getElementById('picker-brand-filter');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const brand = brandSelect?.value || 'all';

  let products = (typeof GAMEVAULT_PRODUCTS !== 'undefined')
    ? GAMEVAULT_PRODUCTS.filter(p => p.subCategory === slot.subCategory)
    : [];

  if (brand !== 'all') {
    products = products.filter(p => p.brand === brand);
  }

  if (query) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(query))
    );
  }

  const container = document.getElementById('picker-products-grid');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search text-muted fs-1 mb-2 d-block"></i>
        <div class="text-white fw-bold">No components found</div>
        <div class="text-secondary small">Try adjusting your keyword or brand filter.</div>
      </div>
    `;
    return;
  }

  const currentSelectedId = currentBuild[slot.key];

  container.innerHTML = products.map(prod => {
    const isSelected = prod.id === currentSelectedId;
    const priceFormatted = typeof formatPKR === 'function' ? formatPKR(prod.price) : `Rs. ${prod.price.toLocaleString()}`;

    // Spec highlights string
    let specText = '';
    if (prod.specs) {
      if (prod.specs.socket) specText += `Socket: ${prod.specs.socket} &bull; `;
      if (prod.specs.cores) specText += `${prod.specs.cores} &bull; `;
      if (prod.specs.vram) specText += `VRAM: ${prod.specs.vram} &bull; `;
      if (prod.specs.type) specText += `${prod.specs.type} &bull; `;
      if (prod.specs.readSpeed) specText += `Read: ${prod.specs.readSpeed} &bull; `;
      if (prod.specs.efficiency) specText += `${prod.specs.efficiency} &bull; `;
    }
    if (prod.wattage) specText += `${prod.wattage}W`;

    return `
      <div class="col-md-6">
        <div class="gv-picker-card ${isSelected ? 'is-selected' : ''}">
          <div class="d-flex gap-3 align-items-center">
            <div class="gv-picker-thumb">
              <img src="${prod.image}" alt="${prod.name}" 
                   onerror="if(typeof handleImgError === 'function') handleImgError(this, '${prod.name}')">
            </div>
            <div class="flex-grow-1 min-w-0">
              <span class="badge bg-dark border border-cyan text-cyan small mb-1">${prod.brand || 'GearVault'}</span>
              <h5 class="gv-picker-title mb-1 text-truncate" title="${prod.name}">${prod.name}</h5>
              <div class="text-muted small mb-2 text-truncate">${specText}</div>
              <div class="d-flex align-items-center justify-content-between">
                <span class="gv-slot-price fs-6">${priceFormatted}</span>
                <button type="button" class="gv-btn gv-btn-sm ${isSelected ? 'gv-btn-glass text-cyan border-cyan' : 'gv-btn-cyan'}"
                        onclick="selectComponentFromModal('${prod.id}')">
                  ${isSelected ? '<i class="bi bi-check-lg"></i> Selected' : '<i class="bi bi-plus-lg"></i> Choose'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Handle selection from the modal picker
 */
function selectComponentFromModal(productId) {
  if (!activeModalSlotKey) return;
  setSlotComponent(activeModalSlotKey, productId);

  // Close modal
  const modalEl = document.getElementById('componentPickerModal');
  if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
  }
}
