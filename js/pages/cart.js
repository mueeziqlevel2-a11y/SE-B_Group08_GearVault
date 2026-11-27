/**
 * GEARVAULT - Shopping Cart Controller (pages/cart.html)
 * Uses shared GearVaultPages utilities for gearvault_cart storage,
 * dynamic item rendering, quantity +/- updates, removal, 5% tax,
 * shipping threshold calculation, and GEAR10 promo validation.
 */

let activePromoCode = null;

document.addEventListener('DOMContentLoaded', () => {
  GearVaultPages.initNestedLayout('cart');

  activePromoCode = GearVaultPages.getSavedPromo();
  const promoInput = document.getElementById('gv-promo-input');
  if (activePromoCode && promoInput) {
    promoInput.value = activePromoCode;
  }

  bindCartEvents();
  renderCartPage();
});

function bindCartEvents() {
  const itemsList = document.getElementById('gv-cart-items-list');
  const clearBtn = document.getElementById('gv-clear-cart-btn');
  const promoForm = document.getElementById('gv-promo-form');
  const promoInput = document.getElementById('gv-promo-input');
  const promoRemoveBtn = document.getElementById('gv-promo-remove-btn');

  if (itemsList) {
    itemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const productId = btn.dataset.id;

      if (action === 'increase') {
        changeItemQuantity(productId, 1);
      } else if (action === 'decrease') {
        changeItemQuantity(productId, -1);
      } else if (action === 'remove') {
        removeCartItem(productId);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      GearVaultPages.clearCart();
      activePromoCode = null;
      resetPromoFeedback();
      renderCartPage();
      if (typeof showToast === 'function') {
        showToast('Your cart has been cleared.', 'warning');
      }
    });
  }

  if (promoForm && promoInput) {
    promoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePromoSubmit(promoInput.value);
    });

    promoInput.addEventListener('input', () => {
      promoInput.classList.remove('is-error');
      promoInput.setAttribute('aria-invalid', 'false');
    });
  }

  if (promoRemoveBtn) {
    promoRemoveBtn.addEventListener('click', () => {
      activePromoCode = null;
      GearVaultPages.savePromo(null);
      if (promoInput) promoInput.value = '';
      resetPromoFeedback();
      updateOrderSummary();
      if (typeof showToast === 'function') {
        showToast('Promo code removed.', 'cyan');
      }
    });
  }

  window.addEventListener('storage', (e) => {
    if (e.key === GearVaultPages.KEYS.CART || e.key === 'gamevault_cart') {
      renderCartPage();
      GearVaultPages.syncNavbarBadges();
    }
  });
}

function changeItemQuantity(productId, delta) {
  const cart = GearVaultPages.readCart();
  const index = cart.findIndex((item) => item.id === productId);
  if (index === -1) return;

  const nextQty = GearVaultPages.getItemQuantity(cart[index]) + delta;
  if (nextQty < 1) return;

  cart[index].quantity = nextQty;
  delete cart[index].qty;
  GearVaultPages.writeCart(cart);
  renderCartPage();
}

function removeCartItem(productId) {
  const cart = GearVaultPages.readCart();
  const target = cart.find((item) => item.id === productId);
  const resolved = target ? GearVaultPages.resolveCartItem(target) : null;
  const updatedCart = cart.filter((item) => item.id !== productId);

  GearVaultPages.writeCart(updatedCart);
  renderCartPage();

  if (typeof showToast === 'function') {
    const label = resolved ? resolved.name : 'Item';
    showToast(`Removed <strong>${GearVaultPages.escapeHtml(label)}</strong> from cart.`, 'warning');
  }
}

function handlePromoSubmit(rawValue) {
  const promoInput = document.getElementById('gv-promo-input');
  const feedbackEl = document.getElementById('gv-promo-feedback');
  const removeWrap = document.getElementById('gv-promo-remove-wrap');
  const code = (rawValue || '').trim().toUpperCase();

  if (!promoInput || !feedbackEl) return;

  promoInput.classList.remove('is-error', 'is-valid-promo');
  promoInput.setAttribute('aria-invalid', 'false');
  feedbackEl.classList.remove('is-success', 'is-error');

  if (!code) {
    promoInput.classList.add('is-error');
    promoInput.setAttribute('aria-invalid', 'true');
    feedbackEl.classList.add('is-error');
    feedbackEl.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Please enter a promo code (try <strong>GEAR10</strong>).';
    if (typeof showToast === 'function') {
      showToast('Please enter a promo code.', 'warning');
    }
    return;
  }

  const promo = GearVaultPages.VALID_PROMOS[code];
  if (!promo) {
    activePromoCode = null;
    GearVaultPages.savePromo(null);
    promoInput.classList.add('is-error');
    promoInput.setAttribute('aria-invalid', 'true');
    feedbackEl.classList.add('is-error');
    feedbackEl.innerHTML = `<i class="bi bi-x-circle-fill"></i> Invalid promo code "<strong>${GearVaultPages.escapeHtml(code)}</strong>". Valid code: <strong>GEAR10</strong> for 10% off.`;
    if (removeWrap) removeWrap.classList.add('d-none');
    updateOrderSummary();
    if (typeof showToast === 'function') {
      showToast(`Promo code "${code}" is invalid.`, 'danger');
    }
    return;
  }

  activePromoCode = promo.code;
  GearVaultPages.savePromo(promo.code);
  promoInput.value = promo.code;
  promoInput.classList.add('is-valid-promo');
  promoInput.setAttribute('aria-invalid', 'false');
  if (removeWrap) removeWrap.classList.remove('d-none');
  updateOrderSummary();

  if (typeof showToast === 'function') {
    showToast(`Promo code <strong>${promo.code}</strong> applied (${promo.label})!`, 'success');
  }
}

function resetPromoFeedback() {
  const promoInput = document.getElementById('gv-promo-input');
  const feedbackEl = document.getElementById('gv-promo-feedback');
  const removeWrap = document.getElementById('gv-promo-remove-wrap');

  if (promoInput) {
    promoInput.classList.remove('is-error', 'is-valid-promo');
    promoInput.setAttribute('aria-invalid', 'false');
  }
  if (feedbackEl) {
    feedbackEl.classList.remove('is-success', 'is-error');
    feedbackEl.innerHTML = '';
  }
  if (removeWrap) removeWrap.classList.add('d-none');
}

function renderCartPage() {
  const rawCart = GearVaultPages.readCart();
  const emptyStateEl = document.getElementById('gv-empty-cart-state');
  const cartContentEl = document.getElementById('gv-cart-content');
  const itemsListEl = document.getElementById('gv-cart-items-list');
  const headerCountEl = document.getElementById('gv-cart-header-count');
  const clearBtn = document.getElementById('gv-clear-cart-btn');

  const resolvedItems = rawCart.map(GearVaultPages.resolveCartItem);
  const totalQuantity = resolvedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (headerCountEl) {
    headerCountEl.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'Item' : 'Items'}`;
  }

  if (resolvedItems.length === 0) {
    if (emptyStateEl) emptyStateEl.classList.remove('d-none');
    if (cartContentEl) cartContentEl.classList.add('d-none');
    if (clearBtn) clearBtn.classList.add('d-none');
    if (itemsListEl) itemsListEl.innerHTML = '';
    return;
  }

  if (emptyStateEl) emptyStateEl.classList.add('d-none');
  if (cartContentEl) cartContentEl.classList.remove('d-none');
  if (clearBtn) clearBtn.classList.remove('d-none');

  if (itemsListEl) {
    itemsListEl.innerHTML = resolvedItems.map((item) => {
      const lineTotal = item.price * item.quantity;
      const safeName = GearVaultPages.escapeHtml(item.name);
      const safeBrand = GearVaultPages.escapeHtml(item.brand);
      const safeSub = GearVaultPages.escapeHtml(String(item.subCategory).toUpperCase());

      return `
        <article class="gv-cart-item" data-product-id="${GearVaultPages.escapeHtml(item.id)}">
          <a href="${item.detailsUrl}" class="gv-cart-thumb">
            <img src="${GearVaultPages.escapeHtml(item.image)}" alt="${safeName}" onerror="handleImgError(this, '${safeName.replace(/'/g, "\\'")}')">
          </a>

          <div>
            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
              <span class="gv-product-category mb-0">${safeBrand} &bull; ${safeSub}</span>
              <span class="gv-badge ${item.inStock ? 'gv-badge-instock' : 'gv-badge-lowstock'}">
                ${item.inStock ? 'In Stock' : 'Limited Stock'}
              </span>
            </div>

            <h3 class="gv-cart-item-title">
              <a href="${item.detailsUrl}">${safeName}</a>
            </h3>

            <div class="d-flex flex-wrap align-items-baseline gap-2">
              <span class="text-cyan fw-bold font-monospace">${GearVaultPages.formatPrice(item.price)}</span>
              ${item.originalPrice && item.originalPrice > item.price
                ? `<span class="gv-price-original">${GearVaultPages.formatPrice(item.originalPrice)}</span>`
                : ''}
              <span class="small text-muted">per unit</span>
            </div>
          </div>

          <div class="gv-cart-controls">
            <div class="text-end">
              <div class="small text-secondary">Item Total</div>
              <div class="gv-price-current text-white">${GearVaultPages.formatPrice(lineTotal)}</div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <div class="gv-qty-stepper" role="group" aria-label="Quantity controls for ${safeName}">
                <button
                  type="button"
                  class="gv-qty-btn"
                  data-action="decrease"
                  data-id="${GearVaultPages.escapeHtml(item.id)}"
                  aria-label="Decrease quantity"
                  ${item.quantity <= 1 ? 'disabled title="Minimum quantity is 1"' : 'title="Decrease quantity"'}
                >
                  <i class="bi bi-dash-lg"></i>
                </button>
                <span class="gv-qty-value" aria-live="polite">${item.quantity}</span>
                <button
                  type="button"
                  class="gv-qty-btn"
                  data-action="increase"
                  data-id="${GearVaultPages.escapeHtml(item.id)}"
                  aria-label="Increase quantity"
                  title="Increase quantity"
                >
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>

              <button
                type="button"
                class="gv-btn-remove"
                data-action="remove"
                data-id="${GearVaultPages.escapeHtml(item.id)}"
                aria-label="Remove ${safeName}"
              >
                <i class="bi bi-trash3"></i> Remove
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  updateOrderSummary();
}

function updateOrderSummary() {
  const resolvedItems = GearVaultPages.readCart().map(GearVaultPages.resolveCartItem);
  const totals = GearVaultPages.calculateTotals(resolvedItems, activePromoCode);

  const itemCountEl = document.getElementById('gv-summary-item-count');
  const subtotalEl = document.getElementById('gv-summary-subtotal');
  const discountRowEl = document.getElementById('gv-discount-row');
  const discountLabelEl = document.getElementById('gv-applied-code-label');
  const discountEl = document.getElementById('gv-summary-discount');
  const taxEl = document.getElementById('gv-summary-tax');
  const shippingEl = document.getElementById('gv-summary-shipping');
  const totalEl = document.getElementById('gv-summary-total');
  const shippingHintEl = document.getElementById('gv-shipping-hint');
  const shippingBarEl = document.getElementById('gv-shipping-bar');
  const feedbackEl = document.getElementById('gv-promo-feedback');
  const removeWrap = document.getElementById('gv-promo-remove-wrap');
  const promoInput = document.getElementById('gv-promo-input');

  if (itemCountEl) itemCountEl.textContent = totals.itemCount;
  if (subtotalEl) subtotalEl.textContent = GearVaultPages.formatPrice(totals.subtotal);
  if (taxEl) taxEl.textContent = GearVaultPages.formatPrice(totals.tax);

  if (shippingEl) {
    if (totals.shipping === 0 && totals.subtotal > 0) {
      shippingEl.innerHTML = '<span class="text-success">FREE</span>';
    } else {
      shippingEl.textContent = GearVaultPages.formatPrice(totals.shipping);
    }
  }

  if (shippingHintEl && shippingBarEl) {
    const threshold = GearVaultPages.FREE_SHIPPING_THRESHOLD;
    const progress = Math.min(100, Math.round((totals.subtotal / threshold) * 100));
    shippingBarEl.style.width = `${progress}%`;

    if (totals.subtotal >= threshold) {
      shippingHintEl.innerHTML = '<span class="text-success fw-semibold">FREE Insured Courier Unlocked!</span>';
    } else {
      const remaining = threshold - totals.subtotal;
      shippingHintEl.innerHTML = `Add <strong class="text-cyan">${GearVaultPages.formatPrice(remaining)}</strong> more for FREE shipping`;
    }
  }

  if (totals.promo && totals.discount > 0) {
    if (discountRowEl) discountRowEl.classList.remove('d-none');
    if (discountLabelEl) discountLabelEl.textContent = totals.promo.code;
    if (discountEl) discountEl.textContent = `- ${GearVaultPages.formatPrice(totals.discount)}`;
    if (promoInput) promoInput.classList.add('is-valid-promo');
    if (removeWrap) removeWrap.classList.remove('d-none');
    if (feedbackEl) {
      feedbackEl.classList.remove('is-error');
      feedbackEl.classList.add('is-success');
      feedbackEl.innerHTML = `<i class="bi bi-check-circle-fill"></i> Code <strong>${totals.promo.code}</strong> applied: saving <strong>${GearVaultPages.formatPrice(totals.discount)}</strong> (${totals.promo.label}).`;
    }
  } else {
    if (discountRowEl) discountRowEl.classList.add('d-none');
  }

  if (totalEl) totalEl.textContent = GearVaultPages.formatPrice(totals.total);
}
