import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/PointerLockControls.js";

import { CollisionSystem } from "./world/collisionSystem.js";
import { createRoom } from "./world/roomFactory.js";
import { createSlidingDoor } from "./world/doorFactory.js";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
// Soft ambient light so rooms are never pitch black
scene.add(new THREE.AmbientLight(0x404040, 0.35));


// Camera
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener("click", () => controls.lock());
scene.add(controls.getObject());

// Collision system
const collisionSystem = new CollisionSystem();

// Player movement state
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let running = false;

// Input
document.addEventListener("keydown", e => {
	if (e.code === "KeyW") moveForward = true;
	if (e.code === "KeyS") moveBackward = true;
	if (e.code === "KeyA") moveLeft = true;
	if (e.code === "KeyD") moveRight = true;
	if (e.code === "ShiftLeft") running = true;
});

document.addEventListener("keyup", e => {
	if (e.code === "KeyW") moveForward = false;
	if (e.code === "KeyS") moveBackward = false;
	if (e.code === "KeyA") moveLeft = false;
	if (e.code === "KeyD") moveRight = false;
	if (e.code === "ShiftLeft") running = false;
});

// Player collision box
const playerBox = new THREE.Box3();
const playerSize = new THREE.Vector3(0.6, 1.8, 0.6);

// Create a test room
const room = createRoom({
	width: 12,
	depth: 12,
	height: 4
});
scene.add(room);

// Register room walls
for (const collider of room.userData.colliders) {
	collisionSystem.add(collider);
}

// Add a door
const door = createSlidingDoor();
door.position.set(0, 0, -6);
scene.add(door);

// Register door collider
collisionSystem.add(door.userData.doorMesh);

// Player start
controls.getObject().position.set(0, 1.6, 2);

// Loop
const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);

	const delta = clock.getDelta();
	const speed = running ? 55 : 40;

	velocity.x -= velocity.x * 10 * delta;
	velocity.z -= velocity.z * 10 * delta;

	direction.z = Number(moveForward) - Number(moveBackward);
	direction.x = Number(moveRight) - Number(moveLeft);
	direction.normalize();

	if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
	if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

	collisionSystem.update();

	const moveX = -velocity.x * delta;
	const moveZ = -velocity.z * delta;

	// X axis collision
	controls.getObject().position.x += moveX;
	playerBox.setFromCenterAndSize(
		controls.getObject().position,
		playerSize
	);
	if (collisionSystem.intersects(playerBox)) {
		controls.getObject().position.x -= moveX;
	}

	// Z axis collision
	controls.getObject().position.z += moveZ;
	playerBox.setFromCenterAndSize(
		controls.getObject().position,
		playerSize
	);
	if (collisionSystem.intersects(playerBox)) {
		controls.getObject().position.z -= moveZ;
	}

	// Update doors
	scene.traverse(obj => {
		if (obj.userData?.isDoor) {
			obj.userData.update(delta);

			if (obj.userData.open) {
				collisionSystem.remove(obj.userData.doorMesh);
			}
		}
	});

	renderer.render(scene, camera);
}

animate();
