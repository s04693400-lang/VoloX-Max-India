import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3000;

export type PlayerStance = 'standing' | 'running' | 'crouching' | 'prone' | 'jumping';

export interface NetworkPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  stance: PlayerStance;
  hp: number;
  maxHp: number;
  armor: number;
  weaponId: string;
  isFiring: boolean;
  kills: number;
  ping: number;
  lastSeen: number;
}

export interface NetworkGlooWall {
  id: string;
  x: number;
  y: number;
  z: number;
  rot: number;
  hp: number;
  ownerId: string;
}

// In-Memory Real-Time Match State
interface RoomState {
  roomId: string;
  players: Map<string, { ws: WebSocket; player: NetworkPlayer }>;
  glooWalls: NetworkGlooWall[];
  zone: {
    centerX: number;
    centerZ: number;
    nextCenterX: number;
    nextCenterZ: number;
    currentRadius: number;
    targetRadius: number;
    shrinkTimer: number;
    isShrinking: boolean;
    phase: number;
  };
  airdrop: {
    x: number;
    y: number;
    z: number;
    targetY: number;
    isDropped: boolean;
    isLooted: boolean;
  } | null;
}

const defaultRoom: RoomState = {
  roomId: 'INDIA-BERMUDA-1',
  players: new Map(),
  glooWalls: [],
  zone: {
    centerX: 0,
    centerZ: 0,
    nextCenterX: 15,
    nextCenterZ: -10,
    currentRadius: 135,
    targetRadius: 85,
    shrinkTimer: 45,
    isShrinking: false,
    phase: 1,
  },
  airdrop: null,
};

// Periodic Zone & Airdrop Simulation on Server
setInterval(() => {
  const dt = 1.0;
  const z = defaultRoom.zone;
  z.shrinkTimer -= dt;

  if (!z.isShrinking) {
    if (z.shrinkTimer <= 0) {
      z.isShrinking = true;
      z.shrinkTimer = 30;
    }
  } else {
    // Shrink zone
    const lerpRate = 0.04;
    z.currentRadius += (z.targetRadius - z.currentRadius) * lerpRate;
    z.centerX += (z.nextCenterX - z.centerX) * lerpRate;
    z.centerZ += (z.nextCenterZ - z.centerZ) * lerpRate;

    if (z.shrinkTimer <= 0) {
      z.isShrinking = false;
      z.phase++;
      const nextRadii = [85, 48, 22, 6, 2];
      z.targetRadius = nextRadii[Math.min(z.phase - 1, nextRadii.length - 1)];
      z.shrinkTimer = 35;
      z.nextCenterX = z.centerX + (Math.random() - 0.5) * 25;
      z.nextCenterZ = z.centerZ + (Math.random() - 0.5) * 25;
    }
  }

  // Periodic Zone Sync Broadcast
  broadcastToRoom(defaultRoom, {
    type: 'ZONE_SYNC',
    zone: z,
  });
}, 1000);

function broadcastToRoom(room: RoomState, message: any, excludeId?: string) {
  const raw = JSON.stringify(message);
  room.players.forEach(({ ws, player }) => {
    if (player.id !== excludeId && ws.readyState === WebSocket.OPEN) {
      ws.send(raw);
    }
  });
}

// WebSocket Connection Management
wss.on('connection', (ws) => {
  let playerId = `volox_${Math.random().toString(36).substring(2, 9)}`;
  let playerRoom = defaultRoom;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'JOIN') {
        playerId = msg.playerId || playerId;
        const name = msg.name || `Warrior_${playerId.substring(0, 4)}`;

        // Spawn positions across Bermuda
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 35;
        const spawnX = Math.cos(angle) * dist;
        const spawnZ = Math.sin(angle) * dist;

        const newPlayer: NetworkPlayer = {
          id: playerId,
          name,
          x: spawnX,
          y: 3.5,
          z: spawnZ,
          yaw: 0,
          pitch: 0,
          stance: 'standing',
          hp: 200,
          maxHp: 200,
          armor: 100,
          weaponId: 'scar',
          isFiring: false,
          kills: 0,
          ping: 18,
          lastSeen: Date.now(),
        };

        playerRoom.players.set(playerId, { ws, player: newPlayer });

        // Send full match init to joining player
        const currentPlayersList: NetworkPlayer[] = [];
        playerRoom.players.forEach(({ player }) => {
          currentPlayersList.push(player);
        });

        ws.send(
          JSON.stringify({
            type: 'INIT',
            selfId: playerId,
            players: currentPlayersList,
            glooWalls: playerRoom.glooWalls,
            zone: playerRoom.zone,
            airdrop: playerRoom.airdrop,
          })
        );

        // Notify other human players
        broadcastToRoom(
          playerRoom,
          {
            type: 'PLAYER_JOINED',
            player: newPlayer,
          },
          playerId
        );
      } else if (msg.type === 'MOVE') {
        const client = playerRoom.players.get(playerId);
        if (client) {
          const p = client.player;
          p.x = msg.x;
          p.y = msg.y;
          p.z = msg.z;
          p.yaw = msg.yaw;
          p.pitch = msg.pitch;
          p.stance = msg.stance || p.stance;
          p.lastSeen = Date.now();

          // Broadcast movement to all other human players
          broadcastToRoom(
            playerRoom,
            {
              type: 'PLAYER_MOVED',
              player: {
                id: p.id,
                x: p.x,
                y: p.y,
                z: p.z,
                yaw: p.yaw,
                pitch: p.pitch,
                stance: p.stance,
              },
            },
            playerId
          );
        }
      } else if (msg.type === 'FIRE') {
        const client = playerRoom.players.get(playerId);
        if (client) {
          broadcastToRoom(
            playerRoom,
            {
              type: 'PLAYER_FIRED',
              playerId,
              weaponId: msg.weaponId,
              origin: msg.origin,
              direction: msg.direction,
            },
            playerId
          );
        }
      } else if (msg.type === 'HIT_PLAYER') {
        const target = playerRoom.players.get(msg.targetId);
        const attacker = playerRoom.players.get(playerId);

        if (target && attacker) {
          const rawDamage = Number(msg.damage) || 25;
          let effectiveDmg = rawDamage;

          // Armor absorption
          if (target.player.armor > 0) {
            const absorbed = Math.min(target.player.armor, effectiveDmg * 0.4);
            target.player.armor -= absorbed;
            effectiveDmg -= absorbed * 0.5;
          }

          target.player.hp -= effectiveDmg;

          // Broadcast damage result
          broadcastToRoom(playerRoom, {
            type: 'PLAYER_DAMAGED',
            targetId: msg.targetId,
            attackerId: playerId,
            damage: Math.round(effectiveDmg),
            isHeadshot: !!msg.isHeadshot,
            hp: Math.max(0, target.player.hp),
            armor: target.player.armor,
          });

          // Check Elimination
          if (target.player.hp <= 0) {
            target.player.hp = 0;
            attacker.player.kills++;

            broadcastToRoom(playerRoom, {
              type: 'PLAYER_ELIMINATED',
              victimId: target.player.id,
              victimName: target.player.name,
              killerId: attacker.player.id,
              killerName: attacker.player.name,
              weaponId: msg.weaponId || 'SCAR',
              isHeadshot: !!msg.isHeadshot,
            });

            // Check if 1 human survivor remains (Booyah victory!)
            const alivePlayers = Array.from(playerRoom.players.values()).filter(
              (p) => p.player.hp > 0
            );
            if (alivePlayers.length === 1) {
              const winner = alivePlayers[0].player;
              broadcastToRoom(playerRoom, {
                type: 'VICTORY_BOOYAH',
                winnerId: winner.id,
                winnerName: winner.name,
              });
            }
          }
        }
      } else if (msg.type === 'DEPLOY_GLOO') {
        const glooId = `gloo_${Date.now()}_${Math.random()}`;
        const newWall: NetworkGlooWall = {
          id: glooId,
          x: msg.x,
          y: msg.y,
          z: msg.z,
          rot: msg.rot,
          hp: 350,
          ownerId: playerId,
        };
        playerRoom.glooWalls.push(newWall);

        broadcastToRoom(playerRoom, {
          type: 'GLOO_DEPLOYED',
          wall: newWall,
        });

        // Expire after 40 seconds
        setTimeout(() => {
          playerRoom.glooWalls = playerRoom.glooWalls.filter((w) => w.id !== glooId);
          broadcastToRoom(playerRoom, {
            type: 'GLOO_DESTROYED',
            wallId: glooId,
          });
        }, 40000);
      } else if (msg.type === 'HIT_GLOO') {
        const wall = playerRoom.glooWalls.find((w) => w.id === msg.wallId);
        if (wall) {
          wall.hp -= Number(msg.damage) || 30;
          if (wall.hp <= 0) {
            playerRoom.glooWalls = playerRoom.glooWalls.filter((w) => w.id !== msg.wallId);
            broadcastToRoom(playerRoom, {
              type: 'GLOO_DESTROYED',
              wallId: msg.wallId,
            });
          }
        }
      } else if (msg.type === 'CHAT_MESSAGE') {
        const sender = playerRoom.players.get(playerId);
        const senderName = sender ? sender.player.name : (msg.senderName || 'Survivor');
        broadcastToRoom(playerRoom, {
          type: 'CHAT_MESSAGE',
          id: `chat_${Date.now()}_${Math.random()}`,
          senderId: playerId,
          senderName,
          text: String(msg.text || '').substring(0, 120),
          isTactical: !!msg.isTactical,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    playerRoom.players.delete(playerId);
    broadcastToRoom(playerRoom, {
      type: 'PLAYER_LEFT',
      playerId,
    });
  });
});

// Setup Express and Vite Middleware
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[VoloX Max India] Game server listening on port ${PORT}`);
  });
}

startServer();
