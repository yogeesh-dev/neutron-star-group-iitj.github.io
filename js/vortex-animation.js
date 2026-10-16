/**
 * NEUTRON STAR 3D — Superfluid Vortex Pinning & Glitch Animation
 * Models the microscopic physics of quantized neutron vortices pinned to
 * inner crust nuclei / nuclear pasta structures, Magnus force buildup,
 * and catastrophic avalanche unpinning transferring angular momentum to the crust.
 *
 * Directly mirrors the physics shown in the user's uploaded images:
 * - media_1790921783421.png (Glitch spin-down & jump curve)
 * - media_1790921793251.jpg (Vortex pinning in lattice & pasta)
 */

class VortexGlitchAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.clientWidth || 600;
    this.height = this.canvas.clientHeight || 340;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Simulation Physics State
    this.state = 'pinned'; // 'pinned', 'lagging', 'unpinning', 'relaxed'
    this.lag = 0.0;        // delta Omega (lag between superfluid and crust)
    this.maxLag = 2.4;     // critical lag threshold
    this.pinningStrength = 1.6; // F_pin
    this.time = 0;

    // Crust Spin Frequency
    this.baseOmega = 30.0; // Hz
    this.currentOmega = 30.0;
    this.glitchJump = 0.0;

    // Frequency History Plot (from image media_1790921783421.png)
    this.freqHistory = [];
    for (let i = 0; i < 90; i++) {
      this.freqHistory.push(this.baseOmega - (90 - i) * 0.004);
    }

    // Lattice Nuclei & Nuclear Pasta Structures
    this.nuclei = [];
    this.pastaRods = [];
    this.setupMicrostructure();

    // Quantized Vortex Lines
    this.vortices = [];
    this.setupVortices();

    // Event hooks
    this.initControls();

    // Resize
    window.addEventListener('resize', () => this.onResize());

    // Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupMicrostructure() {
    this.nuclei = [];
    this.pastaRods = [];

    const cols = 8;
    const rows = 5;
    const startX = 60;
    const endX = this.width - 60;
    const startY = 40;
    const endY = this.height - 110;

    const stepX = (endX - startX) / (cols - 1);
    const stepY = (endY - startY) / (rows - 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * stepX + (Math.random() - 0.5) * 6;
        const y = startY + r * stepY + (Math.random() - 0.5) * 6;
        this.nuclei.push({ x, y, r: 8, pinned: false });
      }
    }

    // Pasta Rods (Spaghetti / Lasagna sheets in background)
    for (let i = 0; i < 6; i++) {
      const x = 70 + i * 80;
      this.pastaRods.push({
        x: x,
        y1: 30,
        y2: this.height - 100,
        w: 12
      });
    }
  }

  setupVortices() {
    this.vortices = [];
    const count = 5;
    const spacing = (this.width - 160) / (count - 1);

    for (let i = 0; i < count; i++) {
      const baseX = 80 + i * spacing;
      this.vortices.push({
        baseX: baseX,
        x: baseX,
        pinnedTo: this.nuclei[i * 7 % this.nuclei.length],
        tension: 0.0,
        velocity: 0.0,
        unpinned: false,
        circRadius: 18 + (i % 2) * 6
      });
    }
  }

  initControls() {
    const lagBtn = document.getElementById('vortex-lag-btn');
    const glitchBtn = document.getElementById('vortex-unpin-btn');
    const pinSlider = document.getElementById('vortex-pin-slider');
    const pinVal = document.getElementById('vortex-pin-val');

    if (lagBtn) {
      lagBtn.addEventListener('click', () => {
        this.state = 'lagging';
        this.lag = Math.min(this.maxLag, this.lag + 0.6);
        this.updateStatusText();
      });
    }

    if (glitchBtn) {
      glitchBtn.addEventListener('click', () => {
        this.triggerUnpinningGlitch();
      });
    }

    if (pinSlider && pinVal) {
      pinSlider.addEventListener('input', (e) => {
        this.pinningStrength = parseFloat(e.target.value);
        pinVal.textContent = `${this.pinningStrength.toFixed(1)} × 10¹⁵ dyn/cm`;
      });
    }
  }

  triggerUnpinningGlitch() {
    this.state = 'unpinning';
    this.glitchJump = 0.85 * (this.lag / 2.0);

    // Sudden spin-up of the crust!
    this.currentOmega += this.glitchJump;

    // Unpin vortices
    this.vortices.forEach(v => {
      v.unpinned = true;
      v.velocity = 6.0 + Math.random() * 4.0; // Outward surge
    });

    this.updateStatusText();

    // Trigger audio glitch sound if active
    if (window.audioEngine) {
      window.audioEngine.playGlitchSound();
    }
  }

  updateStatusText() {
    const statusBadge = document.getElementById('vortex-status-badge');
    const lagReadout = document.getElementById('vortex-lag-readout');
    const jumpReadout = document.getElementById('vortex-jump-readout');

    if (lagReadout) lagReadout.textContent = `${this.lag.toFixed(2)} rad/s`;

    if (statusBadge) {
      if (this.state === 'pinned') {
        statusBadge.textContent = 'STATUS: Pinned Equilibrium';
        statusBadge.style.color = '#10b981';
      } else if (this.state === 'lagging') {
        statusBadge.textContent = 'STATUS: Differential Lag Straining Lattice';
        statusBadge.style.color = '#f59e0b';
      } else if (this.state === 'unpinning') {
        statusBadge.textContent = 'STATUS: AVALANCHE UNPINNING (Glitch in Progress!)';
        statusBadge.style.color = '#ef4444';
      }
    }

    if (jumpReadout && this.glitchJump > 0) {
      const relJump = (this.glitchJump / this.baseOmega) * 1e6;
      jumpReadout.textContent = `ΔΩ/Ω = +${relJump.toFixed(2)} × 10⁻⁶`;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.time += 0.03;

    // Handle Physics State Transitions
    if (this.state === 'unpinning') {
      let allSettled = true;
      this.vortices.forEach(v => {
        if (v.unpinned) {
          v.x += v.velocity;
          v.velocity *= 0.94; // damping
          if (v.velocity < 0.15) {
            v.unpinned = false;
            v.x = v.baseX; // reset to pinned site
          } else {
            allSettled = false;
          }
        }
      });

      // Gradually dissipate lag as angular momentum transfers
      this.lag = Math.max(0, this.lag - 0.05);

      if (allSettled && this.lag <= 0.05) {
        this.state = 'pinned';
        this.updateStatusText();
      }
    } else if (this.state === 'lagging') {
      // Vortex lines bend under Magnus force F_M = rho_s * kappa x (v_L - v_s)
      this.vortices.forEach((v, idx) => {
        v.tension = Math.sin(this.time * 2 + idx) * (this.lag * 6);
      });

      // Auto-trigger glitch if lag exceeds critical threshold
      if (this.lag >= this.maxLag) {
        this.triggerUnpinningGlitch();
      }
    }

    // Stellar Spin-Down Drift + Post-Glitch Relaxation
    if (this.currentOmega > this.baseOmega) {
      // Exponential post-glitch recovery (Q * delta Omega)
      this.currentOmega -= (this.currentOmega - this.baseOmega) * 0.03;
    } else {
      // Steady secular pulsar spin-down dot{Omega} < 0
      this.currentOmega -= 0.0008;
      this.baseOmega -= 0.0008;
    }

    this.freqHistory.shift();
    this.freqHistory.push(this.currentOmega);

    // Draw the entire simulation frame
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Inner Crust Nuclear Pasta Background Slabs
    ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
    this.pastaRods.forEach(rod => {
      ctx.fillRect(rod.x - rod.w / 2, rod.y1, rod.w, rod.y2 - rod.y1);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeRect(rod.x - rod.w / 2, rod.y1, rod.w, rod.y2 - rod.y1);
    });

    // 2. Draw Crystal Lattice Nuclei
    this.nuclei.forEach(nuc => {
      ctx.beginPath();
      ctx.arc(nuc.x, nuc.y, nuc.r, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Nucleus label
      ctx.fillStyle = '#bae6fd';
      ctx.font = '7px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('Nuc', nuc.x, nuc.y + 2.5);
    });

    // 3. Draw Quantized Superfluid Vortex Lines
    this.vortices.forEach((v, idx) => {
      const topY = 25;
      const botY = h - 95;
      const midY = (topY + botY) / 2;
      const bend = (this.state === 'lagging' ? this.lag * 16 : 0) + (v.tension || 0);

      // Vortex core line
      ctx.beginPath();
      ctx.moveTo(v.x, topY);
      ctx.quadraticCurveTo(v.x + bend, midY, v.x, botY);
      ctx.strokeStyle = v.unpinned ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = v.unpinned ? 3.5 : 2.5;
      ctx.shadowColor = v.unpinned ? '#ef4444' : '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Circulation swirl rings around vortex core (quantized circulation kappa = h/2mn)
      const swirlCount = 3;
      for (let s = 1; s <= swirlCount; s++) {
        const sy = topY + s * ((botY - topY) / (swirlCount + 1));
        const cx = v.x + bend * 0.5;
        const cy = sy;
        const swR = v.circRadius * (0.4 + s * 0.2);

        ctx.beginPath();
        ctx.ellipse(cx, cy, swR, swR * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = v.unpinned ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Circulation direction arrow
        const arrowAngle = this.time * 4 + s;
        const ax = cx + Math.cos(arrowAngle) * swR;
        const ay = cy + Math.sin(arrowAngle) * (swR * 0.35);
        ctx.fillStyle = v.unpinned ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(ax, ay, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pinning anchor lines to closest nuclei
      if (!v.unpinned && v.pinnedTo) {
        ctx.beginPath();
        ctx.moveTo(v.x, v.pinnedTo.y);
        ctx.lineTo(v.pinnedTo.x, v.pinnedTo.y);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '8px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('PINNED', v.x, v.pinnedTo.y - 6);
      }
    });

    // 4. Draw Angular Momentum Transfer Outward Arrow if Unpinning
    if (this.state === 'unpinning') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.font = 'bold 12px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ CATASTROPHIC UNPINNING: ΔJ → CRUST SPIN-UP (+ΔΩ)', w / 2, 20);

      // Outward flux arrow
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 120, h - 105);
      ctx.lineTo(w / 2 + 120, h - 105);
      ctx.stroke();
    }

    // 5. Draw Lower Sub-Panel: Synchronized Spin-Down & Glitch Oscilloscope
    // Directly reproduces image media_1790921783421.png
    this.drawGlitchGraph(ctx, w, h);
  }

  drawGlitchGraph(ctx, w, h) {
    const graphY = h - 85;
    const graphH = 75;

    // Sub-panel box
    ctx.fillStyle = 'rgba(1, 3, 8, 0.9)';
    ctx.fillRect(10, graphY, w - 20, graphH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(10, graphY, w - 20, graphH);

    // Title & Axis
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Space Grotesk';
    ctx.textAlign = 'left';
    ctx.fillText('Rotational Frequency Ω(t) • Steady Spin-Down & Glitch Jump (Image 2)', 20, graphY + 14);

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(35, graphY + 18);
    ctx.lineTo(35, graphY + graphH - 10);
    ctx.lineTo(w - 25, graphY + graphH - 10);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9px JetBrains Mono';
    ctx.fillText('Ω', 22, graphY + 28);
    ctx.fillText('t', w - 20, graphY + graphH - 6);

    // Plot Frequency Curve
    const minVal = this.baseOmega - 0.3;
    const maxVal = this.baseOmega + 1.2;

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    const startPlotX = 40;
    const plotW = w - 70;

    for (let i = 0; i < this.freqHistory.length; i++) {
      const px = startPlotX + (i / (this.freqHistory.length - 1)) * plotW;
      const norm = (this.freqHistory[i] - minVal) / (maxVal - minVal);
      const py = (graphY + graphH - 12) - norm * (graphH - 30);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  onResize() {
    if (!this.canvas) return;
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.setupMicrostructure();
    this.setupVortices();
  }
}

window.VortexGlitchAnimation = VortexGlitchAnimation;
