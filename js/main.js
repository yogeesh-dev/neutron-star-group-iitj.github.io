/**
 * NEUTRON STAR 3D — Main Application Orchestrator
 * Bootstraps 3D graphics, physics simulations, audio, scroll controller,
 * KaTeX mathematical rendering, and clean keyboard shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Math Rendering Function (KaTeX display & inline with robust fallback)
  function renderAllMathematics() {
    // Render all .katex-formula containers
    const formulaElements = document.querySelectorAll('.katex-formula');
    formulaElements.forEach(el => {
      const formula = el.getAttribute('data-formula') || el.textContent.trim();
      if (!formula) return;

      if (typeof katex !== 'undefined') {
        try {
          katex.render(formula, el, {
            displayMode: true,
            throwOnError: false
          });
        } catch (err) {
          console.warn('KaTeX rendering notice:', err);
          el.textContent = formula;
        }
      } else {
        el.textContent = formula;
      }
    });

    // Render all inline $ ... $ across the page
    if (typeof renderMathInElement !== 'undefined') {
      try {
        renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false }
          ],
          ignoredTags: ["script", "noscript", "style", "textarea"],
          throwOnError: false
        });
      } catch (err) {
        console.warn('Auto-render notice:', err);
      }
    }
  }

  // Multi-pass KaTeX execution to guarantee all formulas render cleanly
  renderAllMathematics();
  setTimeout(renderAllMathematics, 300);
  setTimeout(renderAllMathematics, 1000);

  // 2. Initialize 3D Star Engine (with Nebular Gas background & 35% screen scale)
  const star3d = new Star3D('webgl-container');
  window.star3d = star3d;

  // 3. Initialize Audio Engine
  const audioEngine = new AudioEngine();
  window.audioEngine = audioEngine;

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isAudible = audioEngine.toggleMute();
      audioToggleBtn.classList.toggle('active', isAudible);
      audioToggleBtn.innerHTML = isAudible 
        ? '<i class="fa-solid fa-volume-high"></i>' 
        : '<i class="fa-solid fa-volume-xmark"></i>';
    });
  }

  // 4. Initialize Scrollytelling Controller
  const scrollyController = new ScrollytellingController(star3d);
  window.scrollyController = scrollyController;

  // 5. Initialize Superfluid Vortex Pinning & Glitch Animation
  if (typeof VortexGlitchAnimation !== 'undefined') {
    const vortexAnimation = new VortexGlitchAnimation('vortex-canvas');
    window.vortexAnimation = vortexAnimation;
  }

  // 6. Initialize Realtime Thermal Cooling Simulator (1 to 10^6 years)
  if (typeof CoolingSimulator !== 'undefined') {
    const coolingSimulator = new CoolingSimulator();
    window.coolingSimulator = coolingSimulator;
  }

  // 7. Fullscreen Toggle
  const fullscreenBtn = document.getElementById('fullscreen-toggle-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.warn(err));
        fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
      } else {
        document.exitFullscreen().catch(err => console.warn(err));
        fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
      }
    });
  }

  // 8. Clean Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
      case ' ': // Space: Toggle rotation
        e.preventDefault();
        const spinBtn = document.getElementById('dock-spin-btn');
        if (spinBtn) spinBtn.click();
        break;

      case 'm': // M: Toggle Audio
        if (audioToggleBtn) audioToggleBtn.click();
        break;

      case 'c': // C: Toggle cutaway
        const cutSlider = document.getElementById('dock-cutaway-slider');
        if (cutSlider) {
          const newDeg = star3d.cutawayAngle > 0.1 ? 0 : 90;
          cutSlider.value = newDeg;
          star3d.setCutawayAngle((newDeg / 180) * Math.PI);
        }
        break;

      case 'b': // B: Toggle magnetic field loops
        const bFieldBtn = document.getElementById('dock-bfield-btn');
        if (bFieldBtn) bFieldBtn.click();
        break;

      case 'g': // G: Trigger Glitch
        const glitchBtn = document.getElementById('vortex-unpin-btn');
        if (glitchBtn) glitchBtn.click();
        break;
    }
  });

  console.log('🚀 Neutron star 3D initialized successfully.');
});
