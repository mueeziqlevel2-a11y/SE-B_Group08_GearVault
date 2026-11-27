/**
 * GEARVAULT - Order Tracking Controller (pages/order-tracking.html)
 * Looks up orders from localStorage (gearvault_orders), renders the 4-step
 * status timeline (Order Placed, Processing, Shipped, Delivered), displays
 * clear error alerts when Order ID is not found, and allows stepping status for demos.
 */

const ORDER_STAGES = [
  'Order Placed',
  'Processing',
  'Shipped',
  'Delivered'
];

const PROGRESS_WIDTHS = ['0%', '30%', '60%', '90%'];

let currentlyTrackedOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
  GearVaultPages.initNestedLayout('order-tracking');
  renderRecentOrderChips();
  bindTrackingEvents();

  const initialOrderId = typeof getQueryParam === 'function' ? getQueryParam('id') : null;
  if (initialOrderId) {
    const input = document.getElementById('gv-tracking-input');
    if (input) input.value = initialOrderId;
    lookupAndRenderOrder(initialOrderId);
  }
});

function bindTrackingEvents() {
  const form = document.getElementById('gv-tracking-form');
  const input = document.getElementById('gv-tracking-input');
  const recentList = document.getElementById('gv-recent-orders-list');
  const advanceBtn = document.getElementById('gv-advance-status-btn');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      lookupAndRenderOrder(input.value);
    });

    input.addEventListener('input', () => {
      input.classList.remove('is-error');
      input.setAttribute('aria-invalid', 'false');
    });
  }

  if (recentList) {
    recentList.addEventListener('click', (e) => {
      const chip = e.target.closest('button[data-order-id]');
      if (!chip) return;
      const id = chip.dataset.orderId;
      if (input) input.value = id;
      lookupAndRenderOrder(id);
    });
  }

  if (advanceBtn) {
    advanceBtn.addEventListener('click', () => {
      if (!currentlyTrackedOrderId) return;
      advanceOrderStage(currentlyTrackedOrderId);
    });
  }
}

function renderRecentOrderChips() {
  const wrap = document.getElementById('gv-recent-orders-wrap');
  const list = document.getElementById('gv-recent-orders-list');
  if (!wrap || !list) return;

  const orders = GearVaultPages.readOrders().slice(0, 6);
  if (orders.length === 0) {
    wrap.classList.add('d-none');
    list.innerHTML = '';
    return;
  }

  wrap.classList.remove('d-none');
  list.innerHTML = orders.map((order) => {
    const safeId = GearVaultPages.escapeHtml(order.orderId);
    const stageIndex = resolveStageIndex(order.status);
    return `
      <button type="button" class="gv-recent-order-chip" data-order-id="${safeId}">
        ${safeId} <span class="text-cyan">(${ORDER_STAGES[stageIndex]})</span>
      </button>
    `;
  }).join('');
}

function lookupAndRenderOrder(rawOrderId) {
  const query = (rawOrderId || '').trim();
  const inputEl = document.getElementById('gv-tracking-input');
  const errorEl = document.getElementById('gv-tracking-error');
  const errorTitleEl = document.getElementById('gv-tracking-error-title');
  const errorMsgEl = document.getElementById('gv-tracking-error-msg');
  const placeholderEl = document.getElementById('gv-tracking-placeholder');
  const resultEl = document.getElementById('gv-tracking-result');

  if (!query) {
    currentlyTrackedOrderId = null;
    if (inputEl) {
      inputEl.classList.add('is-error');
      inputEl.setAttribute('aria-invalid', 'true');
    }
    if (resultEl) resultEl.classList.add('d-none');
    if (placeholderEl) placeholderEl.classList.add('d-none');
    if (errorEl) errorEl.classList.remove('d-none');
    if (errorTitleEl) errorTitleEl.textContent = 'Order ID Required';
    if (errorMsgEl) errorMsgEl.textContent = 'Please enter a valid Order ID (e.g. GV-2026-4821) to track your order.';
    if (typeof showToast === 'function') {
      showToast('Please enter an Order ID.', 'warning');
    }
    return;
  }

  const order = GearVaultPages.findOrderById(query);
  if (!order) {
    currentlyTrackedOrderId = null;
    if (inputEl) {
      inputEl.classList.add('is-error');
      inputEl.setAttribute('aria-invalid', 'true');
    }
    if (resultEl) resultEl.classList.add('d-none');
    if (placeholderEl) placeholderEl.classList.add('d-none');
    if (errorEl) errorEl.classList.remove('d-none');
    if (errorTitleEl) errorTitleEl.textContent = `Order "${query.toUpperCase()}" Not Found`;
    if (errorMsgEl) {
      errorMsgEl.textContent = `No order matching "${query.toUpperCase()}" was found in localStorage (gearvault_orders). Check the ID or place an order at checkout.`;
    }
    if (typeof showToast === 'function') {
      showToast(`Order "${query.toUpperCase()}" not found.`, 'danger');
    }
    return;
  }

  if (inputEl) {
    inputEl.classList.remove('is-error');
    inputEl.setAttribute('aria-invalid', 'false');
  }
  if (errorEl) errorEl.classList.add('d-none');
  if (placeholderEl) placeholderEl.classList.add('d-none');
  if (resultEl) resultEl.classList.remove('d-none');

  currentlyTrackedOrderId = order.orderId;
  renderOrderDetails(order);
}

function resolveStageIndex(status) {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'order placed') return 0;
  if (normalized === 'processing' || normalized === 'quality check' || normalized === 'packed') return 1;
  if (normalized === 'shipped' || normalized === 'dispatched') return 2;
  if (normalized === 'delivered') return 3;
  return 0;
}

function renderOrderDetails(order) {
  const stageIndex = resolveStageIndex(order.status);
  const stageLabel = ORDER_STAGES[stageIndex];

  const orderIdEl = document.getElementById('gv-result-order-id');
  const statusBadgeEl = document.getElementById('gv-result-status-badge');
  const progressEl = document.getElementById('gv-timeline-progress');
  const advanceBtn = document.getElementById('gv-advance-status-btn');
  const dateEl = document.getElementById('gv-result-date');
  const customerEl = document.getElementById('gv-result-customer');
  const destEl = document.getElementById('gv-result-destination');
  const paymentEl = document.getElementById('gv-result-payment');
  const itemsEl = document.getElementById('gv-result-items');
  const subtotalEl = document.getElementById('gv-result-subtotal');
  const discountRowEl = document.getElementById('gv-result-discount-row');
  const discountEl = document.getElementById('gv-result-discount');
  const taxEl = document.getElementById('gv-result-tax');
  const shippingEl = document.getElementById('gv-result-shipping');
  const totalEl = document.getElementById('gv-result-total');

  if (orderIdEl) orderIdEl.textContent = order.orderId;

  if (statusBadgeEl) {
    statusBadgeEl.textContent = stageLabel;
    statusBadgeEl.className = stageIndex === 3
      ? 'gv-badge gv-badge-instock py-2 px-3'
      : 'gv-badge gv-badge-cyan py-2 px-3';
  }

  if (progressEl) {
    progressEl.style.width = PROGRESS_WIDTHS[stageIndex];
  }

  document.querySelectorAll('.gv-timeline-step').forEach((stepEl) => {
    const idx = parseInt(stepEl.dataset.step, 10);
    stepEl.classList.remove('completed', 'active');
    if (idx < stageIndex || (idx === 3 && stageIndex === 3)) {
      stepEl.classList.add('completed');
    } else if (idx === stageIndex) {
      stepEl.classList.add('active');
    }
  });

  if (advanceBtn) {
    advanceBtn.disabled = stageIndex >= ORDER_STAGES.length - 1;
    advanceBtn.innerHTML = stageIndex >= ORDER_STAGES.length - 1
      ? '<i class="bi bi-check-all"></i> Delivered'
      : '<i class="bi bi-fast-forward-fill"></i> Next Stage (Demo)';
  }

  if (dateEl) {
    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Just now';
    dateEl.textContent = formattedDate;
  }

  if (customerEl) {
    customerEl.textContent = order.customer?.name || 'GearVault Customer';
  }

  if (destEl) {
    const city = order.customer?.city || '';
    const addr = order.customer?.address || '';
    destEl.textContent = [city, addr].filter(Boolean).join(' — ') || 'Pakistan';
  }

  if (paymentEl) {
    const method = order.paymentMethod || 'Card / COD';
    paymentEl.textContent = order.cardLast4 ? `${method} (•••• ${order.cardLast4})` : method;
  }

  if (itemsEl && Array.isArray(order.items)) {
    itemsEl.innerHTML = order.items.map((item) => {
      const resolved = GearVaultPages.resolveCartItem(item);
      const safeName = GearVaultPages.escapeHtml(resolved.name);
      return `
        <div class="gv-order-item-row">
          <div class="gv-order-item-thumb">
            <img src="${GearVaultPages.escapeHtml(resolved.image)}" alt="${safeName}" onerror="handleImgError(this, '${safeName.replace(/'/g, "\\'")}')">
          </div>
          <div class="flex-grow-1 min-w-0">
            <div class="text-white fw-semibold text-truncate">${safeName}</div>
            <div class="small text-secondary">Qty: ${resolved.quantity} &times; ${GearVaultPages.formatPrice(resolved.price)}</div>
          </div>
          <div class="text-cyan font-monospace fw-bold text-nowrap">
            ${GearVaultPages.formatPrice(resolved.price * resolved.quantity)}
          </div>
        </div>
      `;
    }).join('');
  }

  if (subtotalEl) subtotalEl.textContent = GearVaultPages.formatPrice(order.subtotal ?? 0);
  if (taxEl) taxEl.textContent = GearVaultPages.formatPrice(order.tax ?? 0);

  if (shippingEl) {
    shippingEl.innerHTML = Number(order.shipping) === 0
      ? '<span class="text-success">FREE</span>'
      : GearVaultPages.formatPrice(order.shipping ?? 0);
  }

  if (discountRowEl && discountEl) {
    if (Number(order.discount) > 0) {
      discountRowEl.classList.remove('d-none');
      discountEl.textContent = `- ${GearVaultPages.formatPrice(order.discount)}`;
    } else {
      discountRowEl.classList.add('d-none');
    }
  }

  if (totalEl) totalEl.textContent = GearVaultPages.formatPrice(order.total ?? 0);
}

function advanceOrderStage(orderId) {
  const orders = GearVaultPages.readOrders();
  const target = orders.find((o) => String(o.orderId).toUpperCase() === orderId.toUpperCase());
  if (!target) return;

  const currentIdx = resolveStageIndex(target.status);
  if (currentIdx >= ORDER_STAGES.length - 1) return;

  target.status = ORDER_STAGES[currentIdx + 1];
  GearVaultPages.writeOrders(orders);
  renderOrderDetails(target);
  renderRecentOrderChips();

  if (typeof showToast === 'function') {
    showToast(`Order <strong>${target.orderId}</strong> updated to <strong>${target.status}</strong>.`, 'success');
  }
}
