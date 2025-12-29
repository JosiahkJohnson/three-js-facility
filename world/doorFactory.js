// src/world/doorFactory.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

export function createSlidingDoor({
	width = 2,
	height = 3,
	thickness = 0.3
} = {}) {

	const doorGroup = new THREE.Group();

	const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
	const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

	// Frame
	const frame = new THREE.Mesh(
		new THREE.BoxGeometry(width + 0.4, height + 0.4, thickness),
		frameMaterial
	);
	frame.position.y = height / 2;
	doorGroup.add(frame);

	// Door panel (this is the collider)
	const door = new THREE.Mesh(
		new THREE.BoxGeometry(width, height, thickness * 0.9),
		doorMaterial
	);
	door.position.y = height / 2;
	doorGroup.add(door);

	let slide = 0;
	const slideDistance = width;

	doorGroup.userData = {
		isDoor: true,
		doorMesh: door,
		open: false,

		toggle() {
			this.open = !this.open;
		},

		update(delta) {
			const target = this.open ? slideDistance : 0;
			slide += (target - slide) * delta * 6;
			door.position.x = slide;
		}
	};

	return doorGroup;
}
