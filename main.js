import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


// Initialisation
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
var mixer                = undefined; 
var Player_anim_IDLE     = undefined;

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 150;
const positions = new Float32Array(particleCount * 3);

let textMesh;
let textScale = 1.0;
var duck = undefined;

const gltfLoader = new GLTFLoader();
gltfLoader.load("/assets/duck.glb", function (gltf) {
    mixer = new THREE.AnimationMixer( gltf.scene );
    Player_anim_IDLE = mixer.clipAction( gltf.animations[ 1 ] );
    Player_anim_IDLE.play();
    duck = gltf.scene;
    duck.position.set(0, 0, 0);
    duck.scale.set(0.5, 0.5, 0.5);
    duck.rotation.y = 1.5;
    scene.add(duck);
} );

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 5;
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particleMaterial = new THREE.PointsMaterial({
  color: 0xffc0cb,
  size: 1.5,
  transparent: true,
  opacity: 0.5,
  depthTest: true,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

renderer.setClearColor(0x2b3059);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -aspect * 1.5, // Left
  aspect * 1.5, // Right
  1.9, // Top
  -1.5, // Bottom
  0.1, // Near
  100 // Far
);
//const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
//const camera = new THREE.PerspectiveCamera(155, aspect, 0.1, 500);


camera.position.set(0, 0, 1);
camera.lookAt(0, 0, 0);
scene.add(camera);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const loader = new FontLoader();
loader.load("/fonts/Nopa1_Regular.json", (font) => {
  const textGeometry = new TextGeometry("phantasmagoria", {
    font: font,
    size: 0.8,
    height: 0.3,
    curveSegments: 32,
    bevelEnabled: false,
  });

  textGeometry.center();
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xd05cbf,
    side: THREE.DoubleSide,
    roughness: 0.2,
  });

  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(0, 1.5, 1);
  scene.add(textMesh);

});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.002;
  if (textScale > 0.3) { 
    textScale -= 0.005; 
    textMesh.scale.set(textScale, textScale, textScale);
  }

  if (mixer) {
    mixer.update(clock.getDelta());
}

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
