import * as THREE from 'three';
import { ZoneState } from './types';

export class BattleZone {
  public state: ZoneState;
  public zoneMesh: THREE.Mesh;
  public nextRingMesh: THREE.LineLoop;
  private material: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.state = {
      currentRadius: 135,
      targetRadius: 85,
      centerX: 0,
      centerZ: 0,
      nextCenterX: (Math.random() - 0.5) * 40,
      nextCenterZ: (Math.random() - 0.5) * 40,
      shrinkTimer: 45, // 45 seconds countdown before phase 1 shrink
      phaseDuration: 45,
      isShrinking: false,
      phase: 1,
      damagePerSec: 4,
    };

    // Electric storm boundary cylinder
    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 60, 64, 1, true);
    this.material = new THREE.MeshBasicMaterial({
      color: '#06b6d4',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.zoneMesh = new THREE.Mesh(cylinderGeo, this.material);
    this.zoneMesh.position.set(0, 30, 0);
    this.updateMeshTransform();
    scene.add(this.zoneMesh);

    // Next Safe Zone white boundary ring (ground projected)
    const ringPoints: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta), 0.2, Math.sin(theta)));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({
      color: '#ffffff',
      linewidth: 3,
      transparent: true,
      opacity: 0.75,
    });
    this.nextRingMesh = new THREE.LineLoop(ringGeo, ringMat);
    this.updateNextRingTransform();
    scene.add(this.nextRingMesh);
  }

  public update(dt: number, onPhaseChange?: (newPhase: number) => void) {
    this.state.shrinkTimer -= dt;

    if (!this.state.isShrinking) {
      // Waiting phase countdown
      if (this.state.shrinkTimer <= 0) {
        this.state.isShrinking = true;
        this.state.shrinkTimer = 25; // 25s duration to shrink
        this.state.phaseDuration = 25;
      }
    } else {
      // Shrinking phase
      const progress = 1 - Math.max(0, this.state.shrinkTimer) / this.state.phaseDuration;
      
      // Interpolate radius and center towards target
      this.state.currentRadius = THREE.MathUtils.lerp(
        this.state.currentRadius,
        this.state.targetRadius,
        0.05
      );
      this.state.centerX = THREE.MathUtils.lerp(this.state.centerX, this.state.nextCenterX, 0.05);
      this.state.centerZ = THREE.MathUtils.lerp(this.state.centerZ, this.state.nextCenterZ, 0.05);

      if (this.state.shrinkTimer <= 0) {
        // Complete current shrink, advance to next phase
        this.state.isShrinking = false;
        this.state.phase++;
        this.state.damagePerSec += 3; // zone gets deadlier each ring

        // Plan next phase
        const nextRadii = [85, 48, 22, 6, 2];
        const nextRadius = nextRadii[Math.min(this.state.phase - 1, nextRadii.length - 1)];
        this.state.targetRadius = nextRadius;

        // Shift center slightly within current circle
        const maxOffset = Math.max(2, (this.state.currentRadius - nextRadius) * 0.7);
        const randAngle = Math.random() * Math.PI * 2;
        const randDist = Math.random() * maxOffset;
        this.state.nextCenterX = this.state.centerX + Math.cos(randAngle) * randDist;
        this.state.nextCenterZ = this.state.centerZ + Math.sin(randAngle) * randDist;

        this.state.shrinkTimer = 35; // wait time before next shrink
        this.state.phaseDuration = 35;

        if (onPhaseChange) onPhaseChange(this.state.phase);
      }
    }

    this.updateMeshTransform();
    this.updateNextRingTransform();

    // Pulse electric field opacity
    this.material.opacity = 0.28 + Math.sin(performance.now() * 0.005) * 0.12;
  }

  private updateMeshTransform() {
    this.zoneMesh.position.x = this.state.centerX;
    this.zoneMesh.position.z = this.state.centerZ;
    this.zoneMesh.scale.set(this.state.currentRadius, 1, this.state.currentRadius);
  }

  private updateNextRingTransform() {
    this.nextRingMesh.position.set(this.state.nextCenterX, 0.2, this.state.nextCenterZ);
    this.nextRingMesh.scale.set(this.state.targetRadius, 1, this.state.targetRadius);
  }

  public isOutside(x: number, z: number): boolean {
    const dist = Math.hypot(x - this.state.centerX, z - this.state.centerZ);
    return dist > this.state.currentRadius;
  }
}
