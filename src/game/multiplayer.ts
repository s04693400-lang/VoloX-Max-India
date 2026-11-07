import * as THREE from 'three';
import { CharacterMeshGroup, createCharacterModel, StanceType } from './models';
import { WeaponId, KillFeedEntry, ChatMessage } from './types';
import { soundEngine } from './audio';

export interface RemoteHumanPlayer {
  id: string;
  name: string;
  mesh: CharacterMeshGroup;
  targetPos: THREE.Vector3;
  targetYaw: number;
  targetPitch: number;
  stance: StanceType;
  speed: number;
  hp: number;
  armor: number;
  weaponId: WeaponId;
  isAlive: boolean;
  isFiring: boolean;
  lastUpdate: number;
}

export interface MultiplayerCallbacks {
  onSelfInit: (selfId: string) => void;
  onPlayerCountChange: (count: number) => void;
  onKillFeed: (entry: KillFeedEntry) => void;
  onRemoteHit: (isHeadshot: boolean) => void;
  onPlayerEliminated: (victimId: string, killerName: string) => void;
  onBooyahVictory: (winnerName: string) => void;
  onZoneSync: (zone: any) => void;
  onRemoteGlooSpawn: (wall: { id: string; x: number; y: number; z: number; rot: number; hp?: number }) => void;
  onRemoteGlooDestroy: (wallId: string) => void;
  onChatMessage?: (chat: ChatMessage) => void;
}

export class MultiplayerManager {
  private ws: WebSocket | null = null;
  public selfId: string = '';
  public playerName: string = 'Warrior';
  public remotePlayers: Map<string, RemoteHumanPlayer> = new Map();
  private scene: THREE.Scene;
  private callbacks: MultiplayerCallbacks;
  private lastSendTime: number = 0;
  private reconnectTimeout: any = null;

  constructor(scene: THREE.Scene, playerName: string, callbacks: MultiplayerCallbacks) {
    this.scene = scene;
    this.playerName = playerName;
    this.callbacks = callbacks;
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Send JOIN message
        this.ws?.send(
          JSON.stringify({
            type: 'JOIN',
            name: this.playerName,
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      this.ws.onclose = () => {
        this.reconnectTimeout = setTimeout(() => this.connect(), 2500);
      };

      this.ws.onerror = (err) => {
        console.warn('WS error, retrying...', err);
      };
    } catch (e) {
      console.warn('Could not connect WS, retrying...', e);
      this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
    }
  }

  private handleServerMessage(msg: any) {
    if (msg.type === 'INIT') {
      this.selfId = msg.selfId;
      this.callbacks.onSelfInit(this.selfId);

      // Spawn other already-connected human players
      if (Array.isArray(msg.players)) {
        msg.players.forEach((p: any) => {
          if (p.id !== this.selfId) {
            this.addRemotePlayer(p);
          }
        });
      }

      this.callbacks.onPlayerCountChange(this.remotePlayers.size + 1);

      if (msg.zone) {
        this.callbacks.onZoneSync(msg.zone);
      }
    } else if (msg.type === 'PLAYER_JOINED') {
      if (msg.player.id !== this.selfId) {
        this.addRemotePlayer(msg.player);
        this.callbacks.onPlayerCountChange(this.remotePlayers.size + 1);
        this.callbacks.onKillFeed({
          id: `join_${Date.now()}`,
          killer: msg.player.name,
          victim: 'joined the India battleground',
          weapon: 'BERMUDA',
          isHeadshot: false,
          isPlayerKiller: false,
          isPlayerVictim: false,
          timestamp: Date.now(),
        });
      }
    } else if (msg.type === 'PLAYER_MOVED') {
      const rp = this.remotePlayers.get(msg.player.id);
      if (rp) {
        rp.targetPos.set(msg.player.x, msg.player.y, msg.player.z);
        rp.targetYaw = msg.player.yaw;
        rp.targetPitch = msg.player.pitch;
        rp.stance = msg.player.stance || 'standing';
        rp.lastUpdate = Date.now();
      }
    } else if (msg.type === 'PLAYER_FIRED') {
      const rp = this.remotePlayers.get(msg.playerId);
      if (rp) {
        rp.isFiring = true;
        setTimeout(() => {
          rp.isFiring = false;
        }, 120);

        if (msg.weaponId === 'awm') soundEngine.playSniperShot();
        else if (msg.weaponId === 'm1014') soundEngine.playShotgunShot();
        else soundEngine.playARShot();
      }
    } else if (msg.type === 'PLAYER_DAMAGED') {
      if (msg.targetId === this.selfId) {
        this.callbacks.onRemoteHit(msg.isHeadshot);
      } else {
        const rp = this.remotePlayers.get(msg.targetId);
        if (rp) {
          rp.hp = msg.hp;
          rp.armor = msg.armor;
        }
      }
    } else if (msg.type === 'PLAYER_ELIMINATED') {
      this.callbacks.onKillFeed({
        id: `kill_${Date.now()}_${Math.random()}`,
        killer: msg.killerName,
        victim: msg.victimName,
        weapon: msg.weaponId,
        isHeadshot: msg.isHeadshot,
        isPlayerKiller: msg.killerId === this.selfId,
        isPlayerVictim: msg.victimId === this.selfId,
        timestamp: Date.now(),
      });

      if (msg.victimId === this.selfId) {
        this.callbacks.onPlayerEliminated(msg.victimId, msg.killerName);
      } else {
        const rp = this.remotePlayers.get(msg.victimId);
        if (rp) {
          rp.isAlive = false;
          rp.mesh.rotation.x = Math.PI / 2; // Collapse pose
          setTimeout(() => {
            this.scene.remove(rp.mesh);
            this.remotePlayers.delete(msg.victimId);
            this.callbacks.onPlayerCountChange(this.remotePlayers.size + 1);
          }, 8000);
        }
      }
    } else if (msg.type === 'VICTORY_BOOYAH') {
      this.callbacks.onBooyahVictory(msg.winnerName);
    } else if (msg.type === 'ZONE_SYNC') {
      this.callbacks.onZoneSync(msg.zone);
    } else if (msg.type === 'GLOO_DEPLOYED') {
      this.callbacks.onRemoteGlooSpawn(msg.wall);
    } else if (msg.type === 'GLOO_DESTROYED') {
      this.callbacks.onRemoteGlooDestroy(msg.wallId);
    } else if (msg.type === 'CHAT_MESSAGE') {
      soundEngine.playChatPing();
      if (this.callbacks.onChatMessage) {
        this.callbacks.onChatMessage({
          id: msg.id || `chat_${Date.now()}`,
          senderId: msg.senderId,
          senderName: msg.senderName,
          text: msg.text,
          isTactical: !!msg.isTactical,
          timestamp: msg.timestamp || Date.now(),
        });
      }
    } else if (msg.type === 'PLAYER_LEFT') {
      const rp = this.remotePlayers.get(msg.playerId);
      if (rp) {
        this.scene.remove(rp.mesh);
        this.remotePlayers.delete(msg.playerId);
        this.callbacks.onPlayerCountChange(this.remotePlayers.size + 1);
      }
    }
  }

  private addRemotePlayer(p: any) {
    if (this.remotePlayers.has(p.id)) return;

    const mesh = createCharacterModel({
      name: p.name,
      skinTone: '#c27945',
      vestHue: (this.remotePlayers.size * 55 + 20) % 360,
      pantColor: '#1e293b',
      visorColor: '#06b6d4',
      isSelf: false,
    });
    mesh.position.set(p.x, p.y, p.z);
    mesh.rotation.y = p.yaw || 0;
    mesh.setWeapon((p.weaponId as WeaponId) || 'scar');
    this.scene.add(mesh);

    this.remotePlayers.set(p.id, {
      id: p.id,
      name: p.name,
      mesh,
      targetPos: new THREE.Vector3(p.x, p.y, p.z),
      targetYaw: p.yaw || 0,
      targetPitch: p.pitch || 0,
      stance: p.stance || 'standing',
      speed: 0,
      hp: p.hp || 200,
      armor: p.armor || 100,
      weaponId: (p.weaponId as WeaponId) || 'scar',
      isAlive: true,
      isFiring: false,
      lastUpdate: Date.now(),
    });
  }

  // Called in game loop to smoothly interpolate remote players
  public update(dt: number) {
    const time = performance.now() * 0.001;

    this.remotePlayers.forEach((rp) => {
      if (!rp.isAlive) return;

      // Smooth position interpolation
      const dist = rp.mesh.position.distanceTo(rp.targetPos);
      rp.speed = dist / Math.max(dt, 0.016);
      rp.mesh.position.lerp(rp.targetPos, 0.25);

      // Smooth rotation
      rp.mesh.rotation.y = THREE.MathUtils.damp(rp.mesh.rotation.y, rp.targetYaw, 12, dt);

      // Real human stance animation
      rp.mesh.animateStance(time, rp.speed, rp.stance, false, rp.isFiring);
    });
  }

  // Send local player state to server at 30Hz
  public sendMove(
    pos: THREE.Vector3,
    yaw: number,
    pitch: number,
    stance: StanceType,
    speed: number
  ) {
    const now = performance.now();
    if (now - this.lastSendTime < 33) return; // 30Hz throttle
    this.lastSendTime = now;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'MOVE',
          x: Number(pos.x.toFixed(2)),
          y: Number(pos.y.toFixed(2)),
          z: Number(pos.z.toFixed(2)),
          yaw: Number(yaw.toFixed(3)),
          pitch: Number(pitch.toFixed(3)),
          stance,
          speed: Number(speed.toFixed(2)),
        })
      );
    }
  }

  public sendFire(weaponId: WeaponId, origin: THREE.Vector3, direction: THREE.Vector3) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'FIRE',
          weaponId,
          origin: { x: origin.x, y: origin.y, z: origin.z },
          direction: { x: direction.x, y: direction.y, z: direction.z },
        })
      );
    }
  }

  public sendHit(targetId: string, damage: number, isHeadshot: boolean, weaponId: WeaponId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'HIT_PLAYER',
          targetId,
          damage,
          isHeadshot,
          weaponId,
        })
      );
    }
  }

  public sendDeployGloo(x: number, y: number, z: number, rot: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'DEPLOY_GLOO',
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          z: Number(z.toFixed(2)),
          rot: Number(rot.toFixed(3)),
        })
      );
    }
  }

  public sendHitGloo(wallId: string, damage: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'HIT_GLOO',
          wallId,
          damage,
        })
      );
    }
  }

  public sendChat(text: string, isTactical: boolean = false) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'CHAT_MESSAGE',
          senderName: this.playerName,
          text,
          isTactical,
        })
      );
    }
  }

  public dispose() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.remotePlayers.forEach((rp) => {
      this.scene.remove(rp.mesh);
    });
    this.remotePlayers.clear();
  }
}
