// src/world/collisionSystem.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

/*
	Simple collision system using Axis-Aligned Bounding Boxes (AABB)
	- Static geometry (walls, doors)
	- Player/NPCs handled externally
*/

export class CollisionSystem {

	constructor() {
		this.colliders = [];
	}

	// Register an object as a solid collider
	add(object) {
		const box = new THREE.Box3().setFromObject(object);

		this.colliders.push({
			object,
			box
		});
	}

	// Update all bounding boxes (needed for doors that move)
	update() {
		for (const entry of this.colliders) {
			entry.box.setFromObject(entry.object);
		}
	}

	// Check if a box intersects any registered collider
	intersects(testBox) {
		for (const entry of this.colliders) {
			if (testBox.intersectsBox(entry.box)) {
				return true;
			}
		}
		return false;
	}

	// Remove a collider (used when doors open)
	remove(object) {
		this.colliders = this.colliders.filter(
			entry => entry.object !== object
		);
	}
}
