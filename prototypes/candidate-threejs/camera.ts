import * as THREE from 'three';
import { InputState } from './types';

export interface ThirdPersonCameraRig {
  yaw: number;
  pitch: number;
  distance: number;
  update: (dt: number, targetPos: THREE.Vector3, input: InputState, camera: THREE.PerspectiveCamera) => void;
  reset: () => void;
}

const _desiredPos = new THREE.Vector3();
const _desiredLook = new THREE.Vector3();
const _smoothedLook = new THREE.Vector3(0, 1.4, 8);

export function createThirdPersonCameraRig(): ThirdPersonCameraRig {
  let yaw = 0; // Looking toward -Z
  let pitch = 0.34;
  let distance = 7.2;

  return {
    get yaw() {
      return yaw;
    },
    get pitch() {
      return pitch;
    },
    get distance() {
      return distance;
    },
    update(dt: number, targetPos: THREE.Vector3, input: InputState, camera: THREE.PerspectiveCamera) {
      const clampedDt = Math.min(dt, 0.05);

      // Pointer drag camera look
      if (input.lookDeltaX !== 0 || input.lookDeltaY !== 0) {
        yaw -= input.lookDeltaX * 0.0055;
        pitch = THREE.MathUtils.clamp(pitch + input.lookDeltaY * 0.0045, 0.06, 1.15);
        input.lookDeltaX = 0;
        input.lookDeltaY = 0;
      }

      // Optional Q/E keyboard camera orbit
      if (input.keys['KeyQ']) yaw += 1.9 * clampedDt;
      if (input.keys['KeyE']) yaw -= 1.9 * clampedDt;

      // Wheel zoom
      if (input.zoomDelta !== 0) {
        distance = THREE.MathUtils.clamp(distance + input.zoomDelta * 0.005, 4.0, 13.5);
        input.zoomDelta = 0;
      }

      const horizDist = Math.cos(pitch) * distance;
      const vertDist = Math.sin(pitch) * distance;

      _desiredPos.set(
        targetPos.x + Math.sin(yaw) * horizDist,
        Math.max(0.65, targetPos.y + 1.35 + vertDist),
        targetPos.z + Math.cos(yaw) * horizDist,
      );

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 12, clampedDt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 12, clampedDt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 12, clampedDt);

      _desiredLook.set(targetPos.x, targetPos.y + 1.35, targetPos.z);
      _smoothedLook.x = THREE.MathUtils.damp(_smoothedLook.x, _desiredLook.x, 16, clampedDt);
      _smoothedLook.y = THREE.MathUtils.damp(_smoothedLook.y, _desiredLook.y, 16, clampedDt);
      _smoothedLook.z = THREE.MathUtils.damp(_smoothedLook.z, _desiredLook.z, 16, clampedDt);

      camera.lookAt(_smoothedLook);
    },
    reset() {
      yaw = 0;
      pitch = 0.34;
      distance = 7.2;
      _smoothedLook.set(0, 1.4, 8);
    },
  };
}
