# 🌟 Neutron star 3D — Dense-Matter Astrophysics & Structure

An interactive, scientific-grade 3D visualization and research hub for neutron star physics, built with **Three.js**, **WebGL**, **Web Audio API**, and **Chart.js**.

---

## 🚀 Quick Start

To launch and explore the website locally, run Python's built-in HTTP server in this directory:

```bash
cd /home/yogeesh/Downloads/antigravity
python3 -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000/
```

---

## 🔭 Key Features & Architecture

### 1. Visual 3D Engine (`js/star3d.js`)
- **Proportional Celestial Scale**: The rotating neutron star is calibrated so its diameter fills **~35% of the screen height**, providing a focused, elegant celestial presence.
- **Nebular Gas Cosmic Background**: Multi-layered soft glowing interstellar dust clouds in warm orange, deep supernova red, cosmic cyan, and violet.
- **In-Place Concentric Cutaway (Picture 2 MUSES Model)**:
  1. **Atmosphere**: $R_W = 10^{-4}\text{ km}$; $n_B < 10^{-7} n_{\text{sat}}$ (mostly H, He, C thin optical plasma).
  2. **Outer Crust**: $R_W = 0.1\text{ km}$; $n_B < 10^{-3} n_{\text{sat}}$ (Coulomb BCC lattice of neutron-rich nuclei, degenerate $e^-$, neutron drip at $4.3 \times 10^{11}\text{ g/cm}^3$).
  3. **Inner Crust**: $R_W = 0.5\text{ km}$; $n_B < 0.5 n_{\text{sat}}$ (free neutron superfluid + *Nuclear Pasta* topologies: *Gnocchi, Spaghetti, Lasagna, Penne, Swiss Cheese*).
  4. **Outer Core**: $R_W \sim 7\text{ km}$; $n_B < 2 n_{\text{sat}}$ (uniform nucleonic Fermi liquid $n+p+e^-+\mu^-$, $^3P_2$ triplet neutron superfluid, $^1S_0$ singlet proton superconductor, quantized vortex lattice).
  5. **Inner Core**: $R_W \sim 5\text{ km}$; $n_B < 10 n_{\text{sat}}$ (hyperons, $\Delta$-isobars, deconfined $u, d, s$ quark matter in Color-Flavor Locked state).
- **Magnetic Dipole Loops**: Luminous blue magnetic envelope loops wrapping around the star in a vast torus (Picture 1).
- **Clean Aesthetic**: Exploded view and relativistic jets removed for a clean, scientifically authentic appearance.

### 2. Dedicated Information Pages

#### 🌌 Page 1: Formation of a Neutron Star
- Complete evolutionary sequence: Massive Star life cycle ($8 - 25 M_\odot$), iron catastrophe, Chandrasekhar collapse, photodisintegration, and core-bounce supernova.
- Embedded stellar life cycle diagram (`stellar_lifecycle.jpg`).
- Black hole fate comparison with gravitational lensing and accretion disk anatomy (`black_hole_anatomy.png`, `black_hole_lensing.png`).

#### 🔬 Page 2: Structure of the Star (All-in-One Page)
- Complete radial breakdown of all 5 layers with exact $R_W$ and $n_B$ values matching the MUSES diagram (`neutron_star_structure.png`).
- Tolman-Oppenheimer-Volkoff (TOV) relativistic hydrostatic equilibrium equation.

#### 🌪️ Page 3: Superfluid Vortex Pinning, Nuclear Pasta & Glitches
- Interactive 2D vortex lattice and avalanche unpinning simulation (`vortex-animation.js`).
- **Nuclear Pasta Topological Suite**: Interactive explorer for the 5 inner crust phases (*Gnocchi*, *Spaghetti*, *Lasagna*, *Penne*, *Swiss Cheese*) and their role in vortex pinning forces ($F_{\text{pin}} \sim 10^{15}\text{ dyn/cm}$).
- Dual glitch diagrams: Macroscopic spin-down curve $\Omega(t)$ (`glitch.png`) and 3-Component Core/Superfluid/Crust dynamic model (`glitch_three_component.jpg`).

#### ❄️ Page 4: Neutron Star Cooling & Cooling Curves
- Thermal evolution from $T \sim 10^{11}\text{ K}$ to surface photon emission.
- Microscopic mechanisms: **Modified Urca**, **Direct Urca** (triangle condition $p_{F,n} \le p_{F,p} + p_{F,e}$ requiring $x_p \ge 11.1\% - 14.8\%$), and **Pair-Breaking & Formation (PBF)** near $T_c$.
- Interactive Chart.js log-log cooling curve comparing standard vs. rapid cooling with observational Chandra/XMM data (Cas A, Crab, Vela, Geminga, PSR J0437).

#### 🔥 Page 5: Dark Kinetic Heating of Neutron Stars
- Relativistic gravitational infall and scattering of dark matter particles in the ultra-dense stellar core setting an asymptotic surface temperature floor ($T_{\text{floor}} \approx 1500 - 2500\text{ K}$).
- Probing dark matter cross-sections with JWST and next-generation 30-meter telescopes.

#### 💻 Page 6: Research Softwares & Data Websites
- Curated directory of premier neutron star codes and archives:
  - **CompOSE**: Online nuclear equation of state database (`compose.obspm.fr`).
  - **LORENE**: C++ spectral numerical relativity library (`lorene.obspm.fr`).
  - **NSCool**: Dany Page's relativistic thermal evolution code (`astroscu.unam.mx/neutrons/NSCool`).
  - **RNS**: Rapidly rotating relativistic neutron star code (`gravity.phys.uwm.edu/rns`).
  - **TEMPO2 & PINT**: High-precision nanosecond pulsar timing analysis.
  - **ATNF Pulsar Catalogue**: Database of over 3,300 known pulsars (`atnf.csiro.au/research/pulsar/psrcat`).
  - **NASA NICER / HEASARC**: X-ray pulse-profile modeling data archive (`heasarc.gsfc.nasa.gov/docs/nicer`).
  - **GWOSC**: Gravitational Wave Open Science Center (LIGO/Virgo/KAGRA data).

#### 👥 Page 7: Our Research Group (IIT Jodhpur)
- **Astrophysics & Dense Matter Theory Group** led by **Dr. Monika Sinha** (Department of Physics, IIT Jodhpur).
- **Research Pillars**: Dense matter equations of state, hyperons, $\Delta$-isobars, dibaryons ($d^*(2380)$), strange quark matter, pulsar glitches & vortex pinning, relativistic cooling, and multi-messenger gravitational-wave astrophysics.
- **Group Citation Statistics**: Refereed count of **1,200+** citations (Scopus / Web of Science) and **~2,470+** cumulative citations on Google Scholar across 45+ peer-reviewed articles (h-index 12+, i10-index 12+).
- **Interactive Group Directory**: Small photo frame with client-side upload/reset and persistent local storage caching for:
  - **Dr. Monika Sinha** (Associate Professor, Group Lead)
  - **Dr. Vivek Baruah Thapa** (Postdoctoral Researcher)
  - **Dr. Anil Kumar** (Former PhD Scholar; now Postdoctoral Researcher at University of Wrocław, Poland; Strange Quark Matter)
  - **Dr. Vishal Parmar** (Former PhD Scholar; now Postdoctoral Researcher at INFN Pisa, Italy)
  - **Yogeesh N.** (Research Scholar, Dept of Physics, IIT Jodhpur)
  - **Athira S.** (Research Scholar, Dept of Physics, IIT Jodhpur)
  - **Samyak Jain** (Research Scholar, Dept of Physics, IIT Jodhpur; Dibaryons in Neutron Stars)
  - **Alumni**: Pratik Thakur (MSc Thesis on Dark Matter; now PhD Scholar, Virginia) and Manoj Kumar Ghosh (MSc Thesis on Ambipolar Diffusion; now PhD Scholar, Virginia).
- **Filterable Publications Directory**: Papers formatted with the journal name directly below the title, individual citation counts displayed on each card, and instant BibTeX copying.

#### 🌐 Page 8: Outreach & Conferences
- **Essential Equation of State (EOS) Tools & Portals**: CompOSE, MUSES, O2scl, LORENE, NSCool, RNS, GWOSC, and NICER / HEASARC.
- **Weekly Updated Conference Calendar**: Curated list of upcoming international workshops and conferences in nuclear astrophysics, dense matter, and neutron star physics with submission deadlines and registration links.

---

## 🎨 Scientific & Minimalistic Styling
- **Color Palette**: Vibrant orange (`#ff7a00`) and deep red (`#ef4444`) font colors and accents paired with cosmic cyan and midnight obsidian.
- **Typography**: Space Grotesk + Inter with native KaTeX mathematical typesetting.
- **Footnote Attribution**:
  - `designed by Yogeesh N`
  - Email: `yoguyamu@gmail.com`

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Pause / Resume Stellar Spin |
| `C` | Toggle 90° Cutaway Wedge |
| `B` | Toggle Magnetic Dipole Loops |
| `M` | Toggle Synthesized Audio (Cosmic Drone & Pulsar Clicks) |
| `G` | Trigger Pulsar Glitch Simulation |
