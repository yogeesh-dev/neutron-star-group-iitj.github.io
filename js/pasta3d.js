/**
 * NEUTRONIS 3D — Nuclear Pasta 3D Viewer
 * Interactive 3D visualization of the frustrated nuclear matter phases:
 * Gnocchi (droplets) -> Spaghetti (rods) -> Lasagna (slabs) -> Penne (tubes) -> Swiss Cheese (bubbles)
 */

class PastaViewer3D {
  constructor(viewportId) {
    this.container = document.getElementById(viewportId);
    if (!this.container) return;

    this.width = this.container.clientWidth || 400;
    this.height = this.container.clientHeight || 300;
    this.currentPhase = 'gnocchi';
    this.density = 0.15; // in units of nuclear saturation density rho_0 (~ 2.8e14 g/cm^3)

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 4, 9);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Subtle lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xfbbf24, 2.0);
    dir1.position.set(5, 8, 5);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dir2.position.set(-5, -4, -5);
    this.scene.add(dir2);

    // Group to hold the current pasta phase geometry
    this.pastaGroup = new THREE.Group();
    this.scene.add(this.pastaGroup);

    // Bounding wireframe cube representing a unit cell of the inner crust
    const boxGeo = new THREE.BoxGeometry(4.5, 4.5, 4.5);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.box = new THREE.Mesh(boxGeo, boxMat);
    this.scene.add(this.box);

    // Render initial phase
    this.setPhase('gnocchi');

    // Resize handling
    window.addEventListener('resize', () => this.onResize());

    // Animation loop
    this.clock = new THREE.Clock();
    this.animate();
  }

  setPhase(phaseKey) {
    this.currentPhase = phaseKey;

    // Clear previous geometries
    while (this.pastaGroup.children.length > 0) {
      const obj = this.pastaGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.pastaGroup.remove(obj);
    }

    const pastaMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.4,
      emissive: new THREE.Color(0xb45309),
      emissiveIntensity: 0.4
    });

    const invertedMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      metalness: 0.3,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.3,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });

    switch (phaseKey) {
      case 'gnocchi': // Spherical nuclear droplets in degenerate electron/neutron gas
        this.density = 0.15;
        this.buildGnocchi(pastaMat);
        break;

      case 'spaghetti': // Parallel cylindrical rods
        this.density = 0.28;
        this.buildSpaghetti(pastaMat);
        break;

      case 'lasagna': // Planar slabs/sheets of nuclear matter
        this.density = 0.40;
        this.buildLasagna(pastaMat);
        break;

      case 'penne': // Inverted hollow tubes inside uniform nuclear matter
        this.density = 0.52;
        this.buildPenne(invertedMat);
        break;

      case 'cheese': // Inverted spherical bubble voids inside uniform nuclear matter
        this.density = 0.65;
        this.buildSwissCheese(invertedMat);
        break;
    }
  }

  // 1. Gnocchi Phase: Lattice of spherical nuclei
  buildGnocchi(material) {
    const sphereGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const spacing = 1.35;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const sphere = new THREE.Mesh(sphereGeo, material);
          sphere.position.set(x * spacing, y * spacing, z * spacing);
          this.pastaGroup.add(sphere);
        }
      }
    }
  }

  // 2. Spaghetti Phase: Parallel elongated cylinders
  buildSpaghetti(material) {
    const cylGeo = new THREE.CylinderGeometry(0.32, 0.32, 4.2, 16);
    const spacing = 1.3;
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const cyl = new THREE.Mesh(cylGeo, material);
        cyl.position.set(x * spacing, 0, z * spacing);
        this.pastaGroup.add(cyl);
      }
    }
  }

  // 3. Lasagna Phase: Undulating parallel planar sheets
  buildLasagna(material) {
    for (let y = -1; y <= 1; y++) {
      const slabGeo = new THREE.BoxGeometry(4.2, 0.45, 4.2, 12, 2, 12);
      // Subtle wave deformation on the sheet
      const pos = slabGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        const wave = Math.sin(vx * 1.5) * Math.cos(vz * 1.5) * 0.12;
        pos.setY(i, pos.getY(i) + wave);
      }
      slabGeo.computeVertexNormals();

      const slab = new THREE.Mesh(slabGeo, material);
      slab.position.set(0, y * 1.4, 0);
      this.pastaGroup.add(slab);
    }
  }

  // 4. Penne Phase: Cylindrical void conduits
  buildPenne(material) {
    // Solid block with hollow cylindrical voids
    const outerBlock = new THREE.BoxGeometry(4.2, 4.2, 4.2);
    const blockMesh = new THREE.Mesh(outerBlock, material);
    this.pastaGroup.add(blockMesh);

    // Render internal void conduits with glowing wireframe
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true
    });
    const spacing = 1.35;
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const voidCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 4.25, 12), voidMat);
        voidCyl.position.set(x * spacing, 0, z * spacing);
        this.pastaGroup.add(voidCyl);
      }
    }
  }

  // 5. Swiss Cheese Phase: Spherical void bubbles in nuclear matter
  buildSwissCheese(material) {
    const outerBlock = new THREE.BoxGeometry(4.2, 4.2, 4.2);
    const blockMesh = new THREE.Mesh(outerBlock, material);
    this.pastaGroup.add(blockMesh);

    // Glowing hollow bubbles inside
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true
    });
    const bubbleGeo = new THREE.SphereGeometry(0.5, 12, 12);
    const spacing = 1.4;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
          bubble.position.set(x * spacing, y * spacing, z * spacing);
          this.pastaGroup.add(bubble);
        }
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    // Gentle 3D rotation of the pasta unit cell
    if (this.pastaGroup) {
      this.pastaGroup.rotation.y += delta * 0.4;
      this.pastaGroup.rotation.x = Math.sin(this.pastaGroup.rotation.y * 0.5) * 0.15;
    }
    if (this.box) {
      this.box.rotation.y = this.pastaGroup.rotation.y;
      this.box.rotation.x = this.pastaGroup.rotation.x;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}

window.PastaViewer3D = PastaViewer3D;
