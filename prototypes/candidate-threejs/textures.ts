import * as THREE from 'three';

export interface ProceduralTextureSet {
  asphaltMap: THREE.CanvasTexture;
  asphaltRoughnessMap: THREE.CanvasTexture;
  plazaGridMap: THREE.CanvasTexture;
  facadeMap: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const anisotropy = Math.max(1, Math.min(maxAnisotropy, 8));

  // 1. Asphalt & lane markings (sRGB albedo)
  const asphaltCanvas = document.createElement('canvas');
  asphaltCanvas.width = 512;
  asphaltCanvas.height = 512;
  const actx = asphaltCanvas.getContext('2d')!;
  actx.fillStyle = '#1b2230';
  actx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3200; i += 1) {
    const x = (i * 73) % 512;
    const y = (i * 137) % 512;
    const shade = 24 + (i % 16);
    actx.fillStyle = `rgb(${shade}, ${shade + 6}, ${shade + 16})`;
    actx.fillRect(x, y, 2, 2);
  }
  actx.strokeStyle = '#334155';
  actx.lineWidth = 4;
  actx.strokeRect(2, 2, 508, 508);
  actx.fillStyle = '#0ea5e9';
  actx.fillRect(252, 0, 8, 512);
  actx.fillRect(0, 252, 512, 8);

  const asphaltMap = new THREE.CanvasTexture(asphaltCanvas);
  asphaltMap.colorSpace = THREE.SRGBColorSpace;
  asphaltMap.wrapS = THREE.RepeatWrapping;
  asphaltMap.wrapT = THREE.RepeatWrapping;
  asphaltMap.repeat.set(16, 16);
  asphaltMap.anisotropy = anisotropy;

  // 2. Asphalt roughness map (linear NoColorSpace)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#c8c8c8';
  rctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i += 1) {
    const x = (i * 53) % 256;
    const y = (i * 97) % 256;
    const v = 165 + (i % 70);
    rctx.fillStyle = `rgb(${v},${v},${v})`;
    rctx.fillRect(x, y, 3, 3);
  }
  const asphaltRoughnessMap = new THREE.CanvasTexture(roughCanvas);
  asphaltRoughnessMap.wrapS = THREE.RepeatWrapping;
  asphaltRoughnessMap.wrapT = THREE.RepeatWrapping;
  asphaltRoughnessMap.repeat.set(16, 16);

  // 3. Plaza tile grid (sRGB albedo)
  const plazaCanvas = document.createElement('canvas');
  plazaCanvas.width = 256;
  plazaCanvas.height = 256;
  const pctx = plazaCanvas.getContext('2d')!;
  pctx.fillStyle = '#263142';
  pctx.fillRect(0, 0, 256, 256);
  pctx.strokeStyle = '#3b4b63';
  pctx.lineWidth = 3;
  for (let g = 0; g <= 256; g += 64) {
    pctx.beginPath();
    pctx.moveTo(g, 0);
    pctx.lineTo(g, 256);
    pctx.stroke();
    pctx.beginPath();
    pctx.moveTo(0, g);
    pctx.lineTo(256, g);
    pctx.stroke();
  }
  const plazaGridMap = new THREE.CanvasTexture(plazaCanvas);
  plazaGridMap.colorSpace = THREE.SRGBColorSpace;
  plazaGridMap.wrapS = THREE.RepeatWrapping;
  plazaGridMap.wrapT = THREE.RepeatWrapping;
  plazaGridMap.repeat.set(6, 6);
  plazaGridMap.anisotropy = anisotropy;

  // 4. Futuristic building facade windows (sRGB albedo)
  const facadeCanvas = document.createElement('canvas');
  facadeCanvas.width = 256;
  facadeCanvas.height = 512;
  const fctx = facadeCanvas.getContext('2d')!;
  fctx.fillStyle = '#141c2b';
  fctx.fillRect(0, 0, 256, 512);
  for (let row = 16; row < 496; row += 32) {
    for (let col = 16; col < 240; col += 36) {
      const lit = ((row * 7 + col * 13) % 5) !== 0;
      fctx.fillStyle = lit ? '#38bdf8' : '#1e293b';
      fctx.fillRect(col, row, 24, 16);
    }
  }
  const facadeMap = new THREE.CanvasTexture(facadeCanvas);
  facadeMap.colorSpace = THREE.SRGBColorSpace;
  facadeMap.wrapS = THREE.RepeatWrapping;
  facadeMap.wrapT = THREE.RepeatWrapping;
  facadeMap.anisotropy = anisotropy;

  return {
    asphaltMap,
    asphaltRoughnessMap,
    plazaGridMap,
    facadeMap,
    dispose() {
      asphaltMap.dispose();
      asphaltRoughnessMap.dispose();
      plazaGridMap.dispose();
      facadeMap.dispose();
    },
  };
}
