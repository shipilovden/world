import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function splashSettings() {
  const container = document.getElementById("splash-container");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.enablePan = false;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const rippleShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0.0 },
      amplitude: { value: 0.02 },
      frequency: { value: 10.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float amplitude;
      uniform float frequency;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        float ripple = sin(uv.y * frequency + time) * amplitude;
        uv.x += ripple;
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    `,
  };

  const ripplePass = new ShaderPass(rippleShader);
  composer.addPass(ripplePass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    1,
    0.15
  );
  composer.addPass(bloomPass);

  const uniforms = {
    time: { value: 1.0 },
    color1: { value: new THREE.Color(0x00ffff) },
    color2: { value: new THREE.Color(0xff00ff) },
    color3: { value: new THREE.Color(0xffffff) },
    opacity: { value: 0.7 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      uniform float opacity;
      void main() {
        vec2 uv = vUv;
        vec3 color = mix(color1, color2, uv.x + sin(time));
        color = mix(color, color3, uv.y + cos(time));
        gl_FragColor = vec4(color, opacity);
      }
    `,
  });

  const group = new THREE.Group();
  const geometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 32);
  for (let i = 0; i < 100; i++) {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff00ff) })
    );
    mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    group.add(mesh);
  }
  scene.add(group);

  new FontLoader().load("https://raw.githubusercontent.com/vainsan/assets/main/Dubtronic_Regular.json", (font) => {
    const geo1 = new TextGeometry("v1.1.0", { font, size: 0.4, height: 1 });
    const geo2 = new TextGeometry("WORLD", { font, size: 1.0, height: 1 });
    geo1.center(); geo2.center();

    const mesh1 = new THREE.Mesh(geo1, material);
    const mesh2 = new THREE.Mesh(geo2, material);
    mesh1.position.set(0, 0.6, 0);
    mesh2.position.set(0, -0.2, 0);
    scene.add(mesh1, mesh2);
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  window.SPLASH_PARAMS = {
    get opacity() {
      return uniforms.opacity.value;
    },
    set opacity(value) {
      uniforms.opacity.value = value;
    },
    get color1() {
      return `#${uniforms.color1.value.getHexString()}`;
    },
    set color1(value) {
      uniforms.color1.value.set(value);
    },
    get color2() {
      return `#${uniforms.color2.value.getHexString()}`;
    },
    set color2(value) {
      uniforms.color2.value.set(value);
    },
    get color3() {
      return `#${uniforms.color3.value.getHexString()}`;
    },
    set color3(value) {
      uniforms.color3.value.set(value);
    },
    get bloomStrength() {
      return bloomPass.strength;
    },
    set bloomStrength(value) {
      bloomPass.strength = value;
    },
    get bloomRadius() {
      return bloomPass.radius;
    },
    set bloomRadius(value) {
      bloomPass.radius = value;
    },
    get bloomThreshold() {
      return bloomPass.threshold;
    },
    set bloomThreshold(value) {
      bloomPass.threshold = value;
    },
  };

  function animate() {
    group.rotation.x += 0.002;
    group.rotation.y += 0.003;
    uniforms.time.value += 0.005;
    ripplePass.uniforms.time.value += 0.005;

    controls.update();
    composer.render();
    requestAnimationFrame(animate);
  }

  animate();
}
