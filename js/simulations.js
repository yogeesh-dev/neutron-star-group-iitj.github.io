/**
 * NEUTRON STAR 3D — Realtime Thermal Cooling Simulator (1 to 10⁶ Years)
 * Models the cooling curves from newborn stellar remnant to late-time equilibrium,
 * with realtime time-scrubbing, playback animation, and dark kinetic heating floor.
 */

class CoolingSimulator {
  constructor() {
    this.canvas = document.getElementById('cooling-chart');
    if (!this.canvas) return;

    this.chart = null;
    this.currentAge = 100; // years
    this.isPlaying = false;
    this.playTimer = null;

    this.initChart();
    this.initControls();
  }

  // Calculate surface temperature Ts as function of age (years)
  calculateTemperature(ageYears, mode = 'standard') {
    const t = Math.max(1, ageYears);

    if (mode === 'rapid') {
      // Direct Urca Active
      if (t < 50) {
        return 3.2e6 * Math.pow(t, -0.08);
      } else if (t < 5000) {
        return 2.4e6 * Math.pow(t / 50, -0.55);
      } else {
        // Approaching dark kinetic heating floor at late times
        const base = 1.8e5 * Math.pow(t / 5000, -0.45);
        return Math.max(1800, base);
      }
    } else {
      // Standard Cooling (Modified Urca + Superfluidity)
      if (t < 100) {
        // Core-crust thermal relaxation plateau
        return 3.6e6 * Math.pow(t, -0.06);
      } else if (t < 1e5) {
        // Neutrino cooling era (T_s ~ t^(-1/8))
        return 2.5e6 * Math.pow(t / 100, -0.16);
      } else {
        // Photon cooling era (T_s ~ t^(-1/2))
        const photonCooling = 6.2e5 * Math.pow(t / 1e5, -0.5);
        // Dark Kinetic Heating floor keeps it >= 1800 K!
        return Math.max(1800, photonCooling);
      }
    }
  }

  initChart() {
    if (typeof Chart === 'undefined') return;

    // Generate high-resolution points from 1 to 10^6 years
    const standardData = [];
    const rapidData = [];
    const darkHeatingFloor = [];

    const numPoints = 60;
    for (let i = 0; i <= numPoints; i++) {
      const logT = (i / numPoints) * 6; // log10(1) = 0 to log10(10^6) = 6
      const age = Math.pow(10, logT);
      standardData.push({ x: age, y: this.calculateTemperature(age, 'standard') });
      rapidData.push({ x: age, y: this.calculateTemperature(age, 'rapid') });
      darkHeatingFloor.push({ x: age, y: 1800 });
    }

    // Real Astronomical Observational Data Points
    const observedPoints = [
      { x: 330, y: 2.0e6, label: 'Cas A (330 yr)' },
      { x: 970, y: 1.8e6, label: 'Crab (970 yr)' },
      { x: 11000, y: 7.2e5, label: 'Vela (11 kyr)' },
      { x: 340000, y: 2.4e5, label: 'Geminga (340 kyr)' }
    ];

    // Current time indicator marker
    const currentTemp = this.calculateTemperature(this.currentAge, 'standard');
    const markerData = [{ x: this.currentAge, y: currentTemp }];

    this.chart = new Chart(this.canvas.getContext('2d'), {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Standard Cooling (Modified Urca)',
            data: standardData,
            borderColor: '#38bdf8',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.2
          },
          {
            label: 'Rapid Cooling (Direct Urca Active)',
            data: rapidData,
            borderColor: '#ef4444',
            borderWidth: 2.2,
            borderDash: [5, 4],
            pointRadius: 0,
            tension: 0.2
          },
          {
            label: 'Dark Kinetic Heating Floor (~1800 K)',
            data: darkHeatingFloor,
            borderColor: '#f97316',
            borderWidth: 1.8,
            borderDash: [3, 3],
            pointRadius: 0
          },
          {
            label: 'Chandra / XMM Observations',
            data: observedPoints,
            type: 'scatter',
            borderColor: '#facc15',
            backgroundColor: '#facc15',
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Current Elapsed Time',
            data: markerData,
            type: 'scatter',
            borderColor: '#ffffff',
            backgroundColor: '#ff7a00',
            pointRadius: 8,
            pointHoverRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Space Grotesk', size: 10 }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pt = ctx.raw;
                const name = pt.label ? `${pt.label}: ` : '';
                return `${name}Age = ${ctx.parsed.x.toLocaleString()} yr, Ts = ${ctx.parsed.y.toExponential(2)} K`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'logarithmic',
            min: 1,
            max: 1000000,
            title: {
              display: true,
              text: 'Stellar Age (Years from 1 to 10⁶)',
              color: '#94a3b8',
              font: { family: 'Space Grotesk' }
            },
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: '#64748b',
              callback: (val) => {
                if (val === 1) return '1 yr';
                if (val === 10) return '10 yr';
                if (val === 100) return '100 yr';
                if (val === 1000) return '10³ yr';
                if (val === 10000) return '10⁴ yr';
                if (val === 100000) return '10⁵ yr';
                if (val === 1000000) return '10⁶ yr';
                return '';
              }
            }
          },
          y: {
            type: 'logarithmic',
            min: 1000,
            max: 10000000,
            title: {
              display: true,
              text: 'Surface Temperature Ts (K)',
              color: '#94a3b8',
              font: { family: 'Space Grotesk' }
            },
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: '#64748b',
              callback: (val) => {
                if (val === 1000) return '10³ K';
                if (val === 10000) return '10⁴ K';
                if (val === 100000) return '10⁵ K';
                if (val === 1000000) return '10⁶ K';
                if (val === 10000000) return '10⁷ K';
                return '';
              }
            }
          }
        }
      }
    });
  }

  initControls() {
    const ageSlider = document.getElementById('cooling-age-slider');
    const playBtn = document.getElementById('cooling-play-btn');

    if (ageSlider) {
      ageSlider.addEventListener('input', (e) => {
        // Slider value 0 to 600 representing log10(age) from 0 to 6
        const val = parseFloat(e.target.value);
        this.currentAge = Math.pow(10, val / 100);
        this.updateTimeDisplay();
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.togglePlayback(playBtn, ageSlider);
      });
    }

    this.updateTimeDisplay();
  }

  togglePlayback(btn, slider) {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      btn.classList.add('active');

      this.playTimer = setInterval(() => {
        let currentSliderVal = parseFloat(slider.value);
        currentSliderVal += 3;
        if (currentSliderVal > 600) currentSliderVal = 0; // loop back to 1 year

        slider.value = currentSliderVal;
        this.currentAge = Math.pow(10, currentSliderVal / 100);
        this.updateTimeDisplay();
      }, 50);
    } else {
      btn.innerHTML = '<i class="fa-solid fa-play"></i> Play Evolution (1 → 10⁶ yr)';
      btn.classList.remove('active');
      if (this.playTimer) clearInterval(this.playTimer);
    }
  }

  updateTimeDisplay() {
    const ageReadout = document.getElementById('cooling-readout-age');
    const tempReadout = document.getElementById('cooling-readout-temp');
    const regimeReadout = document.getElementById('cooling-readout-regime');

    const temp = this.calculateTemperature(this.currentAge, 'standard');

    if (ageReadout) {
      if (this.currentAge < 1000) {
        ageReadout.textContent = `${Math.round(this.currentAge)} Years`;
      } else if (this.currentAge < 1e5) {
        ageReadout.textContent = `${(this.currentAge / 1000).toFixed(1)} kyr`;
      } else {
        ageReadout.textContent = `${(this.currentAge / 1e6).toFixed(2)} Myr`;
      }
    }

    if (tempReadout) {
      tempReadout.textContent = `${Math.round(temp).toLocaleString()} K`;
    }

    if (regimeReadout) {
      const age = this.currentAge;
      if (age < 100) {
        regimeReadout.textContent = 'Core-Crust Thermal Relaxation';
        regimeReadout.className = 'param-val text-cyan';
      } else if (age < 1e5) {
        regimeReadout.textContent = 'Neutrino Cooling Era (Modified Urca)';
        regimeReadout.className = 'param-val text-orange';
      } else if (age < 8e5) {
        regimeReadout.textContent = 'Surface Photon Radiation Era';
        regimeReadout.className = 'param-val text-white';
      } else {
        regimeReadout.textContent = 'Dark Matter Kinetic Heating Floor (~1800 K)';
        regimeReadout.className = 'param-val text-red';
      }
    }

    // Update marker on chart
    if (this.chart) {
      const marker = this.chart.data.datasets.find(d => d.label === 'Current Elapsed Time');
      if (marker) {
        marker.data = [{ x: this.currentAge, y: temp }];
      }
      this.chart.update('none');
    }
  }
}

window.CoolingSimulator = CoolingSimulator;
