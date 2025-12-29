/* =========================================================
   IMPORTS
   ========================================================= */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/PointerLockControls.js";
import { RectAreaLightUniformsLib } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/lights/RectAreaLightUniformsLib.js";

// Required for RectAreaLight to work
RectAreaLightUniformsLib.init();

/* =========================================================
   SCENE / CAMERA / RENDERER
   ========================================================= */

// The main Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// First-person camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* =========================================================
   PLAYER CONTROLS (FIRST PERSON)
   ========================================================= */

// PointerLock gives mouse-look FPS controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// Click to lock mouse
document.body.addEventListener("click", () => controls.lock());

// Eye height (average human)
controls.getObject().position.set(0, 1.6, 0);

/* =========================================================
   MOVEMENT STATE
   ========================================================= */

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Key input handling
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") moveForward = true;
  if (e.code === "KeyS") moveBackward = true;
  if (e.code === "KeyA") moveLeft = true;
  if (e.code === "KeyD") moveRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") moveForward = false;
  if (e.code === "KeyS") moveBackward = false;
  if (e.code === "KeyA") moveLeft = false;
  if (e.code === "KeyD") moveRight = false;
});

/* =========================================================
   ROOM FACTORY
   Creates a room with optional wall openings
   ========================================================= */

function createRoom({
  x = 0,
  z = 0,
  width = 12,
  depth = 12,
  height = 4,
  openings = {} // { north: true, south: true, east: true, west: true }
} = {}) {

  const room = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x777777 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x666666 });

  const wallThickness = 0.4;
  const doorWidth = 3;

  /* ---------- FLOOR ---------- */
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  room.add(floor);

  /* ---------- CEILING ---------- */
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    ceilingMat
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  room.add(ceiling);

  /* ---------- WALL HELPER ---------- */
  function buildWallWithOpening(axis, position, length, opening) {
    if (!opening) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
          axis === "x" ? wallThickness : length,
          height,
          axis === "x" ? length : wallThickness
        ),
        wallMat
      );
      wall.position.copy(position);
      room.add(wall);
    } else {
      const sideLength = (length - doorWidth) / 2;

      const left = new THREE.Mesh(
        new THREE.BoxGeometry(
          axis === "x" ? wallThickness : sideLength,
          height,
          axis === "x" ? sideLength : wallThickness
        ),
        wallMat
      );

      const right = left.clone();

      if (axis === "x") {
        left.position.set(position.x, height / 2, position.z - doorWidth / 2 - sideLength / 2);
        right.position.set(position.x, height / 2, position.z + doorWidth / 2 + sideLength / 2);
      } else {
        left.position.set(position.x - doorWidth / 2 - sideLength / 2, height / 2, position.z);
        right.position.set(position.x + doorWidth / 2 + sideLength / 2, height / 2, position.z);
      }

      room.add(left, right);
    }
  }

  /* ---------- WALLS ---------- */
  buildWallWithOpening("z", new THREE.Vector3(0, height / 2, -depth / 2), width, openings.north);
  buildWallWithOpening("z", new THREE.Vector3(0, height / 2, depth / 2), width, openings.south);
  buildWallWithOpening("x", new THREE.Vector3(-width / 2, height / 2, 0), depth, openings.west);
  buildWallWithOpening("x", new THREE.Vector3(width / 2, height / 2, 0), depth, openings.east);

  /* ---------- LIGHTING ---------- */

  // Main fluorescent ceiling panel
  const mainLight = new THREE.RectAreaLight(
    0xffffff,
    6,
    width * 0.6,
    depth * 0.6
  );
  mainLight.position.set(0, height - 0.05, 0);
  mainLight.rotation.x = -Math.PI / 2;
  room.add(mainLight);

  // Emergency red light (off by default)
  const emergencyLight = new THREE.PointLight(0xff0000, 0, 20);
  emergencyLight.position.set(0, height - 0.2, 0);
  room.add(emergencyLight);

  room.userData.lights = {
    normal: mainLight,
    emergency: emergencyLight
  };

  room.position.set(x, 0, z);
  scene.add(room);

  return room;
}

/* =========================================================
   CORRIDOR FACTORY
   ========================================================= */

function createCorridor({
  x = 0,
  z = 0,
  length = 6,
  width = 3,
  height = 4,
  direction = "north"
} = {}) {

  const corridor = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x777777 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x666666 });

  const isNS = direction === "north" || direction === "south";

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(isNS ? width : length, isNS ? length : width),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  corridor.add(floor);

  const ceiling = new THREE.Mesh(floor.geometry.clone(), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  corridor.add(ceiling);

  corridor.position.set(x, 0, z);
  scene.add(corridor);

  return corridor;
}

/* =========================================================
   FACILITY LAYOUT
   ========================================================= */

const ROOM = 12;
const CORRIDOR = 6;

// Central room
const roomA = createRoom({
  x: 0,
  z: 0,
  openings: { north: true, east: true }
});

// North corridor + room
createCorridor({
  x: 0,
  z: -(ROOM / 2 + CORRIDOR / 2),
  direction: "north"
});

createRoom({
  x: 0,
  z: -(ROOM + CORRIDOR),
  openings: { south: true }
});

// East corridor + room
createCorridor({
  x: ROOM / 2 + CORRIDOR / 2,
  z: 0,
  direction: "east"
});

createRoom({
  x: ROOM + CORRIDOR,
  z: 0,
  openings: { west: true }
});

/* =========================================================
   EMERGENCY LIGHT TOGGLE (TEST)
   ========================================================= */

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyE") {
    const lights = roomA.userData.lights;
    const emergencyOn = lights.emergency.intensity > 0;

    lights.normal.intensity = emergencyOn ? 6 : 1;
    lights.emergency.intensity = emergencyOn ? 0 : 1.5;
  }
});

/* =========================================================
   MAIN LOOP
   ========================================================= */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  velocity.x -= velocity.x * 10 * delta;
  velocity.z -= velocity.z * 10 * delta;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const speed = 20;
  if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  renderer.render(scene, camera);
}

animate();

/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
