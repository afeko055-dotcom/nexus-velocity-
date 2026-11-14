import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { createThirdPersonCameraRig } from './camera';
import { createKaiPlayer } from './player';
import { createProceduralTextures } from './textures';
import { InputState, PrototypeTelemetry } from './types';
import { createNexusTestWorld } from './world';

const INITIAL_TELEMETRY: PrototypeTelemetry = {
  fps: 0,
  x: 0,
  y: 0,
  z: 8,
  speed: 0,
  grounded: true,
  cameraYawDeg: 0,
  cameraPitchDeg: 19,
  collidingWith: null,
  rendererBackend: 'GPU WebGL2',
};

export function ThreeCandidatePrototype() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const joyPadRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<InputState>({
    keys: {},
    joystickX: 0,
    joystickY: 0,
    jumpQueued: false,
    lookDeltaX: 0,
    lookDeltaY: 0,
    zoomDelta: 0,
  });

  const resetFnRef = useRef<(() => void) | null>(null);
  const activeLookPointerId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeJoyPointerId = useRef<number | null>(null);

  const [telemetry, setTelemetry] = useState<PrototypeTelemetry>(INITIAL_TELEMETRY);
  const [contextLost, setContextLost] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [jumpPressed, setJumpPressed] = useState(false);

  const updateJoystickVisual = useCallback((nx: number, ny: number) => {
    const knob = knobRef.current;
    if (!knob) return;
    const maxOffset = 38;
    knob.style.transform = `translate3d(${nx * maxOffset}px, ${ny * maxOffset}px, 0)`;
  }, []);

  const handleReset = useCallback(() => {
    const input = inputRef.current;
    input.joystickX = 0;
    input.joystickY = 0;
    input.jumpQueued = false;
    input.lookDeltaX = 0;
    input.lookDeltaY = 0;
    input.zoomDelta = 0;
    activeJoyPointerId.current = null;
    activeLookPointerId.current = null;
    updateJoystickVisual(0, 0);
    resetFnRef.current?.();
  }, [updateJoystickVisual]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const probeCanvas = document.createElement('canvas');
    const probeGl =
      probeCanvas.getContext('webgl2') ||
      probeCanvas.getContext('webgl') ||
      probeCanvas.getContext('experimental-webgl');

    let isSoftwareGl = false;
    if (probeGl && 'getExtension' in probeGl) {
      const gl = probeGl as WebGLRenderingContext;
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const unmaskedRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) ?? '') : '';
      const rendererStr = unmaskedRenderer || String(gl.getParameter(gl.RENDERER) ?? '');
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth || 800, container.clientHeight || 500);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b162c);
    scene.fog = new THREE.FogExp2(0x16253b, 0.0085);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const aspect = (container.clientWidth || 800) / Math.max(1, container.clientHeight || 500);
    const camera = new THREE.PerspectiveCamera(58, aspect, 0.1, 450);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);
    const world = createNexusTestWorld(textures, isSoftwareGl);
    const player = createKaiPlayer();
    const cameraRig = createThirdPersonCameraRig();

    scene.add(world.group);
    scene.add(player.root);

    // Initialize camera behind Kai before first frame
    cameraRig.update(0.016, player.position, inputRef.current, camera);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const telemetryRef = {
      current: {
        ...INITIAL_TELEMETRY,
        rendererBackend: isSoftwareGl ? ('Software WebGL' as const) : ('GPU WebGL2' as const),
      },
    };
    setTelemetry(telemetryRef.current);

    resetFnRef.current = () => {
      player.reset();
      cameraRig.reset();
      camera.position.set(0, 3.8, 14.8);
      camera.lookAt(0, 1.4, 8);
      setTelemetry({
        ...INITIAL_TELEMETRY,
        fps: telemetryRef.current.fps,
        rendererBackend: isSoftwareGl ? 'Software WebGL' : 'GPU WebGL2',
      });
    };

    // Context lost / restored handlers
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      inputRef.current.keys[e.code] = true;
      if (e.code === 'Space' && !e.repeat) {
        inputRef.current.jumpQueued = true;
        setJumpPressed(true);
      }
      if (e.code === 'KeyR' && !e.repeat) {
        handleReset();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      inputRef.current.keys[e.code] = false;
      if (e.code === 'Space') {
        setJumpPressed(false);
      }
    };
    const onBlur = () => {
      inputRef.current.keys = {};
      inputRef.current.joystickX = 0;
      inputRef.current.joystickY = 0;
      updateJoystickVisual(0, 0);
      setJumpPressed(false);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // ResizeObserver for crisp responsive viewport
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(1, Math.floor(entry.contentRect.width));
      const h = Math.max(1, Math.floor(entry.contentRect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Software WebGL GPU-finish frame pacing helper
    const glCtx = renderer.getContext() as WebGL2RenderingContext;
    const canFence = typeof glCtx.fenceSync === 'function';
    let disposed = false;
    let rafId = 0;
    let timerId = 0;

    const afterDraw = (cb: () => void) => {
      if (!isSoftwareGl || !canFence) {
        rafId = requestAnimationFrame(cb);
        return;
      }
      const sync = glCtx.fenceSync(glCtx.SYNC_GPU_COMMANDS_COMPLETE, 0);
      glCtx.flush();
      const started = performance.now();
      const poll = () => {
        if (disposed) {
          if (sync) glCtx.deleteSync(sync);
          return;
        }
        const status = sync
          ? glCtx.getSyncParameter(sync, glCtx.SYNC_STATUS)
          : glCtx.SIGNALED;
        if (status === glCtx.SIGNALED || performance.now() - started > 80) {
          if (sync) glCtx.deleteSync(sync);
          rafId = requestAnimationFrame(cb);
        } else {
          timerId = window.setTimeout(poll, 4);
        }
      };
      timerId = window.setTimeout(poll, 0);
    };

    let lastTime = performance.now();
    let elapsed = 0;
    let framesInWindow = 0;
    let fpsAccum = 0;
    let currentFps = 0;
    let hudAccum = 0;

    const tick = () => {
      if (disposed) return;

      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsed += dt;

      framesInWindow += 1;
      fpsAccum += dt;
      if (fpsAccum >= 0.25) {
        currentFps = Math.max(1, Math.round(framesInWindow / fpsAccum));
        framesInWindow = 0;
        fpsAccum = 0;
      } else if (currentFps === 0 && framesInWindow >= 2) {
        currentFps = Math.max(1, Math.round(framesInWindow / Math.max(0.016, fpsAccum)));
      }

      player.update(dt, inputRef.current, cameraRig.yaw, world.colliders);
      cameraRig.update(dt, player.position, inputRef.current, camera);
      world.update(elapsed);

      renderer.render(scene, camera);

      hudAccum += dt;
      const stateChanged =
        player.grounded !== telemetryRef.current.grounded ||
        player.collidingWith !== telemetryRef.current.collidingWith;
      if (hudAccum >= 0.06 || stateChanged) {
        hudAccum = 0;
        const speed = Math.hypot(player.velocity.x, player.velocity.z);
        const yawDeg = Math.round((((cameraRig.yaw * 180) / Math.PI) % 360 + 360) % 360);
        const pitchDeg = Math.round((cameraRig.pitch * 180) / Math.PI);
        const nextTelemetry: PrototypeTelemetry = {
          fps: currentFps,
          x: Number(player.position.x.toFixed(1)),
          y: Number(player.position.y.toFixed(1)),
          z: Number(player.position.z.toFixed(1)),
          speed: Number(speed.toFixed(1)),
          grounded: player.grounded,
          cameraYawDeg: yawDeg,
          cameraPitchDeg: pitchDeg,
          collidingWith: player.collidingWith,
          rendererBackend: isSoftwareGl ? 'Software WebGL' : 'GPU WebGL2',
        };
        telemetryRef.current = nextTelemetry;
        setTelemetry(nextTelemetry);
      }

      afterDraw(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      resetFnRef.current = null;
      world.dispose();
      player.dispose();
      textures.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleReset, updateJoystickVisual]);

  // Viewport camera look drag + wheel zoom handlers
  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-ui-control="true"]')) return;
    if (activeLookPointerId.current !== null) return;
    activeLookPointerId.current = e.pointerId;
    lastLookPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleViewportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeLookPointerId.current !== e.pointerId) return;
    const dx = e.clientX - lastLookPos.current.x;
    const dy = e.clientY - lastLookPos.current.y;
    lastLookPos.current = { x: e.clientX, y: e.clientY };
    inputRef.current.lookDeltaX += dx;
    inputRef.current.lookDeltaY += dy;
  };

  const handleViewportPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeLookPointerId.current !== e.pointerId) return;
    activeLookPointerId.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleViewportWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    inputRef.current.zoomDelta += e.deltaY;
  };

  // Virtual touch/pointer movement joystick handlers
  const updateJoystickFromPointer = (clientX: number, clientY: number) => {
    const pad = joyPadRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.36;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    const nx = dx / maxRadius;
    const ny = dy / maxRadius;
    inputRef.current.joystickX = Math.abs(nx) < 0.08 ? 0 : nx;
    inputRef.current.joystickY = Math.abs(ny) < 0.08 ? 0 : ny;
    updateJoystickVisual(nx, ny);
  };

  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    activeJoyPointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateJoystickFromPointer(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeJoyPointerId.current !== e.pointerId) return;
    e.stopPropagation();
    updateJoystickFromPointer(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeJoyPointerId.current !== e.pointerId) return;
    e.stopPropagation();
    activeJoyPointerId.current = null;
    inputRef.current.joystickX = 0;
    inputRef.current.joystickY = 0;
    updateJoystickVisual(0, 0);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden bg-[#0b162c]"
      onPointerDown={handleViewportPointerDown}
      onPointerMove={handleViewportPointerMove}
      onPointerUp={handleViewportPointerUp}
      onPointerCancel={handleViewportPointerUp}
      onWheel={handleViewportWheel}
      data-testid="three-prototype-viewport"
    >
      {/* Dedicated WebGL mount point */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left Telemetry HUD (zero backdrop-filter, zero animate-pulse) */}
      <aside
        data-ui-control="true"
        className="pointer-events-auto absolute top-3 left-3 z-20 rounded-md border border-cyan-500/35 bg-slate-950/88 px-3 py-2 text-[11px] font-mono text-slate-200 shadow-lg"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-1.5">
          <span className="font-semibold tracking-wider text-cyan-400">KAI VEYRON // TECH PROOF</span>
          <span
            data-testid="hud-fps"
            className="rounded bg-cyan-950/90 px-1.5 py-0.5 font-semibold text-cyan-300 tabular-nums border border-cyan-500/30"
          >
            {telemetry.fps} FPS
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 tabular-nums">
          <div>
            <span className="text-slate-400">POS </span>
            <span data-testid="hud-pos" className="text-white">
              {telemetry.x.toFixed(1)}, {telemetry.y.toFixed(1)}, {telemetry.z.toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">SPD </span>
            <span data-testid="hud-speed" className="text-white">
              {telemetry.speed.toFixed(1)} m/s
            </span>
          </div>
          <div>
            <span className="text-slate-400">STATE </span>
            <span
              data-testid="hud-state"
              className={telemetry.grounded ? 'text-emerald-400' : 'text-amber-400'}
            >
              {telemetry.grounded ? 'GROUNDED' : 'AIRBORNE'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">CAM </span>
            <span data-testid="hud-cam" className="text-white">
              {telemetry.cameraYawDeg}° / {telemetry.cameraPitchDeg}°
            </span>
          </div>
          <div className="col-span-2 truncate max-w-[260px]">
            <span className="text-slate-400">HIT </span>
            <span
              data-testid="hud-collision"
              className={telemetry.collidingWith ? 'text-amber-300' : 'text-slate-400'}
            >
              {telemetry.collidingWith ?? 'Clear'}
            </span>
          </div>
          <div className="col-span-2 text-[10px] text-slate-400">
            <span>RENDERER: </span>
            <span data-testid="hud-backend" className="text-slate-200">
              {telemetry.rendererBackend}
            </span>
          </div>
        </div>
      </aside>

      {/* Top-Right Action Controls */}
      <div
        data-ui-control="true"
        className="pointer-events-auto absolute top-3 right-3 z-20 flex flex-col items-end gap-2"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            data-testid="controls-toggle-btn"
            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-950/88 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/60 hover:text-white transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
            Controls
          </button>
          <button
            type="button"
            onClick={handleReset}
            data-testid="reset-btn"
            className="flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-950/60 hover:text-amber-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {showHelp && (
          <div className="w-64 rounded-md border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-300 shadow-xl space-y-1.5">
            <div className="font-semibold text-cyan-400">Stage 02 Test Controls</div>
            <div><strong className="text-white">Move:</strong> WASD / Arrow Keys or Left Joystick</div>
            <div><strong className="text-white">Sprint:</strong> Hold Shift</div>
            <div><strong className="text-white">Jump:</strong> Spacebar or Jump Button</div>
            <div><strong className="text-white">Camera Look:</strong> Drag Scene or Q / E</div>
            <div><strong className="text-white">Zoom:</strong> Mouse Wheel</div>
            <div><strong className="text-white">Reset:</strong> R key or Reset Button</div>
          </div>
        )}
      </div>

      {/* Context Lost Recovery Banner */}
      {contextLost && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90">
          <div className="rounded-md border border-amber-500/50 bg-slate-900 px-5 py-4 text-center space-y-2">
            <p className="text-sm font-semibold text-amber-300">WebGL Context Paused</p>
            <p className="text-xs text-slate-300">Waiting for browser graphics context restoration.</p>
          </div>
        </div>
      )}

      {/* Bottom-Left Virtual Movement Joystick (Touch + Pointer) */}
      <div
        data-ui-control="true"
        className="pointer-events-auto absolute bottom-5 left-5 z-20 flex flex-col items-center gap-1.5"
      >
        <div
          ref={joyPadRef}
          data-testid="touch-joystick"
          onPointerDown={handleJoystickPointerDown}
          onPointerMove={handleJoystickPointerMove}
          onPointerUp={handleJoystickPointerUp}
          onPointerCancel={handleJoystickPointerUp}
          className="relative h-32 w-32 touch-none rounded-full border-2 border-cyan-400/50 bg-slate-950/80 shadow-lg flex items-center justify-center cursor-pointer"
        >
          <div className="pointer-events-none absolute inset-3 rounded-full border border-slate-700/80" />
          <div className="pointer-events-none absolute h-px w-20 bg-slate-700/70" />
          <div className="pointer-events-none absolute w-px h-20 bg-slate-700/70" />
          <div
            ref={knobRef}
            data-testid="touch-joystick-knob"
            className="pointer-events-none h-11 w-11 rounded-full border-2 border-cyan-300 bg-cyan-500/75 shadow-md transition-none"
          />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          Move Stick
        </span>
      </div>

      {/* Bottom-Right Jump Button */}
      <div
        data-ui-control="true"
        className="pointer-events-auto absolute bottom-5 right-5 z-20 flex flex-col items-center gap-1.5"
      >
        <button
          type="button"
          data-testid="jump-btn"
          onPointerDown={(e) => {
            e.stopPropagation();
            inputRef.current.jumpQueued = true;
            setJumpPressed(true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            setJumpPressed(false);
          }}
          onPointerCancel={() => setJumpPressed(false)}
          onPointerLeave={() => setJumpPressed(false)}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current.jumpQueued = true;
          }}
          className={`h-[72px] w-[72px] touch-none rounded-full border-2 font-mono text-xs font-bold tracking-wider shadow-lg transition-transform ${
            jumpPressed
              ? 'scale-95 border-amber-300 bg-amber-500 text-slate-950'
              : 'border-amber-400/75 bg-slate-950/88 text-amber-300 hover:bg-amber-950/70'
          }`}
        >
          JUMP
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          Space / Tap
        </span>
      </div>
    </div>
  );
}
