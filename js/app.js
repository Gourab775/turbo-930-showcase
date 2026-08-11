import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// ── CONFIG ──────────────────────────────────────
const MODEL_PATH = './assets/free_porsche_911_carrera_4s.glb';
const HDR_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/evening_road_01_1k.hdr';
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
const LERP_SPEED = 0.06;
const LERP_SPEED_CAM = 0.055;

// ── NAV ─────────────────────────────────────────
window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('nav-right').classList.remove('mobile-open');
  document.getElementById('hamburger').classList.remove('open');
};

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('nav-right').classList.toggle('mobile-open');
  document.getElementById('hamburger').classList.toggle('open');
});

// ── RENDERER ────────────────────────────────────
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.5, 3.4);
camera.lookAt(0, 0.1, 0);

// ── LIGHTS ──────────────────────────────────────
const rimLight = new THREE.DirectionalLight(0xff4500, 0.0);
rimLight.position.set(-4, 1.5, -5);
scene.add(rimLight);

const keyLight = new THREE.DirectionalLight(0xff9500, 1.0);
keyLight.position.set(8, 14, 8);
const keyLightTarget = new THREE.Object3D();
scene.add(keyLightTarget);
keyLight.target = keyLightTarget;
scene.add(keyLight);

// ── HDR ─────────────────────────────────────────
function loadHDR() {
  new RGBELoader().load(HDR_URL, (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = tex;
    applySceneValues();
  });
}

// ── MODEL ───────────────────────────────────────
let car = null;
let carLoaded = false;

loadHDR();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(DRACO_PATH);
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(MODEL_PATH, (gltf) => {
  car = gltf.scene;
  const box = new THREE.Box3().setFromObject(car);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 4.4 / maxDim;
  car.scale.setScalar(scale);
  car.position.x = -center.x * scale;
  car.position.y = -center.y * scale - 0.75;
  car.position.z = -center.z * scale;

  car.traverse(child => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(m => { m.envMapIntensity = sceneValues.hdrIntensity; });
    }
  });

  scene.add(car);
  carLoaded = true;
});

// ── KEYFRAMES ───────────────────────────────────
const sectionNames = ['Hero', 'Overview', 'Specs', 'Features', 'Quote', 'CTA'];
let activeTabIdx = 0;

const defaultKeyframes = [
  { x: -0.78, z: 0.0, cx: -2.61, cy: -0.29, cz: 2.3, lx: -0.7, ly: -0.97, lz: 0.29, fov: 45, yaw: 0.0 },
  { x: 1.96,  z: 0.0, cx: 0.22,  cy: 0.02,  cz: 4.55, lx: 2.37, ly: -0.82, lz: -0.28, fov: 18.5, yaw: -2.242 },
  { x: -2.05, z: 0.0, cx: -3.49, cy: -0.39, cz: 2.8, lx: -0.4, ly: -1.33, lz: -0.78, fov: 37, yaw: 0.008 },
  { x: -0.06, z: -0.48, cx: 0.0, cy: 6.5, cz: 0.3, lx: 0.0, ly: 0.0, lz: 0.0, fov: 20, yaw: 1.558 },
  { x: 0.0,   z: 0.0, cx: -0.03, cy: 0.81, cz: 3.1, lx: 0.0, ly: -0.81, lz: 0.99, fov: 32.5, yaw: 0.0 },
  { x: -0.5,  z: -0.2, cx: 3.87, cy: 0.07, cz: 5.05, lx: -0.07, ly: -0.82, lz: 0.84, fov: 18.5, yaw: 0.0 },
];

const keyframes = defaultKeyframes.map(k => ({ ...k }));

// ── CAMERA CONTROLS UI ──────────────────────────
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const tabsEl = document.getElementById('settings-tabs');
const bodyEl = document.getElementById('settings-body');

const sceneToggleBtn = document.getElementById('scene-toggle');
const scenePanel = document.getElementById('scene-panel');
const sideToggles = document.getElementById('side-toggles');

sceneToggleBtn.addEventListener('click', () => {
  const isOpen = scenePanel.classList.contains('open');
  if (isOpen) {
    scenePanel.classList.remove('open');
    sceneToggleBtn.classList.remove('active-panel');
    sideToggles.classList.remove('open');
  } else {
    scenePanel.classList.add('open');
    sceneToggleBtn.classList.add('active-panel');
    sideToggles.classList.add('open');
    settingsPanel.classList.remove('open');
    settingsToggle.classList.remove('active-panel');
  }
});

settingsToggle.addEventListener('click', () => {
  const isOpen = settingsPanel.classList.contains('open');
  if (isOpen) {
    settingsPanel.classList.remove('open');
    settingsToggle.classList.remove('active-panel');
    sideToggles.classList.remove('open');
  } else {
    settingsPanel.classList.add('open');
    settingsToggle.classList.add('active-panel');
    sideToggles.classList.add('open');
    scenePanel.classList.remove('open');
    sceneToggleBtn.classList.remove('active-panel');
  }
});

const controls = [
  { key: 'x',   label: 'Car X Position', min: -10, max: 10,  step: 0.01 },
  { key: 'z',   label: 'Car Z Position', min: -10, max: 10,  step: 0.01 },
  { key: 'cx',  label: 'Camera X',       min: -10, max: 10,  step: 0.01 },
  { key: 'cy',  label: 'Camera Y',       min: -5,  max: 10,  step: 0.01 },
  { key: 'cz',  label: 'Camera Z',       min: -5,  max: 20,  step: 0.05 },
  { key: 'lx',  label: 'Look-At X',      min: -10, max: 10,  step: 0.01 },
  { key: 'ly',  label: 'Look-At Y',      min: -5,  max: 10,  step: 0.01 },
  { key: 'lz',  label: 'Look-At Z',      min: -10, max: 10,  step: 0.01 },
  { key: 'fov', label: 'FOV / Zoom',     min: 10,  max: 120, step: 0.5 },
  { key: 'yaw', label: 'Orbit Yaw',      min: -Math.PI, max: Math.PI, step: 0.01 },
];

function buildTabs() {
  tabsEl.innerHTML = '';
  sectionNames.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i === activeTabIdx ? ' active' : '');
    btn.textContent = name;
    btn.addEventListener('click', () => {
      activeTabIdx = i;
      buildTabs();
      buildControls();
      const tops = Array.from(sections).map(s => s.offsetTop);
      window.scrollTo({ top: tops[i] + 10, behavior: 'smooth' });
    });
    tabsEl.appendChild(btn);
  });
}

function buildControls() {
  bodyEl.innerHTML = '';
  const kf = keyframes[activeTabIdx];

  const badge = document.createElement('div');
  badge.className = 'section-name-badge';
  badge.textContent = sectionNames[activeTabIdx];
  bodyEl.appendChild(badge);

  controls.forEach(ctrl => {
    const group = document.createElement('div');
    group.className = 'ctrl-group';

    const lbl = document.createElement('label');
    lbl.className = 'ctrl-label';
    lbl.innerHTML = `${ctrl.label} <span id="val-${ctrl.key}">${kf[ctrl.key].toFixed(2)}</span>`;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'ctrl-slider';
    slider.min = ctrl.min;
    slider.max = ctrl.max;
    slider.step = ctrl.step;
    slider.value = kf[ctrl.key];
    slider.id = `slider-${ctrl.key}`;

    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      keyframes[activeTabIdx][ctrl.key] = val;
      document.getElementById(`val-${ctrl.key}`).textContent = val.toFixed(2);
    });

    group.appendChild(lbl);
    group.appendChild(slider);
    bodyEl.appendChild(group);
  });
}

document.getElementById('btn-reset').addEventListener('click', () => {
  keyframes[activeTabIdx] = { ...defaultKeyframes[activeTabIdx] };
  buildControls();
});

document.getElementById('btn-copy').addEventListener('click', () => {
  const kf = keyframes[activeTabIdx];
  const out = JSON.stringify({
    x: +kf.x.toFixed(3), z: +kf.z.toFixed(3),
    cx: +kf.cx.toFixed(3), cy: +kf.cy.toFixed(3), cz: +kf.cz.toFixed(3),
    lx: +kf.lx.toFixed(3), ly: +kf.ly.toFixed(3), lz: +kf.lz.toFixed(3),
    fov: +kf.fov.toFixed(1), yaw: +kf.yaw.toFixed(3),
  }, null, 2);
  navigator.clipboard.writeText(out).catch(() => {});
  const btn = document.getElementById('btn-copy');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy Values', 1500);
});

buildTabs();
buildControls();

// ── SCENE SETTINGS ──────────────────────────────
const sceneDefaults = {
  exposure: 3.0, keyIntensity: 1.0,
  keyColorR: 255, keyColorG: 149, keyColorB: 0,
  rimIntensity: 0.0,
  rimColorR: 255, rimColorG: 69, rimColorB: 0,
  hdrIntensity: 1.19, envRotation: 0.0,
};

let sceneValues = { ...sceneDefaults };

const sceneControls = [
  { section: 'Renderer', controls: [
    { key: 'exposure', label: 'Tone Map Exposure', min: 0.1, max: 3.0, step: 0.01 },
  ]},
  { section: 'Key Light', controls: [
    { key: 'keyIntensity', label: 'Intensity', min: 0, max: 5.0, step: 0.01 },
    { key: 'keyColorR', label: 'Color R', min: 0, max: 255, step: 1 },
    { key: 'keyColorG', label: 'Color G', min: 0, max: 255, step: 1 },
    { key: 'keyColorB', label: 'Color B', min: 0, max: 255, step: 1 },
  ]},
  { section: 'Rim Light', controls: [
    { key: 'rimIntensity', label: 'Intensity', min: 0, max: 5.0, step: 0.01 },
    { key: 'rimColorR', label: 'Color R', min: 0, max: 255, step: 1 },
    { key: 'rimColorG', label: 'Color G', min: 0, max: 255, step: 1 },
    { key: 'rimColorB', label: 'Color B', min: 0, max: 255, step: 1 },
  ]},
  { section: 'HDR Environment', controls: [
    { key: 'hdrIntensity', label: 'Env Map Intensity', min: 0, max: 5.0, step: 0.01 },
    { key: 'envRotation', label: 'Env Rotation', min: 0, max: Math.PI * 2, step: 0.01 },
  ]},
];

function applySceneValues() {
  renderer.toneMappingExposure = sceneValues.exposure;
  keyLight.intensity = sceneValues.keyIntensity;
  keyLight.color.setRGB(sceneValues.keyColorR / 255, sceneValues.keyColorG / 255, sceneValues.keyColorB / 255);
  rimLight.intensity = sceneValues.rimIntensity;
  rimLight.color.setRGB(sceneValues.rimColorR / 255, sceneValues.rimColorG / 255, sceneValues.rimColorB / 255);

  if (scene.environment) scene.environment.rotation = sceneValues.envRotation;
  if (car) {
    car.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => { if (m.envMapIntensity !== undefined) m.envMapIntensity = sceneValues.hdrIntensity; });
      }
    });
  }
}

function buildSceneControls() {
  const body = document.getElementById('scene-body');
  body.innerHTML = '';
  sceneControls.forEach(group => {
    const secBadge = document.createElement('div');
    secBadge.className = 'section-name-badge';
    secBadge.textContent = group.section;
    body.appendChild(secBadge);

    group.controls.forEach(ctrl => {
      const grp = document.createElement('div');
      grp.className = 'ctrl-group';
      const lbl = document.createElement('label');
      lbl.className = 'ctrl-label';
      lbl.innerHTML = `${ctrl.label} <span id="sv-${ctrl.key}">${(+sceneValues[ctrl.key]).toFixed(ctrl.step < 0.01 ? 4 : 2)}</span>`;
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'ctrl-slider';
      slider.min = ctrl.min;
      slider.max = ctrl.max;
      slider.step = ctrl.step;
      slider.value = sceneValues[ctrl.key];

      if (ctrl.key.endsWith('R') || ctrl.key.endsWith('G') || ctrl.key.endsWith('B')) {
        slider.style.accentColor = '#' + ['R','G','B'].map(c => {
          const base = ctrl.key.slice(0, -1);
          return Math.round(sceneValues[base + c]).toString(16).padStart(2,'0');
        }).join('');
      }

      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        sceneValues[ctrl.key] = val;
        document.getElementById(`sv-${ctrl.key}`).textContent = val.toFixed(ctrl.step < 0.01 ? 4 : 2);
        applySceneValues();
      });

      grp.appendChild(lbl);
      grp.appendChild(slider);
      body.appendChild(grp);
    });
  });
}

buildSceneControls();
applySceneValues();

document.getElementById('btn-scene-reset').addEventListener('click', () => {
  sceneValues = { ...sceneDefaults };
  applySceneValues();
  buildSceneControls();
});

document.getElementById('btn-scene-export').addEventListener('click', () => {
  navigator.clipboard.writeText(JSON.stringify(sceneValues, null, 2)).catch(() => {});
  const btn = document.getElementById('btn-scene-export');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy Values', 1500);
});

// ── SCROLL & ANIMATION ──────────────────────────
function syncTabToSection(idx) {
  if (idx !== activeTabIdx) {
    activeTabIdx = idx;
    buildTabs();
    buildControls();
  }
}

const sections = document.querySelectorAll('.section');
let scrollY = 0;
let targetX = 0, currentX = 0;
let targetZ = 0, currentZ = 0;
let currentCX = -2.61, currentCY = -0.29, currentCZ = 2.3;
let targetCX = -2.61, targetCY = -0.29, targetCZ = 2.3;
let currentLX = -0.7, currentLY = -0.97, currentLZ = 0.29;
let targetLX = -0.7, targetLY = -0.97, targetLZ = 0.29;
let currentFOV = 45, targetFOV = 45;
let dragYaw = 0, targetDragYaw = 0;

const progressBar = document.getElementById('progress-bar');
const navLinks = document.querySelectorAll('[data-nav-section]');
const sectionIds = ['section-hero','section-overview','section-specs','section-features','section-quote','section-cta'];

function updateNavHighlight() {
  const mid = window.innerHeight * 0.45;
  let current = sectionIds[0];
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= mid) current = id;
  }
  navLinks.forEach(a => a.classList.toggle('nav-active', a.dataset.navSection === current));
}

function lerp(a, b, t) { return a + (b - a) * t; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

window.addEventListener('scroll', () => { scrollY = window.scrollY; updateNavHighlight(); }, { passive: true });
updateNavHighlight();

function getSectionScrollData() {
  const tops = Array.from(sections).map(s => s.offsetTop);
  const bottoms = tops.map((t, i) => i < tops.length - 1 ? tops[i + 1] : document.body.scrollHeight);
  for (let i = 0; i < tops.length - 1; i++) {
    if (scrollY < bottoms[i]) {
      const segLen = bottoms[i] - tops[i];
      const segProgress = Math.max(0, scrollY - tops[i]);
      const t = segLen > 0 ? Math.min(segProgress / segLen, 1) : 0;
      return { sectionIdx: i, sectionT: easeOutCubic(t), sectionProgress: i + t };
    }
  }
  return { sectionIdx: tops.length - 1, sectionT: 1, sectionProgress: tops.length - 1 };
}

function tick() {
  requestAnimationFrame(tick);

  const totalHeight = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (Math.min(scrollY / totalHeight, 1) * 100) + '%';

  const { sectionIdx, sectionT, sectionProgress } = getSectionScrollData();
  const clampedIdx = Math.min(sectionIdx, keyframes.length - 1);
  const kA = keyframes[clampedIdx];
  const kB = keyframes[Math.min(clampedIdx + 1, keyframes.length - 1)];

  targetX = lerp(kA.x, kB.x, sectionT);
  targetZ = lerp(kA.z, kB.z, sectionT);
  targetCX = lerp(kA.cx, kB.cx, sectionT);
  targetCY = lerp(kA.cy, kB.cy, sectionT);
  targetCZ = lerp(kA.cz, kB.cz, sectionT);
  targetLX = lerp(kA.lx, kB.lx, sectionT);
  targetLY = lerp(kA.ly, kB.ly, sectionT);
  targetLZ = lerp(kA.lz, kB.lz, sectionT);
  targetFOV = lerp(kA.fov, kB.fov, sectionT);
  targetDragYaw = lerp(kA.yaw, kB.yaw, sectionT);

  const activeDot = Math.round(sectionProgress);
  if (settingsPanel.classList.contains('open')) syncTabToSection(activeDot);

  if (car) {
    currentX = lerp(currentX, targetX, LERP_SPEED);
    currentZ = lerp(currentZ, targetZ, LERP_SPEED);
    car.position.x = currentX;
    car.position.z = currentZ;
  }

  currentCX = lerp(currentCX, targetCX, LERP_SPEED_CAM);
  currentCY = lerp(currentCY, targetCY, LERP_SPEED_CAM);
  currentCZ = lerp(currentCZ, targetCZ, LERP_SPEED_CAM);
  currentLX = lerp(currentLX, targetLX, LERP_SPEED_CAM);
  currentLY = lerp(currentLY, targetLY, LERP_SPEED_CAM);
  currentLZ = lerp(currentLZ, targetLZ, LERP_SPEED_CAM);
  currentFOV = lerp(currentFOV, targetFOV, LERP_SPEED_CAM);
  camera.fov = currentFOV;
  camera.updateProjectionMatrix();

  dragYaw = lerp(dragYaw, targetDragYaw, LERP_SPEED_CAM);
  const lookAt = new THREE.Vector3(currentLX, currentLY, currentLZ);
  const baseOffset = new THREE.Vector3(currentCX - currentLX, currentCY - currentLY, currentCZ - currentLZ);
  const rotatedOffset = baseOffset.clone().applyMatrix4(new THREE.Matrix4().makeRotationY(dragYaw));
  camera.position.copy(lookAt.clone().add(rotatedOffset));
  camera.lookAt(lookAt);

  const lightRadius = 12;
  const LIGHT_ANGLE = Math.PI * 0.18;
  keyLight.position.set(currentX + Math.sin(LIGHT_ANGLE) * lightRadius, 14, currentZ + Math.cos(LIGHT_ANGLE) * lightRadius);
  keyLightTarget.position.set(currentX, 0, currentZ);
  keyLightTarget.updateMatrixWorld();
  rimLight.position.set(currentX - 4, 3.5, currentZ - 5);

  renderer.render(scene, camera);
}

tick();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
