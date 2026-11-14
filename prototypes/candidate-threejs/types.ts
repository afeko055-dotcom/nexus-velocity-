export interface AabbCollider {
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  walkableTop: boolean;
}

export interface PrototypeTelemetry {
  fps: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  grounded: boolean;
  cameraYawDeg: number;
  cameraPitchDeg: number;
  collidingWith: string | null;
  rendererBackend: 'GPU WebGL2' | 'Software WebGL';
}

export interface InputState {
  keys: Record<string, boolean>;
  joystickX: number;
  joystickY: number;
  jumpQueued: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
  zoomDelta: number;
}
