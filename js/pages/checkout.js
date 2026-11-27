/**
 * GEARVAULT - Checkout Page Controller (pages/checkout.html)
 * Handles Order Summary pulled from gearvault_cart, Payment Method tabs (Card / COD),
 * live field validation, order ID generation (GV-2026-XXXX), saving to gearvault_orders,
 * clearing gearvault_cart, and showing the Order Confirmation Modal.
 */

let activePaymentMethod = 'card';
let orderCompleted = false;
const touchedFields = new Set();

const SHIPPING_FIELD_IDS = [
  'checkout-name',
  'checkout-email',
  'checkout-phone',
  'checkout-city',
  'checkout-address'
];

const CARD_FIELD_IDS = [
  'card-holder',
  'card-number',
  'card-expiry',
  'card-cvv'
];

document.addEventListener('DOMContentLoaded', () => {
  GearVaultPages.initNestedLayout('checkout');
  renderCheckoutSummary();
  setupPaymentTabs();
  setupLiveValidation();
  setupFormSubmission();
  setupCopyOrderId();
});

function renderCheckoutSummary() {
  const rawCart = GearVaultPages.readCart();
  const emptyGuardEl = document.getElementById('gv-checkout-empty');
  const formEl = document.getElementById('gv-checkout-form');

  if (rawCart.length === 0 && !orderCompleted) {
    if (emptyGuardEl) emptyGuardEl.classList.remove('d-none');
    if (formEl) formEl.classList.add('d-none');
    return;
  }

  if (emptyGuardEl) emptyGuardEl.classList.add('d-none');
  if (formEl) formEl.classList.remove('d-none');

  const resolvedItems = rawCart.map(GearVaultPages.resolveCartItem);
  const promoCode = GearVaultPages.getSavedPromo();
  const totals = GearVaultPages.calculateTotals(resolvedItems, promoCode);

  const itemsListEl = document.getElementById('gv-checkout-items-list');
  const itemBadgeEl = document.getElementById('gv-checkout-item-badge');
  const subtotalEl = document.getElementById('gv-checkout-subtotal');
  const discountRowEl = document.getElementById('gv-checkout-discount-row');
  const promoCodeEl = document.getElementById('gv-checkout-promo-code');
  const discountEl = document.getElementById('gv-checkout-discount');
  const taxEl = document.getElementById('gv-checkout-tax');
  const shippingEl = document.getElementById('gv-checkout-shipping');
  const totalEl = document.getElementById('gv-checkout-total');

  if (itemBadgeEl) {
    itemBadgeEl.textContent = `${totals.itemCount} ${totals.itemCount === 1 ? 'Item' : 'Items'}`;
  }

  if (itemsListEl) {
    itemsListEl.innerHTML = resolvedItems.map((item) => {
      const safeName = GearVaultPages.escapeHtml(item.name);
      return `
        <div class="gv-summary-mini-item">
          <div class="gv-summary-mini-thumb">
            <img src="${GearVaultPages.escapeHtml(item.image)}" alt="${safeName}" onerror="handleImgError(this, '${safeName.replace(/'/g, "\\'")}')">
          </div>
          <div class="flex-grow-1 min-w-0">
            <div class="small text-white fw-semibold text-truncate">${safeName}</div>
            <div class="text-muted" style="font-size: 0.78rem;">Qty: ${item.quantity} &bull; ${GearVaultPages.formatPrice(item.price)}</div>
          </div>
          <div class="small text-cyan fw-bold font-monospace text-nowrap">
            ${GearVaultPages.formatPrice(item.price * item.quantity)}
          </div>
        </div>
      `;
    }).join('');
  }

  if (subtotalEl) subtotalEl.textContent = GearVaultPages.formatPrice(totals.subtotal);
  if (taxEl) taxEl.textContent = GearVaultPages.formatPrice(totals.tax);

  if (shippingEl) {
    if (totals.shipping === 0 && totals.subtotal > 0) {
      shippingEl.innerHTML = '<span class="text-success">FREE</span>';
    } else {
      shippingEl.textContent = GearVaultPages.formatPrice(totals.shipping);
    }
  }

  if (totals.promo && totals.discount > 0) {
    if (discountRowEl) discountRowEl.classList.remove('d-none');
    if (promoCodeEl) promoCodeEl.textContent = totals.promo.code;
    if (discountEl) discountEl.textContent = `- ${GearVaultPages.formatPrice(totals.discount)}`;
  } else if (discountRowEl) {
    discountRowEl.classList.add('d-none');
  }

  if (totalEl) totalEl.textContent = GearVaultPages.formatPrice(totals.total);
}

function setupPaymentTabs() {
  const cardTab = document.getElementById('tab-payment-card');
  const codTab = document.getElementById('tab-payment-cod');
  const cardPanel = document.getElementById('payment-panel-card');
  const codPanel = document.getElementById('payment-panel-cod');

  if (!cardTab || !codTab || !cardPanel || !codPanel) return;

  function switchMethod(method) {
    activePaymentMethod = method;
    const isCard = method === 'card';

    cardTab.classList.toggle('active', isCard);
    cardTab.setAttribute('aria-selected', String(isCard));
    codTab.classList.toggle('active', !isCard);
    codTab.setAttribute('aria-selected', String(!isCard));

    cardPanel.classList.toggle('d-none', !isCard);
    codPanel.classList.toggle('d-none', isCard);

    CARD_FIELD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('aria-required', String(isCard));
      if (!isCard) clearFieldValidation(id);
    });
  }

  cardTab.addEventListener('click', () => switchMethod('card'));
  codTab.addEventListener('click', () => switchMethod('cod'));
}

function setupLiveValidation() {
  const cardNumberInput = document.getElementById('card-number');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvvInput = document.getElementById('card-cvv');
  const phoneInput = document.getElementById('checkout-phone');

  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
      e.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });
  }

  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^\d-\s]/g, '');
    });
  }

  [...SHIPPING_FIELD_IDS, ...CARD_FIELD_IDS].forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener('blur', () => {
      touchedFields.add(fieldId);
      validateField(fieldId);
    });

    input.addEventListener('input', () => {
      if (touchedFields.has(fieldId)) {
        validateField(fieldId);
      }
    });
  });
}

function validateField(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return true;

  const value = input.value.trim();
  let errorMsg = '';

  switch (fieldId) {
    case 'checkout-name':
      if (!value) {
        errorMsg = 'Full name is required.';
      } else if (value.length < 2) {
        errorMsg = 'Please enter at least 2 characters.';
      }
      break;

    case 'checkout-email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        errorMsg = 'Email address is required.';
      } else if (!emailRegex.test(value)) {
        errorMsg = 'Enter a valid email address (e.g. name@example.com).';
      }
      break;
    }

    case 'checkout-phone': {
      const digits = value.replace(/[\s-]/g, '');
      if (!value) {
        errorMsg = 'Phone number is required.';
      } else if (!/^\d{11}$/.test(digits)) {
        errorMsg = 'Phone number must be exactly 11 digits (e.g. 03001234567).';
      }
      break;
    }

    case 'checkout-city':
      if (!value) {
        errorMsg = 'City is required.';
      }
      break;

    case 'checkout-address':
      if (!value) {
        errorMsg = 'Street address is required.';
      } else if (value.length < 6) {
        errorMsg = 'Please provide a complete delivery address.';
      }
      break;

    case 'card-holder':
      if (activePaymentMethod === 'card' && !value) {
        errorMsg = 'Cardholder name is required.';
      }
      break;

    case 'card-number':
      if (activePaymentMethod === 'card') {
        const digits = value.replace(/\s/g, '');
        if (!digits) {
          errorMsg = 'Card number is required.';
        } else if (!/^\d{16}$/.test(digits)) {
          errorMsg = 'Card number must contain exactly 16 digits.';
        }
      }
      break;

    case 'card-expiry':
      if (activePaymentMethod === 'card') {
        if (!value) {
          errorMsg = 'Expiry date is required.';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
          errorMsg = 'Enter expiry as MM/YY.';
        }
      }
      break;

    case 'card-cvv':
      if (activePaymentMethod === 'card') {
        if (!value) {
          errorMsg = 'CVV is required.';
        } else if (!/^\d{3,4}$/.test(value)) {
          errorMsg = 'CVV must be 3 or 4 digits.';
        }
      }
      break;

    default:
      break;
  }

  applyFieldValidationState(fieldId, errorMsg);
  return errorMsg === '';
}

function applyFieldValidationState(fieldId, errorMsg) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (!input || !errorEl) return;

  if (errorMsg) {
    input.classList.add('is-error');
    input.classList.remove('is-valid-field');
    input.setAttribute('aria-invalid', 'true');
    errorEl.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ${GearVaultPages.escapeHtml(errorMsg)}`;
    errorEl.classList.add('visible');
  } else {
    input.classList.remove('is-error');
    input.classList.add('is-valid-field');
    input.setAttribute('aria-invalid', 'false');
    errorEl.innerHTML = '';
    errorEl.classList.remove('visible');
  }
}

function clearFieldValidation(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (input) {
    input.classList.remove('is-error', 'is-valid-field');
    input.setAttribute('aria-invalid', 'false');
  }
  if (errorEl) {
    errorEl.innerHTML = '';
    errorEl.classList.remove('visible');
  }
}

function validateAllFields() {
  const activeIds = activePaymentMethod === 'card'
    ? [...SHIPPING_FIELD_IDS, ...CARD_FIELD_IDS]
    : [...SHIPPING_FIELD_IDS];

  let firstInvalidId = null;
  let allValid = true;

  activeIds.forEach((fieldId) => {
    touchedFields.add(fieldId);
    const valid = validateField(fieldId);
    if (!valid) {
      allValid = false;
      if (!firstInvalidId) firstInvalidId = fieldId;
    }
  });

  if (firstInvalidId) {
    const target = document.getElementById(firstInvalidId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return allValid;
}

function setupFormSubmission() {
  const form = document.getElementById('gv-checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const rawCart = GearVaultPages.readCart();
    if (rawCart.length === 0) {
      renderCheckoutSummary();
      if (typeof showToast === 'function') {
        showToast('Your cart is empty.', 'warning');
      }
      return;
    }

    if (!validateAllFields()) {
      if (typeof showToast === 'function') {
        showToast('Please fix the highlighted fields before placing your order.', 'danger');
      }
      return;
    }

    const resolvedItems = rawCart.map(GearVaultPages.resolveCartItem);
    const promoCode = GearVaultPages.getSavedPromo();
    const totals = GearVaultPages.calculateTotals(resolvedItems, promoCode);

    const customerName = document.getElementById('checkout-name').value.trim();
    const customerEmail = document.getElementById('checkout-email').value.trim();
    const customerPhone = document.getElementById('checkout-phone').value.trim().replace(/[\s-]/g, '');
    const customerCity = document.getElementById('checkout-city').value.trim();
    const customerAddress = document.getElementById('checkout-address').value.trim();
    const customerNotes = document.getElementById('checkout-notes').value.trim();
    const cardDigits = activePaymentMethod === 'card'
      ? document.getElementById('card-number').value.replace(/\s/g, '')
      : '';

    const orderId = GearVaultPages.generateOrderId();
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      status: 'Order Placed',
      paymentMethod: activePaymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery (COD)',
      cardLast4: activePaymentMethod === 'card' ? cardDigits.slice(-4) : null,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        city: customerCity,
        address: customerAddress,
        notes: customerNotes
      },
      items: resolvedItems.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      promoCode: totals.promo ? totals.promo.code : null,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total
    };

    const existingOrders = GearVaultPages.readOrders();
    existingOrders.unshift(newOrder);
    GearVaultPages.writeOrders(existingOrders);

    orderCompleted = true;
    GearVaultPages.clearCart();
    showOrderConfirmationModal(newOrder);
  });
}

function showOrderConfirmationModal(order) {
  const orderIdEl = document.getElementById('gv-modal-order-id');
  const customerEl = document.getElementById('gv-modal-customer');
  const cityEl = document.getElementById('gv-modal-city');
  const paymentEl = document.getElementById('gv-modal-payment');
  const totalEl = document.getElementById('gv-modal-total');
  const trackLinkEl = document.getElementById('gv-modal-track-link');
  const modalEl = document.getElementById('gv-order-confirm-modal');

  if (orderIdEl) orderIdEl.textContent = order.orderId;
  if (customerEl) customerEl.textContent = order.customer.name;
  if (cityEl) cityEl.textContent = order.customer.city;
  if (paymentEl) {
    paymentEl.textContent = order.cardLast4
      ? `${order.paymentMethod} (•••• ${order.cardLast4})`
      : order.paymentMethod;
  }
  if (totalEl) totalEl.textContent = GearVaultPages.formatPrice(order.total);
  if (trackLinkEl) {
    trackLinkEl.setAttribute('href', `order-tracking.html?id=${encodeURIComponent(order.orderId)}`);
  }

  if (typeof showToast === 'function') {
    showToast(`Order <strong>${order.orderId}</strong> confirmed!`, 'success');
  }

  if (modalEl && typeof bootstrap !== 'undefined') {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function setupCopyOrderId() {
  const copyBtn = document.getElementById('gv-copy-order-id-btn');
  const orderIdEl = document.getElementById('gv-modal-order-id');
  if (!copyBtn || !orderIdEl) return;

  copyBtn.addEventListener('click', () => {
    const text = orderIdEl.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
          showToast(`Copied Order ID <strong>${text}</strong>!`, 'cyan');
        }
      });
    }
  });
}
