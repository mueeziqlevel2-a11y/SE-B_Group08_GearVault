/**
 * GEARVAULT - Hardware Gaming Benchmarks Controller
 * University Semester Project - Group 08
 * 
 * Features:
 * - CPU, GPU, and Resolution (1080p, 1440p, 4K) dynamic dropdowns
 * - Inline validation when CPU or GPU is missing (invalid highlight + warning alert)
 * - Real-time calculation and animated horizontal FPS bars for:
 *   1. Cyberpunk 2077
 *   2. Valorant
 *   3. COD Warzone
 *   4. GTA V
 * - 60 FPS and 144 FPS marker lines on horizontal bars
 * - Hardware Presets (Flagship 4K, Competitive 1440p, Budget 1080p)
 */

// Selected state
let selectedCpuId = '';
let selectedGpuId = '';
let selectedResolution = '1440p';

// The 4 Games to benchmark
const BENCHMARK_GAMES = [
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077: Phantom Liberty',
    genre: 'RPG / Ray Tracing Ultra',
    settings: 'Ray Tracing Ultra, DLSS/FSR Quality',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    maxScaleFps: 200,
    base4090: { '1080p': 168, '1440p': 135, '4k': 82 },
    cpuSensitivity: 0.25
  },
  {
    id: 'valorant',
    title: 'Valorant',
    genre: 'Tactical Esports FPS',
    settings: 'All High, MSAA 4x, Multithreading ON',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    maxScaleFps: 700,
    base4090: { '1080p': 650, '1440p': 580, '4k': 420 },
    cpuSensitivity: 0.65 // Highly CPU bound
  },
  {
    id: 'cod-warzone',
    title: 'Call of Duty: Warzone 3.0',
    genre: 'Battle Royale',
    settings: 'Competitive Ultra/High, Textures Normal',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80',
    maxScaleFps: 320,
    base4090: { '1080p': 285, '1440p': 235, '4k': 145 },
    cpuSensitivity: 0.35
  },
  {
    id: 'gta-v',
    title: 'Grand Theft Auto V',
    genre: 'Open World Action',
    settings: 'Very High / Ultra Textures, FXAA + MSAA 4x',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    maxScaleFps: 300,
    base4090: { '1080p': 245, '1440p': 210, '4k': 160 },
    cpuSensitivity: 0.30
  }
];

// GPU relative performance rating (relative to RTX 4090 = 1.0)
const GPU_RATINGS = {
  'gpu-asus-rtx-4090-rog-strix': { factor: 1.00, name: 'RTX 4090' },
  'gpu-amd-rx-7900-xtx': { factor: 0.88, name: 'RX 7900 XTX' },
  'gpu-zotac-rtx-4070-super': { factor: 0.68, name: 'RTX 4070 Super' },
  'gpu-sapphire-rx-7800-xt': { factor: 0.58, name: 'RX 7800 XT' },
  'gpu-msi-rtx-4060-ventus': { factor: 0.38, name: 'RTX 4060' }
};

// CPU relative performance factor (relative to 7800X3D = 1.0)
const CPU_RATINGS = {
  'cpu-amd-ryzen-7800x3d': { factor: 1.00, name: 'Ryzen 7 7800X3D' },
  'cpu-intel-i7-14700k': { factor: 0.94, name: 'Intel i7-14700K' },
  'cpu-intel-i5-13600k': { factor: 0.84, name: 'Intel i5-13600K' },
  'cpu-amd-ryzen-7600x': { factor: 0.82, name: 'Ryzen 5 7600X' }
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Navbar & Footer with nested relative links
  if (typeof GearVaultPages !== 'undefined' && typeof GearVaultPages.initNestedLayout === 'function') {
    GearVaultPages.initNestedLayout('benchmarks');
  } else {
    if (typeof renderGameVaultNavbar === 'function') {
      renderGameVaultNavbar('benchmarks');
    }
    if (typeof renderGameVaultFooter === 'function') {
      renderGameVaultFooter();
    }
    normalizeNestedLinks();
  }

  // 2. Populate CPU and GPU dropdowns from GAMEVAULT_PRODUCTS
  populateHardwareDropdowns();

  // 3. Pre-select default hardware for an impressive initial presentation
  selectedCpuId = 'cpu-amd-ryzen-7800x3d';
  selectedGpuId = 'gpu-zotac-rtx-4070-super';
  selectedResolution = '1440p';

  const cpuSelect = document.getElementById('bench-cpu-select');
  const gpuSelect = document.getElementById('bench-gpu-select');
  const resSelect = document.getElementById('bench-res-select');

  if (cpuSelect) cpuSelect.value = selectedCpuId;
  if (gpuSelect) gpuSelect.value = selectedGpuId;
  if (resSelect) resSelect.value = selectedResolution;

  // 4. Bind event listeners
  bindBenchmarkEvents();

  // 5. Initial calculation and render
  calculateAndRenderBenchmarks();
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
      if (href.endsWith('.html') && href !== 'index.html' && href !== 'pc-parts.html') {
        // Keep sibling link
      } else if (!href.startsWith('../')) {
        link.setAttribute('href', `../${href}`);
      }
    });
  });
}

/**
 * Populate CPU & GPU dropdowns from products.js
 */
function populateHardwareDropdowns() {
  const cpuSelect = document.getElementById('bench-cpu-select');
  const gpuSelect = document.getElementById('bench-gpu-select');

  const products = (typeof GAMEVAULT_PRODUCTS !== 'undefined') ? GAMEVAULT_PRODUCTS : [];
  const cpus = products.filter(p => p.subCategory === 'cpu');
  const gpus = products.filter(p => p.subCategory === 'gpu');

  if (cpuSelect) {
    cpuSelect.innerHTML = '<option value="">-- Choose Processor (CPU) --</option>' +
      cpus.map(c => `<option value="${c.id}">${c.name} [${c.specs?.socket || ''}]</option>`).join('');
  }

  if (gpuSelect) {
    gpuSelect.innerHTML = '<option value="">-- Choose Graphics Card (GPU) --</option>' +
      gpus.map(g => `<option value="${g.id}">${g.name} [${g.specs?.vram || ''}]</option>`).join('');
  }
}

/**
 * Bind dropdown and button event handlers
 */
function bindBenchmarkEvents() {
  const cpuSelect = document.getElementById('bench-cpu-select');
  const gpuSelect = document.getElementById('bench-gpu-select');
  const resSelect = document.getElementById('bench-res-select');

  if (cpuSelect) {
    cpuSelect.addEventListener('change', (e) => {
      selectedCpuId = e.target.value;
      validateAndRecalculate();
    });
  }

  if (gpuSelect) {
    gpuSelect.addEventListener('change', (e) => {
      selectedGpuId = e.target.value;
      validateAndRecalculate();
    });
  }

  if (resSelect) {
    resSelect.addEventListener('change', (e) => {
      selectedResolution = e.target.value;
      syncResolutionPills();
      validateAndRecalculate();
    });
  }

  // Quick resolution pills
  document.querySelectorAll('[data-res-pill]').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedResolution = pill.dataset.resPill;
      if (resSelect) resSelect.value = selectedResolution;
      syncResolutionPills();
      validateAndRecalculate();
    });
  });

  // Presets
  document.querySelectorAll('[data-bench-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.benchPreset;
      applyBenchmarkPreset(presetKey);
    });
  });

  // Swap / Randomize button
  const resetBtn = document.getElementById('bench-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      selectedCpuId = '';
      selectedGpuId = '';
      if (cpuSelect) cpuSelect.value = '';
      if (gpuSelect) gpuSelect.value = '';
      validateAndRecalculate();
    });
  }
}

/**
 * Synchronize active class on resolution pills
 */
function syncResolutionPills() {
  document.querySelectorAll('[data-res-pill]').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.resPill === selectedResolution);
  });
}

/**
 * Apply quick benchmark presets
 */
function applyBenchmarkPreset(presetKey) {
  const cpuSelect = document.getElementById('bench-cpu-select');
  const gpuSelect = document.getElementById('bench-gpu-select');
  const resSelect = document.getElementById('bench-res-select');

  if (presetKey === 'flagship_4k') {
    selectedCpuId = 'cpu-amd-ryzen-7800x3d';
    selectedGpuId = 'gpu-asus-rtx-4090-rog-strix';
    selectedResolution = '4k';
  } else if (presetKey === 'sweetspot_1440p') {
    selectedCpuId = 'cpu-amd-ryzen-7800x3d';
    selectedGpuId = 'gpu-zotac-rtx-4070-super';
    selectedResolution = '1440p';
  } else if (presetKey === 'budget_1080p') {
    selectedCpuId = 'cpu-amd-ryzen-7600x';
    selectedGpuId = 'gpu-msi-rtx-4060-ventus';
    selectedResolution = '1080p';
  }

  if (cpuSelect) cpuSelect.value = selectedCpuId;
  if (gpuSelect) gpuSelect.value = selectedGpuId;
  if (resSelect) resSelect.value = selectedResolution;
  syncResolutionPills();

  validateAndRecalculate();

  if (typeof showToast === 'function') {
    showToast(`Loaded benchmark preset: ${presetKey.replace('_', ' ').toUpperCase()}`, 'cyan', 2500);
  }
}

/**
 * Validate hardware inputs and trigger calculation
 */
function validateAndRecalculate() {
  const cpuSelect = document.getElementById('bench-cpu-select');
  const gpuSelect = document.getElementById('bench-gpu-select');
  const cpuFeedback = document.getElementById('cpu-inline-feedback');
  const gpuFeedback = document.getElementById('gpu-inline-feedback');
  const validationAlert = document.getElementById('bench-validation-alert');
  const resultsContainer = document.getElementById('gv-benchmarks-results');

  const cpuMissing = !selectedCpuId;
  const gpuMissing = !selectedGpuId;

  // Inline styling on select elements
  if (cpuSelect) {
    cpuSelect.classList.toggle('is-invalid', cpuMissing);
  }
  if (cpuFeedback) {
    cpuFeedback.style.display = cpuMissing ? 'block' : 'none';
  }

  if (gpuSelect) {
    gpuSelect.classList.toggle('is-invalid', gpuMissing);
  }
  if (gpuFeedback) {
    gpuFeedback.style.display = gpuMissing ? 'block' : 'none';
  }

  // Inline Validation Alert Banner
  if (cpuMissing || gpuMissing) {
    if (validationAlert) {
      let missingMsg = '';
      if (cpuMissing && gpuMissing) {
        missingMsg = 'Please select both a Processor (CPU) and a Graphics Card (GPU) to simulate game frame rates.';
      } else if (cpuMissing) {
        missingMsg = 'Please select a Processor (CPU) to calculate accurate CPU scaling and bottlenecks.';
      } else {
        missingMsg = 'Please select a Graphics Card (GPU) to calculate rasterization and ray-tracing performance.';
      }

      validationAlert.innerHTML = `
        <div class="gv-bench-val-banner d-flex align-items-center gap-3 p-3 rounded">
          <i class="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
          <div>
            <strong class="text-danger d-block mb-1">Hardware Selection Incomplete</strong>
            <span class="text-secondary small">${missingMsg}</span>
          </div>
        </div>
      `;
      validationAlert.style.display = 'block';
    }

    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="col-12">
          <div class="gv-bench-awaiting-state text-center py-5">
            <i class="bi bi-speedometer2 text-muted mb-3 d-block" style="font-size: 3.5rem;"></i>
            <h4 class="text-white mb-2" style="font-family: var(--gv-font-heading);">Awaiting Hardware Selection</h4>
            <p class="text-secondary small mx-auto" style="max-width: 480px;">
              Select a Processor and Graphics Card above to see live frame rates across Cyberpunk 2077, Valorant, COD Warzone, and GTA V.
            </p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Both CPU & GPU are valid! Hide validation alerts and compute
  if (validationAlert) {
    validationAlert.style.display = 'none';
  }

  calculateAndRenderBenchmarks();
}

/**
 * Calculate FPS for the 4 titles and render animated horizontal bars
 */
function calculateAndRenderBenchmarks() {
  const resultsContainer = document.getElementById('gv-benchmarks-results');
  if (!resultsContainer) return;

  const cpuData = (typeof getProductById === 'function') ? getProductById(selectedCpuId) : null;
  const gpuData = (typeof getProductById === 'function') ? getProductById(selectedGpuId) : null;

  const gpuRating = GPU_RATINGS[selectedGpuId] || { factor: 0.60, name: 'GPU' };
  const cpuRating = CPU_RATINGS[selectedCpuId] || { factor: 0.85, name: 'CPU' };

  // Update hardware badges in header summary
  const summaryCpuEl = document.getElementById('bench-summary-cpu');
  const summaryGpuEl = document.getElementById('bench-summary-gpu');
  const summaryResEl = document.getElementById('bench-summary-res');

  if (summaryCpuEl) summaryCpuEl.textContent = cpuData ? cpuData.name : cpuRating.name;
  if (summaryGpuEl) summaryGpuEl.textContent = gpuData ? gpuData.name : gpuRating.name;
  if (summaryResEl) summaryResEl.textContent = selectedResolution.toUpperCase();

  // Render the 4 game benchmark cards
  resultsContainer.innerHTML = BENCHMARK_GAMES.map(game => {
    // 1. Calculate realistic estimated FPS
    const base4090Fps = game.base4090[selectedResolution] || 100;
    
    // Scale by GPU power factor and CPU sensitivity factor
    const gpuFactor = gpuRating.factor;
    const cpuFactor = 1.0 - (game.cpuSensitivity * (1.0 - cpuRating.factor));
    
    let calculatedFps = Math.round(base4090Fps * gpuFactor * cpuFactor);
    calculatedFps = Math.max(18, calculatedFps); // minimum playable floor

    // 1% Low FPS simulation (~72-82% of average FPS)
    const low1PctFps = Math.max(12, Math.round(calculatedFps * (0.75 + (cpuRating.factor * 0.05))));

    // Bar percentage relative to max scale for this game
    const barPercentage = Math.min(100, Math.max(4, Math.round((calculatedFps / game.maxScaleFps) * 100)));
    const marker60Pct = Math.round((60 / game.maxScaleFps) * 100);
    const marker144Pct = Math.round((144 / game.maxScaleFps) * 100);

    // Performance tier badge & styling
    let tierBadge = '';
    let barColor = 'linear-gradient(90deg, #00D4FF 0%, #7657FF 100%)';

    if (calculatedFps >= 240) {
      tierBadge = '<span class="badge bg-success text-dark fw-bold"><i class="bi bi-lightning-charge-fill me-1"></i> Esports 240+ FPS</span>';
      barColor = 'linear-gradient(90deg, #10b981 0%, #00d4ff 100%)';
    } else if (calculatedFps >= 144) {
      tierBadge = '<span class="badge bg-dark border border-cyan text-cyan"><i class="bi bi-check-circle-fill me-1"></i> Ultra Smooth 144+ FPS</span>';
      barColor = 'linear-gradient(90deg, #00d4ff 0%, #7657ff 100%)';
    } else if (calculatedFps >= 90) {
      tierBadge = '<span class="badge bg-dark border border-violet text-violet"><i class="bi bi-play-circle-fill me-1"></i> High Framerate (90+ FPS)</span>';
      barColor = 'linear-gradient(90deg, #7657ff 0%, #00d4ff 100%)';
    } else if (calculatedFps >= 60) {
      tierBadge = '<span class="badge bg-dark border border-warning text-warning"><i class="bi bi-patch-check me-1"></i> Smooth 60+ FPS</span>';
      barColor = 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)';
    } else {
      tierBadge = '<span class="badge bg-danger text-white"><i class="bi bi-exclamation-triangle-fill me-1"></i> Sub-60 FPS (Lower Settings)</span>';
      barColor = 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)';
    }

    return `
      <div class="col-lg-6">
        <div class="gv-card gv-benchmark-card h-100 p-4">
          
          <!-- Game Header -->
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="badge bg-dark border border-secondary text-secondary small">${game.genre}</span>
            ${tierBadge}
          </div>

          <h3 class="gv-benchmark-game-title text-white fs-5 mb-1" style="font-family: var(--gv-font-heading); font-weight: 700;">
            ${game.title}
          </h3>

          <div class="text-secondary small mb-3">
            <i class="bi bi-gear-wide-connected text-cyan me-1"></i> ${game.settings}
          </div>

          <!-- Live Numbers Row -->
          <div class="d-flex align-items-baseline justify-content-between mb-2">
            <div>
              <div class="d-flex align-items-baseline gap-2">
                <span class="gv-benchmark-fps-val fs-1 fw-bold text-cyan font-monospace">${calculatedFps}</span>
                <span class="text-cyan small fw-bold">AVG FPS</span>
              </div>
              <div class="small text-muted">1% Lows: <strong class="text-white">${low1PctFps} FPS</strong></div>
            </div>
            <div class="text-end">
              <span class="badge bg-dark border border-cyan text-cyan font-monospace px-2 py-1">
                ${selectedResolution.toUpperCase()}
              </span>
            </div>
          </div>

          <!-- Animated Horizontal FPS Bar Track -->
          <div class="gv-benchmark-track position-relative my-3" style="height: 28px; background: #090e18; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden;">
            
            <!-- 60 FPS Target Line Marker -->
            ${marker60Pct <= 100 ? `
              <div class="gv-fps-marker" style="position: absolute; left: ${marker60Pct}%; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.3); z-index: 3;" title="60 FPS Target">
                <span class="gv-marker-tag" style="position: absolute; top: -18px; left: -14px; font-size: 0.65rem; color: #9ba8b9; font-family: var(--gv-font-display);">60</span>
              </div>
            ` : ''}

            <!-- 144 FPS Target Line Marker -->
            ${marker144Pct <= 100 ? `
              <div class="gv-fps-marker" style="position: absolute; left: ${marker144Pct}%; top: 0; bottom: 0; width: 2px; background: rgba(0, 212, 255, 0.4); z-index: 3;" title="144 FPS Esports Target">
                <span class="gv-marker-tag" style="position: absolute; top: -18px; left: -14px; font-size: 0.65rem; color: var(--gv-cyan); font-family: var(--gv-font-display);">144</span>
              </div>
            ` : ''}

            <!-- Animated Horizontal Fill -->
            <div class="gv-benchmark-fill-bar h-100" 
                 data-target-width="${barPercentage}"
                 style="width: 0%; background: ${barColor}; border-radius: 8px; transition: width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);">
            </div>
          </div>

          <!-- Bottom Footer Metrics -->
          <div class="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25 small text-secondary">
            <div>
              <i class="bi bi-gpu-card text-violet me-1"></i>
              <span class="text-truncate">${gpuRating.name}</span>
            </div>
            <div>
              <i class="bi bi-cpu text-cyan me-1"></i>
              <span class="text-truncate">${cpuRating.name}</span>
            </div>
          </div>

        </div>
      </div>
    `;
  }).join('');

  // Trigger CSS horizontal bar animation via requestAnimationFrame
  requestAnimationFrame(() => {
    document.querySelectorAll('.gv-benchmark-fill-bar').forEach(bar => {
      const targetWidth = bar.dataset.targetWidth || '0';
      bar.style.width = `${targetWidth}%`;
    });
  });
}
