import * as THREE from 'three';

const canvas = document.querySelector('#webgl');
if (!canvas) {
  throw new Error('Missing #webgl');
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const story = document.querySelector('[data-story]');
const copies = story ? [...story.querySelectorAll('.copy')] : [];
const hint = document.querySelector('.hint');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setClearColor(0x07060b, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07060b, 0.045);
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
camera.position.set(0, 0.1, 8.2);

const uniforms = {
  uTime: { value: 0.8 },
  uScroll: { value: 0 },
  uPointer: { value: new THREE.Vector2() }
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

const field = new THREE.Group();
scene.add(field);
const streaks = [];
const streakGeo = new THREE.BoxGeometry(0.012, 1, 0.012);
const streakColors = [0xe4d2b0, 0xc6a36a, 0xf6f1ea, 0x8d6a45];

for (let i = 0; i < 48; i += 1) {
  const mat = new THREE.MeshBasicMaterial({
    color: streakColors[i % streakColors.length],
    transparent: true,
    opacity: 0.22 + (i % 5) * 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });
  const streak = new THREE.Mesh(streakGeo, mat);
  streak.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, -1.5 - Math.random() * 9);
  streak.scale.y = 0.45 + Math.random() * 1.4;
  streak.rotation.z = (Math.random() - 0.5) * 0.6;
  streak.userData.speed = 0.25 + Math.random() * 0.55;
  streak.userData.drift = (Math.random() - 0.5) * 0.15;
  field.add(streak);
  streaks.push(streak);
}

function braid(phase, radius, turns, tube) {
  const points = [];
  const steps = 140;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns + phase;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      (t - 0.5) * 2.6 + Math.sin(angle * 2.0) * 0.28,
      Math.sin(angle) * radius * 0.66
    ));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 180, tube, 18, false);
}

const ribbonMat = new THREE.ShaderMaterial({
  uniforms,
  toneMapped: false,
  vertexShader: `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uPointer;
    varying vec3 vNormal;
    varying vec3 vView;
    varying float vAlong;
    void main() {
      float along = uv.x;
      float wave = sin(along * 28.0 + uTime * 1.8 + uPointer.x * 2.0) * (0.07 + uScroll * 0.42);
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
      vec3 violet = vec3(0.55, 0.28, 0.24);
      vec3 cream = vec3(0.97, 0.94, 0.88);
      vec3 col = mix(rose, violet, smoothstep(0.2, 0.8, vAlong));
      col = mix(col, cream, fres * 0.85);
      float alpha = mix(0.72, 1.0, fres);
      gl_FragColor = vec4(col, alpha);
    }
  `,
  transparent: true
});

const braidGroup = new THREE.Group();
[
  [0, 1.15, 1.35, 0.055],
  [2.2, 0.92, 1.7, 0.032],
  [4.1, 1.32, 1.1, 0.022]
].forEach(([phase, radius, turns, tube]) => {
  const mesh = new THREE.Mesh(braid(phase, radius, turns, tube), ribbonMat);
  braidGroup.add(mesh);
});
scene.add(braidGroup);

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
  if (!story) return 0;
  const total = story.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  const scrolled = Math.min(total, Math.max(0, -story.getBoundingClientRect().top));
  return scrolled / total;
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
  uniforms.uPointer.value.set(ix, iy);

  const orbit = p * Math.PI * 1.35;
  braidGroup.position.x = wide ? 1.15 : 0;
  braidGroup.position.y = Math.sin(orbit) * 0.35;
  braidGroup.scale.setScalar(wide ? 1.05 + Math.sin(p * Math.PI) * 0.28 : 0.62);
  braidGroup.rotation.y = orbit + ix * 0.45;
  braidGroup.rotation.x = -0.25 + Math.sin(orbit * 0.5) * 0.35 - iy * 0.22;
  braidGroup.rotation.z = Math.sin(orbit) * 0.18 + ix * 0.06;

  braidGroup.children.forEach((strand, index) => {
    const side = index - 1;
    const peel = Math.sin(p * Math.PI);
    strand.position.x = side * peel * 0.55;
    strand.position.z = side * peel * 0.35;
    strand.rotation.y = side * p * 1.8;
    strand.rotation.z = side * peel * 0.4;
  });

  field.rotation.y = ix * 0.22 + p * 1.1;
  field.rotation.x = iy * 0.12 + Math.sin(orbit) * 0.08;
  field.position.z = -0.4 - p * 1.2;

  camera.position.x = Math.sin(orbit * 0.5) * 0.7 + ix * 0.25;
  camera.position.y = 0.15 + Math.sin(p * Math.PI) * 0.55;
  camera.position.z = 8.6 - Math.sin(p * Math.PI) * 1.8;
  camera.lookAt(braidGroup.position.x * 0.35, braidGroup.position.y, 0);

  if (story) showCopy(p < 0.26 ? 0 : p < 0.52 ? 1 : p < 0.76 ? 2 : 3);
  document.documentElement.style.setProperty('--scroll-p', p.toFixed(4));
}

function tick() {
  const target = storyProgress();
  const follow = reduce ? 1 : 0.075;
  progress += (target - progress) * follow;
  easeX += (pointerX - easeX) * (reduce ? 1 : 0.08);
  easeY += (pointerY - easeY) * (reduce ? 1 : 0.08);

  if (!reduce) {
    clock += 0.016;
    streaks.forEach((streak) => {
      streak.position.y += streak.userData.speed * 0.012 * (1 + uniforms.uScroll.value);
      streak.position.x += streak.userData.drift * 0.01;
      if (streak.position.y > 6) streak.position.y = -6;
    });
  }

  uniforms.uTime.value = clock;
  apply(story ? progress : 0, easeX, easeY);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

resize();
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) resize();
});
showCopy(0);
tick();
