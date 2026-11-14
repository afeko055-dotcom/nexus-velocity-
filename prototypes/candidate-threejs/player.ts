import * as THREE from 'three';
import { AabbCollider, InputState } from './types';

export interface KaiPlayerController {
  root: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  grounded: boolean;
  collidingWith: string | null;
  update: (dt: number, input: InputState, cameraYaw: number, colliders: AabbCollider[]) => void;
  reset: () => void;
  dispose: () => void;
}

const PLAYER_RADIUS = 0.42;
const PLAYER_HEIGHT = 1.85;
const MOVE_SPEED = 7.4;
const SPRINT_MULTIPLIER = 1.45;
const JUMP_IMPULSE = 9.6;
const GRAVITY = -24.0;
const SPAWN_POS = new THREE.Vector3(0, 0, 8);

const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();

function createContactShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createKaiPlayer(): KaiPlayerController {
  const root = new THREE.Group();
  const actorVisual = new THREE.Group();
  root.add(actorVisual);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.25 });
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.75 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd6a686, roughness: 0.7, metalness: 0.05 });
  const coreGlowMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.3,
    roughness: 0.15,
    metalness: 0.8,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.85,
  });
  materials.push(jacketMat, armorMat, skinMat, coreGlowMat, visorMat);

  // Legs (articulated pivots at hip y = 0.82)
  const legGeo = new THREE.BoxGeometry(0.22, 0.78, 0.24);
  const bootGeo = new THREE.BoxGeometry(0.24, 0.18, 0.32);
  geometries.push(legGeo, bootGeo);

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.16, 0.82, 0);
  const leftLeg = new THREE.Mesh(legGeo, jacketMat);
  leftLeg.position.y = -0.39;
  leftLeg.castShadow = true;
  const leftBoot = new THREE.Mesh(bootGeo, armorMat);
  leftBoot.position.set(0, -0.73, 0.03);
  leftLegPivot.add(leftLeg, leftBoot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.16, 0.82, 0);
  const rightLeg = new THREE.Mesh(legGeo, jacketMat);
  rightLeg.position.y = -0.39;
  rightLeg.castShadow = true;
  const rightBoot = new THREE.Mesh(bootGeo, armorMat);
  rightBoot.position.set(0, -0.73, 0.03);
  rightLegPivot.add(rightLeg, rightBoot);

  // Torso & shoulders
  const torsoGeo = new THREE.BoxGeometry(0.56, 0.66, 0.32);
  const pauldronGeo = new THREE.BoxGeometry(0.7, 0.16, 0.36);
  geometries.push(torsoGeo, pauldronGeo);
  const torso = new THREE.Mesh(torsoGeo, jacketMat);
  torso.position.y = 1.16;
  torso.castShadow = true;
  const pauldrons = new THREE.Mesh(pauldronGeo, armorMat);
  pauldrons.position.y = 1.43;
  pauldrons.castShadow = true;

  // Experimental Velocity Core backpack module
  const packGeo = new THREE.BoxGeometry(0.32, 0.38, 0.16);
  const coreDiscGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16);
  geometries.push(packGeo, coreDiscGeo);
  const pack = new THREE.Mesh(packGeo, armorMat);
  pack.position.set(0, 1.2, -0.22);
  const coreDisc = new THREE.Mesh(coreDiscGeo, coreGlowMat);
  coreDisc.rotation.x = Math.PI / 2;
  coreDisc.position.set(0, 1.2, -0.31);

  // Arms (pivoted at shoulder y = 1.4)
  const armGeo = new THREE.BoxGeometry(0.16, 0.56, 0.18);
  geometries.push(armGeo);
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.38, 1.4, 0);
  const leftArm = new THREE.Mesh(armGeo, armorMat);
  leftArm.position.y = -0.24;
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.38, 1.4, 0);
  const rightArm = new THREE.Mesh(armGeo, armorMat);
  rightArm.position.y = -0.24;
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);

  const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75, metalness: 0.15 });
  materials.push(hairMat);

  // Head + cybernetic visor + obsidian hair + cyan crest (faces +Z forward in actor local space)
  const headGeo = new THREE.BoxGeometry(0.32, 0.34, 0.32);
  const hairCapGeo = new THREE.BoxGeometry(0.35, 0.14, 0.36);
  const hairBackGeo = new THREE.BoxGeometry(0.35, 0.28, 0.14);
  const crestGeo = new THREE.BoxGeometry(0.06, 0.04, 0.37);
  const visorGeo = new THREE.BoxGeometry(0.28, 0.09, 0.06);
  geometries.push(headGeo, hairCapGeo, hairBackGeo, crestGeo, visorGeo);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.68;
  head.castShadow = true;
  const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
  hairCap.position.set(0, 1.81, -0.01);
  hairCap.castShadow = true;
  const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
  hairBack.position.set(0, 1.71, -0.11);
  const crest = new THREE.Mesh(crestGeo, coreGlowMat);
  crest.position.set(0, 1.89, -0.01);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 1.71, 0.16);

  actorVisual.add(
    leftLegPivot,
    rightLegPivot,
    torso,
    pauldrons,
    pack,
    coreDisc,
    leftArmPivot,
    rightArmPivot,
    head,
    hairCap,
    hairBack,
    crest,
    visor,
  );

  // Grounded contact shadow disc (moves horizontally with player, stays slightly above floor)
  const shadowTex = createContactShadowTexture();
  const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.04;
  root.add(contactShadow);
  geometries.push(shadowGeo);
  materials.push(shadowMat);

  const position = SPAWN_POS.clone();
  const velocity = new THREE.Vector3();
  let grounded = true;
  let walkCycle = 0;
  let collidingWith: string | null = null;
  let facingYaw = Math.PI; // Facing north (-Z) toward Nexus plaza

  root.position.copy(position);
  actorVisual.rotation.y = facingYaw;

  function overlapsXZ(px: number, pz: number, c: AabbCollider): boolean {
    return (
      px + PLAYER_RADIUS > c.minX &&
      px - PLAYER_RADIUS < c.maxX &&
      pz + PLAYER_RADIUS > c.minZ &&
      pz - PLAYER_RADIUS < c.maxZ
    );
  }

  function resolveHorizontal(nx: number, nz: number, py: number, colliders: AabbCollider[]) {
    let rx = nx;
    let rz = nz;
    let hitId: string | null = null;

    // Resolve X axis first, then Z axis for clean wall sliding
    for (const c of colliders) {
      if (py >= c.maxY - 0.05 || py + PLAYER_HEIGHT <= c.minY) continue;
      if (overlapsXZ(rx, position.z, c)) {
        if (position.x <= c.minX) rx = c.minX - PLAYER_RADIUS;
        else if (position.x >= c.maxX) rx = c.maxX + PLAYER_RADIUS;
        hitId = c.id;
      }
    }

    for (const c of colliders) {
      if (py >= c.maxY - 0.05 || py + PLAYER_HEIGHT <= c.minY) continue;
      if (overlapsXZ(rx, rz, c)) {
        if (position.z <= c.minZ) rz = c.minZ - PLAYER_RADIUS;
        else if (position.z >= c.maxZ) rz = c.maxZ + PLAYER_RADIUS;
        hitId = c.id;
      }
    }

    return { rx, rz, hitId };
  }

  return {
    root,
    position,
    velocity,
    get grounded() {
      return grounded;
    },
    get collidingWith() {
      return collidingWith;
    },
    update(dt: number, input: InputState, cameraYaw: number, colliders: AabbCollider[]) {
      const clampedDt = Math.min(dt, 0.05);

      // Combine keyboard WASD/Arrows + virtual touch joystick
      let moveX = input.joystickX;
      let moveZ = input.joystickY;
      if (input.keys['KeyW'] || input.keys['ArrowUp']) moveZ -= 1;
      if (input.keys['KeyS'] || input.keys['ArrowDown']) moveZ += 1;
      if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
      if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;

      const mag = Math.hypot(moveX, moveZ);
      if (mag > 1) {
        moveX /= mag;
        moveZ /= mag;
      }

      // Camera-relative horizontal movement vectors
      _forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
      _right.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
      _moveDir.set(0, 0, 0).addScaledVector(_forward, -moveZ).addScaledVector(_right, moveX);

      const sprinting = Boolean(input.keys['ShiftLeft'] || input.keys['ShiftRight']);
      const targetSpeed = MOVE_SPEED * (sprinting ? SPRINT_MULTIPLIER : 1);

      if (_moveDir.lengthSq() > 0.001) {
        _moveDir.normalize();
        const targetVx = _moveDir.x * targetSpeed;
        const targetVz = _moveDir.z * targetSpeed;
        velocity.x = THREE.MathUtils.damp(velocity.x, targetVx, 14, clampedDt);
        velocity.z = THREE.MathUtils.damp(velocity.z, targetVz, 14, clampedDt);

        const targetFacing = Math.atan2(_moveDir.x, _moveDir.z);
        let diff = targetFacing - facingYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        facingYaw += diff * Math.min(1, clampedDt * 12);
      } else {
        velocity.x = THREE.MathUtils.damp(velocity.x, 0, 14, clampedDt);
        velocity.z = THREE.MathUtils.damp(velocity.z, 0, 14, clampedDt);
      }

      // Jump physics
      if (input.jumpQueued) {
        input.jumpQueued = false;
        if (grounded) {
          velocity.y = JUMP_IMPULSE;
          grounded = false;
        }
      }

      velocity.y += GRAVITY * clampedDt;

      // Horizontal integration + sliding collision
      const nextX = position.x + velocity.x * clampedDt;
      const nextZ = position.z + velocity.z * clampedDt;
      const horiz = resolveHorizontal(nextX, nextZ, position.y, colliders);
      position.x = horiz.rx;
      position.z = horiz.rz;
      collidingWith = horiz.hitId;

      // Vertical integration + walkable surface landing
      const prevY = position.y;
      let nextY = position.y + velocity.y * clampedDt;
      let supportHeight = 0;

      for (const c of colliders) {
        if (!c.walkableTop) continue;
        if (overlapsXZ(position.x, position.z, c)) {
          if (prevY >= c.maxY - 0.12 && nextY <= c.maxY && velocity.y <= 0) {
            supportHeight = Math.max(supportHeight, c.maxY);
          }
        }
      }

      if (nextY <= supportHeight) {
        nextY = supportHeight;
        velocity.y = 0;
        grounded = true;
      } else {
        grounded = false;
      }

      position.y = nextY;
      root.position.copy(position);
      actorVisual.rotation.y = facingYaw;

      // Contact shadow tracks support height underneath player
      contactShadow.position.y = Math.max(0.04, supportHeight - position.y + 0.04);
      const heightAboveSupport = Math.max(0, position.y - supportHeight);
      shadowMat.opacity = THREE.MathUtils.clamp(0.75 - heightAboveSupport * 0.15, 0.15, 0.75);

      // Procedural limb animation
      const planarSpeed = Math.hypot(velocity.x, velocity.z);
      if (grounded && planarSpeed > 0.35) {
        walkCycle += clampedDt * planarSpeed * 1.9;
        const swing = Math.sin(walkCycle) * 0.65;
        leftLegPivot.rotation.x = swing;
        rightLegPivot.rotation.x = -swing;
        leftArmPivot.rotation.x = -swing * 0.8;
        rightArmPivot.rotation.x = swing * 0.8;
      } else if (!grounded) {
        leftLegPivot.rotation.x = -0.35;
        rightLegPivot.rotation.x = 0.25;
        leftArmPivot.rotation.x = -0.55;
        rightArmPivot.rotation.x = -0.55;
      } else {
        leftLegPivot.rotation.x = THREE.MathUtils.damp(leftLegPivot.rotation.x, 0, 12, clampedDt);
        rightLegPivot.rotation.x = THREE.MathUtils.damp(rightLegPivot.rotation.x, 0, 12, clampedDt);
        leftArmPivot.rotation.x = THREE.MathUtils.damp(leftArmPivot.rotation.x, 0, 12, clampedDt);
        rightArmPivot.rotation.x = THREE.MathUtils.damp(rightArmPivot.rotation.x, 0, 12, clampedDt);
      }

      coreDisc.rotation.z += clampedDt * (grounded ? 2.0 + planarSpeed * 0.5 : 6.0);
    },
    reset() {
      position.copy(SPAWN_POS);
      velocity.set(0, 0, 0);
      grounded = true;
      collidingWith = null;
      facingYaw = Math.PI;
      walkCycle = 0;
      root.position.copy(position);
      actorVisual.rotation.y = facingYaw;
    },
    dispose() {
      shadowTex.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
