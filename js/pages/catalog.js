document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderGameVaultNavbar === 'function') renderGameVaultNavbar('pc-parts');
  if (typeof renderGameVaultFooter === 'function') renderGameVaultFooter();

  const grid = document.getElementById('catalog-products-grid');
  const countEl = document.getElementById('catalog-count');
  const categorySelect = document.getElementById('catalog-category-filter');
  const priceSlider = document.getElementById('catalog-price-slider');
  const priceVal = document.getElementById('catalog-price-val');
  const inStockOnly = document.getElementById('catalog-instock-only');
  const brandList = document.getElementById('catalog-brand-list');
  const searchInput = document.getElementById('catalog-search-input');
  const sortSelect = document.getElementById('catalog-sort-select');
  const resetBtn = document.getElementById('catalog-reset-filters');

  if (!grid || typeof GAMEVAULT_PRODUCTS === 'undefined') return;

  const allParts = GAMEVAULT_PRODUCTS.filter(p => (p.category || '').toLowerCase() === 'pc-parts');

  const params = new URLSearchParams(window.location.search);
  const initialCat = params.get('category');
  if (initialCat && categorySelect) categorySelect.value = initialCat.toLowerCase();

  const brands = [...new Set(allParts.map(p => p.brand).filter(Boolean))].sort();
  if (brandList) {
    brandList.innerHTML = brands.map(b => `
      <div class="form-check mb-1">
        <input class="form-check-input catalog-brand-cb" type="checkbox" value="${b}" id="brand-${b.replace(/\s+/g, '-')}">
        <label class="form-check-label text-secondary small" for="brand-${b.replace(/\s+/g, '-')}">${b}</label>
      </div>
    `).join('');
  }

  function formatPKR(num) {
    return 'Rs. ' + Number(num || 0).toLocaleString('en-PK');
  }

  function renderCatalog() {
    const selectedType = categorySelect ? categorySelect.value : 'all';
    const maxPrice = priceSlider ? Number(priceSlider.value) : 700000;
    const onlyStock = inStockOnly ? inStockOnly.checked : false;
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const sortBy = sortSelect ? sortSelect.value : 'default';
    const checkedBrands = [...document.querySelectorAll('.catalog-brand-cb:checked')].map(cb => cb.value);

    if (priceVal) priceVal.textContent = formatPKR(maxPrice);

    let filtered = allParts.filter(p => {
      if (selectedType !== 'all' && (p.subCategory || '').toLowerCase() !== selectedType) return false;
      if (Number(p.price) > maxPrice) return false;
      if (onlyStock && p.inStock === false) return false;
      if (checkedBrands.length && !checkedBrands.includes(p.brand)) return false;
      if (query) {
        const specsText = p.specs && typeof p.specs === 'object' ? Object.values(p.specs).join(' ') : (p.specs || '');
        const hay = `${p.name} ${p.brand} ${p.subCategory} ${p.shortDescription || ''} ${specsText}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating-desc') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'popularity') filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

    if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allParts.length} PC components`;

    if (!filtered.length) {
      grid.innerHTML = `<div class="col-12"><div class="gv-card p-5 text-center text-secondary">No PC parts match your active filters. Click <strong>Reset All Filters</strong> to view all hardware.</div></div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <div class="col-md-6 col-xl-4">
        <div class="gv-card h-100 d-flex flex-column p-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-dark border border-secondary text-cyan text-uppercase">${p.subCategory || 'part'}</span>
            <span class="badge ${p.inStock === false ? 'bg-danger' : 'bg-success'} bg-opacity-25 ${p.inStock === false ? 'text-danger' : 'text-success'}">${p.inStock === false ? 'Out of Stock' : 'In Stock'}</span>
          </div>
          <div class="text-center my-2" style="height: 150px; display: flex; align-items: center; justify-content: center;">
            <img src="${p.image || ''}" alt="${p.name}" style="max-height: 140px; max-width: 100%; object-fit: contain;" onerror="this.style.display='none'">
          </div>
          <div class="small text-secondary mb-1">${p.brand || ''} &bull; <span class="text-warning">&#9733; ${p.rating || '4.8'}</span></div>
          <h6 class="text-white mb-2">${p.name}</h6>
          <div class="small text-secondary mb-3 flex-grow-1">${p.shortDescription || ''}</div>
          <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-25">
            <span class="text-cyan fw-bold">${formatPKR(p.price)}</span>
            <button class="gv-btn gv-btn-cyan gv-btn-sm gv-add-cart-btn" data-id="${p.id}">
              <i class="bi bi-cart-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.gv-add-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (typeof addToCart === 'function') addToCart(id, 1);
        else if (typeof GameVaultStorage !== 'undefined' && GameVaultStorage.addToCart) GameVaultStorage.addToCart(id, 1);
        if (typeof updateBadgeCounters === 'function') updateBadgeCounters();
        if (typeof showToast === 'function') showToast('Component added to cart!', 'success');
      });
    });
  }

  [categorySelect, priceSlider, inStockOnly, sortSelect].forEach(el => {
    if (el) el.addEventListener('input', renderCatalog);
  });
  if (searchInput) searchInput.addEventListener('input', renderCatalog);
  document.addEventListener('change', e => {
    if (e.target && e.target.classList.contains('catalog-brand-cb')) renderCatalog();
  });
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (categorySelect) categorySelect.value = 'all';
      if (priceSlider) priceSlider.value = 700000;
      if (inStockOnly) inStockOnly.checked = false;
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'default';
      document.querySelectorAll('.catalog-brand-cb').forEach(cb => cb.checked = false);
      renderCatalog();
    });
  }

  renderCatalog();
});
