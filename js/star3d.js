/**
 * NEUTRON STAR 3D — Core 3D Engine (Refined Edition)
 * Updates:
 * - Star size increased by 10% (R = 1.122)
 * - Nebular gas removed (clean cosmic void background)
 * - Dynamic 3D cutaway structure labels when cutaway opens
 * - Clean rotating neutron star with concentric in-place layers and magnetic loops
 */

class Star3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    // Physics & Rotation
    this.rotationSpeed = 0.005;
    this.isRotating = true;
    this.spinAxisTilt = 0.20;         // ~11.5 degrees
    this.magneticTilt = 0.45;         // ~25.8 degrees
    this.cutawayAngle = 1.57;         // Default 90-degree cutaway
    this.targetCutawayAngle = 1.57;
    this.showMagneticField = true;
    this.showLabels = true;

    // Camera settings (Distance 8.0)
    // Star size increased by 10%: outer radius = 1.122
    this.cameraPos = new THREE.Vector3(0, 0.8, 8.0);
    this.targetCameraPos = new THREE.Vector3(0, 0.8, 8.0);
    this.lookAtPos = new THREE.Vector3(0, 0, 0);
    this.targetLookAtPos = new THREE.Vector3(0, 0, 0);

    // Exact layer radii (Increased by 10% over previous 1.02)
    this.radii = {
      atmosphere: 1.122,
      outerCrust: 1.034,
      innerCrust: 0.902,
      outerCore: 0.748,
      innerCore: 0.396
    };

    this.init();
  }

  init() {
    // 1. Scene setup (Clean deep cosmic space, nebular gas removed)
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x010206, 0.015);

    // 2. Camera setup (40 deg FOV)
    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 1000);
    this.camera.position.copy(this.cameraPos);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxDistance = 20;
      this.controls.minDistance = 3.2;
      this.controls.enablePan = false;
      this.isUserInteracting = false;

      this.controls.addEventListener('start', () => {
        this.isUserInteracting = true;
      });
      this.controls.addEventListener('end', () => {
        setTimeout(() => {
          this.isUserInteracting = false;
        }, 3500);
      });
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Local Clipping Planes for Cutaway
    this.setupClippingPlanes();

    // 7. Clean Cosmic Starfield (Nebular gas removed)
    this.setupStarfield();

    // 8. Build Rotating Neutron Star (5 concentric layers + magnetic loops)
    this.buildStar();

    // 9. Cutaway 3D Annotation Labels
    this.setupCutawayLabels();

    // 10. Resize Handling
    window.addEventListener('resize', () => this.onWindowResize());

    // 11. Start Animation Loop
    this.clock = new THREE.Clock();
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x0c192c, 1.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    keyLight.position.set(10, 8, 12);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-10, -5, -8);
    this.scene.add(rimLight);

    this.corePointLight = new THREE.PointLight(0x38bdf8, 3.2, 10);
    this.corePointLight.position.set(0, 0, 0);
    this.scene.add(this.corePointLight);
  }

  setupClippingPlanes() {
    this.clipPlane1 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    this.clipPlane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    this.clippingPlanes = [this.clipPlane1, this.clipPlane2];
  }

  // Clean Cosmic Starfield (Nebular gas removed as requested)
  setupStarfield() {
    const starCount = 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const starPal = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xfed7aa),
      new THREE.Color(0xfecdd3),
      new THREE.Color(0xbae6fd)
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 35 + Math.random() * 75;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const c = starPal[Math.floor(Math.random() * starPal.length)];
      starCol[i * 3] = c.r;
      starCol[i * 3 + 1] = c.g;
      starCol[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    this.starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starPoints);
  }

  generateMottledTexture(baseHex, spotHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = Math.random() * 7 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = spotHex;
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }

  buildStar() {
    this.starRoot = new THREE.Group();
    this.starRoot.rotation.z = this.spinAxisTilt;
    this.scene.add(this.starRoot);

    this.starBody = new THREE.Group();
    this.starRoot.add(this.starBody);

    this.magneticGroup = new THREE.Group();
    this.magneticGroup.rotation.x = this.magneticTilt;
    this.starBody.add(this.magneticGroup);

    // 1. Concentric Layers (In-place cutaway, Picture 2 MUSES Model)
    this.createLayers();

    // 2. Picture 1: Ethereal Sweeping Magnetic Sheath Loops
    this.createMagneticSheath();
  }

  createLayers() {
    const clipPlanes = this.clippingPlanes;

    // Layer 1: ATMOSPHERE
    const atmoGeo = new THREE.SphereGeometry(this.radii.atmosphere, 64, 64);
    const atmoTex = this.generateMottledTexture('#0284c7', 'rgba(56, 189, 248, 0.4)');
    const atmoMat = new THREE.MeshStandardMaterial({
      map: atmoTex,
      roughness: 0.35,
      metalness: 0.4,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.45,
      clippingPlanes: clipPlanes,
      clipIntersection: true,
      side: THREE.DoubleSide
    });
    this.atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    this.starBody.add(this.atmoMesh);

    // Subtle atmospheric Fresnel halo
    const glowGeo = new THREE.SphereGeometry(this.radii.atmosphere * 1.05, 48, 48);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x38bdf8) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(glowColor, intensity * 0.7);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    this.glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.starBody.add(this.glowMesh);

    // Layer 2: OUTER CRUST
    const outCrustGeo = new THREE.SphereGeometry(this.radii.outerCrust, 54, 54);
    const outCrustTex = this.generateMottledTexture('#0f172a', 'rgba(59, 130, 246, 0.3)');
    const outCrustMat = new THREE.MeshStandardMaterial({
      map: outCrustTex,
      roughness: 0.35,
      metalness: 0.6,
      emissive: new THREE.Color(0x1e3a8a),
      emissiveIntensity: 0.35,
      clippingPlanes: clipPlanes,
      clipIntersection: true,
      side: THREE.DoubleSide
    });
    this.outerCrustMesh = new THREE.Mesh(outCrustGeo, outCrustMat);
    this.starBody.add(this.outerCrustMesh);

    // Layer 3: INNER CRUST
    const inCrustGeo = new THREE.SphereGeometry(this.radii.innerCrust, 48, 48);
    const inCrustTex = this.generateMottledTexture('#1e293b', 'rgba(14, 165, 233, 0.35)');
    const inCrustMat = new THREE.MeshStandardMaterial({
      map: inCrustTex,
      roughness: 0.3,
      metalness: 0.5,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.45,
      clippingPlanes: clipPlanes,
      clipIntersection: true,
      side: THREE.DoubleSide
    });
    this.innerCrustMesh = new THREE.Mesh(inCrustGeo, inCrustMat);
    this.starBody.add(this.innerCrustMesh);

    // Layer 4: OUTER CORE
    const outCoreGeo = new THREE.SphereGeometry(this.radii.outerCore, 48, 48);
    const outCoreTex = this.generateMottledTexture('#0284c7', 'rgba(186, 230, 253, 0.5)');
    const outCoreMat = new THREE.MeshStandardMaterial({
      map: outCoreTex,
      roughness: 0.25,
      metalness: 0.3,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.55,
      clippingPlanes: clipPlanes,
      clipIntersection: true,
      side: THREE.DoubleSide
    });
    this.outerCoreMesh = new THREE.Mesh(outCoreGeo, outCoreMat);
    this.starBody.add(this.outerCoreMesh);

    // Cut cross-section disc showing smooth pale-cyan core face
    const capGeo = new THREE.RingGeometry(this.radii.innerCore, this.radii.outerCore, 36);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      side: THREE.DoubleSide,
      roughness: 0.3
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.rotation.y = Math.PI / 2;
    this.outerCoreMesh.add(capMesh);

    // Layer 5: INNER CORE
    const inCoreGeo = new THREE.SphereGeometry(this.radii.innerCore, 40, 40);
    const inCoreTex = this.generateMottledTexture('#bae6fd', 'rgba(255, 255, 255, 0.8)');
    const inCoreMat = new THREE.MeshStandardMaterial({
      map: inCoreTex,
      roughness: 0.2,
      metalness: 0.1,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 1.15
    });
    this.innerCoreMesh = new THREE.Mesh(inCoreGeo, inCoreMat);
    this.starBody.add(this.innerCoreMesh);

    // Core halo
    const haloGeo = new THREE.SphereGeometry(this.radii.innerCore * 1.15, 24, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    this.innerCoreMesh.add(new THREE.Mesh(haloGeo, haloMat));
  }

  createMagneticSheath() {
    this.sheathGroup = new THREE.Group();
    this.magneticGroup.add(this.sheathGroup);

    const sheathMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    const loopRadii = [2.0, 2.8, 3.8, 4.8];
    const azimuths = 16;

    loopRadii.forEach(R0 => {
      for (let a = 0; a < azimuths; a++) {
        const phi = (a / azimuths) * Math.PI * 2;
        const pts = [];
        const steps = 32;

        for (let s = 1; s < steps; s++) {
          const theta = (s / steps) * Math.PI;
          const r = R0 * Math.sin(theta) * Math.sin(theta);
          if (r >= this.radii.atmosphere * 0.95) {
            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.cos(theta);
            const z = r * Math.sin(theta) * Math.sin(phi);
            pts.push(new THREE.Vector3(x, y, z));
          }
        }

        if (pts.length > 2) {
          const curve = new THREE.CatmullRomCurve3(pts);
          const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(26));
          const line = new THREE.Line(geo, sheathMat);
          this.sheathGroup.add(line);
        }
      }
    });
  }

  // Dynamic Cutaway Structure Labels (Appear when cutaway opens!)
  setupCutawayLabels() {
    this.labelOverlay = document.getElementById('cutaway-labels-overlay');
    if (!this.labelOverlay) {
      this.labelOverlay = document.createElement('div');
      this.labelOverlay.id = 'cutaway-labels-overlay';
      this.labelOverlay.className = 'cutaway-labels-container';
      this.container.appendChild(this.labelOverlay);
    }

    // Define 5 layer label descriptors matching Picture 2
    this.labelDefinitions = [
      {
        key: 'atmosphere',
        name: 'ATMOSPHERE',
        sub: 'Mostly H, He, C (Rw=10⁻⁴ km)',
        color: '#38bdf8',
        r: this.radii.atmosphere,
        angle: 0.25
      },
      {
        key: 'outerCrust',
        name: 'OUTER CRUST',
        sub: 'Heavier nuclei, free e⁻ (Rw=0.1 km)',
        color: '#60a5fa',
        r: this.radii.outerCrust,
        angle: 0.55
      },
      {
        key: 'innerCrust',
        name: 'INNER CRUST',
        sub: 'Free neutrons, pasta (Rw=0.5 km)',
        color: '#f59e0b',
        r: this.radii.innerCrust,
        angle: 0.85
      },
      {
        key: 'outerCore',
        name: 'OUTER CORE',
        sub: 'Neutron rich matter (Rw~7 km)',
        color: '#0284c7',
        r: this.radii.outerCore,
        angle: 1.15
      },
      {
        key: 'innerCore',
        name: 'INNER CORE',
        sub: 'Hyperons, quarks? (Rw~5 km)',
        color: '#ef4444',
        r: this.radii.innerCore,
        angle: 1.45
      }
    ];

    // Build DOM elements for each label
    this.labelElements = this.labelDefinitions.map(def => {
      const el = document.createElement('div');
      el.className = 'cutaway-leader-label';
      el.innerHTML = `
        <div class="leader-line" style="border-color: ${def.color}"></div>
        <div class="leader-text" style="border-left-color: ${def.color}">
          <div class="leader-title" style="color: ${def.color}">${def.name}</div>
          <div class="leader-sub">${def.sub}</div>
        </div>
      `;
      this.labelOverlay.appendChild(el);
      return { el, def };
    });
  }

  // Update label positions projected onto screen coordinates
  updateLabels() {
    if (!this.labelOverlay) return;

    // Show labels only when cutaway is significantly open
    const isOpen = this.cutawayAngle > 0.4 && this.showLabels;
    this.labelOverlay.style.opacity = isOpen ? '1' : '0';
    this.labelOverlay.style.pointerEvents = isOpen ? 'auto' : 'none';

    if (!isOpen) return;

    const halfW = this.width / 2;
    const halfH = this.height / 2;

    this.labelElements.forEach(({ el, def }) => {
      // Calculate 3D position along cut face
      const r = def.r;
      const x = r * Math.cos(def.angle);
      const y = r * Math.sin(def.angle) * 0.7;
      const z = 0.1;

      const vec = new THREE.Vector3(x, y, z);
      vec.applyEuler(this.starRoot.rotation);
      vec.project(this.camera);

      const sx = (vec.x * halfW) + halfW;
      const sy = -(vec.y * halfH) + halfH;

      el.style.transform = `translate(${sx}px, ${sy}px)`;
    });
  }

  setCutawayAngle(targetAngle) {
    this.targetCutawayAngle = Math.max(0, Math.min(Math.PI, targetAngle));
  }

  focusSection(sectionKey) {
    switch (sectionKey) {
      case 'overview':
        this.targetCameraPos.set(0, 0.8, 8.0);
        this.targetLookAtPos.set(0, 0, 0);
        this.setCutawayAngle(0.0);
        this.showLabels = false;
        break;

      case 'formation':
        this.targetCameraPos.set(0.8, 0.5, 7.8);
        this.targetLookAtPos.set(0, 0, 0);
        this.setCutawayAngle(0.0);
        this.showLabels = false;
        break;

      case 'structure':
        this.targetCameraPos.set(1.4, 0.6, 7.2);
        this.targetLookAtPos.set(-0.2, 0, 0);
        this.setCutawayAngle(1.57); // 90-degree cutaway
        this.showLabels = true;
        break;

      case 'vortex':
        this.targetCameraPos.set(0.6, 0.4, 7.4);
        this.targetLookAtPos.set(0, 0, 0);
        this.setCutawayAngle(1.57);
        this.showLabels = true;
        break;

      case 'cooling':
        this.targetCameraPos.set(0.8, 0.5, 7.6);
        this.targetLookAtPos.set(0, 0, 0);
        this.setCutawayAngle(1.57);
        this.showLabels = true;
        break;

      case 'dark-heating':
        this.targetCameraPos.set(1.0, 0.5, 7.5);
        this.targetLookAtPos.set(0, 0, 0);
        this.setCutawayAngle(0.0);
        this.showLabels = false;
        break;

      case 'research':
        this.targetCameraPos.set(0, 1.0, 8.2);
        this.targetLookAtPos.set(0, 0, 0);
        this.setCutawayAngle(0.0);
        this.showLabels = false;
        break;

      case 'group':
        this.targetCameraPos.set(0.6, 0.4, 7.8);
        this.targetLookAtPos.set(-0.1, 0, 0);
        this.setCutawayAngle(0.5);
        this.showLabels = false;
        break;

      case 'outreach':
        this.targetCameraPos.set(0.0, 0.8, 8.0);
        this.targetLookAtPos.set(0, 0, 0);
        this.setCutawayAngle(0.3);
        this.showLabels = false;
        break;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // 1. Stellar Rotation
    if (this.isRotating) {
      this.starBody.rotation.y += this.rotationSpeed;
    }

    // 2. Cutaway Wedge Lerp
    this.cutawayAngle = THREE.MathUtils.lerp(this.cutawayAngle, this.targetCutawayAngle, delta * 4.0);
    if (this.cutawayAngle <= 0.01) {
      this.clipPlane1.constant = 1000;
      this.clipPlane2.constant = 1000;
    } else {
      this.clipPlane1.constant = 0;
      this.clipPlane2.constant = 0;
      this.clipPlane1.normal.set(-Math.cos(this.cutawayAngle * 0.5), 0, -Math.sin(this.cutawayAngle * 0.5));
      this.clipPlane2.normal.set(Math.cos(this.cutawayAngle * 0.5), 0, -Math.sin(this.cutawayAngle * 0.5));
    }

    // 3. Camera Interpolation
    if (!this.isUserInteracting) {
      this.camera.position.lerp(this.targetCameraPos, delta * 2.5);
      this.lookAtPos.lerp(this.targetLookAtPos, delta * 2.5);
      this.camera.lookAt(this.lookAtPos);
      if (this.controls) this.controls.target.copy(this.lookAtPos);
    } else if (this.controls) {
      this.controls.update();
    }

    // 4. Update Cutaway Labels
    this.updateLabels();

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  toggleMagneticField(visible) {
    this.showMagneticField = visible !== undefined ? visible : !this.showMagneticField;
    this.sheathGroup.visible = this.showMagneticField;
    return this.showMagneticField;
  }

  toggleRotation(rotating) {
    this.isRotating = rotating !== undefined ? rotating : !this.isRotating;
    return this.isRotating;
  }
}

window.Star3D = Star3D;
