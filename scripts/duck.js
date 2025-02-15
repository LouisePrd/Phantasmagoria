import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Initialisation
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
let mixer = undefined;
let Player_anim_IDLE = undefined;

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 150;
const positions = new Float32Array(particleCount * 3);

let textMesh;
let textScale = 1.0;
let duck = undefined;
let duckMini = false;
let dialogEnded = false;

let tabSubtitles = [
  "Marcel : Alors comme ça, tu as osé t'aventurer dans mon jeu ?",
  "Marcel : Tu es bien courageux, ou bien inconscient.",
  "Marcel : Laisse-moi te faire regretter ta décision.",
];

const gltfLoader = new GLTFLoader();
gltfLoader.load("/assets/duck.glb", function (gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);
  Player_anim_IDLE = mixer.clipAction(gltf.animations[1]);
  Player_anim_IDLE.play();
  duck = gltf.scene;
  duck.position.set(0, -0.4, 0);
  duck.scale.set(0.4, 0.4, 0.4);
  duck.rotation.y = 1.5;
  scene.add(duck);

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      duck.rotation.y += 0.33;
    }, 1400 * i);
  }
});

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
let sizeAdjust = window.innerHeight - 150;
renderer.setSize(window.innerWidth, sizeAdjust);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("canvasContainer").appendChild(renderer.domElement);

const aspect = window.innerWidth / sizeAdjust;
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

const pointlight = new THREE.PointLight(0xd63131, 10);
pointlight.position.set(0, -2, 2);
scene.add(pointlight);

const loader = new FontLoader();
loader.load("/fonts/Nopa1_Regular.json", (font) => {
  const textGeometry = new TextGeometry("phantasmagoria", {
    font: font,
    size: 0.5,
    height: 0.3,
    curveSegments: 32,
    bevelEnabled: false,
  });
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (duckMini === false) {
    particles.rotation.y += 0.01;
  } else {
    particles.rotation.y += 0.002;
  }
  if (textScale > 0.3 && textMesh) {
    textScale -= 0.015;
    textMesh.scale.set(textScale, textScale, textScale);
    let progress = (textScale - 0.3) / (1 - 0.3);
    let maxRotation = Math.PI / 1.5;
    textMesh.rotation.z = progress * maxRotation;
  }

  if (mixer) {
    mixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
}

document.addEventListener("click", () => {
  if (duck && !duckMini && dialogEnded) {
    scene.remove(duck);
    const texture = new THREE.TextureLoader().load("/assets/marcel.png");
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, -0.4, 0);
    plane.scale.set(1, 1.8, 1);
    scene.add(plane);
    duckMini = true;
  }
});

if (duckMini === false) {
  let subtitleContainer = document.getElementById("scriptInGame");
  setTimeout(() => {
    tabSubtitles.forEach((subtitle, index) => {
      setTimeout(() => {
        subtitleContainer.innerHTML = subtitle;
        subtitleContainer.classList.add("show");
      }, 4000 * index);
    });
  }, 2000);

  let totalTime = tabSubtitles.length * 2500;

  setTimeout(() => {
    dialogEnded = true;
  }, totalTime);
}

animate();

// Resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
