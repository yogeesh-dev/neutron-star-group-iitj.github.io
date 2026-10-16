/**
 * NEUTRON STAR 3D — Scrollytelling Controller
 * Coordinates section scrolling with 3D camera angles, cutaways,
 * navigation active states, and telemetry updates.
 */

class ScrollytellingController {
  constructor(star3d) {
    this.star3d = star3d;
    this.sections = document.querySelectorAll('.content-section');
    this.currentSectionKey = 'overview';

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupNavigation();
    this.setupDockControls();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: [0.1, 0.4]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionKey = entry.target.getAttribute('data-section');
          if (sectionKey && sectionKey !== this.currentSectionKey) {
            this.currentSectionKey = sectionKey;
            this.onSectionEnter(sectionKey);
          }
        }
      });
    }, options);

    this.sections.forEach(sec => observer.observe(sec));
  }

  onSectionEnter(sectionKey) {
    if (this.star3d) {
      this.star3d.focusSection(sectionKey);

      // Synchronize cutaway slider in dock
      const cutawaySlider = document.getElementById('dock-cutaway-slider');
      if (cutawaySlider) {
        cutawaySlider.value = (this.star3d.targetCutawayAngle / Math.PI) * 180;
      }
    }

    // Update top nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${sectionKey}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update telemetry mini HUD
    const miniLayer = document.getElementById('mini-layer-name');
    if (miniLayer) {
      const names = {
        'overview': 'Overview (Full Remnant)',
        'formation': 'Supernova Collapse',
        'structure': '5-Layer Cutaway Active',
        'vortex': 'Vortex Pinning & Nuclear Pasta',
        'cooling': 'Cooling Regimes',
        'dark-heating': 'Dark Kinetic Heating',
        'research': 'Research Softwares',
        'group': 'Dense Matter Research Group',
        'outreach': 'Outreach & EOS Portals',
        'lab': 'Physics Laboratory'
      };
      miniLayer.textContent = names[sectionKey] || 'Neutron Star 3D';
    }
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSec = document.getElementById(targetId);
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  setupDockControls() {
    // Cutaway Slider
    const cutawaySlider = document.getElementById('dock-cutaway-slider');
    if (cutawaySlider) {
      cutawaySlider.addEventListener('input', (e) => {
        const degrees = parseFloat(e.target.value);
        const radians = (degrees / 180) * Math.PI;
        if (this.star3d) this.star3d.setCutawayAngle(radians);
      });
    }

    // B-Field toggle
    const bFieldBtn = document.getElementById('dock-bfield-btn');
    if (bFieldBtn) {
      bFieldBtn.addEventListener('click', () => {
        if (this.star3d) {
          const vis = this.star3d.toggleMagneticField();
          bFieldBtn.classList.toggle('active', vis);
        }
      });
    }

    // Spin toggle
    const spinBtn = document.getElementById('dock-spin-btn');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        if (this.star3d) {
          const isSpinning = this.star3d.toggleRotation();
          spinBtn.classList.toggle('active', isSpinning);
          spinBtn.innerHTML = isSpinning 
            ? '<i class="fa-solid fa-pause"></i> Pause' 
            : '<i class="fa-solid fa-play"></i> Spin';
        }
      });
    }

    // Reset Camera
    const resetBtn = document.getElementById('dock-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.star3d) {
          this.star3d.focusSection(this.currentSectionKey);
        }
      });
    }
  }
}

window.ScrollytellingController = ScrollytellingController;
