/**
 * GAMEVAULT - Shared Navigation Bar Component
 * Renders the top header, desktop mega-navigation, mobile offcanvas drawer,
 * and quick-search modal across all 15 pages.
 */

function renderGameVaultNavbar(activePage = '') {
  const container = document.getElementById('gv-navbar-container');
  if (!container) return;

  const html = `
    <!-- Demonstration Notice Banner -->
    <div class="gv-demo-banner">
      <div class="container d-flex align-items-center justify-content-center flex-wrap gap-2">
        <span><i class="bi bi-shield-check text-cyan me-1"></i> <strong>GAMEVAULT</strong> &bull; University Semester Project <span class="badge-proj">GROUP 08</span></span>
        <span class="d-none d-md-inline text-muted">|</span>
        <span class="text-secondary small">Simulation Mode: Hardware Catalog & Shopping Experience</span>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <header class="gv-navbar-wrap">
      <div class="container">
        <div class="gv-navbar">
          <!-- Logo -->
          <a href="index.html" class="gv-brand" aria-label="GameVault Home">
            <div class="gv-brand-icon">
              <i class="bi bi-cpu-fill"></i>
            </div>
            <div class="gv-brand-text">
              <div class="gv-brand-name">GAME<span>VAULT</span></div>
              <div class="gv-brand-sub">Group 08 Hardware</div>
            </div>
          </a>

          <!-- Desktop Navigation Links -->
          <ul class="gv-nav-links">
            <li>
              <a href="index.html" class="gv-nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            </li>
            <li>
              <a href="pc-parts.html" class="gv-nav-link ${activePage === 'pc-parts' ? 'active' : ''}">PC Parts</a>
            </li>
            <li>
              <a href="gaming-gear.html" class="gv-nav-link ${activePage === 'gaming-gear' ? 'active' : ''}">Gaming Gear</a>
            </li>
            <li>
              <a href="pc-builder.html" class="gv-nav-link ${activePage === 'pc-builder' ? 'active' : ''}">
                <i class="bi bi-tools text-cyan"></i> PC Builder
              </a>
            </li>
            <li>
              <a href="prebuilt-pcs.html" class="gv-nav-link ${activePage === 'prebuilt-pcs' ? 'active' : ''}">Pre-Builts</a>
            </li>
            <li>
              <a href="flash-deals.html" class="gv-nav-link ${activePage === 'flash-deals' ? 'active' : ''}">
                <i class="bi bi-lightning-charge-fill text-warning"></i> Deals
              </a>
            </li>
            <li>
              <a href="benchmarks.html" class="gv-nav-link ${activePage === 'benchmarks' ? 'active' : ''}">Benchmarks</a>
            </li>
            <!-- Tools Dropdown -->
            <li class="gv-nav-dropdown">
              <a href="javascript:void(0)" class="gv-nav-link ${['wattage', 'compare'].includes(activePage) ? 'active' : ''}">
                Tools <i class="bi bi-chevron-down small ms-1"></i>
              </a>
              <div class="gv-dropdown-menu">
                <a href="wattage-calculator.html" class="gv-dropdown-item ${activePage === 'wattage' ? 'text-cyan' : ''}">
                  <i class="bi bi-battery-charging text-cyan"></i> Wattage Calc
                </a>
                <a href="compare.html" class="gv-dropdown-item ${activePage === 'compare' ? 'text-cyan' : ''}">
                  <i class="bi bi-arrow-left-right text-violet"></i> Compare Gear
                </a>
                <a href="order-tracking.html" class="gv-dropdown-item ${activePage === 'order-tracking' ? 'text-cyan' : ''}">
                  <i class="bi bi-geo-alt-fill text-success"></i> Track Order
                </a>
              </div>
            </li>
            <li>
              <a href="about.html" class="gv-nav-link ${activePage === 'about' ? 'active' : ''}">About Us</a>
            </li>
          </ul>

          <!-- Nav Action Buttons -->
          <div class="gv-nav-actions">
            <!-- Search Trigger -->
            <button id="gv-search-trigger" class="gv-action-btn" title="Quick Search (Ctrl + K)" aria-label="Search">
              <i class="bi bi-search"></i>
            </button>

            <!-- Wishlist -->
            <a href="wishlist.html" class="gv-action-btn" title="Wishlist" aria-label="Wishlist">
              <i class="bi bi-heart"></i>
              <span id="gv-wishlist-badge" class="gv-badge-counter" style="display: none;">0</span>
            </a>

            <!-- Cart -->
            <a href="cart.html" class="gv-action-btn" title="Shopping Cart" aria-label="Cart">
              <i class="bi bi-cart3"></i>
              <span id="gv-cart-badge" class="gv-badge-counter" style="display: none;">0</span>
            </a>

            <!-- Mobile Hamburger Toggle -->
            <button id="gv-hamburger-btn" class="gv-hamburger" aria-label="Toggle Mobile Menu">
              <i class="bi bi-list"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation Drawer -->
    <div id="gv-drawer-backdrop" class="gv-drawer-backdrop"></div>
    <div id="gv-mobile-drawer" class="gv-mobile-drawer">
      <div class="gv-drawer-header">
        <div class="gv-brand">
          <div class="gv-brand-icon"><i class="bi bi-cpu-fill"></i></div>
          <div class="gv-brand-text">
            <div class="gv-brand-name">GAME<span>VAULT</span></div>
            <div class="gv-brand-sub">Group 08</div>
          </div>
        </div>
        <button id="gv-drawer-close" class="gv-action-btn" aria-label="Close Menu">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <ul class="gv-mobile-links">
        <li><a href="index.html" class="${activePage === 'home' ? 'active' : ''}"><i class="bi bi-house"></i> Home</a></li>
        <li><a href="pc-parts.html" class="${activePage === 'pc-parts' ? 'active' : ''}"><i class="bi bi-motherboard"></i> PC Parts</a></li>
        <li><a href="gaming-gear.html" class="${activePage === 'gaming-gear' ? 'active' : ''}"><i class="bi bi-mouse"></i> Gaming Gear</a></li>
        <li><a href="pc-builder.html" class="${activePage === 'pc-builder' ? 'active' : ''}"><i class="bi bi-tools text-cyan"></i> PC Builder</a></li>
        <li><a href="prebuilt-pcs.html" class="${activePage === 'prebuilt-pcs' ? 'active' : ''}"><i class="bi bi-pc-display"></i> Pre-Built PCs</a></li>
        <li><a href="flash-deals.html" class="${activePage === 'flash-deals' ? 'active' : ''}"><i class="bi bi-lightning-charge-fill text-warning"></i> Flash Deals</a></li>
        <li><a href="benchmarks.html" class="${activePage === 'benchmarks' ? 'active' : ''}"><i class="bi bi-speedometer2"></i> Benchmarks</a></li>
        <li><a href="wattage-calculator.html" class="${activePage === 'wattage' ? 'active' : ''}"><i class="bi bi-battery-charging text-cyan"></i> Wattage Calculator</a></li>
        <li><a href="compare.html" class="${activePage === 'compare' ? 'active' : ''}"><i class="bi bi-arrow-left-right text-violet"></i> Compare Gear</a></li>
        <li><a href="wishlist.html" class="${activePage === 'wishlist' ? 'active' : ''}"><i class="bi bi-heart"></i> Wishlist <span id="gv-mobile-wishlist-badge" class="badge bg-secondary ms-auto">0</span></a></li>
        <li><a href="cart.html" class="${activePage === 'cart' ? 'active' : ''}"><i class="bi bi-cart3"></i> Cart <span id="gv-mobile-cart-badge" class="badge bg-primary ms-auto">0</span></a></li>
        <li><a href="order-tracking.html" class="${activePage === 'order-tracking' ? 'active' : ''}"><i class="bi bi-geo-alt"></i> Order Tracking</a></li>
        <li><a href="about.html" class="${activePage === 'about' ? 'active' : ''}"><i class="bi bi-info-circle"></i> About Group 08</a></li>
      </ul>

      <div class="mt-auto pt-3 border-top border-secondary text-center small text-muted">
        <div>GAMEVAULT Semester Project</div>
        <div class="text-cyan">Theme: Gaming Gear & PC Parts</div>
      </div>
    </div>

    <!-- Quick Search Modal -->
    <div id="gv-search-modal" class="gv-search-modal-backdrop">
      <div class="gv-search-modal">
        <div class="gv-search-header">
          <i class="bi bi-search text-cyan fs-5"></i>
          <input type="text" id="gv-search-input" class="gv-search-input" placeholder="Search graphics cards, processors, keyboards, monitors..." autocomplete="off">
          <button id="gv-search-close" class="btn btn-sm btn-link text-secondary" aria-label="Close search">
            <kbd class="bg-dark text-white border border-secondary px-2 py-1">ESC</kbd>
          </button>
        </div>
        <div id="gv-search-results" class="gv-search-results">
          <!-- Dynamic results populated by ui.js -->
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Bind mobile drawer behavior
  const hamburger = document.getElementById('gv-hamburger-btn');
  const drawer = document.getElementById('gv-mobile-drawer');
  const backdrop = document.getElementById('gv-drawer-backdrop');
  const closeDrawerBtn = document.getElementById('gv-drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Initial update of counters
  if (typeof updateBadgeCounters === 'function') {
    updateBadgeCounters();
  }
}
