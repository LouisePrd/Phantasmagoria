import * as THREE from "../node_modules/three/build/three.module.js";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "../node_modules/three/examples/jsm/loaders/OBJLoader.js";


// Initialisation
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
let mixer = undefined;
let Player_anim_IDLE = undefined;

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

let duck = undefined;
let bbtea = undefined;
let duckMini = false;
let dialogEnded = false;
let sprite;
let deplacements = 0;
let tabImgSprites = [
  "/assets/modeles/2D/marcel-front.png",
  "/assets/modeles/2D/marcel-left.png",
  "/assets/modeles/2D/marcel-right.png",
  "/assets/modeles/2D/marcel-back.png",
];

async function loadDialogues(key) {
  try {
    const response = await fetch("/assets/dialogues/dialogues.json");
    const data = await response.json();
    return data[key] || [];
  } catch (error) {
    console.error("Erreur de chargement des dialogues :", error);
    return [];
  }
}

async function initDialogues(dialogueKey) {
  const subtitles = await loadDialogues(dialogueKey);
  if (subtitles.length === 0) {
    console.warn("Aucun dialogue trouvé pour la clé :", dialogueKey);
    return;
  }

  displaySubtitles(subtitles);

  let totalTime = subtitles.length * 2500;
  setTimeout(() => {
    dialogEnded = true;
  }, totalTime);
}

function displaySubtitles(subtitles, index = 0) {
  let subtitleContainer = document.querySelector(".scriptInGame");

  if (!subtitleContainer) {
    console.error("Le conteneur de dialogues n'existe pas !");
    return;
  }

  subtitleContainer.classList.add("show");
  subtitleContainer.innerHTML = `${subtitles[index]}
                                 <span class="press-space">Barre espace pour passer</span>`;

  function nextDialogue(event) {
    if (event.code === "Space") { 
      event.preventDefault();
      document.removeEventListener("keydown", nextDialogue);

      if (index + 1 < subtitles.length) {
        displaySubtitles(subtitles, index + 1);
      } else {
        subtitleContainer.classList.remove("show");
        subtitleContainer.innerHTML = "";
        dialogEnded = true;
      }
    }
  }

  document.addEventListener("keydown", nextDialogue);
}


function createText(text) {
  setTimeout(() => {
    let titleGame = document.getElementsByTagName("h1")[0];
    let p = document.createElement("p");
    titleGame.appendChild(p);
    p.innerHTML = "Cliquez pour le faire taire";
    p.classList.add("narrator");
    dialogEnded = true;
  }, 5000);
}

let dialogueKey = "marcel";

if (!duckMini) {
  setTimeout(() => initDialogues(dialogueKey), 500);
  createText();
}

const gltfLoader = new GLTFLoader();
gltfLoader.load("/assets/modeles/3D/duck.glb", function (gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);
  Player_anim_IDLE = mixer.clipAction(gltf.animations[1]);
  Player_anim_IDLE.play();
  duck = gltf.scene;
  duck.position.set(0, -0.5, 0);
  duck.scale.set(0.43, 0.43, 0.43);
  duck.rotation.y = 1.5;
  scene.add(duck);
});

const objLoader = new OBJLoader();
objLoader.load(
  "/assets/modeles/3D/BBTEA.obj",
  function (object) {
    bbtea = object;
    bbtea.position.set(2, -1.8, -0.5);
    bbtea.scale.set(0.3, 0.3, 0.3);
    bbtea.rotation.y = 1.5;
    scene.add(bbtea);
  },
  undefined,
  function (error) {
    console.error("Erreur de chargement du modèle :", error);
  }
);



for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 5;
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particleMaterial = new THREE.PointsMaterial({
  color: 0xf7ccbc,
  size: 0.05,
  transparent: true,
  sizeAttenuation: true,
  opacity: 0.5,
  depthTest: true,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

renderer.setClearColor(0x000000);
let sizeAdjustHeight = window.innerHeight - 240;
let sizeAdjustWidth = window.innerWidth - 400;
renderer.setSize(sizeAdjustWidth, sizeAdjustHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document
  .getElementsByClassName("canvasContainer")[0]
  .appendChild(renderer.domElement);

const aspect = sizeAdjustWidth / sizeAdjustHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);

camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);
scene.add(camera);

const pointlight = new THREE.PointLight(0xd63131, 8);
pointlight.position.set(0, -2, 2);
scene.add(pointlight);

const clock = new THREE.Clock();
let rotationProgress = 0;
function animate() {
  requestAnimationFrame(animate);
  setTimeout(() => {
    if (rotationProgress < 3) {
      duck.rotation.y += 0.01;
      if (duck.rotation.y >= 1.5 + 0.4 * 3) {
        rotationProgress = 5;
      }
    }
  }, 1000);
  if (duckMini === false) {
    particles.rotation.y += 0.01;
  } else {
    particles.rotation.y += 0.002;
  }

  if (mixer) {
    mixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
}

function flashScreen(condition) {
  if (condition) {
    document.getElementsByClassName("narrator")[0].classList.add("hide");
    let flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.top = "0";
    flash.style.left = "0";
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "white";
    flash.style.opacity = "1";
    flash.style.transition = "opacity 0.3s ease-out";
    document.body.appendChild(flash);
    setTimeout(() => (flash.style.opacity = "0"), 50);
    setTimeout(() => flash.remove(), 500);
    dialogForMiniDuck();
  }
}

document.addEventListener("click", () => {
  if (duck && !duckMini && dialogEnded) {
    scene.remove(duck);
    scene.remove(bbtea);
    
    const texture = new THREE.TextureLoader().load(tabImgSprites[0]);

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 1.8, 1);
    sprite.position.set(0, -0.4, 0);
    scene.add(sprite);
    renderer.setSize(sizeAdjustWidth / 1.7, window.innerHeight / 2);

    let hud = document.getElementsByClassName("hud")[0];
    //hud.style.display = "flex";

    setTimeout(() => {
      scene.remove(camera);
      const aspect = sizeAdjustWidth / 2 / (window.innerHeight / 2);
      const camera2 = new THREE.OrthographicCamera(
        -aspect,
        aspect,
        1,
        -1,
        0.1,
        100
      );
      camera2.position.set(0, 0, 10);
      camera2.lookAt(0, 0, 0);
      scene.add(camera2);
      particles.material.size = 0.1;
    }, 500);

    duckMini = true;
    document.getElementsByTagName("canvas")[0].classList.add("border-game");
  }
});

function dialogForMiniDuck() {
  setTimeout(() => initDialogues("marcel-petit"), 500);
}

// Move the duck
document.addEventListener("keydown", (event) => {
  if (duckMini) {
    let step = 0.1;
    switch (event.key) {
      case "ArrowUp":
        sprite.position.y += step;
        sprite.material.map = new THREE.TextureLoader().load(tabImgSprites[3]);
        deplacements++;
        break;
      case "ArrowDown":
        sprite.position.y -= step;
        sprite.material.map = new THREE.TextureLoader().load(tabImgSprites[0]);
        deplacements++;
        break;
      case "ArrowLeft":
        sprite.position.x -= step;
        sprite.material.map = new THREE.TextureLoader().load(tabImgSprites[1]);
        deplacements++;
        break;
      case "ArrowRight":
        sprite.position.x += step;
        sprite.material.map = new THREE.TextureLoader().load(tabImgSprites[2]);
        deplacements++;
        break;
    }
  }
  if (deplacements === 4) {
    setTimeout(() => initDialogues("marcel-move"), 500);
  }
});

document.addEventListener("click", () => flashScreen(duckMini));

animate();
