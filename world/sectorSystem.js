// src/world/sectorSystem.js

export const SECTORS = {
  LIGHT: {
    id: "light",
    name: "Light Containment",
    clearanceRequired: 2,
    color: 0x66ccff
  },

  HEAVY: {
    id: "heavy",
    name: "Heavy Containment",
    clearanceRequired: 4,
    color: 0xff6666
  },

  ADMIN: {
    id: "admin",
    name: "Administration",
    clearanceRequired: 1,
    color: 0x66ff99
  }
};

export class SectorManager {
  constructor() {
    this.sectors = new Map();
  }

  /** Register a sector instance */
  registerSector(sectorId) {
    this.sectors.set(sectorId, {
      power: true,
      lockdown: false,
      alarm: false,
      rooms: []
    });
  }

  /** Assign a room to a sector */
  assignRoom(room, sectorId) {
    if (!this.sectors.has(sectorId)) {
      this.registerSector(sectorId);
    }

    room.userData.sector = sectorId;
    this.sectors.get(sectorId).rooms.push(room);
  }

  /** Toggle emergency lighting for an entire sector */
  setEmergencyLighting(sectorId, enabled) {
    const sector = this.sectors.get(sectorId);
    if (!sector) return;

    for (const room of sector.rooms) {
      const lights = room.userData.lights;
      if (!lights) continue;

      lights.normal.intensity = enabled ? 1 : 6;
      lights.emergency.intensity = enabled ? 1.5 : 0;
    }
  }

  /** Cut or restore power */
  setPower(sectorId, enabled) {
    const sector = this.sectors.get(sectorId);
    if (!sector) return;

    sector.power = enabled;

    for (const room of sector.rooms) {
      const lights = room.userData.lights;
      if (!lights) continue;

      lights.normal.intensity = enabled ? 6 : 0;
      lights.emergency.intensity = enabled ? 0 : 1.2;
    }
  }

  /** Lockdown state (doors later) */
  setLockdown(sectorId, enabled) {
    const sector = this.sectors.get(sectorId);
    if (!sector) return;

    sector.lockdown = enabled;
  }
}
