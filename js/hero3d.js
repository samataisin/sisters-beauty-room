// 3D-Hero: flüssige Perle mit Goldring und Goldstaub (Three.js, ohne externe Modelle).
// Leistung: begrenzte Pixeldichte, weniger Geometrie auf dem Handy,
// Rendering pausiert, wenn der Hero nicht sichtbar oder der Tab im Hintergrund ist.
import * as THREE from "../vendor/three.module.min.js";

// Simplex-Noise 3D von Ashima Arts / Stefan Gustavson (MIT-Lizenz)
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const blobVertex = /* glsl */ `
uniform float uTime; uniform float uAmp; uniform float uFreq;
varying vec3 vNormal; varying vec3 vViewPos; varying float vNoise;
${NOISE}
float disp(vec3 p){ return snoise(p*uFreq + vec3(0.0, uTime*0.22, uTime*0.12)) * uAmp
                         + snoise(p*uFreq*2.1 - uTime*0.15) * uAmp * 0.12; }
void main(){
  vec3 p = position;
  float d = disp(p);
  vec3 displaced = p + normal * d;
  // Normale per Nachbarpunkten neu berechnen, damit das Licht der Verformung folgt
  vec3 t = normalize(cross(normal, abs(normal.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
  vec3 b = normalize(cross(normal, t));
  float e = 0.01;
  vec3 pt = p + t*e; vec3 pb = p + b*e;
  vec3 dt = pt + normalize(pt) * disp(pt);
  vec3 db = pb + normalize(pb) * disp(pb);
  vec3 n = normalize(cross(dt - displaced, db - displaced));
  if (dot(n, normal) < 0.0) n = -n;
  vNoise = d;
  vNormal = normalize(normalMatrix * n);
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const blobFragment = /* glsl */ `
uniform float uTime;
varying vec3 vNormal; varying vec3 vViewPos; varying float vNoise;
void main(){
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);

  vec3 cream = vec3(0.985, 0.955, 0.915);
  vec3 rose  = vec3(0.925, 0.780, 0.735);
  vec3 gold  = vec3(0.800, 0.640, 0.420);
  vec3 pearl = vec3(0.880, 0.880, 0.940);

  // Grundfarbe: Creme nach Rosé, je nach Ausrichtung und Verformung
  vec3 col = mix(cream, rose, smoothstep(-0.6, 0.9, n.x * 0.6 - n.y * 0.5 + vNoise * 2.0));
  // Perlmutt-Schimmer
  float iri = 0.5 + 0.5 * sin(fres * 7.0 + vNoise * 9.0 + uTime * 0.4);
  col = mix(col, pearl, iri * fres * 0.55);

  // Weiches Licht von oben links + Glanzpunkt
  vec3 L = normalize(vec3(-0.6, 0.8, 0.7));
  float diff = max(dot(n, L), 0.0);
  vec3 H = normalize(L + v);
  float spec = pow(max(dot(n, H), 0.0), 60.0);
  col *= 0.78 + 0.32 * diff;
  col += spec * 0.55;

  // Goldener Rand
  col = mix(col, gold, fres * 0.75);
  gl_FragColor = vec4(col, 1.0);
}`;

const dustVertex = /* glsl */ `
uniform float uTime; uniform float uPixelRatio;
attribute float aSize; attribute float aSeed;
varying float vAlpha;
void main(){
  vec3 p = position;
  p.y += mod(uTime * 0.06 * (0.4 + aSeed) + aSeed * 10.0, 6.0) - 3.0;
  p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.08;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z);
  vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.2 + aSeed * 40.0));
  gl_Position = projectionMatrix * mv;
}`;

const dustFragment = /* glsl */ `
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(0.79, 0.62, 0.40, a * vAlpha * 0.9);
}`;

export function initHero3D(canvas, { reducedMotion = false } = {}) {
  const isSmall = window.matchMedia("(max-width: 860px)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    console.warn("WebGL nicht verfügbar, zeige statischen Hintergrund.", err);
    return null;
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 1.6);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  const group = new THREE.Group();
  scene.add(group);

  // Perle
  const blobUniforms = { uTime: { value: 0 }, uAmp: { value: 0.14 }, uFreq: { value: 0.75 } };
  const blob = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, isSmall ? 28 : 60),
    new THREE.ShaderMaterial({ vertexShader: blobVertex, fragmentShader: blobFragment, uniforms: blobUniforms })
  );
  group.add(blob);

  // Zwei feine Goldringe
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xb8915e, transparent: true, opacity: 0.75 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.006, 8, 220), ringMat);
  ring1.rotation.set(1.25, 0.2, 0.3);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.004, 8, 220), ringMat.clone());
  ring2.material.opacity = 0.4;
  ring2.rotation.set(1.6, -0.45, 0.1);
  group.add(ring1, ring2);

  // Goldstaub
  const count = isSmall ? 160 : 420;
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 1.6 + Math.random() * 2.6;
    const th = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(th) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    pos[i * 3 + 2] = Math.sin(th) * r - 1.0;
    size[i] = 2 + Math.random() * 5;
    seed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const dustUniforms = { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } };
  const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
    vertexShader: dustVertex, fragmentShader: dustFragment, uniforms: dustUniforms,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending
  }));
  scene.add(dust);

  // Layout: Desktop rechts neben dem Text, Handy oben mittig
  const base = { x: 0, y: 0, s: 1 };
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Sichtbare halbe Breite in Höhe der Perle (Kamera-Abstand 6, FOV 35°)
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * camera.aspect;
    if (w < 860) { base.x = 0; base.y = halfH * 0.52; base.s = 0.54; }
    else { base.x = halfW * 0.56; base.y = 0.05; base.s = 0.86; }
    // setSize leert die Zeichenfläche: ohne laufende Schleife sofort neu zeichnen
    if (!running) frame();
  }

  // Maus
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // Scroll-Fortschritt (0 = oben, 1 = Hero verlassen), kommt aus main.js
  let scroll = 0;

  const clock = new THREE.Clock();
  let running = true, rafId = 0;

  let t = 0;
  function frame() {
    t += Math.min(clock.getDelta(), 0.05); // nach Pausen kein Zeitsprung
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    blobUniforms.uTime.value = t;
    blobUniforms.uAmp.value = 0.14 + scroll * 0.22;
    dustUniforms.uTime.value = t;

    group.position.set(base.x - scroll * 0.4, base.y + scroll * 1.2, 0);
    group.scale.setScalar(base.s * (1 - scroll * 0.25));
    group.rotation.y = t * 0.12 + mouse.x * 0.35;
    group.rotation.x = mouse.y * 0.25 + scroll * 0.6;
    ring1.rotation.z = t * 0.18;
    ring2.rotation.z = -t * 0.12;
    dust.rotation.y = t * 0.02 + mouse.x * 0.08;

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    frame();
    rafId = requestAnimationFrame(loop);
  }

  function start() { if (!running && !reducedMotion) { running = true; clock.getDelta(); loop(); } }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  if (reducedMotion) running = false;
  layout(); // zeichnet bei reduzierter Bewegung das Standbild
  window.addEventListener("resize", layout);
  if (!reducedMotion) loop();

  // Pausieren, wenn unsichtbar
  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 });
  io.observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  return {
    setScroll(p) { scroll = p; if (reducedMotion) frame(); }
  };
}
