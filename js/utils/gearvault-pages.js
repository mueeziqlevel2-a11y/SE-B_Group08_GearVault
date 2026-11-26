/**
 * GEARVAULT - Shared Page Utilities for pages/*.html
 * Centralizes localStorage keys (gearvault_cart, gearvault_orders, gearvault_promo),
 * tax/shipping/promo calculations, product catalog resolution, and nested link rewriting.
 */

const GearVaultPages = (() => {
  const KEYS = {
    CART: 'gearvault_cart',
    ORDERS: 'gearvault_orders',
    PROMO: 'gearvault_promo'
  };

  const TAX_RATE = 0.05;
  const FREE_SHIPPING_THRESHOLD = 100000;
  const STANDARD_SHIPPING_FEE = 1500;

  const VALID_PROMOS = {
    GEAR10: {
      code: 'GEAR10',
      discountRate: 0.10,
      label: '10% Off'
    }
  };

  const NESTED_PAGE_FILES = new Set([
    'cart.html',
    'checkout.html',
    'order-tracking.html'
  ]);

  function initNestedLayout(activePage) {
    if (typeof renderGameVaultNavbar === 'function') {
      renderGameVaultNavbar(activePage);
      rewriteNestedLinks('#gv-navbar-container');
      observeSearchLinks();
      highlightActiveAction(activePage);
    }

    if (typeof renderGameVaultFooter === 'function') {
      renderGameVaultFooter();
      rewriteNestedLinks('#gv-footer-container');
    }

    enhanceSharedInputAccessibility();
    syncNavbarBadges();
  }

  function enhanceSharedInputAccessibility() {
    const searchInput = document.getElementById('gv-search-input');
    if (searchInput && !searchInput.getAttribute('aria-label')) {
      searchInput.setAttribute('aria-label', 'Search hardware and gaming gear');
    }

    const newsletterInput = document.getElementById('gv-newsletter-email');
    if (newsletterInput && !newsletterInput.getAttribute('aria-label')) {
      newsletterInput.setAttribute('aria-label', 'Newsletter email address');
    }
  }

  function rewriteNestedLinks(containerSelector) {
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
      if (NESTED_PAGE_FILES.has(baseFile)) {
        link.setAttribute('href', href);
      } else {
        link.setAttribute('href', `../${href}`);
      }
    });
  }

  function observeSearchLinks() {
    const resultsEl = document.getElementById('gv-search-results');
    if (!resultsEl || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(() => {
      rewriteNestedLinks('#gv-search-results');
    });
    observer.observe(resultsEl, { childList: true });
  }

  function highlightActiveAction(activePage) {
    if (activePage === 'cart') {
      const btn = document.querySelector('.gv-nav-actions a[href="cart.html"]');
      if (btn) {
        btn.style.borderColor = 'var(--gv-cyan)';
        btn.style.color = 'var(--gv-cyan)';
        btn.style.boxShadow = '0 0 12px var(--gv-cyan-glow)';
      }
    }
  }

  function getItemQuantity(item) {
    const qty = parseInt(item?.quantity ?? item?.qty ?? 1, 10);
    return isNaN(qty) || qty < 1 ? 1 : qty;
  }

  function readCart() {
    try {
      const rawGear = localStorage.getItem(KEYS.CART);
      if (rawGear !== null) {
        const parsed = JSON.parse(rawGear);
        return Array.isArray(parsed) ? parsed : [];
      }

      if (typeof StorageManager !== 'undefined') {
        const fallback = StorageManager.getCart();
        if (Array.isArray(fallback) && fallback.length > 0) {
          localStorage.setItem(KEYS.CART, JSON.stringify(fallback));
          return fallback;
        }
      }
    } catch (err) {
      console.warn('[GearVault] Failed reading gearvault_cart:', err);
    }
    return [];
  }

  function writeCart(cart) {
    try {
      localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch (err) {
      console.error('[GearVault] Failed writing gearvault_cart:', err);
    }

    if (typeof StorageManager !== 'undefined') {
      StorageManager.saveCart(cart);
    }
    syncNavbarBadges();
  }

  function clearCart() {
    writeCart([]);
    savePromo(null);
  }

  function syncNavbarBadges() {
    const cart = readCart();
    const totalCount = cart.reduce((sum, item) => sum + getItemQuantity(item), 0);

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
  }

  function resolveCartItem(cartItem) {
    const id = cartItem.id;
    let catalogItem = null;

    if (typeof getProductById === 'function') {
      catalogItem = getProductById(id);
    }
    if (!catalogItem && typeof getPrebuiltById === 'function') {
      catalogItem = getPrebuiltById(id);
    }

    const quantity = getItemQuantity(cartItem);
    const name = catalogItem?.name || cartItem.name || 'GearVault Hardware Item';
    const price = Number(catalogItem?.price ?? cartItem.price ?? 0);
    const originalPrice = catalogItem?.originalPrice ?? cartItem.originalPrice ?? null;
    const image = catalogItem?.image || cartItem.image || '';
    const brand = catalogItem?.brand || cartItem.brand || 'GearVault';
    const subCategory = catalogItem?.subCategory || catalogItem?.badge || cartItem.category || 'Hardware';
    const inStock = catalogItem?.inStock !== undefined ? catalogItem.inStock : true;
    const detailsUrl = typeof getProductById === 'function' && getProductById(id)
      ? `../part-details.html?id=${encodeURIComponent(id)}`
      : '../prebuilt-pcs.html';

    return {
      id,
      name,
      price,
      originalPrice,
      image,
      brand,
      subCategory,
      inStock,
      quantity,
      detailsUrl
    };
  }

  function getSavedPromo() {
    try {
      const saved = localStorage.getItem(KEYS.PROMO);
      if (saved && VALID_PROMOS[saved.toUpperCase()]) {
        return saved.toUpperCase();
      }
    } catch (err) {
      console.warn('[GearVault] Failed reading promo:', err);
    }
    return null;
  }

  function savePromo(code) {
    try {
      if (code && VALID_PROMOS[code.toUpperCase()]) {
        localStorage.setItem(KEYS.PROMO, code.toUpperCase());
      } else {
        localStorage.removeItem(KEYS.PROMO);
      }
    } catch (err) {
      console.warn('[GearVault] Failed saving promo:', err);
    }
  }

  function calculateTotals(resolvedItems, promoCode = null) {
    const itemCount = resolvedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = resolvedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const promo = promoCode ? VALID_PROMOS[promoCode.toUpperCase()] || null : null;
    const discount = promo ? Math.round(subtotal * promo.discountRate) : 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * TAX_RATE);
    const shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE);
    const total = taxable + tax + shipping;

    return {
      itemCount,
      subtotal,
      promo,
      discount,
      tax,
      shipping,
      total
    };
  }

  function readOrders() {
    const merged = [];
    const seenIds = new Set();

    const appendOrders = (list) => {
      if (!Array.isArray(list)) return;
      list.forEach((order) => {
        if (order && order.orderId && !seenIds.has(order.orderId.toUpperCase())) {
          seenIds.add(order.orderId.toUpperCase());
          merged.push(order);
        }
      });
    };

    try {
      const rawGear = localStorage.getItem(KEYS.ORDERS);
      if (rawGear !== null) {
        appendOrders(JSON.parse(rawGear));
      }
      if (typeof StorageManager !== 'undefined') {
        appendOrders(StorageManager.getOrders());
      }
    } catch (err) {
      console.warn('[GearVault] Failed reading orders:', err);
    }

    return merged;
  }

  function writeOrders(orders) {
    try {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    } catch (err) {
      console.error('[GearVault] Failed writing gearvault_orders:', err);
    }

    if (typeof StorageManager !== 'undefined') {
      StorageManager.saveOrders(orders);
    }
  }

  function generateOrderId() {
    const existing = new Set(readOrders().map((o) => String(o.orderId).toUpperCase()));
    const year = new Date().getFullYear();
    let candidate = '';
    do {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      candidate = `GV-${year}-${suffix}`;
    } while (existing.has(candidate));
    return candidate;
  }

  function findOrderById(orderId) {
    if (!orderId) return null;
    const target = orderId.trim().toUpperCase();
    return readOrders().find((o) => String(o.orderId).toUpperCase() === target) || null;
  }

  function formatPrice(amount) {
    if (typeof formatPKR === 'function') {
      return formatPKR(amount);
    }
    return 'Rs. ' + Number(amount || 0).toLocaleString('en-PK');
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    KEYS,
    TAX_RATE,
    FREE_SHIPPING_THRESHOLD,
    STANDARD_SHIPPING_FEE,
    VALID_PROMOS,
    initNestedLayout,
    rewriteNestedLinks,
    getItemQuantity,
    readCart,
    writeCart,
    clearCart,
    syncNavbarBadges,
    resolveCartItem,
    getSavedPromo,
    savePromo,
    calculateTotals,
    readOrders,
    writeOrders,
    generateOrderId,
    findOrderById,
    formatPrice,
    escapeHtml
  };
})();
