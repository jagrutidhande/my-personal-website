/**
 * CropCare AI — Smart Crop Disease Helper Website
 * Main JavaScript Controller
 * 
 * Features:
 * 1. Three.js 3D Interactive Leaf & Bio-Visualizer (Modes: Organic, Bio-Scan, Symptoms)
 * 2. 3D Card Parallax Tilt Engine
 * 3. Leaf Image Analyzer (File validation, 5MB limit, JPEG/PNG/WEBP, ObjectURL memory management)
 * 4. Holographic Scanner HUD Overlay
 * 5. Quick Sample Leaf Loader
 * 6. Responsive Mobile Navigation & Scroll Spy
 * 7. Dynamic Year & ARIA Live Announcements
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. Dynamic Current Year
  // ---------------------------------------------------------------------------
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ---------------------------------------------------------------------------
  // 2. Navigation & Mobile Drawer
  // ---------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll effect on header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle mobile drawer
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileDrawer.classList.toggle('open');
      mobileDrawer.setAttribute('aria-hidden', isExpanded);
    });

    // Close drawer on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });

    // Close drawer on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && mobileDrawer.classList.contains('open')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Active link scroll spy
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        desktopLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // ---------------------------------------------------------------------------
  // 3. 3D Card Parallax Tilt Effect (CSS 3D perspective)
  // ---------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.card-3d');

  tiltCards.forEach(card => {
    // Only apply on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
      card.addEventListener('mousemove', (e) => {
        // Skip tilt on canvas container to prevent interference with Three.js orbit
        if (e.target.closest('#hero-canvas-container')) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Three.js 3D Interactive Leaf & Bio-Visualizer
  // ---------------------------------------------------------------------------
  initThreeDLeafViewer();

  function initThreeDLeafViewer() {
    const container = document.getElementById('hero-canvas-container');
    const loader = document.getElementById('canvas-loader');
    const resetCamBtn = document.getElementById('reset-cam-btn');
    const modeButtons = document.querySelectorAll('.model-mode-buttons .mode-btn');

    if (!container || typeof THREE === 'undefined') {
      if (loader) loader.innerHTML = '<span>3D Model Preview Available</span>';
      return;
    }

    let scene, camera, renderer, controls;
    let leafMesh, leafWireframe, stemMesh, veinGroup, laserScanGroup, symptomsGroup;
    let particles;
    let currentMode = 'organic'; // 'organic', 'scanner', 'symptoms'
    let scanDirection = 1;
    let scanY = -1.8;

    try {
      // Scene
      scene = new THREE.Scene();

      // Camera
      const width = container.clientWidth || 450;
      const height = container.clientHeight || 400;
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.5, 4.2);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Controls
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 7;
        controls.minDistance = 2.2;
        controls.maxPolarAngle = Math.PI / 1.8;
        controls.minPolarAngle = Math.PI / 6;
      }

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xa7f3d0, 1.2);
      dirLight.position.set(3, 5, 4);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const warmBounce = new THREE.DirectionalLight(0xd1fae5, 0.6);
      warmBounce.position.set(-3, -3, -2);
      scene.add(warmBounce);

      // Build Procedural 3D Curved Leaf Geometry
      const leafGeometry = createCurvedLeafGeometry();

      // Organic Material
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d6a4f,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
        bumpScale: 0.05
      });

      leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
      leafMesh.castShadow = true;
      leafMesh.receiveShadow = true;
      scene.add(leafMesh);

      // Wireframe Overlay for Scanner Mode
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x80ed99,
        wireframe: true,
        transparent: true,
        opacity: 0.0
      });
      leafWireframe = new THREE.Mesh(leafGeometry, wireframeMat);
      leafWireframe.scale.set(1.002, 1.002, 1.002);
      scene.add(leafWireframe);

      // Central Vein & Stem
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -2.1, -0.05),
        new THREE.Vector3(0, -1.5, 0),
        new THREE.Vector3(0, 0, 0.08),
        new THREE.Vector3(0, 1.2, 0.05),
        new THREE.Vector3(0, 1.8, 0)
      ]);
      const stemGeo = new THREE.TubeGeometry(stemCurve, 32, 0.035, 8, false);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.5 });
      stemMesh = new THREE.Mesh(stemGeo, stemMat);
      scene.add(stemMesh);

      // Side Veins
      veinGroup = new THREE.Group();
      const veinMat = new THREE.LineBasicMaterial({ color: 0x74c69d, transparent: true, opacity: 0.6 });
      for (let y = -1.1; y <= 1.3; y += 0.3) {
        const spread = (1.8 - Math.abs(y)) * 0.45;
        // Right vein
        const rightPts = [new THREE.Vector3(0, y, 0.04), new THREE.Vector3(spread, y + 0.18, -0.02)];
        const rightGeo = new THREE.BufferGeometry().setFromPoints(rightPts);
        veinGroup.add(new THREE.Line(rightGeo, veinMat));
        // Left vein
        const leftPts = [new THREE.Vector3(0, y, 0.04), new THREE.Vector3(-spread, y + 0.18, -0.02)];
        const leftGeo = new THREE.BufferGeometry().setFromPoints(leftPts);
        veinGroup.add(new THREE.Line(leftGeo, veinMat));
      }
      scene.add(veinGroup);

      // Ambient Floating Bio-Particles / Spores
      particles = createBioParticles();
      scene.add(particles);

      // Laser Scan Beam Group for Scanner Mode
      laserScanGroup = createLaserScanBeam();
      laserScanGroup.visible = false;
      scene.add(laserScanGroup);

      // 3D Symptom Decals for Symptoms Mode
      symptomsGroup = create3DSymptoms();
      symptomsGroup.visible = false;
      scene.add(symptomsGroup);

      // Hide Loader
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 300);
      }

      // Animation Loop
      let clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Subtle organic breathing animation
        if (leafMesh) {
          const sway = Math.sin(elapsedTime * 0.8) * 0.05;
          leafMesh.rotation.y = sway;
          leafWireframe.rotation.y = sway;
          stemMesh.rotation.y = sway;
          veinGroup.rotation.y = sway;
          if (symptomsGroup) symptomsGroup.rotation.y = sway;
        }

        // Swirl bio-particles gently
        if (particles) {
          particles.rotation.y = elapsedTime * 0.04;
          particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;
        }

        // Scanner mode beam animation
        if (currentMode === 'scanner' && laserScanGroup) {
          scanY += 0.025 * scanDirection;
          if (scanY > 1.8) {
            scanY = 1.8;
            scanDirection = -1;
          } else if (scanY < -1.8) {
            scanY = -1.8;
            scanDirection = 1;
          }
          laserScanGroup.position.y = scanY;
        }

        // Update OrbitControls
        if (controls) {
          controls.update();
        }

        renderer.render(scene, camera);
      }

      animate();

      // Handle Resize
      window.addEventListener('resize', onWindowResize, { passive: true });

      function onWindowResize() {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }

      // Reset Camera
      if (resetCamBtn) {
        resetCamBtn.addEventListener('click', () => {
          if (controls) {
            controls.reset();
          }
          camera.position.set(0, 0.5, 4.2);
          camera.lookAt(0, 0, 0);
        });
      }

      // Mode Switching
      modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          modeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const mode = btn.dataset.mode;
          currentMode = mode;

          apply3DMode(mode);
        });
      });

      function apply3DMode(mode) {
        if (mode === 'organic') {
          leafMaterial.color.setHex(0x2d6a4f);
          wireframeMat.opacity = 0.0;
          laserScanGroup.visible = false;
          symptomsGroup.visible = false;
        } else if (mode === 'scanner') {
          leafMaterial.color.setHex(0x1b4332);
          wireframeMat.opacity = 0.45;
          laserScanGroup.visible = true;
          symptomsGroup.visible = false;
        } else if (mode === 'symptoms') {
          leafMaterial.color.setHex(0x356345);
          wireframeMat.opacity = 0.1;
          laserScanGroup.visible = false;
          symptomsGroup.visible = true;
        }
      }

    } catch (err) {
      console.warn('Three.js initialization notice:', err);
      if (loader) {
        loader.innerHTML = '<span>Interactive 3D Visualizer Active</span>';
      }
    }

    // Helper: Create Curved Organic Leaf Geometry
    function createCurvedLeafGeometry() {
      const geom = new THREE.PlaneGeometry(2.4, 3.6, 24, 24);
      const pos = geom.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);

        // Normalize y to range 0 to 1
        const ny = (y + 1.8) / 3.6;

        // Leaf outline taper: broad in middle, narrow at base and tip
        const widthFactor = Math.sin(ny * Math.PI) * 1.1;
        x = x * widthFactor;
        pos.setX(i, x);

        // Transverse parabolic curvature (curving down at leaf margins)
        const zArch = -Math.pow(x * 1.3, 2) * 0.22;

        // Longitudinal spine curvature (subtle S-curve)
        const zSpine = Math.sin(ny * Math.PI) * 0.25 - 0.05 * Math.pow(ny, 2);

        pos.setZ(i, zArch + zSpine);
      }

      geom.computeVertexNormals();
      return geom;
    }

    // Helper: Create Floating Bio-Particles
    function createBioParticles() {
      const count = 120;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = 1.2 + Math.random() * 2.2;
        positions[i * 3] = Math.cos(theta) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const pMat = new THREE.PointsMaterial({
        color: 0x80ed99,
        size: 0.045,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });

      return new THREE.Points(pGeo, pMat);
    }

    // Helper: Create Laser Scan Beam
    function createLaserScanBeam() {
      const group = new THREE.Group();

      // Glowing laser line
      const lineGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.8, 16);
      lineGeo.rotateZ(Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x80ed99,
        transparent: true,
        opacity: 0.95
      });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      group.add(lineMesh);

      // Soft scan plane
      const planeGeo = new THREE.PlaneGeometry(2.8, 0.25);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x52b788,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      group.add(planeMesh);

      return group;
    }

    // Helper: Create 3D Symptoms (Concentric early blight spots, rust pustules)
    function create3DSymptoms() {
      const group = new THREE.Group();

      // Early Blight Target Spot 1
      const spot1 = createSpotDecal(0.4, 0.3, 0.18, 0.28, 0x8b4513, 0xd4a373);
      group.add(spot1);

      // Early Blight Target Spot 2
      const spot2 = createSpotDecal(-0.35, -0.4, 0.16, 0.22, 0x78350f, 0xca8a04);
      group.add(spot2);

      // Late Blight Water Soaked Lesion
      const lesion = createWaterSoakedLesion(-0.45, 0.6, 0.12);
      group.add(lesion);

      // Rust Pustules Group
      const rustCluster = createRustPustuleCluster(0.3, -0.9, 0.15);
      group.add(rustCluster);

      // Cotton Angular Bacterial Blight Spot
      const cottonAngular = createAngularBacterialSpot(-0.25, 0.15, 0.14);
      group.add(cottonAngular);

      // Corn Elongated Cigar-Shaped Blight Lesion
      const cornBlight = createElongatedCornLesion(0.35, -0.35, 0.16);
      group.add(cornBlight);

      return group;
    }

    function createSpotDecal(x, y, z, radius, innerColor, ringColor) {
      const spotGroup = new THREE.Group();
      spotGroup.position.set(x, y, z);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(radius * 0.7, radius, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      spotGroup.add(ringMesh);

      // Center necrotic spot
      const centerGeo = new THREE.CircleGeometry(radius * 0.5, 24);
      const centerMat = new THREE.MeshBasicMaterial({ color: innerColor, side: THREE.DoubleSide });
      const centerMesh = new THREE.Mesh(centerGeo, centerMat);
      centerMesh.position.z = 0.005;
      spotGroup.add(centerMesh);

      return spotGroup;
    }

    function createWaterSoakedLesion(x, y, z) {
      const lesionGeo = new THREE.CircleGeometry(0.35, 16);
      lesionGeo.scale(1.2, 0.8, 1);
      const lesionMat = new THREE.MeshBasicMaterial({
        color: 0x1f2937,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(lesionGeo, lesionMat);
      mesh.position.set(x, y, z);
      return mesh;
    }

    function createRustPustuleCluster(x, y, z) {
      const cluster = new THREE.Group();
      cluster.position.set(x, y, z);

      const rustMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
      for (let i = 0; i < 8; i++) {
        const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const dot = new THREE.Mesh(dotGeo, rustMat);
        dot.position.set(
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.35,
          0.02
        );
        cluster.add(dot);
      }
      return cluster;
    }

    function createAngularBacterialSpot(x, y, z) {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      const geom = new THREE.PlaneGeometry(0.24, 0.22);
      geom.rotateZ(Math.PI / 4); // Angular vein-bound appearance
      const mat = new THREE.MeshBasicMaterial({ color: 0x3d0c02, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geom, mat);
      group.add(mesh);
      return group;
    }

    function createElongatedCornLesion(x, y, z) {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      const geom = new THREE.CircleGeometry(0.18, 16);
      geom.scale(0.5, 2.2, 1); // Cigar shape
      geom.rotateZ(-0.25);
      const mat = new THREE.MeshBasicMaterial({ color: 0x926c36, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geom, mat);
      group.add(mesh);
      return group;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Leaf Image Analyzer Implementation
  // ---------------------------------------------------------------------------
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('leaf-file-input');
  const fileInfoBar = document.getElementById('file-info-bar');
  const selectedFilename = document.getElementById('selected-filename');
  const selectedFilesize = document.getElementById('selected-filesize');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnClear = document.getElementById('btn-clear');

  const emptyState = document.getElementById('empty-state');
  const activePreviewWrap = document.getElementById('active-preview-wrap');
  const previewImg = document.getElementById('preview-img');
  const scannerHud = document.getElementById('scanner-hud');

  const resultStatusBadge = document.getElementById('result-status-badge');
  const resultMessage = document.getElementById('result-message');
  const guideLinkWrap = document.getElementById('guide-link-wrap');
  const sampleButtons = document.querySelectorAll('.btn-sample');
  const accessibleAnnouncement = document.getElementById('accessible-announcement');

  // Crop Care Module Elements
  const cropCareContainer = document.getElementById('crop-care-container');
  const careCropSubtitle = document.getElementById('care-crop-subtitle');
  const cropSwitchButtons = document.querySelectorAll('.btn-crop-switch');
  const careTabButtons = document.querySelectorAll('.care-tab-btn');
  const carePanels = document.querySelectorAll('.care-panel');
  const careChecklistItems = document.getElementById('care-checklist-items');
  const careTreatmentContent = document.getElementById('care-treatment-content');
  const careWateringContent = document.getElementById('care-watering-content');
  const carePreventionContent = document.getElementById('care-prevention-content');
  const btnCopyCare = document.getElementById('btn-copy-care');
  const copyToast = document.getElementById('copy-toast');
  let activeCrop = 'tomato';

  // Comprehensive Crop Care, Treatment & Recovery Database
  const CROP_CARE_DATABASE = {
    tomato: {
      name: "Tomato (Solanum lycopersicum)",
      cropKey: "tomato",
      diseaseRisk: "Early Blight & Foliar Spot Recovery",
      icon: "🍅",
      checklist: [
        "Prune the lower 12–18 inches of foliage to eliminate ground contact where fungal spores reside.",
        "Disinfect pruning shears with 70% isopropyl alcohol between cuts to prevent pathogen transmission.",
        "Switch immediately to base drip irrigation or gentle root-zone soaker hoses; keep leaves bone-dry.",
        "Spread a 2–3 inch layer of clean straw, pine needles, or bark mulch over the soil bed to stop spore splashback.",
        "Apply organic copper octanoate or cold-pressed neem spray in the late afternoon/dusk."
      ],
      treatments: [
        {
          title: "Liquid Copper Octanoate (Copper Soap)",
          desc: "A proven organic broad-spectrum protectant that prevents germinating fungal spores from penetrating epidermal tissue. Spray both upper and lower leaf surfaces.",
          dosage: "Mix 15–30 ml per gallon of water. Reapply every 7–10 days during warm, wet weather."
        },
        {
          title: "Biological Fungicide (Bacillus subtilis / B. amyloliquefaciens)",
          desc: "Beneficial bacteria that colonize leaf surfaces and outcompete fungal pathogens while producing natural antifungal lipopeptides.",
          dosage: "Apply every 10–14 days as preventative foliar mist before disease outbreak."
        },
        {
          title: "Potassium Bicarbonate Foliar Remedy",
          desc: "Creates an alkaline surface pH on the leaf cuticle that inhibits mycelial fungal growth without harming beneficial insects.",
          dosage: "Mix 1 tbsp potassium bicarbonate + 1/2 tsp mild liquid soap in 1 gallon water."
        }
      ],
      watering: [
        {
          title: "Water Early Morning Only (5:00 AM – 9:00 AM)",
          desc: "Any incidental foliage splash evaporates quickly with morning sun. Prolonged night wetness (>2 hours) drastically increases fungal spore germination."
        },
        {
          title: "Soil Drainage & Calcium Balance",
          desc: "Maintain well-draining loamy soil with a pH of 6.2–6.8. Ensure adequate available calcium to reinforce plant cell walls against hyphal infection."
        }
      ],
      prevention: [
        {
          title: "Strict 3-to-4 Year Crop Rotation",
          desc: "Never plant tomatoes where potatoes, eggplants, or peppers grew in the previous 3 seasons. Solanaceous crops share common soil-borne inoculum."
        },
        {
          title: "Staking & Airflow Optimization",
          desc: "Use sturdy cages or Florida-weave trellising to keep the plant canopy upright. Prune internal non-fruiting suckers to maximize breeze and sunlight penetration."
        }
      ]
    },
    potato: {
      name: "Potato (Solanum tuberosum)",
      cropKey: "potato",
      diseaseRisk: "Late Blight & Water Mold Defense",
      icon: "🥔",
      checklist: [
        "Scout the entire field/patch immediately; bag and discard severely blighted plants to curb spore drift.",
        "Cease all overhead sprinkler irrigation; late blight zoospores require a film of free water to swim and infect.",
        "Hill up soil around stems (minimum 4-inch ridge) to physically shield developing tubers from rain-washed spores.",
        "Apply preventative copper-based protectant or bio-fungicide to all surrounding green foliage.",
        "Eliminate volunteer potato plants and discard unharvested cull tubers far away from the garden plot."
      ],
      treatments: [
        {
          title: "Copper Hydroxide / Fixed Copper Protectant",
          desc: "Essential preventative foliar barrier against Phytophthora infestans zoospores. Must be applied before major rain events when blight alerts are active.",
          dosage: "Follow manufacturer label (approx 20–30g per 10 liters). Spray thoroughly on leaf undersides."
        },
        {
          title: "Bio-Inoculant (Trichoderma viride / T. harzianum)",
          desc: "Soil and foliar bio-control agent that parasitizes pathogenic oomycetes and induces systemic acquired resistance (SAR) in potato plants.",
          dosage: "Soil drench at hilling; foliar spray at first bloom."
        }
      ],
      watering: [
        {
          title: "Deep Furrow or Drip Irrigation",
          desc: "Direct water solely into furrows between raised planting ridges. Never irrigate during overcast or high-humidity days."
        },
        {
          title: "Tuber Zone Aeration",
          desc: "Avoid soil compaction and waterlogging. Saturated root zones promote bacterial soft rot and tuber blight infection."
        }
      ],
      prevention: [
        {
          title: "Certified Disease-Free Seed Tubers",
          desc: "Always start with government or university-certified clean seed potatoes. Never plant grocery store potatoes which may harbor latent blight."
        },
        {
          title: "Vine Desiccation Before Harvest",
          desc: "Kill or cut potato foliage 2 weeks prior to harvest. This allows the tuber skins to toughen and ensures no living blight spores contact tubers during digging."
        }
      ]
    },
    wheat: {
      name: "Wheat (Triticum aestivum)",
      cropKey: "wheat",
      diseaseRisk: "Leaf Rust & Stripe Rust Management",
      icon: "🌾",
      checklist: [
        "Scout upper canopy leaves (especially the Flag leaf and F-1 leaf) weekly from jointing through grain filling.",
        "Eradicate volunteer wheat plants ('green bridge') in and around field perimeters at least 4 weeks before sowing.",
        "Avoid excessive nitrogen fertilizer application, which produces soft, lush tissue highly prone to rust pustules.",
        "Ensure balanced potassium and phosphorus levels to maximize straw stiffness and vascular defense.",
        "If pustule severity exceeds threshold (5–10% on lower canopy before heading), consult local agronomist for targeted intervention."
      ],
      treatments: [
        {
          title: "Wettable Sulfur / Micronized Sulfur Spray",
          desc: "Traditional, effective protective fungicide that curtails fungal spore germination on the cereal foliage.",
          dosage: "Mix 25–30g per 10 liters water. Avoid spraying in temperatures above 32°C."
        },
        {
          title: "Bio-fungicide (Trichoderma harzianum)",
          desc: "Foliar bio-agent that colonizes wheat leaves and suppresses urediniospore germination.",
          dosage: "Foliar application at flag-leaf emergence."
        }
      ],
      watering: [
        {
          title: "Avoid Late Evening Sprinkler Sessions",
          desc: "Rust spores germinate in 6–8 hours of moisture. Irrigate in early morning so canopy dries rapidly."
        },
        {
          title: "Optimum Soil Moisture at Tillering",
          desc: "Maintain uniform soil moisture during tillering and heading, avoiding moisture stress which weakens plant immunity."
        }
      ],
      prevention: [
        {
          title: "Rust-Resistant Cultivar Selection",
          desc: "Sow regionally recommended varieties carrying multi-gene rust resistance (e.g. Lr34 adult plant resistance)."
        },
        {
          title: "Synchronized Sowing Dates",
          desc: "Plant within the optimal agronomic window recommended by your regional agricultural university to escape peak spore flight periods."
        }
      ]
    },
    cotton: {
      name: "Cotton (Gossypium hirsutum)",
      cropKey: "cotton",
      diseaseRisk: "Bacterial Blight & Angular Spot Management",
      icon: "🌱",
      checklist: [
        "Hand-prune initial diseased leaves showing angular water-soaked lesions and burn or bury them off-field.",
        "Strictly avoid overhead sprinkler irrigation or field flooding that splashes bacteria across the foliage.",
        "Spray copper oxychloride combined with agricultural bactericide as soon as first angular spots are spotted.",
        "Cultivate and weed fields only when plants are completely dry to prevent mechanical bacterial transmission.",
        "Deep-plow crop stalks and stubble immediately following the final harvest picking."
      ],
      treatments: [
        {
          title: "Copper Oxychloride (50% WP)",
          desc: "Standard agricultural bactericide/fungicide that forms a protective ionic copper barrier inhibiting bacterial multiplication.",
          dosage: "Mix 25–30g per 10 liters water. Spray on entire plant canopy."
        },
        {
          title: "Pseudomonas fluorescens (Bio-Control)",
          desc: "Beneficial rhizobacteria that produce systemic resistance and antimicrobial compounds against Xanthomonas.",
          dosage: "Foliar spray at 10g/liter water at 30 and 45 days after sowing."
        }
      ],
      watering: [
        {
          title: "Drip or Regulated Furrow Irrigation",
          desc: "Deliver water at the ground furrow level. Ensure field drainage channels are clear so standing water does not create humid microclimates."
        },
        {
          title: "Avoid Water Stress at Squaring",
          desc: "Keep soil moisture consistent without saturation. Water stress during boll formation increases susceptibility to bacterial boll rot."
        }
      ],
      prevention: [
        {
          title: "Certified Acid-Delinted Seeds",
          desc: "Treating seeds with sulfuric acid destroys seed-borne bacterial inoculum on the seed coat fuzz, ensuring clean seedling emergence."
        },
        {
          title: "2-to-3 Year Non-Host Rotation",
          desc: "Rotate cotton fields with crops like sorghum, maize, or legumes that do not host Xanthomonas citri pv. malvacearum."
        }
      ]
    },
    corn: {
      name: "Corn / Maize (Zea mays)",
      cropKey: "corn",
      diseaseRisk: "Northern Corn Leaf Blight & Foliar Care",
      icon: "🌽",
      checklist: [
        "Scout the lower canopy during V8 through silking for developing tan, cigar-shaped lesions.",
        "Protect the ear leaf! If lesions appear within 2 leaves of the primary ear before silking, initiate protective treatment.",
        "Irrigate strictly in early morning so standing dew and water droplets evaporate within 2 hours.",
        "Apply balanced potassium to reinforce stalk cell walls and prevent late-season stalk rot and lodging.",
        "Chop and till corn residue post-harvest to accelerate winter decomposition of overwintering fungal mycelium."
      ],
      treatments: [
        {
          title: "Bio-Fungicide (Bacillus amyloliquefaciens strain D747)",
          desc: "Organic broad-spectrum foliar bio-fungicide that prevents foliar blight pathogen colonization.",
          dosage: "Apply 1–2 teaspoons per gallon water; spray during vegetative V10 to VT tasseling stages."
        },
        {
          title: "Liquid Copper Octanoate (Copper Soap)",
          desc: "Safe protective spray for organic sweet corn and specialty maize gardens against fungal leaf blights.",
          dosage: "Mix 20–30 ml per gallon of water. Spray at first sign of lower foliar lesions."
        }
      ],
      watering: [
        {
          title: "Avoid Wet Foliage at Tasseling",
          desc: "Fungal spores thrive in warm (18–27°C) humid environments. Use furrow or base drip lines to minimize canopy wetness."
        },
        {
          title: "Soil Moisture During Silking",
          desc: "Ensure adequate water during the critical pollination window while avoiding waterlogged root conditions."
        }
      ],
      prevention: [
        {
          title: "Ht Gene Resistant Hybrids",
          desc: "Plant maize hybrids with documented genetic resistance to Northern Corn Leaf Blight (incorporating Ht1, Ht2, or polygenic tolerance)."
        },
        {
          title: "Crop Rotation with Non-Grasses",
          desc: "Rotate with soybeans, cotton, or pulses. Avoid continuous corn-on-corn farming which allows blight spores to accumulate in crop trash."
        }
      ]
    },
    general: {
      name: "General Plant & Garden Crop Health",
      cropKey: "general",
      diseaseRisk: "Universal Foliar Health & Plant Immunity",
      icon: "🌿",
      checklist: [
        "Prune and dispose of any dead, yellowing, or diseased foliage using sanitized hand shears.",
        "Always direct irrigation water at the soil root zone; never mist or spray leaves from above.",
        "Apply 2–3 inches of clean organic mulch (shredded leaves, straw, or woodchips) over exposed soil.",
        "Ensure each plant has adequate spacing to allow wind and air circulation through the lower branches.",
        "Apply preventative cold-pressed neem oil (0.5% emulsion) once a week as a natural foliar shield."
      ],
      treatments: [
        {
          title: "Organic Cold-Pressed Neem Oil Emulsion",
          desc: "Natural fungicide and pest deterrent. Disrupts fungal spore membranes and repels sap-sucking insect vectors.",
          dosage: "Mix 5 ml pure neem oil + 2 ml mild natural liquid soap in 1 liter of lukewarm water. Spray at dusk."
        },
        {
          title: "Compost Tea Foliar Drench",
          desc: "Aerated compost tea introduces millions of beneficial microorganisms that outcompete leaf pathogens.",
          dosage: "Dilute 1:5 with non-chlorinated water and spray early morning."
        }
      ],
      watering: [
        {
          title: "Soil-Level Base Irrigation",
          desc: "Water deeply and infrequently rather than shallow daily sprinkles. Encourages deep taproots that resist drought and disease."
        },
        {
          title: "Proper Drainage Check",
          desc: "Ensure garden beds and pots have rapid drainage holes. Waterlogged roots suffocate and invite root rot (Pythium/Phytophthora)."
        }
      ],
      prevention: [
        {
          title: "Diverse Companion Planting",
          desc: "Intercrop with marigolds, basil, garlic, and alliums to deter fungal spores and insect vectors naturally."
        },
        {
          title: "Soil Microbe Enrichment",
          desc: "Feed soil with aged compost, mycorrhizal fungi, and biochar to foster a resilient living soil ecosystem."
        }
      ]
    }
  };

  // Allowed MIME types and extensions
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  let currentObjectURL = null;
  let currentFile = null;

  // Cleanup helper to prevent browser memory leaks
  function revokeActiveObjectURL() {
    if (currentObjectURL) {
      URL.revokeObjectURL(currentObjectURL);
      currentObjectURL = null;
    }
  }

  // Announce to screen readers
  function announceToScreenReader(message) {
    if (accessibleAnnouncement) {
      accessibleAnnouncement.textContent = message;
    }
  }

  // Show error
  function showError(msg) {
    if (errorBanner && errorMessage) {
      errorMessage.textContent = msg;
      errorBanner.style.display = 'flex';
      announceToScreenReader(`Error: ${msg}`);
    }
  }

  // Hide error
  function hideError() {
    if (errorBanner) {
      errorBanner.style.display = 'none';
    }
  }

  // Format bytes for display
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate File
  function validateFile(file) {
    hideError();

    if (!file) {
      showError('No file was detected. Please select an image.');
      return false;
    }

    // Check MIME type or extension
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                             fileName.endsWith('.png') || fileName.endsWith('.webp');

    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !hasValidExtension) {
      showError('Unsupported file format. Please select a valid JPEG, PNG, or WEBP image.');
      return false;
    }

    // Check Size Limit (5 MB)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showError(`File size exceeds 5 MB limit (Current: ${sizeMB} MB). Please choose a smaller image.`);
      return false;
    }

    return true;
  }

  // Handle Valid Selected File
  function handleValidImageFile(file, optionalDisplayName) {
    revokeActiveObjectURL();
    currentFile = file;

    // Create object URL
    currentObjectURL = URL.createObjectURL(file);

    // Update File Info Bar
    if (fileInfoBar && selectedFilename && selectedFilesize) {
      selectedFilename.textContent = optionalDisplayName || file.name;
      selectedFilesize.textContent = formatBytes(file.size);
      fileInfoBar.style.display = 'flex';
    }

    // Update Image Preview
    if (emptyState && activePreviewWrap && previewImg) {
      emptyState.style.display = 'none';
      activePreviewWrap.style.display = 'flex';
      previewImg.src = currentObjectURL;
      previewImg.alt = `Preview of uploaded leaf: ${optionalDisplayName || file.name}`;
    }

    // Reset Scanner HUD
    if (scannerHud) {
      scannerHud.classList.remove('active');
    }

    // Enable Analyze Button
    if (btnAnalyze) {
      btnAnalyze.disabled = false;
    }

    // Update Result Panel to "Image Ready"
    if (resultStatusBadge && resultMessage) {
      resultStatusBadge.textContent = 'Image Ready';
      resultStatusBadge.className = 'result-status-badge ready';
      resultMessage.textContent = 'Image Ready! Your image is ready to explore.';
    }

    // Auto-detect crop type
    const detected = autoDetectCrop(optionalDisplayName || file.name);
    activeCrop = detected;
    updateCropSwitcherButtons(activeCrop);

    // Hide guide link and care container until analyzed
    if (guideLinkWrap) {
      guideLinkWrap.style.display = 'none';
    }
    if (cropCareContainer) {
      cropCareContainer.style.display = 'none';
    }

    announceToScreenReader(`Leaf image ${optionalDisplayName || file.name} loaded successfully and is ready to explore.`);
  }

  // Auto-detect crop based on file or sample name
  function autoDetectCrop(name) {
    if (!name) return 'general';
    const lower = name.toLowerCase();
    if (lower.includes('tomato')) return 'tomato';
    if (lower.includes('potato')) return 'potato';
    if (lower.includes('wheat') || lower.includes('rust')) return 'wheat';
    if (lower.includes('cotton')) return 'cotton';
    if (lower.includes('corn') || lower.includes('maize')) return 'corn';
    return 'general';
  }

  // File Input Change Listener
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (validateFile(file)) {
          handleValidImageFile(file);
        } else {
          // Reset file input on validation failure
          fileInput.value = '';
        }
      }
    });
  }

  // Drag and Drop Listeners
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files && dt.files[0];
      if (file) {
        if (validateFile(file)) {
          handleValidImageFile(file);
        }
      }
    });

    // Keyboard support for dropzone
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (fileInput) fileInput.click();
      }
    });
  }

  // Quick Testing Samples Click Handler
  sampleButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const sampleKey = btn.dataset.sample;
      let samplePath = '';
      let sampleName = '';

      switch (sampleKey) {
        case 'tomato':
          samplePath = 'images/sample_tomato_early_blight.jpg';
          sampleName = 'sample_tomato_early_blight.jpg';
          break;
        case 'potato':
          samplePath = 'images/sample_potato_late_blight.jpg';
          sampleName = 'sample_potato_late_blight.jpg';
          break;
        case 'wheat':
          samplePath = 'images/sample_wheat_leaf_rust.jpg';
          sampleName = 'sample_wheat_leaf_rust.jpg';
          break;
        case 'cotton':
          samplePath = 'images/sample_cotton_bacterial_blight.jpg';
          sampleName = 'sample_cotton_bacterial_blight.jpg';
          break;
        case 'corn':
          samplePath = 'images/sample_corn_leaf_blight.jpg';
          sampleName = 'sample_corn_leaf_blight.jpg';
          break;
        case 'healthy':
          samplePath = 'images/sample_healthy_leaf.jpg';
          sampleName = 'sample_healthy_leaf.jpg';
          break;
        default:
          return;
      }

      // Set active crop
      activeCrop = (sampleKey === 'healthy') ? 'general' : sampleKey;
      updateCropSwitcherButtons(activeCrop);

      try {
        const response = await fetch(samplePath);
        if (!response.ok) throw new Error('Sample could not be fetched');
        const blob = await response.blob();
        const file = new File([blob], sampleName, { type: 'image/jpeg' });

        if (validateFile(file)) {
          handleValidImageFile(file, `Sample: ${sampleName}`);
        }
      } catch (err) {
        console.warn('Direct fetch notice, using fallback sample display:', err);
        // Fallback for file:// protocol if fetch is restricted
        fetchFallbackSample(samplePath, sampleName);
      }
    });
  });

  function fetchFallbackSample(path, name) {
    revokeActiveObjectURL();
    currentFile = { name: name, size: 42000, type: 'image/jpeg' };

    activeCrop = (name.includes('healthy')) ? 'general' : autoDetectCrop(name);
    updateCropSwitcherButtons(activeCrop);

    if (fileInfoBar && selectedFilename && selectedFilesize) {
      selectedFilename.textContent = `Sample: ${name}`;
      selectedFilesize.textContent = '42.0 KB';
      fileInfoBar.style.display = 'flex';
    }

    if (emptyState && activePreviewWrap && previewImg) {
      emptyState.style.display = 'none';
      activePreviewWrap.style.display = 'flex';
      previewImg.src = path;
      previewImg.alt = `Sample preview: ${name}`;
    }

    if (btnAnalyze) btnAnalyze.disabled = false;
    hideError();

    if (resultStatusBadge && resultMessage) {
      resultStatusBadge.textContent = 'Image Ready';
      resultStatusBadge.className = 'result-status-badge ready';
      resultMessage.textContent = 'Image Ready! Your image is ready to explore.';
    }

    if (cropCareContainer) {
      cropCareContainer.style.display = 'none';
    }
  }

  // "Explore Leaf Information" Button Click Handler
  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => {
      // Require valid image selection
      if (!currentFile && (!previewImg || !previewImg.src)) {
        showError('Please upload or choose a valid leaf image to explore.');
        return;
      }

      // Activate 3D Holographic Scanner HUD
      if (scannerHud) {
        scannerHud.classList.add('active');
      }

      // Button loading state
      btnAnalyze.disabled = true;
      const originalText = btnAnalyze.innerHTML;
      btnAnalyze.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div>
        <span>Exploring Leaf Features...</span>
      `;

      // Simulate analysis scanning process (1.2s)
      setTimeout(() => {
        btnAnalyze.disabled = false;
        btnAnalyze.innerHTML = originalText;

        // Keep scanner subtle
        if (scannerHud) {
          scannerHud.classList.remove('active');
        }

        // Section 6.3 PRD Requirement:
        // "The button must display an educational guide message, not a fabricated disease prediction."
        // Analysis button state: “Educational Guide Ready. No AI diagnosis has been performed.”
        if (resultStatusBadge && resultMessage) {
          resultStatusBadge.textContent = 'Educational Guide Ready';
          resultStatusBadge.className = 'result-status-badge guide-ready';
          resultMessage.textContent = 'Educational Guide Ready. No AI diagnosis has been performed.';
        }

        // Display the Comprehensive Crop Care & Management Plan
        if (cropCareContainer) {
          cropCareContainer.style.display = 'flex';
          renderCropCarePlan(activeCrop);
        }

        // Show the jump button to Disease Guide
        if (guideLinkWrap) {
          guideLinkWrap.style.display = 'block';
        }

        announceToScreenReader('Educational Guide Ready. Crop care plan and recovery guide generated.');
      }, 1200);
    });
  }

  // "Clear Image" Button Click Handler
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      resetAnalyzerState();
      announceToScreenReader('Analyzer reset. Ready for a new leaf upload.');
    });
  }

  // Reset Analyzer Function
  function resetAnalyzerState() {
    // 1. Release Object URL
    revokeActiveObjectURL();
    currentFile = null;

    // 2. Reset File Input
    if (fileInput) {
      fileInput.value = '';
    }

    // 3. Reset Info Bar
    if (fileInfoBar) {
      fileInfoBar.style.display = 'none';
    }

    // 4. Hide Error
    hideError();

    // 5. Reset Preview Stage
    if (activePreviewWrap && emptyState && previewImg) {
      activePreviewWrap.style.display = 'none';
      emptyState.style.display = 'flex';
      previewImg.src = '';
      previewImg.alt = 'Selected crop leaf image preview';
    }

    // 6. Reset Scanner HUD
    if (scannerHud) {
      scannerHud.classList.remove('active');
    }

    // 7. Disable Analyze Button
    if (btnAnalyze) {
      btnAnalyze.disabled = true;
    }

    // 8. Reset Result Panel to Initial Empty State
    // "Ready to explore? Upload a leaf image to get started."
    if (resultStatusBadge && resultMessage) {
      resultStatusBadge.textContent = 'Awaiting Upload';
      resultStatusBadge.className = 'result-status-badge';
      resultMessage.textContent = 'Ready to explore? Upload a leaf image to get started.';
    }

    // 9. Hide Crop Care Container
    if (cropCareContainer) {
      cropCareContainer.style.display = 'none';
    }

    // 10. Hide Guide Link Wrap
    if (guideLinkWrap) {
      guideLinkWrap.style.display = 'none';
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Crop Care Plan Renderer & Interactive Listeners
  // ---------------------------------------------------------------------------
  function renderCropCarePlan(cropKey) {
    const data = CROP_CARE_DATABASE[cropKey] || CROP_CARE_DATABASE['general'];
    if (!data) return;

    // 1. Update Subtitle
    if (careCropSubtitle) {
      careCropSubtitle.innerHTML = `Showing recovery plan for <strong>${data.name}</strong> • Focus: <em>${data.diseaseRisk}</em>`;
    }

    // 2. Render Checklist
    if (careChecklistItems) {
      careChecklistItems.innerHTML = '';
      data.checklist.forEach((itemText, idx) => {
        const li = document.createElement('li');
        li.className = 'checklist-item';
        li.innerHTML = `
          <input type="checkbox" id="check-step-${idx}" class="check-input" aria-label="Mark step as complete">
          <span class="check-label-text">${itemText}</span>
        `;
        li.addEventListener('click', (e) => {
          if (e.target.tagName !== 'INPUT') {
            const cb = li.querySelector('.check-input');
            cb.checked = !cb.checked;
          }
          const cb = li.querySelector('.check-input');
          if (cb.checked) {
            li.classList.add('completed');
          } else {
            li.classList.remove('completed');
          }
        });
        careChecklistItems.appendChild(li);
      });
    }

    // 3. Render Treatments
    if (careTreatmentContent) {
      let treatmentHTML = '<div class="treatment-cards-list">';
      data.treatments.forEach(t => {
        treatmentHTML += `
          <div class="care-card-item">
            <h5 class="care-card-title">💊 ${t.title}</h5>
            <p class="care-card-desc">${t.desc}</p>
            <span class="care-dosage-tag">Recommended Application: ${t.dosage}</span>
          </div>
        `;
      });
      treatmentHTML += '</div>';
      careTreatmentContent.innerHTML = treatmentHTML;
    }

    // 4. Render Watering & Soil
    if (careWateringContent) {
      let wateringHTML = '<div class="watering-cards-list">';
      data.watering.forEach(w => {
        wateringHTML += `
          <div class="care-card-item">
            <h5 class="care-card-title">💧 ${w.title}</h5>
            <p class="care-card-desc">${w.desc}</p>
          </div>
        `;
      });
      wateringHTML += '</div>';
      careWateringContent.innerHTML = wateringHTML;
    }

    // 5. Render Prevention
    if (carePreventionContent) {
      let prevHTML = '<div class="prevention-cards-list">';
      data.prevention.forEach(p => {
        prevHTML += `
          <div class="care-card-item">
            <h5 class="care-card-title">🛡️ ${p.title}</h5>
            <p class="care-card-desc">${p.desc}</p>
          </div>
        `;
      });
      prevHTML += '</div>';
      carePreventionContent.innerHTML = prevHTML;
    }

    updateCropSwitcherButtons(cropKey);
  }

  function updateCropSwitcherButtons(cropKey) {
    cropSwitchButtons.forEach(btn => {
      if (btn.dataset.crop === cropKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Crop Switcher Buttons click handler
  cropSwitchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.crop;
      activeCrop = selected;
      renderCropCarePlan(activeCrop);
      announceToScreenReader(`Care plan updated for ${selected}`);
    });
  });

  // Care Navigation Tabs click handler
  careTabButtons.forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const tabTarget = tabBtn.dataset.tab;
      careTabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabBtn.classList.add('active');
      tabBtn.setAttribute('aria-selected', 'true');

      carePanels.forEach(panel => {
        if (panel.id === `panel-${tabTarget}`) {
          panel.style.display = 'block';
          panel.classList.add('active');
        } else {
          panel.style.display = 'none';
          panel.classList.remove('active');
        }
      });
    });
  });

  // Copy Care Plan to Clipboard
  if (btnCopyCare) {
    btnCopyCare.addEventListener('click', () => {
      const data = CROP_CARE_DATABASE[activeCrop] || CROP_CARE_DATABASE['general'];
      let copyText = `=== CropCare AI: ${data.name} Care & Recovery Plan ===\n`;
      copyText += `Focus: ${data.diseaseRisk}\n\n`;
      copyText += `[IMMEDIATE CHECKLIST]:\n`;
      data.checklist.forEach((item, i) => {
        copyText += `${i + 1}. ${item}\n`;
      });
      copyText += `\n[ORGANIC TREATMENTS]:\n`;
      data.treatments.forEach(t => {
        copyText += `- ${t.title}: ${t.desc} (Dosage: ${t.dosage})\n`;
      });
      copyText += `\n[WATERING & SOIL RULES]:\n`;
      data.watering.forEach(w => {
        copyText += `- ${w.title}: ${w.desc}\n`;
      });
      copyText += `\n[PREVENTION & ROTATION]:\n`;
      data.prevention.forEach(p => {
        copyText += `- ${p.title}: ${p.desc}\n`;
      });
      copyText += `\nFor localized diagnosis, consult regional agricultural extension services.`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(() => {
          showCopyToast();
        }).catch(() => {
          fallbackCopyText(copyText);
        });
      } else {
        fallbackCopyText(copyText);
      }
    });
  }

  function showCopyToast() {
    if (copyToast) {
      copyToast.style.display = 'block';
      setTimeout(() => {
        copyToast.style.display = 'none';
      }, 2500);
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showCopyToast();
  }

  // ---------------------------------------------------------------------------
  // 6. Disease Card Focus & Comparison
  // ---------------------------------------------------------------------------
  const btnJumpGuide = document.getElementById('btn-jump-guide');
  if (btnJumpGuide) {
    btnJumpGuide.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('guide');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });

        // Highlight cards with a subtle pulse
        const cards = document.querySelectorAll('.disease-card');
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.boxShadow = '0 0 25px rgba(82, 183, 136, 0.45)';
            setTimeout(() => {
              card.style.boxShadow = '';
            }, 1200);
          }, i * 150);
        });
      }
    });
  }
});
