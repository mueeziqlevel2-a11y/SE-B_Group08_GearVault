function renderGameVaultFooter() {
  const container = document.getElementById('gv-footer-container');
  if (!container) return;

  const inPages = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
  const rootPrefix = inPages ? '../' : '';
  const pagesPrefix = inPages ? '' : 'pages/';

  container.innerHTML = `
    <footer class="gv-footer">
      <div class="container">
        <div class="gv-footer-grid">
          <div>
            <div class="gv-brand">
              <div class="gv-brand-icon"><i class="bi bi-cpu-fill"></i></div>
              <div class="gv-brand-text">
                <div class="gv-brand-name">GAME<span>VAULT</span></div>
                <div class="gv-brand-sub">Group 08 Project</div>
              </div>
            </div>
            <p class="gv-footer-brand-p text-secondary">
              The premier destination for high-performance PC hardware, custom battle stations, and competitive gaming gear in Pakistan.
            </p>
            <div class="d-flex gap-2">
              <span class="badge bg-dark border border-secondary text-cyan">HTML5</span>
              <span class="badge bg-dark border border-secondary text-violet">CSS3</span>
              <span class="badge bg-dark border border-secondary text-warning">Vanilla JS</span>
              <span class="badge bg-dark border border-secondary text-info">Bootstrap 5</span>
            </div>
          </div>

          <div>
            <h5 class="gv-footer-heading">Catalog & Orders</h5>
            <ul class="gv-footer-links">
              <li><a href="${rootPrefix}index.html"><i class="bi bi-chevron-right small"></i> Home</a></li>
              <li><a href="${rootPrefix}pc-parts.html"><i class="bi bi-chevron-right small"></i> PC Hardware</a></li>
              <li><a href="${pagesPrefix}gaming-gear.html"><i class="bi bi-chevron-right small"></i> Gaming Gear</a></li>
              <li><a href="${pagesPrefix}flash-deals.html"><i class="bi bi-chevron-right small"></i> Flash Deals</a></li>
              <li><a href="${pagesPrefix}cart.html"><i class="bi bi-chevron-right small"></i> Shopping Cart</a></li>
            </ul>
          </div>

          <div>
            <h5 class="gv-footer-heading">Interactive Tools</h5>
            <ul class="gv-footer-links">
              <li><a href="${pagesPrefix}pc-builder.html"><i class="bi bi-chevron-right small"></i> Custom PC Builder</a></li>
              <li><a href="${pagesPrefix}pc-builder.html"><i class="bi bi-chevron-right small"></i> Wattage Estimator</a></li>
              <li><a href="${rootPrefix}pc-parts.html"><i class="bi bi-chevron-right small"></i> Hardware Catalog</a></li>
              <li><a href="${pagesPrefix}flash-deals.html"><i class="bi bi-chevron-right small"></i> Bundle Deals</a></li>
            </ul>
          </div>

          <div>
            <h5 class="gv-footer-heading">Project Newsletter</h5>
            <p class="small text-secondary mb-3">Subscribe for simulated hardware drops, exclusive voucher alerts, and semester project updates.</p>
            <form id="gv-newsletter-form" class="mb-3">
              <div class="input-group">
                <input type="email" id="gv-newsletter-email" class="gv-input py-2" placeholder="Enter student / personal email..." required>
                <button class="gv-btn gv-btn-cyan gv-btn-sm" type="submit">Join</button>
              </div>
              <div id="gv-newsletter-feedback" class="small mt-1 text-cyan" style="display: none;"></div>
            </form>
            <div class="small text-muted"><i class="bi bi-mortarboard-fill text-violet me-1"></i> University Semester Project &bull; Group 08</div>
          </div>
        </div>

        <div class="gv-footer-bottom">
          <div class="d-flex flex-column gap-1">
            <div>&copy; 2026 GAMEVAULT (Group 08). All Rights Reserved.</div>
            <div class="text-secondary small">
              <span class="text-warning"><i class="bi bi-info-circle me-1"></i> Academic Project Notice:</span>
              This website is an educational semester project simulation. No monetary payments or actual shipping are executed.
            </div>
          </div>
          <div class="gv-payment-badges">
            <span class="gv-payment-badge"><i class="bi bi-cash-coin text-success me-1"></i> Cash on Delivery</span>
            <span class="gv-payment-badge"><i class="bi bi-bank text-cyan me-1"></i> 1Link / Bank Transfer</span>
            <span class="gv-payment-badge"><i class="bi bi-credit-card text-warning me-1"></i> Visa / Mastercard (Simulated)</span>
          </div>
        </div>
      </div>
    </footer>
  `;

  const newsletterForm = document.getElementById('gv-newsletter-form');
  const emailInput = document.getElementById('gv-newsletter-email');
  const feedback = document.getElementById('gv-newsletter-feedback');

  if (newsletterForm && emailInput) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (typeof showToast === 'function') showToast('Please provide a valid email address.', 'warning');
        return;
      }
      if (feedback) {
        feedback.textContent = `Thanks for joining! A simulated discount code has been sent to ${email}.`;
        feedback.style.display = 'block';
      }
      emailInput.value = '';
      if (typeof showToast === 'function') showToast('Subscribed! Use voucher code GROUP08 for Rs. 5,000 off.', 'success');
    });
  }
}
