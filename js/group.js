/**
 * NEUTRON STAR 3D — Research Group & Nuclear Pasta Interactivity
 * Handles:
 * 1. Interactive Nuclear Pasta structure viewer on Glitches page
 * 2. Group members small photo upload & localStorage persistence
 * 3. Publication category filtering
 * 4. BibTeX citation copying with toast notification
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. NUCLEAR PASTA STRUCTURES INTERACTIVE VIEWER (Glitches Page)
  // =========================================================================
  const pastaData = {
    gnocchi: {
      name: 'Gnocchi (Spherical Droplets)',
      italian: 'Gnocchi Phase',
      density: '0.05 – 0.08 n₀ (ρ ~ 1.4 – 2.2 × 10¹⁴ g/cm³)',
      geometry: '3D Spherical nuclear clusters (Droplets)',
      dimension: 'd = 0 (isolated points)',
      pinning: 'Point-like pinning centers. Quantized vortex lines bend between individual droplet nuclei. Pinning energy per droplet E_pin ~ 1 – 2 MeV.',
      glitchRole: 'Initial vortex pinning regime. As the pulsar crust spins down, vortices are weakly anchored to droplets, allowing thermally activated creep at low lag.',
      shear: 'μ ~ 2 × 10²⁹ dyn/cm² (Coulomb crystal BCC lattice)',
      color: '#f59e0b'
    },
    spaghetti: {
      name: 'Spaghetti (Cylindrical Rods)',
      italian: 'Spaghetti Phase',
      density: '0.08 – 0.15 n₀ (ρ ~ 2.2 – 4.2 × 10¹⁴ g/cm³)',
      geometry: '1D Continuous parallel nuclear cylinders',
      dimension: 'd = 1 (linear filaments)',
      pinning: 'Line-line intersection pinning. Vortices crossing transverse rods experience extremely high barrier forces (F_pin ~ 10¹⁵ dyn/cm). Pinned over long contact lengths.',
      glitchRole: 'Primary barrier for vortex outward motion. Large superfluid angular momentum lag (δΩ) accumulates here until hydrodynamic Magnus force overwhelms pinning.',
      shear: 'μ ~ 6 × 10²⁹ dyn/cm² (High transverse rigidity)',
      color: '#ff7a00'
    },
    lasagna: {
      name: 'Lasagna (Planar Slabs)',
      italian: 'Lasagna Phase',
      density: '0.15 – 0.25 n₀ (ρ ~ 4.2 – 7.0 × 10¹⁴ g/cm³)',
      geometry: '2D Parallel nuclear plates / slabs',
      dimension: 'd = 2 (infinite sheets)',
      pinning: 'Planar surface pinning. Vortices can glide smoothly within 2D neutron-gas channels between slabs, but cannot cross perpendicular to the slabs without massive energy.',
      glitchRole: 'Creates directional channeling of unpinned vortices. During a glitch avalanche, vortices cascade preferentially along planar corridors, accelerating momentum transfer.',
      shear: 'μ ~ 1.2 × 10³⁰ dyn/cm² (Strongest shear resistance)',
      color: '#ef4444'
    },
    penne: {
      name: 'Penne / Anti-Spaghetti (Cylindrical Voids)',
      italian: 'Penne Phase (Anti-Spaghetti)',
      density: '0.25 – 0.35 n₀ (ρ ~ 7.0 – 9.8 × 10¹⁴ g/cm³)',
      geometry: 'Inverted phase: cylindrical neutron-gas tubes inside continuous nuclear matter',
      dimension: 'd = 1 (inverted hollow tubes)',
      pinning: 'Core vortex trapping. Quantized vortex cores minimize kinetic energy by threading directly down empty cylindrical gas channels.',
      glitchRole: 'Vortices trapped within tubes are shielded from lattice drag until critical Magnus pressure ruptures the tube walls, triggering sudden collective release.',
      shear: 'μ ~ 8 × 10²⁹ dyn/cm²',
      color: '#38bdf8'
    },
    cheese: {
      name: 'Swiss Cheese / Anti-Gnocchi (Spherical Bubbles)',
      italian: 'Swiss Cheese Phase (Anti-Gnocchi)',
      density: '0.35 – 0.50 n₀ (ρ ~ 0.98 – 1.4 × 10¹⁵ g/cm³)',
      geometry: 'Inverted phase: isolated spherical neutron bubbles inside uniform nuclear matter',
      dimension: 'd = 0 (inverted voids)',
      pinning: 'Cavity pinning. Superfluid vortex lines terminate or kink around spherical bubbles before transitioning into homogeneous outer core liquid.',
      glitchRole: 'Crust-core boundary interface. Couples inner crust vortex avalanches directly to the outer core proton superconductor flux tubes.',
      shear: 'μ ~ 3 × 10²⁹ dyn/cm² (Dissolving near core boundary)',
      color: '#10b981'
    }
  };

  const pastaButtons = document.querySelectorAll('.pasta-nav-item');
  const pastaNameEl = document.getElementById('pasta-detail-name');
  const pastaDensityEl = document.getElementById('pasta-detail-density');
  const pastaGeomEl = document.getElementById('pasta-detail-geom');
  const pastaDimEl = document.getElementById('pasta-detail-dim');
  const pastaPinEl = document.getElementById('pasta-detail-pin');
  const pastaGlitchEl = document.getElementById('pasta-detail-glitch');
  const pastaShearEl = document.getElementById('pasta-detail-shear');
  const pastaSvgContainer = document.getElementById('pasta-svg-display');

  function renderPastaDetail(key) {
    const data = pastaData[key];
    if (!data) return;

    if (pastaNameEl) pastaNameEl.innerHTML = `<span style="color: ${data.color};">${data.name}</span>`;
    if (pastaDensityEl) pastaDensityEl.textContent = data.density;
    if (pastaGeomEl) pastaGeomEl.textContent = data.geometry;
    if (pastaDimEl) pastaDimEl.textContent = data.dimension;
    if (pastaPinEl) pastaPinEl.textContent = data.pinning;
    if (pastaGlitchEl) pastaGlitchEl.textContent = data.glitchRole;
    if (pastaShearEl) pastaShearEl.textContent = data.shear;

    // Highlight active button
    pastaButtons.forEach(btn => {
      if (btn.getAttribute('data-pasta') === key) {
        btn.classList.add('active');
        btn.style.borderColor = data.color;
      } else {
        btn.classList.remove('active');
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    });

    // Render interactive SVG schematic
    if (pastaSvgContainer) {
      pastaSvgContainer.innerHTML = generatePastaSvg(key, data.color);
    }
  }

  function generatePastaSvg(key, color) {
    switch (key) {
      case 'gnocchi':
        // Droplets
        let droplets = '';
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 6; c++) {
            const cx = 35 + c * 48 + (r % 2) * 24;
            const cy = 35 + r * 42;
            droplets += `<circle cx="${cx}" cy="${cy}" r="14" fill="${color}" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5" filter="drop-shadow(0 0 6px ${color})"/>`;
            droplets += `<circle cx="${cx - 4}" cy="${cy - 4}" r="4" fill="#ffffff" fill-opacity="0.6"/>`;
          }
        }
        return `
          <svg viewBox="0 0 320 180" class="pasta-svg-art">
            <rect width="320" height="180" rx="8" fill="#040914" />
            <!-- Vortex lines passing through -->
            <path d="M 60,0 Q 80,90 60,180" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,4" fill="none" opacity="0.8"/>
            <path d="M 160,0 Q 140,90 170,180" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,4" fill="none" opacity="0.8"/>
            <path d="M 260,0 Q 280,90 250,180" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,4" fill="none" opacity="0.8"/>
            ${droplets}
            <text x="10" y="172" fill="#94a3b8" font-size="11" font-family="monospace">ρ ~ 0.05 n₀ | Droplets (d=0)</text>
            <text x="210" y="20" fill="#38bdf8" font-size="11" font-family="monospace">--- Vortex line</text>
          </svg>
        `;

      case 'spaghetti':
        // Rods
        let rods = '';
        for (let i = 0; i < 5; i++) {
          const x = 35 + i * 60;
          rods += `
            <rect x="${x}" y="15" width="26" height="150" rx="13" fill="${color}" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5" filter="drop-shadow(0 0 8px ${color})"/>
            <rect x="${x + 6}" y="20" width="6" height="140" rx="3" fill="#ffffff" fill-opacity="0.45"/>
          `;
        }
        return `
          <svg viewBox="0 0 320 180" class="pasta-svg-art">
            <rect width="320" height="180" rx="8" fill="#040914" />
            <!-- Vortices crossing rods -->
            <path d="M 0,50 C 100,60 200,40 320,55" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5,4" fill="none"/>
            <path d="M 0,130 C 120,120 220,140 320,125" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5,4" fill="none"/>
            ${rods}
            <text x="10" y="172" fill="#94a3b8" font-size="11" font-family="monospace">ρ ~ 0.10 n₀ | Cylindrical Rods (d=1)</text>
            <text x="200" y="22" fill="#38bdf8" font-size="11" font-family="monospace">Transverse Vortex</text>
          </svg>
        `;

      case 'lasagna':
        // Slabs
        let slabs = '';
        for (let i = 0; i < 3; i++) {
          const y = 25 + i * 48;
          slabs += `
            <rect x="20" y="${y}" width="280" height="30" rx="6" fill="${color}" fill-opacity="0.82" stroke="#ffffff" stroke-width="1.5" filter="drop-shadow(0 0 8px ${color})"/>
            <line x1="25" y1="${y + 7}" x2="295" y2="${y + 7}" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
          `;
        }
        return `
          <svg viewBox="0 0 320 180" class="pasta-svg-art">
            <rect width="320" height="180" rx="8" fill="#040914" />
            ${slabs}
            <!-- 2D gliding channel -->
            <path d="M 15,70 L 305,70" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4" fill="none"/>
            <polygon points="305,70 295,66 295,74" fill="#38bdf8" />
            <text x="70" y="65" fill="#38bdf8" font-size="10" font-family="monospace">Vortex Gliding Corridor</text>
            <text x="10" y="172" fill="#94a3b8" font-size="11" font-family="monospace">ρ ~ 0.20 n₀ | Planar Slabs (d=2)</text>
          </svg>
        `;

      case 'penne':
        // Tubes
        return `
          <svg viewBox="0 0 320 180" class="pasta-svg-art">
            <rect width="320" height="180" rx="8" fill="${color}" fill-opacity="0.45" stroke="#ffffff" stroke-width="1"/>
            <!-- Hollow cylindrical channels -->
            <rect x="35" y="20" width="35" height="140" rx="17" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <rect x="105" y="20" width="35" height="140" rx="17" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <rect x="175" y="20" width="35" height="140" rx="17" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <rect x="245" y="20" width="35" height="140" rx="17" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <!-- Vortex threading through tube center -->
            <path d="M 52,5 L 52,175" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,4"/>
            <path d="M 192,5 L 192,175" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,4"/>
            <text x="10" y="172" fill="#94a3b8" font-size="11" font-family="monospace">ρ ~ 0.30 n₀ | Hollow Tubes (Anti-Spaghetti)</text>
            <text x="140" y="15" fill="#38bdf8" font-size="10" font-family="monospace">Threaded Vortex Core</text>
          </svg>
        `;

      case 'cheese':
        // Swiss Cheese bubbles
        return `
          <svg viewBox="0 0 320 180" class="pasta-svg-art">
            <rect width="320" height="180" rx="8" fill="${color}" fill-opacity="0.5" stroke="#ffffff" stroke-width="1"/>
            <!-- Bubble voids -->
            <circle cx="50" cy="50" r="22" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <circle cx="120" cy="115" r="26" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <circle cx="200" cy="45" r="24" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <circle cx="270" cy="110" r="22" fill="#040914" stroke="${color}" stroke-width="2.5"/>
            <circle cx="150" cy="40" r="12" fill="#040914" stroke="${color}" stroke-width="2"/>
            <circle cx="65" cy="130" r="14" fill="#040914" stroke="${color}" stroke-width="2"/>
            <!-- Vortex pinned to void surface -->
            <path d="M 20,40 Q 50,50 90,80 T 120,115 T 180,140" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,4" fill="none"/>
            <text x="10" y="172" fill="#94a3b8" font-size="11" font-family="monospace">ρ ~ 0.40 n₀ | Bubble Cavities (Swiss Cheese)</text>
            <text x="170" y="165" fill="#38bdf8" font-size="10" font-family="monospace">Bubble-Pinned Vortex</text>
          </svg>
        `;
    }
  }

  // Bind clicks to pasta buttons
  pastaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pastaKey = btn.getAttribute('data-pasta');
      renderPastaDetail(pastaKey);
    });
  });

  // Initial render of default pasta
  renderPastaDetail('spaghetti');


  // =========================================================================
  // 2. GROUP MEMBERS SMALL PHOTO OPTION & LOCALSTORAGE PERSISTENCE
  // =========================================================================
  const photoInputs = document.querySelectorAll('.photo-upload-input');
  const resetButtons = document.querySelectorAll('.photo-reset-btn');

  // Load existing photos from localStorage
  document.querySelectorAll('.member-photo').forEach(photoDiv => {
    const targetId = photoDiv.id;
    if (!targetId) return;
    const savedPhoto = localStorage.getItem(`member_photo_${targetId}`);
    if (savedPhoto) {
      photoDiv.innerHTML = `<img src="${savedPhoto}" alt="Member Photo" class="custom-avatar-img">`;
      photoDiv.classList.add('has-photo');
    }
  });

  // Handle Photo File Upload
  photoInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      const targetId = input.getAttribute('data-target');
      if (!file || !targetId) return;

      const photoDiv = document.getElementById(targetId);
      if (!photoDiv) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        photoDiv.innerHTML = `<img src="${dataUrl}" alt="Member Photo" class="custom-avatar-img">`;
        photoDiv.classList.add('has-photo');

        try {
          localStorage.setItem(`member_photo_${targetId}`, dataUrl);
          showToast('Profile photo updated successfully!');
        } catch (storageErr) {
          console.warn('Storage limit reached, photo active in session:', storageErr);
          showToast('Photo updated (session active)!');
        }
      };
      reader.readAsDataURL(file);
    });
  });

  // Handle Photo Reset
  resetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      const photoDiv = document.getElementById(targetId);
      if (!photoDiv) return;

      localStorage.removeItem(`member_photo_${targetId}`);
      photoDiv.classList.remove('has-photo');

      const initials = photoDiv.getAttribute('data-initials') || 'NS';
      const iconClass = photoDiv.getAttribute('data-icon') || 'fa-user-tie';
      photoDiv.innerHTML = `
        <div class="avatar-fallback">
          <i class="fa-solid ${iconClass}"></i>
          <span class="avatar-initials">${initials}</span>
        </div>
      `;
      showToast('Photo reset to default avatar.');
    });
  });


  // =========================================================================
  // 3. PUBLICATION FILTERING BY CATEGORY
  // =========================================================================
  const filterBtns = document.querySelectorAll('.pub-filter-btn');
  const pubCards = document.querySelectorAll('.pub-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      pubCards.forEach(card => {
        if (filter === 'all') {
          card.style.display = 'block';
        } else {
          const categories = (card.getAttribute('data-category') || '').split(' ');
          if (categories.includes(filter)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });


  // =========================================================================
  // 4. BIBTEX CITATION COPYING & TOAST NOTIFICATION
  // =========================================================================
  const copyButtons = document.querySelectorAll('.copy-bibtex-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const bibtex = btn.getAttribute('data-bibtex');
      if (!bibtex) return;

      navigator.clipboard.writeText(bibtex).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.classList.add('copied');
        showToast('BibTeX citation copied to clipboard!');

        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove('copied');
        }, 2200);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
        showToast('Unable to copy to clipboard.');
      });
    });
  });

  // Toast notice helper
  function showToast(message) {
    let toast = document.getElementById('site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.className = 'site-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }
});
