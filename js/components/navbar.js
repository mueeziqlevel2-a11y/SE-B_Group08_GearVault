function renderGameVaultNavbar(activePage = '') {
  const container = document.getElementById('gv-navbar-container');
  if (!container) return;

  const inPages = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
  const rootPrefix = inPages ? '../' : '';
  const pagesPrefix = inPages ? '' : 'pages/';

  const html = `
    <div class="gv-demo-banner">
      <div class="container d-flex align-items-center justify-content-center flex-wrap gap-2">
        <span><i class="bi bi-shield-check text-cyan me-1"></i> <strong>GAMEVAULT</strong> &bull; University Semester Project <span class="badge-proj">GROUP 08</span></span>
        <span class="d-none d-md-inline text-muted">|</span>
        <span class="text-secondary small">Simulation Mode: Hardware Catalog & Shopping Experience</span>
      </div>
    </div>

    <header class="gv-navbar-wrap">
      <div class="container">
        <div class="gv-navbar">
          <a href="${rootPrefix}index.html" class="gv-brand" aria-label="GameVault Home">
            <div class="gv-brand-icon"><i class="bi bi-cpu-fill"></i></div>
            <div class="gv-brand-text">
              <div class="gv-brand-name">GAME<span>VAULT</span></div>
              <div class="gv-brand-sub">Group 08 Hardware</div>
            </div>
          </a>

          <ul class="gv-nav-links">
            <li><a href="${rootPrefix}index.html" class="gv-nav-link ${activePage === 'home' ? 'active' : ''}">Home</a></li>
            <li><a href="${rootPrefix}pc-parts.html" class="gv-nav-link ${activePage === 'pc-parts' ? 'active' : ''}">PC Parts</a></li>
            <li><a href="${pagesPrefix}gaming-gear.html" class="gv-nav-link ${activePage === 'gaming-gear' ? 'active' : ''}">Gaming Gear</a></li>
            <li><a href="${pagesPrefix}pc-builder.html" class="gv-nav-link ${activePage === 'pc-builder' ? 'active' : ''}"><i class="bi bi-tools text-cyan"></i> PC Builder</a></li>
            <li><a href="${pagesPrefix}flash-deals.html" class="gv-nav-link ${activePage === 'flash-deals' ? 'active' : ''}"><i class="bi bi-lightning-charge-fill text-warning"></i> Flash Deals</a></li>
            <li><a href="${pagesPrefix}cart.html" class="gv-nav-link ${activePage === 'cart' ? 'active' : ''}"><i class="bi bi-cart3 text-cyan"></i> Cart</a></li>
          </ul>

          <div class="gv-nav-actions">
            <button id="gv-search-trigger" class="gv-action-btn" title="Quick Search (Ctrl + K)" aria-label="Search">
              <i class="bi bi-search"></i>
            </button>
            <a href="${pagesPrefix}cart.html" class="gv-action-btn" title="Shopping Cart" aria-label="Cart">
              <i class="bi bi-cart3"></i>
              <span id="gv-cart-badge" class="gv-badge-counter" style="display: none;">0</span>
            </a>
            <button id="gv-hamburger-btn" class="gv-hamburger" aria-label="Toggle Mobile Menu">
              <i class="bi bi-list"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

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
        <button id="gv-drawer-close" class="gv-action-btn" aria-label="Close Menu"><i class="bi bi-x-lg"></i></button>
      </div>

      <ul class="gv-mobile-links">
        <li><a href="${rootPrefix}index.html" class="${activePage === 'home' ? 'active' : ''}"><i class="bi bi-house"></i> Home</a></li>
        <li><a href="${rootPrefix}pc-parts.html" class="${activePage === 'pc-parts' ? 'active' : ''}"><i class="bi bi-motherboard"></i> PC Parts</a></li>
        <li><a href="${pagesPrefix}gaming-gear.html" class="${activePage === 'gaming-gear' ? 'active' : ''}"><i class="bi bi-mouse"></i> Gaming Gear</a></li>
        <li><a href="${pagesPrefix}pc-builder.html" class="${activePage === 'pc-builder' ? 'active' : ''}"><i class="bi bi-tools text-cyan"></i> PC Builder</a></li>
        <li><a href="${pagesPrefix}flash-deals.html" class="${activePage === 'flash-deals' ? 'active' : ''}"><i class="bi bi-lightning-charge-fill text-warning"></i> Flash Deals</a></li>
        <li><a href="${pagesPrefix}cart.html" class="${activePage === 'cart' ? 'active' : ''}"><i class="bi bi-cart3"></i> Cart <span id="gv-mobile-cart-badge" class="badge bg-primary ms-auto">0</span></a></li>
      </ul>

      <div class="mt-auto pt-3 border-top border-secondary text-center small text-muted">
        <div>GAMEVAULT Semester Project</div>
        <div class="text-cyan">Group 08 &bull; Gaming Gear & PC Parts</div>
      </div>
    </div>

    <div id="gv-search-modal" class="gv-search-modal-backdrop">
      <div class="gv-search-modal">
        <div class="gv-search-header">
          <i class="bi bi-search text-cyan fs-5"></i>
          <input type="text" id="gv-search-input" class="gv-search-input" placeholder="Search graphics cards, processors, keyboards, monitors..." autocomplete="off">
          <button id="gv-search-close" class="btn btn-sm btn-link text-secondary" aria-label="Close search">
            <kbd class="bg-dark text-white border border-secondary px-2 py-1">ESC</kbd>
          </button>
        </div>
        <div id="gv-search-results" class="gv-search-results"></div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  const hamburger = document.getElementById('gv-hamburger-btn');
  const drawer = document.getElementById('gv-mobile-drawer');
  const backdrop = document.getElementById('gv-drawer-backdrop');
  const closeDrawerBtn = document.getElementById('gv-drawer-close');

  if (hamburger) hamburger.addEventListener('click', () => { drawer.classList.add('open'); backdrop.classList.add('show'); document.body.style.overflow = 'hidden'; });
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => { drawer.classList.remove('open'); backdrop.classList.remove('show'); document.body.style.overflow = ''; });
  if (backdrop) backdrop.addEventListener('click', () => { drawer.classList.remove('open'); backdrop.classList.remove('show'); document.body.style.overflow = ''; });

  if (typeof updateBadgeCounters === 'function') updateBadgeCounters();
}
