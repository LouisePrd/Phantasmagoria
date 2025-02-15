import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { makeNoise2D } from "open-simplex-noise";

// Initialisation
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -aspect * 1.5, // Left
  aspect * 1.5,  // Right
  1.7,           // Top
  -1.5,          // Bottom
  0.1,           // Near
  100            // Far
);

camera.position.set(0, 0, 1);
camera.lookAt(0, 0, 0);
scene.add(camera);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);


const loader = new FontLoader();
loader.load(
  "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
  (font) => {
    const textGeometry = new TextGeometry("phantasmagoria", {
      font: font,
      size: .1, // Taille du texte
      height: 0.3, // Épaisseur
      curveSegments: 12,
      bevelEnabled: false,
    });


    const textMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x85AFAB,
        side: THREE.DoubleSide
      });
      

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.center();
    textMesh.position.set(0, 1.5, 1);

    scene.add(textMesh);
  }
);

const amplitude = 1;
const segments = 200;
let width = window.innerWidth / 100 + 1;

const noise2D = makeNoise2D(Date.now());

let geometry, sineWave;
function createWave() {
  const points = new Float32Array((segments + 1) * 3);

  for (let i = 0; i <= segments; i++) {
    let x = (i / segments) * width - width / 2;
    let y = 0;
    points.set([x, y, 0], i * 3);
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x535DA4 });

  if (sineWave) scene.remove(sineWave);
  sineWave = new THREE.Line(geometry, material);
  scene.add(sineWave);
}

createWave();

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.003;

  const position = geometry.attributes.position.array;
  for (let i = 0; i <= segments; i++) {
    let x = (i / segments) * width - width / 2;
    let y = noise2D(x * 0.2, time) * amplitude;
    position[i * 3 + 1] = y;
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.setClearColor(0xF7CCBC);
  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  width = window.innerWidth / 100;
  createWave();
});
