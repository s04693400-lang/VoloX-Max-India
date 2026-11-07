import * as THREE from 'three';
import { createCamoTexture, createAirdropTexture, createGlooWallTexture } from './textures';
import { WeaponId } from './types';

/**
 * Procedural 3D Composite Models (3-12 distinct parts per subject)
 * Adheres strictly to Three.js design guidelines.
 */

export type StanceType = 'standing' | 'running' | 'crouching' | 'prone' | 'jumping';

export interface CharacterMeshGroup extends THREE.Group {
  parts: {
    pelvis: THREE.Mesh;
    torso: THREE.Mesh;
    head: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    weaponMount: THREE.Group;
    currentWeaponMesh?: THREE.Group;
    contactShadow: THREE.Mesh;
    nametag?: THREE.Sprite;
  };
  animateStance: (
    time: number,
    speed: number,
    stance: StanceType,
    isAiming: boolean,
    isFiring: boolean
  ) => void;
  setWeapon: (weaponId: WeaponId) => void;
  setNametag: (name: string, isSelf?: boolean) => void;
}

// Procedural Contact Shadow Texture
function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const contactShadowTexture = createContactShadowTexture();

// Helper to create Nametag Sprite
function createNametagSprite(name: string, isSelf: boolean = false): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Background pill
  ctx.fillStyle = isSelf ? 'rgba(249, 115, 22, 0.75)' : 'rgba(15, 23, 42, 0.75)';
  ctx.roundRect(10, 10, 236, 44, 12);
  ctx.fill();

  ctx.strokeStyle = isSelf ? '#fdba74' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Rajdhani, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name.toUpperCase(), 128, 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.8, 0.45, 1);
  sprite.position.y = 2.2;
  return sprite;
}

// 1. Procedural Character Model (Real Human Warrior - VoloX Max India)
export function createCharacterModel(options?: {
  skinTone?: string;
  vestHue?: number;
  pantColor?: string;
  visorColor?: string;
  name?: string;
  isSelf?: boolean;
}): CharacterMeshGroup {
  const opts = {
    skinTone: '#c27945', // warm human skin tone
    vestHue: 35, // tactical saffron / camo
    pantColor: '#1e293b',
    visorColor: '#f97316',
    name: 'Player',
    isSelf: false,
    ...options,
  };

  const group = new THREE.Group() as CharacterMeshGroup;

  // Root shadow disk
  const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTexture,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.02;
  group.add(contactShadow);

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: opts.skinTone,
    roughness: 0.75,
    metalness: 0.05,
  });
  const camoTex = createCamoTexture(opts.vestHue);
  const vestMat = new THREE.MeshStandardMaterial({
    map: camoTex,
    roughness: 0.85,
    metalness: 0.1,
  });
  const pantMat = new THREE.MeshStandardMaterial({
    color: opts.pantColor,
    roughness: 0.8,
    metalness: 0.1,
  });
  const bootMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.5,
    metalness: 0.3,
  });
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: opts.visorColor,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0,
    emissive: opts.visorColor,
    emissiveIntensity: 0.35,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.35,
    metalness: 0.85,
  });

  // Hips / Pelvis
  const pelvisGeo = new THREE.BoxGeometry(0.5, 0.2, 0.3);
  const pelvis = new THREE.Mesh(pelvisGeo, pantMat);
  pelvis.position.y = 1.0;
  group.add(pelvis);

  // Utility belt & holster
  const beltGeo = new THREE.BoxGeometry(0.54, 0.08, 0.34);
  const belt = new THREE.Mesh(beltGeo, bootMat);
  belt.position.y = 0.08;
  pelvis.add(belt);

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.58, 0.65, 0.36);
  const torso = new THREE.Mesh(torsoGeo, vestMat);
  torso.position.y = 0.42;
  torso.castShadow = true;
  pelvis.add(torso);

  // Tactical chest pouches & radio
  const pouchGeo = new THREE.BoxGeometry(0.18, 0.16, 0.08);
  const pouch1 = new THREE.Mesh(pouchGeo, bootMat);
  pouch1.position.set(-0.14, -0.05, 0.22);
  torso.add(pouch1);

  const pouch2 = new THREE.Mesh(pouchGeo, bootMat);
  pouch2.position.set(0.14, -0.05, 0.22);
  torso.add(pouch2);

  const radioGeo = new THREE.BoxGeometry(0.08, 0.15, 0.06);
  const radio = new THREE.Mesh(radioGeo, metalMat);
  radio.position.set(-0.22, 0.2, 0.15);
  torso.add(radio);

  // Head group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.45, 0);
  torso.add(headGroup);

  const headGeo = new THREE.BoxGeometry(0.3, 0.32, 0.3);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Tactical Bandana / Visor
  const visorGeo = new THREE.BoxGeometry(0.32, 0.1, 0.12);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.04, 0.12);
  headGroup.add(visor);

  // Tactical Comms Headset
  const earGeo = new THREE.BoxGeometry(0.06, 0.12, 0.1);
  const earL = new THREE.Mesh(earGeo, metalMat);
  earL.position.set(-0.17, 0.02, 0);
  const earR = new THREE.Mesh(earGeo, metalMat);
  earR.position.set(0.17, 0.02, 0);
  headGroup.add(earL, earR);

  // --- Left Leg ---
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, -0.1, 0);
  pelvis.add(leftLeg);

  const thighGeo = new THREE.BoxGeometry(0.18, 0.42, 0.2);
  const leftThigh = new THREE.Mesh(thighGeo, pantMat);
  leftThigh.position.y = -0.21;
  leftThigh.castShadow = true;
  leftLeg.add(leftThigh);

  const shinGeo = new THREE.BoxGeometry(0.16, 0.42, 0.18);
  const leftShin = new THREE.Mesh(shinGeo, pantMat);
  leftShin.position.y = -0.42;
  leftShin.castShadow = true;
  leftThigh.add(leftShin);

  const bootGeo = new THREE.BoxGeometry(0.18, 0.16, 0.26);
  const leftBoot = new THREE.Mesh(bootGeo, bootMat);
  leftBoot.position.set(0, -0.22, 0.03);
  leftShin.add(leftBoot);

  // --- Right Leg ---
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, -0.1, 0);
  pelvis.add(rightLeg);

  const rightThigh = new THREE.Mesh(thighGeo, pantMat);
  rightThigh.position.y = -0.21;
  rightThigh.castShadow = true;
  rightLeg.add(rightThigh);

  const rightShin = new THREE.Mesh(shinGeo, pantMat);
  rightShin.position.y = -0.42;
  rightShin.castShadow = true;
  rightThigh.add(rightShin);

  const rightBoot = new THREE.Mesh(bootGeo, bootMat);
  rightBoot.position.set(0, -0.22, 0.03);
  rightShin.add(rightBoot);

  // --- Left Arm ---
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.36, 0.24, 0);
  torso.add(leftArm);

  const upperArmGeo = new THREE.BoxGeometry(0.14, 0.34, 0.16);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  leftUpperArm.position.y = -0.17;
  leftUpperArm.castShadow = true;
  leftArm.add(leftUpperArm);

  const forearmGeo = new THREE.BoxGeometry(0.12, 0.32, 0.14);
  const leftForearm = new THREE.Mesh(forearmGeo, bootMat);
  leftForearm.position.y = -0.32;
  leftUpperArm.add(leftForearm);

  // --- Right Arm (Weapon holding arm) ---
  const rightArm = new THREE.Group();
  rightArm.position.set(0.36, 0.24, 0);
  torso.add(rightArm);

  const rightUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  rightUpperArm.position.y = -0.17;
  rightUpperArm.castShadow = true;
  rightArm.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(forearmGeo, bootMat);
  rightForearm.position.y = -0.32;
  rightUpperArm.add(rightForearm);

  // Weapon mount attached to right forearm
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.14, 0.15);
  rightForearm.add(weaponMount);

  // Nametag above player
  const nametag = createNametagSprite(opts.name, opts.isSelf);
  group.add(nametag);

  // Cache parts
  group.parts = {
    pelvis,
    torso,
    head: headGroup,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    weaponMount,
    contactShadow,
    nametag,
  };

  group.setNametag = (newName: string, isSelfUser: boolean = false) => {
    if (group.parts.nametag) {
      group.remove(group.parts.nametag);
    }
    const newSprite = createNametagSprite(newName, isSelfUser);
    group.add(newSprite);
    group.parts.nametag = newSprite;
  };

  // Comprehensive Real Human Stance Animation (Standing, Running, Sitting/Crouching, Lieing/Prone)
  group.animateStance = (
    time: number,
    speed: number,
    stance: StanceType,
    isAiming: boolean,
    isFiring: boolean
  ) => {
    // 1. Reset root rotation
    group.rotation.x = 0;
    group.rotation.z = 0;

    if (stance === 'prone') {
      // LIEING / PRONE POSE (Full flat on stomach)
      pelvis.position.y = 0.22;
      group.rotation.x = Math.PI / 2 - 0.1; // Flat horizontal body
      headGroup.rotation.x = -Math.PI / 2 + 0.2; // Head raised looking forward

      // Crawling kick animation if moving
      if (speed > 0.1) {
        const crawl = Math.sin(time * 6) * 0.3;
        leftLeg.rotation.x = crawl;
        rightLeg.rotation.x = -crawl;
      } else {
        leftLeg.rotation.x = 0.1;
        rightLeg.rotation.x = -0.1;
      }

      // Arms bracing rifle on ground
      rightArm.rotation.x = -0.8;
      rightArm.rotation.y = -0.3;
      leftArm.rotation.x = -0.7;
      leftArm.rotation.y = 0.4;
      return;
    }

    if (stance === 'crouching') {
      // SITTING / CROUCHING POSE
      pelvis.position.y = 0.62; // Lowered hips
      torso.rotation.x = 0.2; // Slight forward hunch
      headGroup.rotation.x = -0.15; // Look up

      // Bent knees
      leftLeg.rotation.x = 1.1;
      rightLeg.rotation.x = 0.7;

      if (!isAiming) {
        rightArm.rotation.x = -0.7;
        leftArm.rotation.x = -0.6;
      }
    } else if (stance === 'jumping') {
      // JUMPING POSE
      pelvis.position.y = 1.15;
      torso.rotation.x = 0;
      headGroup.rotation.x = 0;
      leftLeg.rotation.x = 0.45;
      rightLeg.rotation.x = -0.35;
    } else if (stance === 'running' || speed > 4.5) {
      // ATHLETIC RUNNING SPRINT STRIDE
      torso.rotation.x = 0.12; // Athletic forward lean
      headGroup.rotation.x = -0.1;

      const freq = 13;
      const legAngle = Math.sin(time * freq) * 0.78;
      leftLeg.rotation.x = legAngle;
      rightLeg.rotation.x = -legAngle;

      // Vertical bounce
      pelvis.position.y = 1.0 + Math.abs(Math.sin(time * freq * 2)) * 0.08;

      if (!isAiming) {
        leftArm.rotation.x = -legAngle * 0.85;
        rightArm.rotation.x = legAngle * 0.55 - 0.4;
      }
    } else {
      // STANDING IDLE POSE
      torso.rotation.x = 0;
      headGroup.rotation.x = 0;
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, 0.016);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, 0.016);
      pelvis.position.y = 1.0 + Math.sin(time * 2) * 0.02; // Idle breathing

      if (!isAiming) {
        rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -0.45, 8, 0.016);
        rightArm.rotation.z = THREE.MathUtils.damp(rightArm.rotation.z, 0.12, 8, 0.016);
        leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, -0.28, 8, 0.016);
        leftArm.rotation.y = THREE.MathUtils.damp(leftArm.rotation.y, 0.25, 8, 0.016);
      }
    }

    // Aiming / Shooting Arms
    if (isAiming) {
      rightArm.rotation.x = -Math.PI / 2 + 0.1;
      rightArm.rotation.y = -0.2;
      rightArm.rotation.z = 0;
      leftArm.rotation.x = -Math.PI / 2 + 0.25;
      leftArm.rotation.y = 0.55;
    }

    if (isFiring) {
      rightArm.rotation.x -= 0.15; // Gunshot kick
    }
  };

  group.setWeapon = (weaponId: WeaponId) => {
    if (group.parts.currentWeaponMesh) {
      group.parts.weaponMount.remove(group.parts.currentWeaponMesh);
      group.parts.currentWeaponMesh = undefined;
    }
    const weaponMesh = createWeaponModel(weaponId);
    group.parts.weaponMount.add(weaponMesh);
    group.parts.currentWeaponMesh = weaponMesh;
  };

  group.setWeapon('scar');
  return group;
}


// 2. Procedural Weapon Models
export function createWeaponModel(id: WeaponId): THREE.Group {
  const group = new THREE.Group();

  const gunMetalMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.35,
    metalness: 0.85,
  });
  const darkPolymerMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.7,
    metalness: 0.2,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: '#854d0e',
    roughness: 0.7,
    metalness: 0.1,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.3,
    metalness: 0.8,
  });

  if (id === 'scar') {
    // SCAR Assault Rifle
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.55), gunMetalMat);
    body.position.set(0, 0, 0.1);
    group.add(body);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.52);
    group.add(barrel);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.12), darkPolymerMat);
    mag.position.set(0, -0.14, 0.12);
    mag.rotation.x = -0.2;
    group.add(mag);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.25), darkPolymerMat);
    stock.position.set(0, -0.02, -0.28);
    group.add(stock);

    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.12), goldTrimMat);
    sight.position.set(0, 0.1, 0.05);
    group.add(sight);
  } else if (id === 'ak47') {
    // AK-47 (Classic Wooden Furniture & Steel Receiver)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.13, 0.52), gunMetalMat);
    body.position.set(0, 0, 0.08);
    group.add(body);

    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 0.24), woodMat);
    handguard.position.set(0, 0.01, 0.38);
    group.add(handguard);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.42, 8), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, 0.62);
    group.add(barrel);

    // Curved Banana Mag
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.26, 0.13), gunMetalMat);
    mag.position.set(0, -0.16, 0.16);
    mag.rotation.x = -0.35;
    group.add(mag);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.16, 0.32), woodMat);
    stock.position.set(0, -0.04, -0.3);
    stock.rotation.x = 0.08;
    group.add(stock);
  } else if (id === 'm1014') {
    // Shotgun M1014
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.48), darkPolymerMat);
    body.position.set(0, 0, 0.05);
    group.add(body);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, 0.45);
    group.add(barrel);

    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.38, 8), gunMetalMat);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, -0.03, 0.4);
    group.add(tube);

    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.18), goldTrimMat);
    pump.position.set(0, -0.03, 0.32);
    group.add(pump);
  } else if (id === 'spas12') {
    // SPAS-12 Shotgun (Folding metal stock & heat shield)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.15, 0.5), darkPolymerMat);
    body.position.set(0, 0, 0.06);
    group.add(body);

    const heatShield = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.36, 8), gunMetalMat);
    heatShield.rotation.x = Math.PI / 2;
    heatShield.position.set(0, 0.02, 0.42);
    group.add(heatShield);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.52, 8), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.52);
    group.add(barrel);

    const foldStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.35), gunMetalMat);
    foldStock.position.set(0, 0.1, -0.05);
    group.add(foldStock);
  } else if (id === 'usp') {
    // USP .45 Tactical Pistol
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.28), gunMetalMat);
    slide.position.set(0, 0.04, 0.08);
    group.add(slide);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.14, 0.11), darkPolymerMat);
    frame.position.set(0, -0.06, 0.01);
    frame.rotation.x = -0.2;
    group.add(frame);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.1, 8), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, 0.23);
    group.add(barrel);
  } else if (id === 'deagle') {
    // Desert Eagle (Heavy Magnum Handgun)
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.36), goldTrimMat);
    slide.position.set(0, 0.05, 0.1);
    group.add(slide);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.17, 0.13), darkPolymerMat);
    frame.position.set(0, -0.07, 0.01);
    frame.rotation.x = -0.22;
    group.add(frame);

    const heavyBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), goldTrimMat);
    heavyBarrel.rotation.x = Math.PI / 2;
    heavyBarrel.position.set(0, 0.05, 0.3);
    group.add(heavyBarrel);
  } else if (id === 'awm') {
    // AWM Sniper Rifle
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.65), darkPolymerMat);
    body.position.set(0, 0, 0.1);
    group.add(body);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.7);
    group.add(barrel);

    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), goldTrimMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.02, 1.05);
    group.add(muzzle);

    const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.32, 12), gunMetalMat);
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0, 0.14, 0.12);
    group.add(scopeTube);

    const scopeLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12),
      new THREE.MeshBasicMaterial({ color: '#38bdf8' })
    );
    scopeLens.rotation.x = Math.PI / 2;
    scopeLens.position.set(0, 0.14, 0.28);
    group.add(scopeLens);
  } else if (id === 'kar98k') {
    // Kar98k Marksman Rifle
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.85), woodMat);
    stock.position.set(0, -0.01, 0.1);
    group.add(stock);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, 0.6);
    group.add(barrel);

    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), gunMetalMat);
    bolt.position.set(0.05, 0.06, 0.05);
    bolt.rotation.z = Math.PI / 2;
    group.add(bolt);

    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.24, 8), darkPolymerMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.11, 0.1);
    group.add(scope);
  } else if (id === 'pan') {
    // Tactical Frying Pan
    const rimMat = new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.35,
      metalness: 0.9,
    });
    const panBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.06, 16), rimMat);
    panBody.rotation.x = Math.PI / 2;
    panBody.position.set(0, 0.25, 0);
    group.add(panBody);

    const panHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.25, 8), darkPolymerMat);
    panHandle.position.set(0, -0.02, 0);
    group.add(panHandle);
  } else {
    // Katana
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), darkPolymerMat);
    handle.position.set(0, -0.1, 0);
    group.add(handle);

    const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 8), goldTrimMat);
    guard.position.set(0, 0.03, 0);
    group.add(guard);

    const bladeMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.1,
      metalness: 0.95,
      emissive: '#38bdf8',
      emissiveIntensity: 0.2,
    });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.85, 0.05), bladeMat);
    blade.position.set(0, 0.45, 0.01);
    group.add(blade);
  }

  group.scale.set(1.4, 1.4, 1.4);
  return group;
}

// 3. Loot Item 3D Meshes

// Ammo Crate Mesh with Caliber Palette
export function createAmmoBoxMesh(ammoType: string): THREE.Group {
  const group = new THREE.Group();

  let boxColor = '#4a7536'; // Default AR Olive
  let caliberLabel = '5.56mm';

  if (ammoType === 'ammo_sg') {
    boxColor = '#dc2626'; // Red Shotgun
    caliberLabel = '12G';
  } else if (ammoType === 'ammo_hg') {
    boxColor = '#2563eb'; // Blue Pistol
    caliberLabel = '9mm';
  } else if (ammoType === 'ammo_sr') {
    boxColor = '#9333ea'; // Purple Sniper
    caliberLabel = '.300';
  }

  const boxGeo = new THREE.BoxGeometry(0.55, 0.35, 0.4);
  const boxMat = new THREE.MeshStandardMaterial({
    color: boxColor,
    roughness: 0.5,
    metalness: 0.4,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.castShadow = true;
  group.add(box);

  // Top carry handle
  const handleGeo = new THREE.BoxGeometry(0.25, 0.05, 0.06);
  const handleMat = new THREE.MeshStandardMaterial({ color: '#18181b', metalness: 0.8 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 0.2;
  group.add(handle);

  return group;
}

// Medical Kit 3D Mesh (White briefcase with green cross)
export function createMedkitMesh(): THREE.Group {
  const group = new THREE.Group();

  const caseGeo = new THREE.BoxGeometry(0.65, 0.45, 0.25);
  const caseMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.4,
    metalness: 0.2,
  });
  const caseMesh = new THREE.Mesh(caseGeo, caseMat);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // Green Cross Emblem
  const crossMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
  const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.02), crossMat);
  bar1.position.set(0, 0, 0.13);
  const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.02), crossMat);
  bar2.position.set(0, 0, 0.13);
  group.add(bar1, bar2);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.06, 0.04),
    new THREE.MeshStandardMaterial({ color: '#ef4444' })
  );
  handle.position.y = 0.25;
  group.add(handle);

  return group;
}

// Combat Bandage 3D Mesh (Rolled gauze)
export function createBandageMesh(): THREE.Group {
  const group = new THREE.Group();

  const rollGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 12);
  const rollMat = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.9,
    metalness: 0.05,
  });
  const roll = new THREE.Mesh(rollGeo, rollMat);
  roll.rotation.z = Math.PI / 2;
  roll.castShadow = true;
  group.add(roll);

  // Red Cross tape wrap
  const tapeGeo = new THREE.CylinderGeometry(0.205, 0.205, 0.08, 12);
  const tapeMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
  const tape = new THREE.Mesh(tapeGeo, tapeMat);
  tape.rotation.z = Math.PI / 2;
  group.add(tape);

  return group;
}

// Helmet 3D Mesh (Level 1, 2, 3)
export function createHelmetMesh(level: 1 | 2 | 3): THREE.Group {
  const group = new THREE.Group();

  const helmetColors = {
    1: '#4d7c0f', // Level 1 Olive
    2: '#1e293b', // Level 2 Tactical Black
    3: '#334155', // Level 3 Titanium Grey
  };

  const domeGeo = new THREE.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const domeMat = new THREE.MeshStandardMaterial({
    color: helmetColors[level],
    roughness: level === 3 ? 0.3 : 0.6,
    metalness: level === 3 ? 0.8 : 0.2,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.castShadow = true;
  group.add(dome);

  // Brim / rim
  const rimGeo = new THREE.TorusGeometry(0.28, 0.03, 6, 16);
  const rim = new THREE.Mesh(rimGeo, domeMat);
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  // Level 3 Titanium Visor Shield!
  if (level === 3) {
    const visorGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.16, 12, 1, true, 0, Math.PI);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: '#0284c7',
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.y = Math.PI / 2;
    visor.position.set(0, -0.06, 0.05);
    group.add(visor);
  }

  return group;
}

// Tactical Vest 3D Mesh (Level 1, 2, 3)
export function createVestMesh(level: 1 | 2 | 3): THREE.Group {
  const group = new THREE.Group();

  const vestColors = {
    1: '#475569', // Level 1 Police Blue-Grey
    2: '#334155', // Level 2 Tactical Spec-Ops
    3: '#18181b', // Level 3 Ceramic Heavy Black
  };

  const torsoGeo = new THREE.BoxGeometry(0.52, 0.45, 0.3);
  const vestMat = new THREE.MeshStandardMaterial({
    color: vestColors[level],
    roughness: 0.7,
    metalness: level === 3 ? 0.6 : 0.15,
  });
  const vest = new THREE.Mesh(torsoGeo, vestMat);
  vest.castShadow = true;
  group.add(vest);

  // Mag Pouches on front
  const pouchCount = level === 3 ? 4 : level === 2 ? 3 : 2;
  const pouchMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 });
  for (let i = 0; i < pouchCount; i++) {
    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.07), pouchMat);
    const xOffset = -0.16 + (0.32 / (pouchCount - 1 || 1)) * i;
    pMesh.position.set(xOffset, -0.08, 0.18);
    group.add(pMesh);
  }

  // Heavy Ceramic Plate for Level 3
  if (level === 3) {
    const plateGeo = new THREE.BoxGeometry(0.38, 0.28, 0.05);
    const plateMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.7, roughness: 0.3 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.08, 0.17);
    group.add(plate);
  }

  return group;
}

// Gloo Wall Pickup Mesh
export function createGlooWallPickupMesh(): THREE.Group {
  const group = new THREE.Group();
  const crystalGeo = new THREE.OctahedronGeometry(0.22);
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: '#06b6d4',
    emissive: '#0284c7',
    emissiveIntensity: 0.6,
    roughness: 0.15,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9,
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.castShadow = true;
  group.add(crystal);

  const ringGeo = new THREE.TorusGeometry(0.32, 0.02, 6, 16);
  const ringMat = new THREE.MeshBasicMaterial({ color: '#67e8f9' });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  return group;
}

// 3. Gloo Wall Model (Curved energy barricade with glowing shield ribs)
export function createGlooWallMesh(): THREE.Group {
  const wallGroup = new THREE.Group();
  const glooTex = createGlooWallTexture();

  const glooMat = new THREE.MeshPhysicalMaterial({
    map: glooTex,
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.5,
    transmission: 0.2,
    transparent: true,
    opacity: 0.92,
  });

  // 3 Curved segmented panels
  const panelCount = 5;
  const radius = 2.4;
  const height = 2.2;
  const angleSpan = Math.PI * 0.45;

  for (let i = 0; i < panelCount; i++) {
    const angle = -angleSpan / 2 + (angleSpan / (panelCount - 1)) * i;
    const panelGeo = new THREE.BoxGeometry(0.7, height, 0.18);
    const panel = new THREE.Mesh(panelGeo, glooMat);
    panel.position.set(Math.sin(angle) * radius, height / 2, Math.cos(angle) * radius - radius + 0.3);
    panel.rotation.y = angle;
    panel.castShadow = true;
    panel.receiveShadow = true;
    wallGroup.add(panel);

    // Glowing base anchor
    const anchorGeo = new THREE.BoxGeometry(0.78, 0.22, 0.35);
    const anchor = new THREE.Mesh(anchorGeo, new THREE.MeshStandardMaterial({ color: '#0369a1', metalness: 0.8 }));
    anchor.position.set(panel.position.x, 0.11, panel.position.z);
    anchor.rotation.y = angle;
    wallGroup.add(anchor);
  }

  // Energy crest on top
  const crestGeo = new THREE.TorusGeometry(radius, 0.05, 8, 24, angleSpan);
  const crestMat = new THREE.MeshBasicMaterial({ color: '#67e8f9' });
  const crest = new THREE.Mesh(crestGeo, crestMat);
  crest.rotation.x = Math.PI / 2;
  crest.rotation.z = Math.PI / 2 - angleSpan / 2;
  crest.position.set(0, height, -radius + 0.3);
  wallGroup.add(crest);

  return wallGroup;
}

// 4. Airdrop Supply Crate (with parachute harness & blinking beacon)
export function createAirdropMesh(): THREE.Group {
  const crateGroup = new THREE.Group();
  const airdropTex = createAirdropTexture();

  const crateMat = new THREE.MeshStandardMaterial({
    map: airdropTex,
    roughness: 0.6,
    metalness: 0.4,
  });
  const cornerMat = new THREE.MeshStandardMaterial({
    color: '#18181b',
    roughness: 0.4,
    metalness: 0.85,
  });

  // Main box
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), crateMat);
  box.position.y = 0.9;
  box.castShadow = true;
  box.receiveShadow = true;
  crateGroup.add(box);

  // Corner steel brackets
  const bracketGeo = new THREE.BoxGeometry(0.25, 1.82, 0.25);
  const corners = [
    [-0.85, 0.9, -0.85],
    [0.85, 0.9, -0.85],
    [-0.85, 0.9, 0.85],
    [0.85, 0.9, 0.85],
  ];
  corners.forEach(([x, y, z]) => {
    const bracket = new THREE.Mesh(bracketGeo, cornerMat);
    bracket.position.set(x, y, z);
    crateGroup.add(bracket);
  });

  // Red beacon light on top
  const beaconGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.25, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(0, 1.9, 0);
  crateGroup.add(beacon);

  // Smoke column (vertical particles or semi-transparent cone for Free Fire airdrop red smoke)
  const smokeGeo = new THREE.CylinderGeometry(0.6, 0.1, 14, 8, 1, true);
  const smokeMat = new THREE.MeshBasicMaterial({
    color: '#ef4444',
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const smoke = new THREE.Mesh(smokeGeo, smokeMat);
  smoke.position.set(0, 8.8, 0);
  crateGroup.add(smoke);

  return crateGroup;
}

// 5. Procedural Palm Tree (Composite 3-12 parts)
export function createPalmTree(): THREE.Group {
  const tree = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#785f40',
    roughness: 0.9,
    metalness: 0.1,
  });
  const frondMat = new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // Segmented curved trunk
  let currentY = 0;
  const segments = 6;
  let currentX = 0;
  const curveFactor = (Math.random() - 0.5) * 0.15;

  for (let i = 0; i < segments; i++) {
    const radiusTop = 0.35 - i * 0.04;
    const radiusBottom = 0.42 - i * 0.04;
    const segHeight = 1.1;
    const segGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, segHeight, 8);
    const seg = new THREE.Mesh(segGeo, trunkMat);
    seg.position.set(currentX, currentY + segHeight / 2, 0);
    seg.rotation.z = curveFactor * i;
    seg.castShadow = true;
    tree.add(seg);

    currentY += segHeight * 0.95;
    currentX += Math.sin(curveFactor * i) * segHeight;
  }

  // Canopy of Palm Fronds (8 curved leaves)
  const frondCount = 8;
  for (let i = 0; i < frondCount; i++) {
    const angle = (Math.PI * 2 / frondCount) * i;
    const frondGeo = new THREE.ConeGeometry(0.8, 3.2, 4);
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(currentX, currentY, 0);
    frond.rotation.y = angle;
    frond.rotation.x = Math.PI / 2 + 0.35;
    frond.castShadow = true;
    tree.add(frond);
  }

  // Base rock grounding
  const rockGeo = new THREE.DodecahedronGeometry(0.6);
  const rockMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.85 });
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.position.set(0.2, 0.25, 0.2);
  rock.scale.set(1.2, 0.5, 0.8);
  tree.add(rock);

  return tree;
}

// 6. Military Outpost Watchtower
export function createWatchtower(): THREE.Group {
  const tower = new THREE.Group();

  const steelMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.5,
    metalness: 0.8,
  });
  const deckMat = new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.4,
    metalness: 0.8,
  });

  const height = 7.5;
  const legGeo = new THREE.CylinderGeometry(0.1, 0.14, height, 6);

  // 4 Legs
  const legPositions = [
    [-2, height / 2, -2],
    [2, height / 2, -2],
    [-2, height / 2, 2],
    [2, height / 2, 2],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, steelMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    tower.add(leg);
  });

  // Cross braces
  const braceGeo = new THREE.BoxGeometry(4.2, 0.08, 0.08);
  for (let h = 2; h < height; h += 2.5) {
    const b1 = new THREE.Mesh(braceGeo, steelMat);
    b1.position.set(0, h, 2);
    const b2 = new THREE.Mesh(braceGeo, steelMat);
    b2.position.set(0, h, -2);
    const b3 = new THREE.Mesh(braceGeo, steelMat);
    b3.rotation.y = Math.PI / 2;
    b3.position.set(2, h, 0);
    const b4 = new THREE.Mesh(braceGeo, steelMat);
    b4.rotation.y = Math.PI / 2;
    b4.position.set(-2, h, 0);
    tower.add(b1, b2, b3, b4);
  }

  // Observation Deck Platform
  const deckGeo = new THREE.BoxGeometry(4.8, 0.25, 4.8);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, height, 0);
  deck.receiveShadow = true;
  tower.add(deck);

  // Railing
  const railGeo = new THREE.BoxGeometry(4.8, 0.9, 0.1);
  const rail1 = new THREE.Mesh(railGeo, steelMat);
  rail1.position.set(0, height + 0.45, 2.35);
  const rail2 = new THREE.Mesh(railGeo, steelMat);
  rail2.position.set(0, height + 0.45, -2.35);
  tower.add(rail1, rail2);

  // Tin Roof
  const roofGeo = new THREE.ConeGeometry(3.6, 1.2, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6, metalness: 0.5 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, height + 2.4, 0);
  roof.castShadow = true;
  tower.add(roof);

  return tower;
}
