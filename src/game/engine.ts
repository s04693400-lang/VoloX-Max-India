import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterMeshGroup,
  createCharacterModel,
  createGlooWallMesh,
  createAirdropMesh,
  StanceType,
} from './models';
import { buildBermudaWorld, WorldData } from './world';
import { BattleZone } from './zone';
import { MultiplayerManager, RemoteHumanPlayer } from './multiplayer';
import {
  WeaponId,
  WeaponState,
  WEAPON_DEFINITIONS,
  createInitialWeaponStates,
  createInitialArmorState,
  createInitialAmmoInventory,
  createInitialHealingInventory,
  HELMET_DEFINITIONS,
  VEST_DEFINITIONS,
  HEALING_DEFINITIONS,
  DamageNumber,
  KillFeedEntry,
  SurvivorStats,
  MatchStats,
  LootItem,
  AmmoType,
  ChatMessage,
  KillBadgeData,
  KillBadgeType,
} from './types';
import { CHARACTERS, OUTFITS, CharacterDef, OutfitDef } from './characterSkills';
import { soundEngine } from './audio';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: SurvivorStats) => void;
  onWeaponUpdate: (current: WeaponState, slot: WeaponId) => void;
  onSlotsUpdate: (slots: Record<1 | 2 | 3 | 4, WeaponId>, activeSlot: 1 | 2 | 3 | 4) => void;
  onNearbyLoot: (loot: LootItem | null) => void;
  onAliveCountUpdate: (count: number) => void;
  onKillFeedEntry: (entry: KillFeedEntry) => void;
  onDamageNumber: (dmg: DamageNumber) => void;
  onMatchEnd: (stats: MatchStats) => void;
  onHitmarker: (isHeadshot: boolean) => void;
  onAirdropIncoming: () => void;
  onZoneTimer: (seconds: number, isShrinking: boolean, phase: number) => void;
  onScopeToggle: (isScoped: boolean, fov: number, weaponId: WeaponId) => void;
  onStanceChange: (stance: StanceType) => void;
  onKillBadge?: (badge: KillBadgeData) => void;
  onChatMessage?: (chat: ChatMessage) => void;
  onSkillUpdate?: (cooldown: number, maxCooldown: number, isActive: boolean) => void;
}

export class GameEngine {
  private container: HTMLElement;
  public scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private callbacks: GameEngineCallbacks;

  // World, Zone, and Real Human Multiplayer
  private world: WorldData;
  public zone: BattleZone;
  public multiplayer: MultiplayerManager;

  // Local Player
  public playerMesh: CharacterMeshGroup;
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 5, 0);
  private playerVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.2;
  public currentStance: StanceType = 'standing';

  private isPointerLocked: boolean = false;
  public isAiming: boolean = false;
  private isGrounded: boolean = true;

  // Combat & Inventory (Free Fire 4-Slot System)
  public slots: Record<1 | 2 | 3 | 4, WeaponId> = {
    1: 'scar',
    2: 'm1014',
    3: 'usp',
    4: 'katana',
  };
  public activeSlot: 1 | 2 | 3 | 4 = 1;
  public currentWeaponId: WeaponId = 'scar';
  public weaponStates: Record<WeaponId, WeaponState> = createInitialWeaponStates();
  public stats: SurvivorStats = {
    hp: 200,
    maxHp: 200,
    ep: 150,
    maxEp: 200,
    armor: createInitialArmorState(),
    ammo: createInitialAmmoInventory(),
    healing: createInitialHealingInventory(),
    glooWalls: 3,
    kills: 0,
    damageDealt: 0,
    headshots: 0,
  };
  public nearbyLoot: LootItem | null = null;

  // Free Fire Character & Outfit Skills
  public characterId: string = 'alok';
  public outfitId: string = 'tactical_commando';
  public skillCooldown: number = 0;
  public skillDuration: number = 0;
  public chronoShieldHp: number = 0;
  public isCamouflaged: boolean = false;

  // Gloo Walls
  private glooWalls: Map<string, { mesh: THREE.Group; hp: number }> = new Map();

  // Airdrop
  private airdropMesh: THREE.Group | null = null;
  private airdropY: number = 60;
  private airdropTargetY: number = 0;
  private airdropPos: { x: number; z: number } = { x: 0, z: 0 };
  private airdropLooted: boolean = false;

  // Input states (Keyboard + Touch)
  private keys: Record<string, boolean> = {};
  public isMouseDown: boolean = false;
  public touchMoveVector: { x: number; y: number } = { x: 0, y: 0 };
  private fireTimer: number = 0;
  private isHealing: boolean = false;

  // Camera Shake
  private cameraShake: number = 0;

  // Raycasting
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  // Animation frame loop
  private frameId: number = 0;
  private isRunning: boolean = false;
  private clock: THREE.Clock = new THREE.Clock();
  private startTime: number = Date.now();
  private isSoftwareGl: boolean = false;

  constructor(
    container: HTMLElement,
    playerName: string,
    callbacks: GameEngineCallbacks,
    characterId: string = 'alok',
    outfitId: string = 'tactical_commando'
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.characterId = characterId;
    this.outfitId = outfitId;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#38bdf8'); // Tropical Bermuda sunny sky
    this.scene.fog = new THREE.FogExp2('#38bdf8', 0.007);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 800);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Room Environment Map
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting Rig
    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    sunLight.position.set(60, 100, 40);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 280;
    const d = 90;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight('#bae6fd', '#365314', 0.7);
    this.scene.add(hemiLight);

    // 6. Build Island World & Terrain
    this.world = buildBermudaWorld(this.scene);

    // 7. Initialize Battle Zone
    this.zone = new BattleZone(this.scene);

    // 8. Initialize Local Player Model with Chosen Free Fire Character & Outfit
    const charDef = CHARACTERS.find((c) => c.id === this.characterId) || CHARACTERS[0];
    const outfitDef = OUTFITS.find((o) => o.id === this.outfitId) || OUTFITS[0];

    this.playerMesh = createCharacterModel({
      name: playerName || 'You',
      vestHue: outfitDef.vestHue !== undefined ? outfitDef.vestHue : charDef.vestHue,
      pantColor: outfitDef.pantColor || charDef.pantColor,
      visorColor: outfitDef.visorColor || charDef.visorColor,
      isSelf: true,
    });
    const startX = (Math.random() - 0.5) * 30;
    const startZ = (Math.random() - 0.5) * 30;
    this.playerPos.set(startX, this.world.getGroundHeight(startX, startZ) + 0.1, startZ);
    this.playerMesh.position.copy(this.playerPos);
    this.scene.add(this.playerMesh);

    // 9. Initialize Real Human Multiplayer (No AI bots)
    this.multiplayer = new MultiplayerManager(this.scene, playerName, {
      onSelfInit: (selfId) => {
        this.playerMesh.setNametag(playerName || 'You', true);
      },
      onPlayerCountChange: (count) => {
        this.callbacks.onAliveCountUpdate(count);
      },
      onChatMessage: (chat) => {
        this.callbacks.onChatMessage?.(chat);
      },
      onKillFeed: (entry) => {
        this.callbacks.onKillFeedEntry(entry);

        // When local player scores a kill, trigger Free Fire Kill Effects!
        if (entry.isPlayerKiller) {
          this.stats.kills++;
          this.callbacks.onStatsUpdate(this.stats);

          let badgeType: KillBadgeType = 'ELIMINATED';
          if (entry.isHeadshot) {
            badgeType = 'HEADSHOT';
            soundEngine.playHeadshotKill();
          } else if (this.stats.kills === 1) {
            badgeType = 'FIRST_BLOOD';
            soundEngine.playKillConfirmed();
          } else if (this.stats.kills === 2) {
            badgeType = 'DOUBLE_KILL';
            soundEngine.playKillConfirmed();
          } else if (this.stats.kills >= 3) {
            badgeType = 'TRIPLE_KILL';
            soundEngine.playKillConfirmed();
          } else {
            soundEngine.playKillConfirmed();
          }

          this.callbacks.onKillBadge?.({
            id: `badge_${Date.now()}_${Math.random()}`,
            type: badgeType,
            victimName: entry.victim,
            weapon: entry.weapon,
            isHeadshot: entry.isHeadshot,
            timestamp: Date.now(),
          });
        }
      },
      onRemoteHit: (isHeadshot) => {
        this.damagePlayer(isHeadshot ? 65 : 28, isHeadshot);
      },
      onPlayerEliminated: (_victimId, killerName) => {
        this.handlePlayerDeath(killerName);
      },
      onBooyahVictory: (winnerName) => {
        this.handleBooyahVictory(winnerName);
      },
      onZoneSync: (serverZone) => {
        if (serverZone) {
          this.zone.state.currentRadius = serverZone.currentRadius;
          this.zone.state.targetRadius = serverZone.targetRadius;
          this.zone.state.centerX = serverZone.centerX;
          this.zone.state.centerZ = serverZone.centerZ;
          this.zone.state.nextCenterX = serverZone.nextCenterX;
          this.zone.state.nextCenterZ = serverZone.nextCenterZ;
          this.zone.state.shrinkTimer = serverZone.shrinkTimer;
          this.zone.state.isShrinking = serverZone.isShrinking;
          this.zone.state.phase = serverZone.phase;
        }
      },
      onRemoteGlooSpawn: (wall) => {
        if (this.glooWalls.has(wall.id)) return;
        const mesh = createGlooWallMesh();
        mesh.position.set(wall.x, wall.y, wall.z);
        mesh.rotation.y = wall.rot;
        this.scene.add(mesh);
        this.glooWalls.set(wall.id, { mesh, hp: wall.hp || 350 });
      },
      onRemoteGlooDestroy: (wallId) => {
        const wall = this.glooWalls.get(wallId);
        if (wall) {
          this.scene.remove(wall.mesh);
          this.glooWalls.delete(wallId);
        }
      },
    });

    this.callbacks.onAliveCountUpdate(1);

    // Bind event listeners
    this.setupInputs();
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    // Schedule Airdrop
    setTimeout(() => {
      this.triggerAirdrop();
    }, 25000);

    this.isRunning = true;
    this.clock.start();
    this.tick = this.tick.bind(this);
    this.frameId = requestAnimationFrame(this.tick);
  }

  // --- Input & Controls ---
  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Free Fire 4-Slot Weapon Switching (1: Primary, 2: Secondary, 3: Sidearm, 4: Melee)
      if (e.code === 'Digit1') this.selectSlot(1);
      if (e.code === 'Digit2') this.selectSlot(2);
      if (e.code === 'Digit3') this.selectSlot(3);
      if (e.code === 'Digit4') this.selectSlot(4);

      // Loot Pickup ([E])
      if (e.code === 'KeyE') this.pickupNearbyLoot();

      // Reload ([R])
      if (e.code === 'KeyR') this.reloadWeapon();

      // Gloo Wall deployment (F or G)
      if (e.code === 'KeyF' || e.code === 'KeyG') this.deployGlooWall();

      // Healing Item Use ([V] or [H])
      if (e.code === 'KeyV' || e.code === 'KeyH') this.useHealingItem();

      // Healing Item Switch ([X])
      if (e.code === 'KeyX') this.toggleHealingType();

      // Character Skill ([T])
      if (e.code === 'KeyT') this.activateCharacterSkill();

      // Stances: Crouch / Sit (KeyC)
      if (e.code === 'KeyC') {
        this.toggleCrouch();
      }

      // Stances: Prone / Lie down (KeyZ)
      if (e.code === 'KeyZ') {
        this.toggleProne();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Pointer Lock on canvas click for computer
    this.container.addEventListener('click', () => {
      if (!document.pointerLockElement && window.innerWidth > 768) {
        this.container.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.container;
    });

    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;
      const sens = this.isAiming ? 0.0012 : 0.0022;
      this.cameraYaw -= e.movementX * sens;
      this.cameraPitch = Math.max(-0.6, Math.min(0.8, this.cameraPitch + e.movementY * sens));
    });

    // Mouse buttons
    window.addEventListener('mousedown', (e) => {
      if (!this.isPointerLocked && window.innerWidth > 768) return;
      if (e.button === 0) {
        this.isMouseDown = true;
      } else if (e.button === 2) {
        this.toggleAim(true);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      } else if (e.button === 2) {
        this.toggleAim(false);
      }
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.isMouseDown = false;
    });
  }

  public toggleAim(active?: boolean) {
    this.isAiming = active !== undefined ? active : !this.isAiming;
    const def = WEAPON_DEFINITIONS[this.currentWeaponId];
    const targetFov = this.isAiming ? (def.zoomFov || 50) : 65;
    this.camera.fov = targetFov;
    this.camera.updateProjectionMatrix();
    this.callbacks.onScopeToggle(this.isAiming && def.category !== 'MELEE', targetFov, this.currentWeaponId);
  }

  public toggleCrouch() {
    if (this.currentStance === 'crouching') {
      this.currentStance = 'standing';
    } else {
      this.currentStance = 'crouching';
    }
    this.callbacks.onStanceChange(this.currentStance);
  }

  public toggleProne() {
    if (this.currentStance === 'prone') {
      this.currentStance = 'standing';
    } else {
      this.currentStance = 'prone';
    }
    this.callbacks.onStanceChange(this.currentStance);
  }

  public triggerJump() {
    if (this.isGrounded && this.currentStance !== 'prone') {
      this.playerVel.y = 7.5;
      this.isGrounded = false;
      this.currentStance = 'jumping';
      this.callbacks.onStanceChange(this.currentStance);
    }
  }

  public addTouchLookDelta(dx: number, dy: number) {
    const sens = this.isAiming ? 0.003 : 0.005;
    this.cameraYaw -= dx * sens;
    this.cameraPitch = Math.max(-0.6, Math.min(0.8, this.cameraPitch + dy * sens));
  }

  public selectSlot(slotNum: 1 | 2 | 3 | 4) {
    this.activeSlot = slotNum;
    const targetWeapon = this.slots[slotNum];
    this.switchWeapon(targetWeapon);
    this.callbacks.onSlotsUpdate(this.slots, this.activeSlot);
  }

  public switchWeapon(id: WeaponId) {
    this.currentWeaponId = id;
    this.playerMesh.setWeapon(id);
    this.callbacks.onWeaponUpdate(this.weaponStates[id], id);
    const def = WEAPON_DEFINITIONS[id];
    if (this.isAiming && def.category !== 'MELEE') {
      const targetFov = def.zoomFov || 50;
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
      this.callbacks.onScopeToggle(true, targetFov, id);
    } else if (this.isAiming) {
      this.camera.fov = 65;
      this.camera.updateProjectionMatrix();
      this.callbacks.onScopeToggle(false, 65, id);
    }
  }

  public reloadWeapon() {
    const state = this.weaponStates[this.currentWeaponId];
    const def = WEAPON_DEFINITIONS[this.currentWeaponId];
    if (state.isReloading || state.ammo >= def.magazineSize) return;

    // Melee weapons don't need reload
    if (!def.ammoType) return;

    const availableReserve = this.stats.ammo[def.ammoType] || 0;
    if (availableReserve <= 0) return;

    state.isReloading = true;
    soundEngine.playReload();

    setTimeout(() => {
      const needed = def.magazineSize - state.ammo;
      const toLoad = Math.min(needed, this.stats.ammo[def.ammoType!]);
      state.ammo += toLoad;
      this.stats.ammo[def.ammoType!] -= toLoad;
      state.isReloading = false;
      this.callbacks.onWeaponUpdate(state, this.currentWeaponId);
      this.callbacks.onStatsUpdate(this.stats);
    }, def.reloadTime * 1000);
  }

  public pickupNearbyLoot() {
    if (!this.nearbyLoot) return;
    const item = this.nearbyLoot;

    if (item.type === 'weapon' && item.weaponId) {
      const def = WEAPON_DEFINITIONS[item.weaponId];
      let targetSlot: 1 | 2 | 3 | 4 = 1;
      if (def.category === 'HG') {
        targetSlot = 3;
      } else if (def.category === 'MELEE') {
        targetSlot = 4;
      } else {
        // Slot 1 or Slot 2 for AR / SG / SR
        targetSlot = (this.activeSlot === 1 || this.activeSlot === 2) ? this.activeSlot : 1;
      }

      this.slots[targetSlot] = item.weaponId;
      this.selectSlot(targetSlot);
      soundEngine.playLootPickup();
    } else if (item.type === 'helmet' && item.armorLevel) {
      const hLvl = item.armorLevel;
      const hDef = HELMET_DEFINITIONS[hLvl];
      this.stats.armor.helmetLevel = hLvl;
      this.stats.armor.helmetDurability = hDef.maxDurability;
      this.stats.armor.maxHelmetDurability = hDef.maxDurability;
      this.stats.armor.helmetDamageReduction = hDef.damageReduction;
      soundEngine.playArmorEquip();
    } else if (item.type === 'vest' && item.armorLevel) {
      const vLvl = item.armorLevel;
      const vDef = VEST_DEFINITIONS[vLvl];
      this.stats.armor.vestLevel = vLvl;
      this.stats.armor.vestDurability = vDef.maxDurability;
      this.stats.armor.maxVestDurability = vDef.maxDurability;
      this.stats.armor.vestDamageReduction = vDef.damageReduction;
      soundEngine.playArmorEquip();
    } else if (item.type === 'healing') {
      if (item.healingType === 'medkit') {
        this.stats.healing.medkits += item.amount;
      } else {
        this.stats.healing.bandages += item.amount;
      }
      soundEngine.playLootPickup();
    } else if (item.type === 'gloo') {
      this.stats.glooWalls = Math.min(8, this.stats.glooWalls + item.amount);
      soundEngine.playLootPickup();
    } else if (item.type === 'ammo' && item.ammoType) {
      this.stats.ammo[item.ammoType] += item.amount;
      soundEngine.playLootPickup();
    }

    // Remove 3D visual mesh from scene & world spawns
    if (item.mesh) {
      this.scene.remove(item.mesh);
    }
    this.world.lootSpawns = this.world.lootSpawns.filter((l) => l.id !== item.id);
    this.nearbyLoot = null;

    this.callbacks.onNearbyLoot(null);
    this.callbacks.onStatsUpdate(this.stats);
    this.callbacks.onWeaponUpdate(this.weaponStates[this.currentWeaponId], this.currentWeaponId);
    this.callbacks.onSlotsUpdate(this.slots, this.activeSlot);
  }

  public toggleHealingType() {
    this.stats.healing.activeType =
      this.stats.healing.activeType === 'medkit' ? 'bandage' : 'medkit';
    this.callbacks.onStatsUpdate(this.stats);
  }

  public useHealingItem() {
    if (this.isHealing) return;
    const isMedkit = this.stats.healing.activeType === 'medkit';

    if (isMedkit) {
      if (this.stats.healing.medkits <= 0 || this.stats.hp >= this.stats.maxHp) return;
      this.isHealing = true;
      this.stats.healing.medkits--;
      this.callbacks.onStatsUpdate(this.stats);
      soundEngine.playMedkitUse();

      setTimeout(() => {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + HEALING_DEFINITIONS.medkit.hpHeal);
        this.stats.ep = Math.min(this.stats.maxEp, this.stats.ep + HEALING_DEFINITIONS.medkit.epHeal);
        this.isHealing = false;
        this.callbacks.onStatsUpdate(this.stats);
      }, HEALING_DEFINITIONS.medkit.useTime * 1000);
    } else {
      // Bandage (heals 25 HP up to 150 HP cap in 1.5s)
      if (this.stats.healing.bandages <= 0 || this.stats.hp >= HEALING_DEFINITIONS.bandage.maxHpCap) return;
      this.isHealing = true;
      this.stats.healing.bandages--;
      this.callbacks.onStatsUpdate(this.stats);
      soundEngine.playBandageUse();

      setTimeout(() => {
        this.stats.hp = Math.min(HEALING_DEFINITIONS.bandage.maxHpCap, this.stats.hp + HEALING_DEFINITIONS.bandage.hpHeal);
        this.isHealing = false;
        this.callbacks.onStatsUpdate(this.stats);
      }, HEALING_DEFINITIONS.bandage.useTime * 1000);
    }
  }

  public deployGlooWall() {
    if (this.stats.glooWalls <= 0) return;
    this.stats.glooWalls--;
    this.callbacks.onStatsUpdate(this.stats);

    const spawnDist = 2.8;
    const wallX = this.playerPos.x + Math.sin(this.cameraYaw) * spawnDist;
    const wallZ = this.playerPos.z + Math.cos(this.cameraYaw) * spawnDist;
    const wallY = this.world.getGroundHeight(wallX, wallZ);

    const wall = createGlooWallMesh();
    wall.position.set(wallX, wallY, wallZ);
    wall.rotation.y = this.cameraYaw;
    this.scene.add(wall);

    soundEngine.playGlooWallDeploy();
    const glooId = `local_gloo_${Date.now()}`;
    this.glooWalls.set(glooId, { mesh: wall, hp: 350 });

    // Broadcast Gloo Wall to all other real human players over WebSocket
    this.multiplayer.sendDeployGloo(wallX, wallY, wallZ, this.cameraYaw);

    setTimeout(() => {
      this.scene.remove(wall);
      this.glooWalls.delete(glooId);
    }, 40000);
  }

  public triggerAirdrop() {
    this.callbacks.onAirdropIncoming();
    const crate = createAirdropMesh();

    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * (this.zone.state.currentRadius * 0.5);
    const dropX = this.zone.state.centerX + Math.cos(angle) * r;
    const dropZ = this.zone.state.centerZ + Math.sin(angle) * r;
    const groundY = this.world.getGroundHeight(dropX, dropZ);

    this.airdropPos = { x: dropX, z: dropZ };
    this.airdropTargetY = groundY;
    this.airdropY = groundY + 50;

    crate.position.set(dropX, this.airdropY, dropZ);
    this.scene.add(crate);
    this.airdropMesh = crate;
    this.airdropLooted = false;
  }

  // --- Character Skills & Combat Abilities ---
  public activateCharacterSkill() {
    if (this.skillCooldown > 0) return;
    const charDef = CHARACTERS.find((c) => c.id === this.characterId) || CHARACTERS[0];
    this.skillCooldown = charDef.skill.cooldown;

    if (this.characterId === 'alok') {
      this.skillDuration = 6;
      soundEngine.playAlokSkill();
    } else if (this.characterId === 'chrono') {
      this.skillDuration = 8;
      this.chronoShieldHp = 500;
      soundEngine.playChronoSkill();
    } else if (this.characterId === 'wukong') {
      this.skillDuration = 10;
      this.isCamouflaged = true;
      soundEngine.playCamouflageSkill();
    } else if (this.characterId === 'k') {
      this.skillDuration = 8;
      this.stats.ep = Math.min(this.stats.maxEp, this.stats.ep + 50);
      this.callbacks.onStatsUpdate(this.stats);
      soundEngine.playAlokSkill();
    } else if (this.characterId === 'kelly') {
      this.skillDuration = 5;
      soundEngine.playMedkitUse();
    } else if (this.characterId === 'hayato') {
      this.skillDuration = 6;
      soundEngine.playKatanaSlash();
    }

    this.callbacks.onSkillUpdate?.(this.skillCooldown, charDef.skill.cooldown, true);
  }

  public sendChat(text: string, isTactical: boolean = false) {
    this.multiplayer.sendChat(text, isTactical);
  }

  // --- Main Tick Game Loop ---
  private tick() {
    if (!this.isRunning) return;

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // 60fps clamped simulation
    const time = performance.now() * 0.001;

    // Process Character Skill Cooldowns & Active Effects
    if (this.skillCooldown > 0) {
      this.skillCooldown = Math.max(0, this.skillCooldown - dt);
      const charDef = CHARACTERS.find((c) => c.id === this.characterId) || CHARACTERS[0];
      this.callbacks.onSkillUpdate?.(this.skillCooldown, charDef.skill.cooldown, this.skillDuration > 0);
    }
    if (this.skillDuration > 0) {
      this.skillDuration = Math.max(0, this.skillDuration - dt);
      // Alok Drop the Beat: restores 12 HP/s
      if (this.characterId === 'alok') {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 12 * dt);
        this.callbacks.onStatsUpdate(this.stats);
      }
      if (this.skillDuration <= 0) {
        this.chronoShieldHp = 0;
        this.isCamouflaged = false;
        const charDef = CHARACTERS.find((c) => c.id === this.characterId) || CHARACTERS[0];
        this.callbacks.onSkillUpdate?.(this.skillCooldown, charDef.skill.cooldown, false);
      }
    }

    // 1. Process Zone
    this.zone.update(dt, () => {
      soundEngine.playZoneAlert();
    });
    this.callbacks.onZoneTimer(
      Math.ceil(this.zone.state.shrinkTimer),
      this.zone.state.isShrinking,
      this.zone.state.phase
    );

    // Check player zone damage
    if (this.zone.isOutside(this.playerPos.x, this.playerPos.z)) {
      this.stats.hp -= this.zone.state.damagePerSec * dt;
      this.callbacks.onStatsUpdate(this.stats);
      if (Math.random() < 0.02) soundEngine.playPlayerHurt();

      if (this.stats.hp <= 0) {
        this.handlePlayerDeath('Electric Storm');
        return;
      }
    }

    // EP to HP passive conversion
    if (this.stats.hp < this.stats.maxHp && this.stats.ep > 0) {
      const healAmount = 2.5 * dt;
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + healAmount);
      this.stats.ep = Math.max(0, this.stats.ep - healAmount);
      this.callbacks.onStatsUpdate(this.stats);
    }

    // 2. Process Player Movement & Human Poses
    this.updatePlayerMovement(dt, time);

    // 3. Process Weapons & Shooting
    this.updateCombat(dt);

    // 4. Update Multiplayer Human Survivors
    this.multiplayer.update(dt);

    // Broadcast our movement to WebSocket server
    const currentSpeed = Math.hypot(this.playerVel.x, this.playerVel.z);
    this.multiplayer.sendMove(
      this.playerPos,
      this.cameraYaw,
      this.cameraPitch,
      this.currentStance,
      currentSpeed
    );

    // 5. Update Ground Loot Items (Animation & Proximity Check)
    let closestItem: LootItem | null = null;
    let closestDist = 2.8;

    for (let i = this.world.lootSpawns.length - 1; i >= 0; i--) {
      const item = this.world.lootSpawns[i];
      if (item.mesh) {
        // Floating rotation & gentle hover bobbing
        item.mesh.rotation.y += dt * 1.5;
        item.mesh.position.y = item.y + Math.sin(time * 3 + item.x) * 0.08;
      }

      const dist = Math.hypot(this.playerPos.x - item.x, this.playerPos.z - item.z);

      // Auto-pickup Ammo boxes when running over them (< 1.6m)
      if (item.type === 'ammo' && item.ammoType && dist < 1.6) {
        this.stats.ammo[item.ammoType] += item.amount;
        soundEngine.playLootPickup();
        if (item.mesh) {
          this.scene.remove(item.mesh);
        }
        this.world.lootSpawns.splice(i, 1);
        this.callbacks.onStatsUpdate(this.stats);
        this.callbacks.onWeaponUpdate(this.weaponStates[this.currentWeaponId], this.currentWeaponId);
        continue;
      }

      // Check proximity for interactive loot pickup ([E] / Tap)
      if (dist < closestDist) {
        closestDist = dist;
        closestItem = item;
      }
    }

    if (closestItem !== this.nearbyLoot) {
      this.nearbyLoot = closestItem;
      this.callbacks.onNearbyLoot(this.nearbyLoot);
    }

    // 6. Update Airdrop descent
    if (this.airdropMesh) {
      if (this.airdropY > this.airdropTargetY) {
        this.airdropY -= 6 * dt;
        this.airdropMesh.position.y = this.airdropY;
      } else {
        this.airdropMesh.position.y = this.airdropTargetY;
        const dist = Math.hypot(this.playerPos.x - this.airdropPos.x, this.playerPos.z - this.airdropPos.z);
        if (dist < 3.2 && !this.airdropLooted) {
          this.airdropLooted = true;
          // Equip Legendary / Tier 3 Armor
          this.stats.armor.helmetLevel = 3;
          this.stats.armor.helmetDurability = HELMET_DEFINITIONS[3].maxDurability;
          this.stats.armor.maxHelmetDurability = HELMET_DEFINITIONS[3].maxDurability;
          this.stats.armor.helmetDamageReduction = HELMET_DEFINITIONS[3].damageReduction;

          this.stats.armor.vestLevel = 3;
          this.stats.armor.vestDurability = VEST_DEFINITIONS[3].maxDurability;
          this.stats.armor.maxVestDurability = VEST_DEFINITIONS[3].maxDurability;
          this.stats.armor.vestDamageReduction = VEST_DEFINITIONS[3].damageReduction;

          this.stats.glooWalls = Math.min(8, this.stats.glooWalls + 3);
          this.stats.healing.medkits += 2;
          this.stats.healing.bandages += 4;
          this.stats.ammo.ammo_ar += 90;
          this.stats.ammo.ammo_sr += 15;

          soundEngine.playArmorEquip();
          soundEngine.playLootPickup();
          this.callbacks.onStatsUpdate(this.stats);
          this.callbacks.onWeaponUpdate(this.weaponStates[this.currentWeaponId], this.currentWeaponId);
        }
      }
    }

    // 7. Camera Follow Orbit
    this.updateCamera(dt);

    // 8. Render
    this.renderer.render(this.scene, this.camera);

    this.frameId = requestAnimationFrame(this.tick);
  }

  private updatePlayerMovement(dt: number, time: number) {
    const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];

    // Speed scaled by stance (prone is slowest, sprint is fastest)
    const baseSpeed =
      this.currentStance === 'prone'
        ? 1.5
        : this.currentStance === 'crouching'
        ? 2.6
        : isSprinting
        ? 7.8
        : 4.8;

    let moveX = 0;
    let moveZ = 0;

    // Keyboard movement
    if (this.keys['KeyW']) moveZ += 1;
    if (this.keys['KeyS']) moveZ -= 1;
    if (this.keys['KeyA']) moveX += 1;
    if (this.keys['KeyD']) moveX -= 1;

    // Mobile Touch Virtual Joystick movement
    if (Math.abs(this.touchMoveVector.x) > 0.05 || Math.abs(this.touchMoveVector.y) > 0.05) {
      moveX = -this.touchMoveVector.x;
      moveZ = -this.touchMoveVector.y;
    }

    const len = Math.hypot(moveX, moveZ);
    if (len > 0) {
      moveX /= len;
      moveZ /= len;
    }

    // Determine current stance when moving vs idle
    if (this.isGrounded) {
      if (this.currentStance !== 'crouching' && this.currentStance !== 'prone') {
        if (len > 0.1 && (isSprinting || len > 0.8)) {
          this.currentStance = 'running';
        } else if (len > 0.1) {
          this.currentStance = 'running';
        } else {
          this.currentStance = 'standing';
        }
      }
    }

    // Calculate world movement along camera yaw
    const forwardX = Math.sin(this.cameraYaw);
    const forwardZ = Math.cos(this.cameraYaw);
    const rightX = Math.cos(this.cameraYaw);
    const rightZ = -Math.sin(this.cameraYaw);

    // Character skill speed modifiers (Kelly Dash & Alok Drop the Beat aura)
    let speedMult = 1.0;
    if (this.characterId === 'kelly') {
      speedMult += this.skillDuration > 0 ? 0.35 : 0.12;
    }
    if (this.characterId === 'alok' && this.skillDuration > 0) {
      speedMult += 0.20;
    }

    const worldMoveX = (forwardX * moveZ + rightX * moveX) * baseSpeed * speedMult;
    const worldMoveZ = (forwardZ * moveZ + rightZ * moveX) * baseSpeed * speedMult;

    this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, worldMoveX, 14, dt);
    this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, worldMoveZ, 14, dt);

    // Jump & Gravity (Space on keyboard)
    if (this.keys['Space'] && this.isGrounded && this.currentStance !== 'prone') {
      this.triggerJump();
    }

    this.playerVel.y -= 19.8 * dt; // gravity

    // Apply movement
    this.playerPos.x += this.playerVel.x * dt;
    this.playerPos.z += this.playerVel.z * dt;
    this.playerPos.y += this.playerVel.y * dt;

    // Ground check
    const groundHeight = this.world.getGroundHeight(this.playerPos.x, this.playerPos.z);
    if (this.playerPos.y <= groundHeight) {
      this.playerPos.y = groundHeight;
      this.playerVel.y = 0;
      this.isGrounded = true;
      if (this.currentStance === 'jumping') {
        this.currentStance = 'standing';
      }
    }

    // Face camera direction
    this.playerMesh.position.copy(this.playerPos);
    this.playerMesh.rotation.y = this.cameraYaw;

    // Animate Real Human Stance
    const speed = Math.hypot(this.playerVel.x, this.playerVel.z);
    this.playerMesh.animateStance(
      time,
      speed,
      this.currentStance,
      this.isAiming,
      this.fireTimer > 0.05
    );
  }

  private updateCombat(dt: number) {
    this.fireTimer -= dt;
    const def = WEAPON_DEFINITIONS[this.currentWeaponId];
    const state = this.weaponStates[this.currentWeaponId];

    if (this.isMouseDown && this.fireTimer <= 0 && !state.isReloading) {
      if (state.ammo <= 0) {
        this.reloadWeapon();
        return;
      }

      this.fireTimer = def.fireRate;
      state.ammo--;
      this.callbacks.onWeaponUpdate(state, this.currentWeaponId);

      // Procedural audio for all 10 Free Fire weapons
      switch (this.currentWeaponId) {
        case 'scar':
          soundEngine.playARShot();
          break;
        case 'ak47':
          soundEngine.playAK47Shot();
          break;
        case 'm1014':
          soundEngine.playShotgunShot();
          break;
        case 'spas12':
          soundEngine.playSPAS12Shot();
          break;
        case 'usp':
          soundEngine.playUSPShot();
          break;
        case 'deagle':
          soundEngine.playDeagleShot();
          break;
        case 'awm':
          soundEngine.playSniperShot();
          break;
        case 'kar98k':
          soundEngine.playKar98kShot();
          break;
        case 'katana':
          soundEngine.playKatanaSlash();
          break;
        case 'pan':
          soundEngine.playPanClank();
          break;
        default:
          soundEngine.playARShot();
          break;
      }

      // Recoil kick
      this.cameraPitch -= def.recoil;
      this.cameraShake = Math.min(0.25, this.cameraShake + def.recoil * 0.8);

      // Broadcast fire event to other human players over WebSocket
      const origin = new THREE.Vector3(
        this.playerPos.x,
        this.playerPos.y + (this.currentStance === 'prone' ? 0.3 : 1.4),
        this.playerPos.z
      );
      const dir = new THREE.Vector3(
        Math.sin(this.cameraYaw),
        -Math.sin(this.cameraPitch),
        Math.cos(this.cameraYaw)
      ).normalize();
      this.multiplayer.sendFire(this.currentWeaponId, origin, dir);

      // Perform raycast shot from crosshair center against real human players
      this.executeShot(def);
    }
  }

  private executeShot(def: typeof WEAPON_DEFINITIONS[WeaponId]) {
    const pellets = def.pellets || 1;

    for (let p = 0; p < pellets; p++) {
      const spreadX = (Math.random() - 0.5) * def.spread * (this.isAiming ? 0.35 : 1.0);
      const spreadY = (Math.random() - 0.5) * def.spread * (this.isAiming ? 0.35 : 1.0);

      this.raycaster.setFromCamera(new THREE.Vector2(spreadX, spreadY), this.camera);

      // Raycast against real human players!
      let hitSomething = false;
      this.multiplayer.remotePlayers.forEach((human) => {
        if (!human.isAlive || hitSomething) return;

        const hPos = human.mesh.position;
        const targetCenter = new THREE.Vector3(
          hPos.x,
          hPos.y + (human.stance === 'prone' ? 0.3 : human.stance === 'crouching' ? 0.8 : 1.2),
          hPos.z
        );

        const distToRay = this.raycaster.ray.distanceToPoint(targetCenter);
        if (distToRay < (human.stance === 'prone' ? 0.7 : 1.1)) {
          hitSomething = true;
          const headCenter = new THREE.Vector3(hPos.x, hPos.y + (human.stance === 'prone' ? 0.4 : 1.8), hPos.z);
          const isHeadshot = this.raycaster.ray.distanceToPoint(headCenter) < 0.45;
          const damage = Math.round(def.damage * (isHeadshot ? def.headshotMultiplier : 1.0));

          // Send real-time hit to WebSocket server
          this.multiplayer.sendHit(human.id, damage, isHeadshot, this.currentWeaponId);

          if (isHeadshot) {
            soundEngine.playHeadshotSound();
            this.callbacks.onHitmarker(true);
            this.stats.headshots++;
          } else {
            soundEngine.playHitMarker();
            this.callbacks.onHitmarker(false);
          }

          this.stats.damageDealt += damage;
          this.callbacks.onStatsUpdate(this.stats);

          // Damage number pop
          this.callbacks.onDamageNumber({
            id: Math.random(),
            text: `${damage}`,
            x: hPos.x,
            y: hPos.y + (isHeadshot ? 2.2 : 1.4),
            z: hPos.z,
            isHeadshot,
            opacity: 1,
            scale: isHeadshot ? 1.5 : 1.0,
          });
        }
      });

      // Check hits against Gloo walls
      if (!hitSomething) {
        this.glooWalls.forEach((wall, wallId) => {
          const dist = this.raycaster.ray.distanceToPoint(wall.mesh.position);
          if (dist < 2.2) {
            wall.hp -= def.damage;
            this.multiplayer.sendHitGloo(wallId, def.damage);
            if (wall.hp <= 0) {
              this.scene.remove(wall.mesh);
              this.glooWalls.delete(wallId);
            }
          }
        });
      }
    }
  }

  public damagePlayer(amount: number, isHeadshot: boolean = false) {
    let effective = amount;

    // Chrono Time Turner Shield Absorption
    if (this.chronoShieldHp > 0) {
      const absorbed = Math.min(this.chronoShieldHp, effective);
      this.chronoShieldHp -= absorbed;
      effective -= absorbed;
      soundEngine.playChronoSkill();
      if (effective <= 0) return;
    }

    // Hayato Bushido Art of Blades Frontal Damage Resistance
    if (this.characterId === 'hayato' && this.skillDuration > 0) {
      effective *= 0.8;
    }

    if (isHeadshot) {
      // Helmet damage reduction
      const helmet = this.stats.armor;
      if (helmet.helmetLevel > 0 && helmet.helmetDurability > 0) {
        const absorbed = effective * helmet.helmetDamageReduction;
        effective -= absorbed;
        helmet.helmetDurability = Math.max(0, helmet.helmetDurability - absorbed);
        if (helmet.helmetDurability <= 0) {
          helmet.helmetLevel = 0;
          helmet.helmetDamageReduction = 0;
          soundEngine.playArmorBreak();
        }
      }
    } else {
      // Vest damage reduction
      const vest = this.stats.armor;
      if (vest.vestLevel > 0 && vest.vestDurability > 0) {
        const absorbed = effective * vest.vestDamageReduction;
        effective -= absorbed;
        vest.vestDurability = Math.max(0, vest.vestDurability - absorbed);
        if (vest.vestDurability <= 0) {
          vest.vestLevel = 0;
          vest.vestDamageReduction = 0;
          soundEngine.playArmorBreak();
        }
      }
    }

    this.stats.hp -= effective;
    this.cameraShake += 0.15;
    soundEngine.playPlayerHurt();
    this.callbacks.onStatsUpdate(this.stats);

    if (this.stats.hp <= 0) {
      this.handlePlayerDeath('Enemy Survivor');
    }
  }

  private updateCamera(dt: number) {
    // Shoulder offset adjusted by stance
    const shoulderDist = this.isAiming ? 1.4 : this.currentStance === 'prone' ? 2.6 : 3.4;
    const shoulderHeight =
      this.isAiming
        ? 1.55
        : this.currentStance === 'prone'
        ? 0.75
        : this.currentStance === 'crouching'
        ? 1.25
        : 1.8;
    const shoulderRight = this.isAiming ? 0.6 : 0.8;

    const backX = -Math.sin(this.cameraYaw) * shoulderDist;
    const backZ = -Math.cos(this.cameraYaw) * shoulderDist;
    const rightX = Math.cos(this.cameraYaw) * shoulderRight;
    const rightZ = -Math.sin(this.cameraYaw) * shoulderRight;

    const shakeX = (Math.random() - 0.5) * this.cameraShake;
    const shakeY = (Math.random() - 0.5) * this.cameraShake;
    this.cameraShake = THREE.MathUtils.damp(this.cameraShake, 0, 10, dt);

    const targetCamX = this.playerPos.x + backX + rightX + shakeX;
    const targetCamY = this.playerPos.y + shoulderHeight + Math.sin(this.cameraPitch) * shoulderDist + shakeY;
    const targetCamZ = this.playerPos.z + backZ + rightZ;

    this.camera.position.set(targetCamX, targetCamY, targetCamZ);

    const lookTarget = new THREE.Vector3(
      this.playerPos.x + Math.sin(this.cameraYaw) * 20,
      this.playerPos.y + shoulderHeight - Math.sin(this.cameraPitch) * 20,
      this.playerPos.z + Math.cos(this.cameraYaw) * 20
    );
    this.camera.lookAt(lookTarget);
  }

  private handlePlayerDeath(killer: string) {
    this.stats.hp = 0;
    this.callbacks.onStatsUpdate(this.stats);
    soundEngine.playDefeatSound();

    const survivalSec = Math.floor((Date.now() - this.startTime) / 1000);
    this.callbacks.onMatchEnd({
      rank: this.multiplayer.remotePlayers.size + 1,
      totalPlayers: this.multiplayer.remotePlayers.size + 1,
      kills: this.stats.kills,
      headshots: this.stats.headshots,
      damageDealt: this.stats.damageDealt,
      survivalTimeSec: survivalSec,
      isBooyah: false,
    });
  }

  private handleBooyahVictory(winnerName?: string) {
    soundEngine.playBooyahFanfare();
    const survivalSec = Math.floor((Date.now() - this.startTime) / 1000);
    this.callbacks.onMatchEnd({
      rank: 1,
      totalPlayers: this.multiplayer.remotePlayers.size + 1,
      kills: this.stats.kills,
      headshots: this.stats.headshots,
      damageDealt: this.stats.damageDealt,
      survivalTimeSec: survivalSec,
      isBooyah: true,
    });
  }

  private onWindowResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.multiplayer.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
