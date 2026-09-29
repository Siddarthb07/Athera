import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.querySelector('#webgl');
if (!canvas) {
  throw new Error('Missing #webgl');
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const story = document.querySelector('[data-story]');
const copies = story ? [...story.querySelectorAll('.copy')] : [];
const hint = document.querySelector('.hint');
const page = document.body.dataset.page || 'home';

const poses = {
  home: { x: 1.55, y: 0.05, scale: 1.18, rot: 0.35 },
  services: { x: 2.45, y: 0.12, scale: 0.9, rot: 0.85 },
  about: { x: 2.35, y: 0.02, scale: 0.96, rot: -0.15 },
  work: { x: 2.4, y: -0.06, scale: 0.92, rot: 1.15 },
  contact: { x: 2.55, y: 0.16, scale: 0.72, rot: 0.2 }
};
const pose = poses[page] || poses.home;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setClearColor(0x07060b, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07060b, 0.028);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
camera.position.set(0, 0.1, 8.4);

const inner = page !== 'home';
const uniforms = {
  uTime: { value: 0.8 },
  uScroll: { value: 0 },
  uPointer: { value: new THREE.Vector2() },
  uCalm: { value: inner ? 0.22 : 1 }
};

const bg = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    uniforms,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uScroll;
      uniform vec2 uPointer;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = p * 2.02 + vec2(1.7, 9.2);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        vec2 drift = vec2(uTime * 0.045, uTime * 0.02) + uPointer * 0.08;
        float warp = fbm(uv * 2.2 + drift);
        vec2 q = uv * 1.6 + vec2(warp, warp * 0.6) + drift;
        float n = fbm(q + uScroll * 0.4);
        float band = smoothstep(0.35, 0.72, n);
        vec3 ink = vec3(0.03, 0.025, 0.02);
        vec3 gold = vec3(0.45, 0.32, 0.16);
        vec3 wine = vec3(0.28, 0.1, 0.1);
        vec3 col = mix(ink, wine, n * 0.55);
        col = mix(col, gold, band * 0.42);
        float vignette = smoothstep(1.15, 0.25, length(uv - 0.5));
        col *= mix(0.45, 1.0, vignette);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  })
);
bg.renderOrder = -2;
bg.frustumCulled = false;
scene.add(bg);

scene.add(new THREE.AmbientLight(0xfff1df, 0.35));
const key = new THREE.DirectionalLight(0xffe4bc, 2.4);
key.position.set(4, 5, 6);
scene.add(key);
const rim = new THREE.PointLight(0xc45c48, 18, 14);
rim.position.set(-2.2, -0.4, 3);
scene.add(rim);
const fill = new THREE.PointLight(0xf6f1ea, 6, 10);
fill.position.set(2.4, 1.6, 2);
scene.add(fill);

function braidCurve(phase, radius, turns) {
  const points = [];
  const steps = 160;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns + phase;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      (t - 0.5) * 3.2 + Math.sin(angle * 2.0) * 0.22,
      Math.sin(angle) * radius * 0.7
    ));
  }
  return new THREE.CatmullRomCurve3(points);
}

const ribbonMat = new THREE.ShaderMaterial({
  uniforms,
  toneMapped: false,
  transparent: true,
  vertexShader: `
    uniform float uTime;
    uniform float uScroll;
    uniform float uCalm;
    uniform vec2 uPointer;
    varying vec3 vNormal;
    varying vec3 vView;
    varying float vAlong;
    void main() {
      float along = uv.x;
      float wave = sin(along * 28.0 + uTime * 1.8 + uPointer.x * 2.0) * (0.07 + uScroll * 0.42) * uCalm;
      vec3 pos = position + normal * wave;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = -mv.xyz;
      vAlong = along;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vView;
    varying float vAlong;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 view = normalize(vView);
      float fres = pow(1.0 - max(dot(n, view), 0.0), 2.0);
      vec3 rose = vec3(0.86, 0.68, 0.42);
      vec3 wine = vec3(0.55, 0.28, 0.24);
      vec3 cream = vec3(0.97, 0.94, 0.88);
      vec3 col = mix(rose, wine, smoothstep(0.2, 0.8, vAlong));
      col = mix(col, cream, fres * 0.85);
      float alpha = mix(0.78, 1.0, fres);
      gl_FragColor = vec4(col, alpha);
    }
  `
});

const metal = new THREE.MeshPhysicalMaterial({
  color: 0xe7d3ae,
  metalness: 1,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.5
});

const braidGroup = new THREE.Group();
const signals = [];
[
  [0, 1.05, 1.45, 0.05],
  [2.2, 0.84, 1.75, 0.03],
  [4.1, 1.22, 1.15, 0.02]
].forEach(([phase, radius, turns, tube], index) => {
  const curve = braidCurve(phase, radius, turns);
  const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, tube, 16, false), ribbonMat);
  strand.userData.strand = true;
  braidGroup.add(strand);
  if (index !== 0) return;
  for (let s = 0; s < 3; s += 1) {
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xf6f1ea, toneMapped: false })
    );
    bead.userData.curve = curve;
    bead.userData.offset = s / 3;
    strand.add(bead);
    signals.push(bead);
  }
});

[-1.15, 0.05, 1.15].forEach((y, index) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.018, 20, 96), metal);
  ring.position.y = y;
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = index * 0.55;
  ring.userData.gate = true;
  ring.userData.spin = 0.15 + index * 0.05;
  braidGroup.add(ring);
});

scene.add(braidGroup);
braidGroup.visible = !inner;

function linkCurve(tilt, rx, ry) {
  const points = [];
  const steps = 96;
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    points.push(new THREE.Vector3(
      x * Math.cos(tilt),
      y,
      x * Math.sin(tilt)
    ));
  }
  return new THREE.CatmullRomCurve3(points, true);
}

const clasp = new THREE.Group();
[
  [0.15, 1.05, 0.62, 0.045],
  [1.2, 0.92, 0.7, 0.034],
  [2.25, 1.18, 0.5, 0.028]
].forEach(([tilt, rx, ry, tube], slot) => {
  const curve = linkCurve(tilt, rx, ry);
  const link = new THREE.Mesh(new THREE.TubeGeometry(curve, 140, tube, 12, true), ribbonMat);
  link.userData.link = true;
  link.userData.slot = slot;
  link.userData.curve = curve;
  clasp.add(link);
});

const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 16), metal);
clasp.add(pin);
const claspBead = new THREE.Mesh(
  new THREE.SphereGeometry(0.042, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xf6f1ea, toneMapped: false })
);
claspBead.userData.curve = clasp.children[0].userData.curve;
clasp.add(claspBead);
clasp.visible = inner;
clasp.position.set(pose.x, pose.y, 0);
scene.add(clasp);

const deck = new THREE.Group();
[0xc6a36a, 0xe4d2b0, 0xf6f1ea].forEach((color, index) => {
  const card = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.018, 0.62),
    new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.95,
      roughness: 0.18,
      clearcoat: 0.8,
      envMapIntensity: 1.3
    })
  );
  card.position.y = index * 0.03;
  deck.add(card);
});
deck.position.set(pose.x, -2.15, 0.2);
deck.rotation.x = -0.4;
deck.visible = !inner;
scene.add(deck);

let pointerX = 0;
let pointerY = 0;
let easeX = 0;
let easeY = 0;
let progress = 0;
let clock = 0.8;

window.addEventListener('pointermove', (event) => {
  pointerX = (event.clientX / window.innerWidth) * 2 - 1;
  pointerY = (event.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

function smooth(edge0, edge1, value) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function storyProgress() {
  if (story) {
    const total = story.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    const scrolled = Math.min(total, Math.max(0, -story.getBoundingClientRect().top));
    return scrolled / total;
  }
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / total));
}

function showCopy(index) {
  copies.forEach((node, i) => {
    const on = i === index;
    node.classList.toggle('is-on', on);
    node.setAttribute('aria-hidden', on ? 'false' : 'true');
  });
  if (hint) hint.classList.toggle('is-gone', index > 0);
}

function apply(p, ix, iy) {
  const wide = window.innerWidth > 860;
  uniforms.uScroll.value = p;
  uniforms.uPointer.value.set(inner ? ix * 0.25 : ix, iy);

  if (inner) {
    const settle = reduce ? 1 : Math.min(1, p / 0.82);
    const open = 1 - settle;
    clasp.position.x = wide ? pose.x + ix * 0.04 : 0.15;
    clasp.position.y = 1.12 * open + pose.y * settle;
    clasp.rotation.y = pose.rot - open * 0.95;
    clasp.rotation.x = 0.18 * open;
    clasp.rotation.z = open * 0.08;
    clasp.scale.setScalar((wide ? pose.scale : 0.55) * (0.94 + 0.06 * settle));
    clasp.children.forEach((child) => {
      if (!child.userData.link) return;
      const slot = child.userData.slot - 1;
      child.position.y = slot * open * 0.46;
      child.rotation.z = slot * open * 0.16;
    });
    claspBead.position.copy(claspBead.userData.curve.getPointAt(Math.min(0.999, settle)));
    camera.position.set(0.04, 0.04, 8.5);
    camera.lookAt(0.18, -0.22 * open, 0);
    document.documentElement.style.setProperty('--scroll-p', p.toFixed(4));
    return;
  }

  const orbit = p * Math.PI * 1.2;
  const idle = reduce ? 0 : clock * 0.12;
  braidGroup.position.x = wide ? pose.x + ix * 0.18 : 0.15;
  braidGroup.position.y = pose.y + Math.sin(orbit) * 0.28 - iy * 0.12;
  braidGroup.scale.setScalar(wide ? pose.scale + Math.sin(p * Math.PI) * 0.12 : 0.58);
  braidGroup.rotation.y = pose.rot + idle + orbit + ix * 0.4;
  braidGroup.rotation.x = -0.22 + Math.sin(orbit * 0.5) * 0.28 - iy * 0.2;
  braidGroup.rotation.z = Math.sin(orbit) * 0.12;

  braidGroup.children.forEach((child, index) => {
    if (child.userData.strand) {
      const side = index - 1;
      const peel = Math.sin(p * Math.PI);
      child.position.x = side * peel * 0.42;
      child.position.z = side * peel * 0.28;
      child.rotation.y = side * p * 1.4;
      return;
    }
    if (child.userData.gate && !reduce) {
      child.rotation.z += 0.002 * child.userData.spin * 8;
    }
  });

  signals.forEach((bead) => {
    const t = (clock * 0.04 + bead.userData.offset) % 1;
    bead.position.copy(bead.userData.curve.getPointAt(t));
    const pulse = 0.85 + Math.sin((clock + bead.userData.offset * 8) * 3) * 0.15;
    bead.scale.setScalar(reduce ? 1 : pulse);
  });

  const open = Math.sin(p * Math.PI);
  deck.position.set(
    wide ? pose.x + 0.2 : 0,
    -2.05 + open * 0.25,
    0.2
  );
  deck.children.forEach((card, index) => {
    const side = index - 1;
    card.position.x = side * open * 0.34;
    card.position.z = Math.abs(side) * open * 0.12;
    card.rotation.y = side * open * 0.28;
  });

  camera.position.x = Math.sin(orbit * 0.5) * 0.35 + ix * 0.2;
  camera.position.y = 0.12 + Math.sin(p * Math.PI) * 0.35;
  camera.position.z = 8.5 - Math.sin(p * Math.PI) * 1.1;
  camera.lookAt(wide ? 0.35 : 0, braidGroup.position.y * 0.25, 0);

  if (story) showCopy(p < 0.26 ? 0 : p < 0.52 ? 1 : p < 0.76 ? 2 : 3);
  document.documentElement.style.setProperty('--scroll-p', p.toFixed(4));
}

function tick() {
  const target = storyProgress();
  progress += (target - progress) * (reduce ? 1 : 0.075);
  easeX += (pointerX - easeX) * (reduce ? 1 : 0.08);
  easeY += (pointerY - easeY) * (reduce ? 1 : 0.08);
  if (!reduce) clock += inner ? 0.007 : 0.016;
  uniforms.uTime.value = clock;
  apply(progress, easeX, easeY);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

resize();
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) resize();
});
if (story) showCopy(0);
tick();
