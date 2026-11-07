import * as THREE from 'three';
import { createTerrainTexture, createContainerTexture } from './textures';
import { createPalmTree, createWatchtower } from './models';
import { LootItem } from './types';
import {
  BERMUDA_LOOT_LOCATIONS,
  generateLootForPoint,
  createLootVisualMesh,
} from './lootSystem';

export interface WorldCollisionObstacle {
  x: number;
  z: number;
  radius: number;
  height: number;
}

export interface WorldData {
  terrainMesh: THREE.Mesh;
  oceanMesh: THREE.Mesh;
  obstacles: WorldCollisionObstacle[];
  lootSpawns: LootItem[];
  getGroundHeight: (x: number, z: number) => number;
}

// Procedural Bermuda Island elevation calculation
export function getIslandElevation(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z);
  const islandRadius = 140;

  // Island falls off into the ocean at borders
  if (distFromCenter > islandRadius) {
    const falloff = distFromCenter - islandRadius;
    return -Math.min(falloff * 0.4, 8);
  }

  // Smooth rolling hills & Peak mountain
  const baseNoise = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 3.5;
  const detailNoise = Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.08 - 0.7) * 1.5;

  // Peak central hill (Free Fire "Peak" location)
  const peakDist = Math.sqrt((x - 15) * (x - 15) + (z + 10) * (z + 10));
  const peakHeight = Math.max(0, 18 - peakDist * 0.35);

  const edgeDamping = Math.cos((distFromCenter / islandRadius) * (Math.PI / 2));
  return Math.max(0, (baseNoise + detailNoise + peakHeight) * Math.max(0.2, edgeDamping));
}

export function buildBermudaWorld(scene: THREE.Scene): WorldData {
  const obstacles: WorldCollisionObstacle[] = [];
  const lootSpawns: LootItem[] = [];

  // 1. Terrain Mesh
  const terrainSize = 320;
  const segments = 120;
  const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, getIslandElevation(x, z));
  }
  terrainGeo.computeVertexNormals();

  const terrainTex = createTerrainTexture();
  const terrainMat = new THREE.MeshStandardMaterial({
    map: terrainTex,
    roughness: 0.85,
    metalness: 0.1,
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // 2. Ocean water plane around island
  const oceanGeo = new THREE.PlaneGeometry(800, 800);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanMat = new THREE.MeshPhysicalMaterial({
    color: '#0284c7',
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.8,
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.position.y = -0.5;
  scene.add(oceanMesh);

  // 3. Military Outpost Buildings (Bunkers / Hangars)
  const buildingLocations = [
    { x: -35, z: -25, w: 14, h: 5.5, d: 20, name: 'Hangar A' },
    { x: 45, z: 20, w: 18, h: 6.0, d: 14, name: 'Clocktower Depot' },
    { x: -20, z: 50, w: 12, h: 5.0, d: 16, name: 'Factory Yard' },
    { x: 30, z: -55, w: 16, h: 5.5, d: 16, name: 'Mill Outpost' },
  ];

  const wallMat = new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.8,
    metalness: 0.2,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: '#b91c1c',
    roughness: 0.7,
    metalness: 0.3,
  });

  buildingLocations.forEach(loc => {
    const y = getIslandElevation(loc.x, loc.z);
    const bGroup = new THREE.Group();
    bGroup.position.set(loc.x, y, loc.z);

    // Walls
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(loc.w, loc.h, loc.d), wallMat);
    bMesh.position.y = loc.h / 2;
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    bGroup.add(bMesh);

    // Flat roof with rim
    const rMesh = new THREE.Mesh(new THREE.BoxGeometry(loc.w + 0.8, 0.4, loc.d + 0.8), roofMat);
    rMesh.position.y = loc.h + 0.2;
    rMesh.castShadow = true;
    bGroup.add(rMesh);

    // Doorway opening indicator (dark opening on front)
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3.5, 0.2),
      new THREE.MeshBasicMaterial({ color: '#090d16' })
    );
    door.position.set(0, 1.75, loc.d / 2 + 0.05);
    bGroup.add(door);

    scene.add(bGroup);

    // Collision obstacle
    obstacles.push({
      x: loc.x,
      z: loc.z,
      radius: Math.max(loc.w, loc.d) * 0.55,
      height: loc.h,
    });
  });

  // 4. Watchtowers
  const towerLocations = [
    { x: -50, z: 15 },
    { x: 15, z: -35 },
    { x: 60, z: -10 },
    { x: -10, z: -60 },
  ];
  towerLocations.forEach(loc => {
    const y = getIslandElevation(loc.x, loc.z);
    const tower = createWatchtower();
    tower.position.set(loc.x, y, loc.z);
    scene.add(tower);

    obstacles.push({
      x: loc.x,
      z: loc.z,
      radius: 2.8,
      height: 8,
    });
  });

  // 5. Shipping Containers (Red, Blue, Yellow tactical cover)
  const containerColors = ['#dc2626', '#2563eb', '#d97706'];
  const containerCoords = [
    { x: -15, z: -15, rot: 0.3, color: containerColors[0] },
    { x: -18, z: -11, rot: 0.3, color: containerColors[1] },
    { x: 25, z: 35, rot: 1.1, color: containerColors[2] },
    { x: 30, z: 38, rot: 1.1, color: containerColors[0] },
    { x: -38, z: 35, rot: -0.4, color: containerColors[1] },
    { x: 10, z: -20, rot: 0.8, color: containerColors[2] },
    { x: -5, z: 30, rot: 2.1, color: containerColors[0] },
    { x: 40, z: -30, rot: -1.2, color: containerColors[1] },
  ];

  containerCoords.forEach(c => {
    const y = getIslandElevation(c.x, c.z);
    const contTex = createContainerTexture(c.color);
    const contMat = new THREE.MeshStandardMaterial({
      map: contTex,
      roughness: 0.5,
      metalness: 0.6,
    });
    const contMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 6.0), contMat);
    contMesh.position.set(c.x, y + 1.3, c.z);
    contMesh.rotation.y = c.rot;
    contMesh.castShadow = true;
    contMesh.receiveShadow = true;
    scene.add(contMesh);

    obstacles.push({
      x: c.x,
      z: c.z,
      radius: 2.5,
      height: 2.8,
    });
  });

  // 6. Instanced Palm Trees (Bermuda tropical foliage)
  const treePositions: { x: number; z: number }[] = [];
  for (let i = 0; i < 45; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 115 + 15;
    const tx = Math.cos(angle) * r;
    const tz = Math.sin(angle) * r;

    // Check not colliding with buildings
    const close = buildingLocations.some(b => Math.hypot(tx - b.x, tz - b.z) < 18);
    if (!close) {
      treePositions.push({ x: tx, z: tz });
      const ty = getIslandElevation(tx, tz);
      const tree = createPalmTree();
      tree.position.set(tx, ty, tz);
      const scale = 0.85 + Math.random() * 0.35;
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = Math.random() * Math.PI * 2;
      scene.add(tree);

      obstacles.push({
        x: tx,
        z: tz,
        radius: 0.9,
        height: 6,
      });
    }
  }

  // 7. Boulders / Rocks
  const rockGeo = new THREE.DodecahedronGeometry(1.6);
  const rockMat = new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.9,
    metalness: 0.1,
  });
  for (let i = 0; i < 30; i++) {
    const rx = (Math.random() - 0.5) * 220;
    const rz = (Math.random() - 0.5) * 220;
    const ry = getIslandElevation(rx, rz);
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(rx, ry + 0.6, rz);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const scale = 0.7 + Math.random() * 0.9;
    rock.scale.set(scale * 1.3, scale * 0.8, scale * 1.1);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);

    obstacles.push({
      x: rx,
      z: rz,
      radius: scale * 1.2,
      height: 1.8,
    });
  }

  // 8. Spawn Tiered Bermuda Ground Loot (High, Mid, Low zones)
  BERMUDA_LOOT_LOCATIONS.forEach((spawn, idx) => {
    const item = generateLootForPoint(spawn, `loot_${idx}`, getIslandElevation);
    const mesh = createLootVisualMesh(item);
    scene.add(mesh);
    lootSpawns.push(item);
  });

  return {
    terrainMesh,
    oceanMesh,
    obstacles,
    lootSpawns,
    getGroundHeight: getIslandElevation,
  };
}
