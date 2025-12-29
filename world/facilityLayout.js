import { createRoom } from "./roomFactory.js";
import { createSlidingDoor } from "./doorFactory.js";
import { SECTORS } from "./sectorSystem.js";

const ROOM = 12;
const CORRIDOR = 6;

export function buildFacility(scene, sectorManager) {

	const rooms = {};

	// ADMIN HUB
	rooms.adminHub = createRoom(scene, {
		id: "admin-hub",
		x: 0,
		z: 0,
		openings: {
			north: true,
			east: true
		}
	});
	sectorManager.assignRoom(rooms.adminHub, SECTORS.ADMIN.id);

	// LIGHT CONTAINMENT
	rooms.lightA = createRoom(scene, {
		id: "light-a",
		x: 0,
		z: -(ROOM + CORRIDOR),
		openings: {
			south: true
		}
	});
	sectorManager.assignRoom(rooms.lightA, SECTORS.LIGHT.id);

	// HEAVY CONTAINMENT
	rooms.heavyA = createRoom(scene, {
		id: "heavy-a",
		x: ROOM + CORRIDOR,
		z: 0,
		openings: {
			west: true
		}
	});
	sectorManager.assignRoom(rooms.heavyA, SECTORS.HEAVY.id);

	// ==============================
	// AUTO-GENERATE DOORS
	// ==============================

	for (const room of Object.values(rooms)) {

		for (const socket of room.userData.doorSockets) {

			const worldPos = socket.localPosition.clone();
			room.localToWorld(worldPos);

			const door = createSlidingDoor(scene, {
				x: worldPos.x,
				y: 0,
				z: worldPos.z
			});

			// Rotate doors on east/west walls
			if (socket.axis === "x") {
				door.rotation.y = Math.PI / 2;
			}
		}
	}

	return rooms;
}
