/**
 * GAMEVAULT - Central localStorage Controller
 * Manages strict persistent keys:
 * - gamevault_cart
 * - gamevault_wishlist
 * - gamevault_builder
 * - gamevault_compare
 * - gamevault_orders
 */

const STORAGE_KEYS = {
  CART: 'gamevault_cart',
  WISHLIST: 'gamevault_wishlist',
  BUILDER: 'gamevault_builder',
  COMPARE: 'gamevault_compare',
  ORDERS: 'gamevault_orders'
};

const StorageManager = {
  // Safe read from localStorage
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`[GameVault Storage] Error reading ${key}:`, e);
      return defaultValue;
    }
  },

  // Safe write to localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch custom storage event for in-tab reactive updates
      window.dispatchEvent(new CustomEvent('gamevault_storage_update', { detail: { key, value } }));
      return true;
    } catch (e) {
      console.error(`[GameVault Storage] Error writing ${key}:`, e);
      return false;
    }
  },

  /* ==================== CART OPERATIONS ==================== */
  getCart() {
    return this.get(STORAGE_KEYS.CART, []);
  },

  saveCart(cart) {
    return this.set(STORAGE_KEYS.CART, cart);
  },

  addToCart(productId, quantity = 1, options = {}) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
      if (options) {
        cart[existingIndex].options = { ...cart[existingIndex].options, ...options };
      }
    } else {
      cart.push({
        id: productId,
        quantity: Math.max(1, quantity),
        options: options || {}
      });
    }

    this.saveCart(cart);
    return cart;
  },

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity(productId, quantity) {
    let cart = this.getCart();
    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return this.removeFromCart(productId);
    }

    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = parsedQty;
      this.saveCart(cart);
    }
    return cart;
  },

  clearCart() {
    this.saveCart([]);
    return [];
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  /* ==================== WISHLIST OPERATIONS ==================== */
  getWishlist() {
    return this.get(STORAGE_KEYS.WISHLIST, []);
  },

  saveWishlist(wishlist) {
    return this.set(STORAGE_KEYS.WISHLIST, wishlist);
  },

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const exists = wishlist.includes(productId);

    if (exists) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }

    this.saveWishlist(wishlist);
    return { wishlist, isAdded: !exists };
  },

  isInWishlist(productId) {
    const wishlist = this.getWishlist();
    return wishlist.includes(productId);
  },

  removeFromWishlist(productId) {
    let wishlist = this.getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    this.saveWishlist(wishlist);
    return wishlist;
  },

  clearWishlist() {
    this.saveWishlist([]);
    return [];
  },

  /* ==================== PC BUILDER OPERATIONS ==================== */
  getBuilder() {
    return this.get(STORAGE_KEYS.BUILDER, {
      cpu: null,
      motherboard: null,
      ram: null,
      gpu: null,
      storage: null,
      psu: null,
      case: null,
      cooler: null
    });
  },

  saveBuilder(builderState) {
    return this.set(STORAGE_KEYS.BUILDER, builderState);
  },

  setBuilderSlot(slot, productId) {
    const builder = this.getBuilder();
    builder[slot] = productId;
    this.saveBuilder(builder);
    return builder;
  },

  removeBuilderSlot(slot) {
    const builder = this.getBuilder();
    builder[slot] = null;
    this.saveBuilder(builder);
    return builder;
  },

  clearBuilder() {
    const emptyBuilder = {
      cpu: null,
      motherboard: null,
      ram: null,
      gpu: null,
      storage: null,
      psu: null,
      case: null,
      cooler: null
    };
    this.saveBuilder(emptyBuilder);
    return emptyBuilder;
  },

  /* ==================== GEAR COMPARE OPERATIONS ==================== */
  getCompareList() {
    return this.get(STORAGE_KEYS.COMPARE, []);
  },

  saveCompareList(list) {
    return this.set(STORAGE_KEYS.COMPARE, list);
  },

  toggleCompare(productId) {
    let list = this.getCompareList();
    const index = list.indexOf(productId);

    if (index > -1) {
      list.splice(index, 1);
      this.saveCompareList(list);
      return { list, isAdded: false };
    } else {
      if (list.length >= 4) {
        return { list, isAdded: false, error: 'Maximum 4 items can be compared at once.' };
      }
      list.push(productId);
      this.saveCompareList(list);
      return { list, isAdded: true };
    }
  },

  isInCompare(productId) {
    const list = this.getCompareList();
    return list.includes(productId);
  },

  removeFromCompare(productId) {
    let list = this.getCompareList();
    list = list.filter(id => id !== productId);
    this.saveCompareList(list);
    return list;
  },

  clearCompare() {
    this.saveCompareList([]);
    return [];
  },

  /* ==================== ORDERS OPERATIONS ==================== */
  getOrders() {
    return this.get(STORAGE_KEYS.ORDERS, []);
  },

  saveOrders(orders) {
    return this.set(STORAGE_KEYS.ORDERS, orders);
  },

  createOrder(orderData) {
    const orders = this.getOrders();
    const orderId = 'GV-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      status: 'Processing', // Processing, Quality Check, Packed, Dispatched, Delivered
      ...orderData
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  getOrderById(orderId) {
    if (!orderId) return null;
    const orders = this.getOrders();
    return orders.find(o => o.orderId.toUpperCase() === orderId.trim().toUpperCase()) || null;
  }
};
