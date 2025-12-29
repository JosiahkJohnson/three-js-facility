// src/world/roomFactory.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

export function createRoom({
	x = 0,
	z = 0,
	width = 10,
	depth = 10,
	height = 4
} = {}) {

	const room = new THREE.Group();
	room.userData.colliders = [];

	const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
	const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
	const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });

	// Floor
	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(width, depth),
		floorMaterial
	);
	floor.rotation.x = -Math.PI / 2;
	room.add(floor);

	// Ceiling
	const ceiling = new THREE.Mesh(
		new THREE.PlaneGeometry(width, depth),
		ceilingMaterial
	);
	ceiling.rotation.x = Math.PI / 2;
	ceiling.position.y = height;
	room.add(ceiling);

	// Walls
	const wallGeoH = new THREE.BoxGeometry(width, height, 0.5);
	const wallGeoV = new THREE.BoxGeometry(0.5, height, depth);

	const wallNorth = new THREE.Mesh(wallGeoH, wallMaterial);
	wallNorth.position.set(0, height / 2, -depth / 2);

	const wallSouth = wallNorth.clone();
	wallSouth.position.z = depth / 2;

	const wallWest = new THREE.Mesh(wallGeoV, wallMaterial);
	wallWest.position.set(-width / 2, height / 2, 0);

	const wallEast = wallWest.clone();
	wallEast.position.x = width / 2;

	room.add(wallNorth, wallSouth, wallWest, wallEast);

	// Register walls as colliders
	room.userData.colliders.push(
		wallNorth,
		wallSouth,
		wallWest,
		wallEast
	);

    // Normal fluorescent-style room light
    const mainLight = new THREE.PointLight(0xffffff, 2.2, 40);
    mainLight.position.set(0, height - .8, 0);
    room.add(mainLight);

    // Emergency red light (off by default)
    const emergencyLight = new THREE.PointLight(0xff2222, 0, 25);
    emergencyLight.position.set(0, height - .8, 0);
    room.add(emergencyLight);

	room.userData.lights = {
		normal: mainLight,
		emergency: emergencyLight
	};

	room.position.set(x, 0, z);

	return room;
}
