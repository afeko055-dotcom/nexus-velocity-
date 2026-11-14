import * as THREE from 'three';
import { ProceduralTextureSet } from './textures';
import { AabbCollider } from './types';

export interface NexusTestWorld {
  group: THREE.Group;
  colliders: AabbCollider[];
  update: (elapsed: number) => void;
  dispose: () => void;
}

function createSkyDome(): { mesh: THREE.Mesh; dispose: () => void } {
  const skyGeo = new THREE.SphereGeometry(260, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x0b162c) },
      horizonColor: { value: new THREE.Color(0x1f3654) },
      sunGlowColor: { value: new THREE.Color(0xf59e0b) },
      sunDir: { value: new THREE.Vector3(0.45, 0.25, -0.85).normalize() },
    },
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldDir;
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 sunGlowColor;
      uniform vec3 sunDir;
      void main() {
        float h = clamp(vWorldDir.y * 1.4, 0.0, 1.0);
        vec3 col = mix(horizonColor, topColor, pow(h, 0.65));
        float sunAmt = max(dot(normalize(vWorldDir), sunDir), 0.0);
        col += sunGlowColor * pow(sunAmt, 24.0) * 0.45;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(skyGeo, skyMat);
  return {
    mesh,
    dispose() {
      skyGeo.dispose();
      skyMat.dispose();
    },
  };
}

function createBuilding(
  id: string,
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  accentHex: number,
  facadeMap: THREE.CanvasTexture,
  materialsToDispose: THREE.Material[],
  geometriesToDispose: THREE.BufferGeometry[],
): { group: THREE.Group; collider: AabbCollider } {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // 1. Structural concrete plinth (matte)
  const plinthGeo = new THREE.BoxGeometry(width + 0.8, 1.2, depth + 0.8);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.85,
    metalness: 0.15,
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.6;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  // 2. Main tower body (semi-gloss facade)
  const bodyGeo = new THREE.BoxGeometry(width, height - 1.2, depth);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: facadeMap,
    color: 0xcbd5e1,
    roughness: 0.35,
    metalness: 0.55,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.2 + (height - 1.2) / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Rooftop collar & accent light band
  const collarGeo = new THREE.BoxGeometry(width + 0.3, 0.45, depth + 0.3);
  const collarMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.65,
    roughness: 0.25,
    metalness: 0.75,
  });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.y = height + 0.15;
  group.add(collar);

  // 4. Rooftop mechanical penthouse + spire
  const crownGeo = new THREE.BoxGeometry(width * 0.55, 1.4, depth * 0.55);
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.5,
  });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.y = height + 1.05;
  crown.castShadow = true;
  group.add(crown);

  const spireGeo = new THREE.CylinderGeometry(0.08, 0.14, 3.2, 8);
  const spire = new THREE.Mesh(spireGeo, collarMat);
  spire.position.y = height + 3.2;
  group.add(spire);

  geometriesToDispose.push(plinthGeo, bodyGeo, collarGeo, crownGeo, spireGeo);
  materialsToDispose.push(plinthMat, bodyMat, collarMat, crownMat);

  return {
    group,
    collider: {
      id,
      minX: x - (width + 0.8) / 2,
      maxX: x + (width + 0.8) / 2,
      minY: 0,
      maxY: height + 1.5,
      minZ: z - (depth + 0.8) / 2,
      maxZ: z + (depth + 0.8) / 2,
      walkableTop: false,
    },
  };
}

export function createNexusTestWorld(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): NexusTestWorld {
  const group = new THREE.Group();
  const colliders: AabbCollider[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Sky dome
  const sky = createSkyDome();
  group.add(sky.mesh);

  // Extended terrain base (extends beyond playable perimeter so no floating void)
  const groundGeo = new THREE.PlaneGeometry(360, 360);
  const groundMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltMap,
    roughnessMap: textures.asphaltRoughnessMap,
    roughness: 0.85,
    metalness: 0.12,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);
  geometries.push(groundGeo);
  materials.push(groundMat);

  // Central Velocity Plaza deck (+0.03 Y offset to avoid Z-fighting)
  const plazaGeo = new THREE.BoxGeometry(28, 0.06, 28);
  const plazaMat = new THREE.MeshStandardMaterial({
    map: textures.plazaGridMap,
    roughness: 0.55,
    metalness: 0.25,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, 0.03, 0);
  plaza.receiveShadow = true;
  group.add(plaza);
  geometries.push(plazaGeo);
  materials.push(plazaMat);

  // Lighting rig (warm key, cool hemisphere fill, subtle rim)
  const hemi = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 0.85);
  group.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfff1db, 1.8);
  keyLight.position.set(28, 42, 22);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 4;
    keyLight.shadow.camera.far = 120;
    const d = 46;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  group.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
  rimLight.position.set(-26, 18, -28);
  group.add(rimLight);

  // District test buildings surrounding central plaza
  const buildingSpecs: Array<[string, number, number, number, number, number, number]> = [
    ['Tower North-West', -18, -18, 9, 9, 18, 0x06b6d4],
    ['Tower North-East', 19, -17, 10, 8, 22, 0xf59e0b],
    ['Tower South-West', -20, 17, 8, 10, 14, 0x38bdf8],
    ['Tower South-East', 18, 19, 9, 9, 16, 0x06b6d4],
    ['Nexus Relay Spire', 0, -28, 11, 7, 26, 0x22d3ee],
    ['Harbor Depot', -30, 0, 7, 14, 11, 0xf59e0b],
    ['Transit Annex', 30, 1, 7, 14, 13, 0x38bdf8],
  ];

  for (const [id, x, z, w, d, h, accent] of buildingSpecs) {
    const b = createBuilding(id, x, z, w, d, h, accent, textures.facadeMap, materials, geometries);
    group.add(b.group);
    colliders.push(b.collider);
  }

  // Jumpable stepped platforms & environmental test obstacles
  const platformSpecs: Array<[string, number, number, number, number, number, number]> = [
    ['Step Platform A', -5.5, -2.5, 3.2, 0.85, 3.2, 0x0ea5e9],
    ['Step Platform B', -5.5, -6.2, 3.2, 1.7, 3.2, 0x0284c7],
    ['Step Platform C', -1.8, -6.2, 3.2, 2.55, 3.2, 0xf59e0b],
    ['Cargo Crate 1', 6.5, 3.5, 2.2, 1.1, 2.2, 0x64748b],
    ['Cargo Crate 2', 8.8, 1.8, 2.0, 1.75, 2.0, 0x475569],
    ['Barrier East', 10.5, -6.0, 1.0, 1.1, 5.2, 0xf59e0b],
  ];

  const stepTrimMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.75,
    metalness: 0.3,
  });
  materials.push(stepTrimMat);

  for (const [id, x, z, w, h, d, color] of platformSpecs) {
    const platGroup = new THREE.Group();
    platGroup.position.set(x, 0, z);

    const baseGeo = new THREE.BoxGeometry(w, h, d);
    const baseMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.55,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = h / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    platGroup.add(baseMesh);

    const capHeight = 0.06;
    const capGeo = new THREE.BoxGeometry(w + 0.08, capHeight, d + 0.08);
    const capMesh = new THREE.Mesh(capGeo, stepTrimMat);
    capMesh.position.y = h + capHeight / 2;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    platGroup.add(capMesh);

    geometries.push(baseGeo, capGeo);
    materials.push(baseMat);
    group.add(platGroup);

    colliders.push({
      id,
      minX: x - w / 2,
      maxX: x + w / 2,
      minY: 0,
      maxY: h + capHeight,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      walkableTop: true,
    });
  }

  // Animated Velocity Core beacon monument at plaza north-east
  const beaconGroup = new THREE.Group();
  beaconGroup.position.set(7.5, 0, -8.5);
  const beaconBaseGeo = new THREE.CylinderGeometry(1.1, 1.35, 0.9, 12);
  const beaconBaseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    metalness: 0.7,
  });
  const beaconBase = new THREE.Mesh(beaconBaseGeo, beaconBaseMat);
  beaconBase.position.y = 0.45;
  beaconBase.castShadow = true;
  beaconGroup.add(beaconBase);

  const coreRingGeo = new THREE.TorusGeometry(0.85, 0.1, 12, 32);
  const coreRingMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.1,
    roughness: 0.2,
    metalness: 0.85,
  });
  const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
  coreRing.position.y = 2.0;
  beaconGroup.add(coreRing);

  const coreCrystalGeo = new THREE.OctahedronGeometry(0.42, 0);
  const coreCrystalMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.9,
    roughness: 0.15,
    metalness: 0.8,
  });
  const coreCrystal = new THREE.Mesh(coreCrystalGeo, coreCrystalMat);
  coreCrystal.position.y = 2.0;
  beaconGroup.add(coreCrystal);

  geometries.push(beaconBaseGeo, coreRingGeo, coreCrystalGeo);
  materials.push(beaconBaseMat, coreRingMat, coreCrystalMat);
  group.add(beaconGroup);
  colliders.push({
    id: 'Velocity Core Monument',
    minX: 7.5 - 1.35,
    maxX: 7.5 + 1.35,
    minY: 0,
    maxY: 3.0,
    minZ: -8.5 - 1.35,
    maxZ: -8.5 + 1.35,
    walkableTop: false,
  });

  // Instanced perimeter light bollards (24 instances)
  const bollardCount = 24;
  const bollardGeo = new THREE.CylinderGeometry(0.16, 0.22, 2.2, 8);
  const bollardMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.75,
  });
  const bollards = new THREE.InstancedMesh(bollardGeo, bollardMat, bollardCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < bollardCount; i += 1) {
    const angle = (i / bollardCount) * Math.PI * 2;
    const radius = 37;
    const bx = Math.cos(angle) * radius;
    const bz = Math.sin(angle) * radius;
    dummy.position.set(bx, 1.1, bz);
    dummy.rotation.set(0, -angle, 0);
    dummy.scale.setScalar(0.92 + (i % 3) * 0.08);
    dummy.updateMatrix();
    bollards.setMatrixAt(i, dummy.matrix);
  }
  bollards.instanceMatrix.needsUpdate = true;
  bollards.computeBoundingSphere();
  group.add(bollards);
  geometries.push(bollardGeo);
  materials.push(bollardMat);

  // Invisible boundary colliders around the 42m half-extent playable district
  const limit = 40;
  const wallThickness = 2;
  colliders.push(
    { id: 'North Perimeter', minX: -limit, maxX: limit, minY: 0, maxY: 6, minZ: -limit - wallThickness, maxZ: -limit, walkableTop: false },
    { id: 'South Perimeter', minX: -limit, maxX: limit, minY: 0, maxY: 6, minZ: limit, maxZ: limit + wallThickness, walkableTop: false },
    { id: 'West Perimeter', minX: -limit - wallThickness, maxX: -limit, minY: 0, maxY: 6, minZ: -limit, maxZ: limit, walkableTop: false },
    { id: 'East Perimeter', minX: limit, maxX: limit + wallThickness, minY: 0, maxY: 6, minZ: -limit, maxZ: limit, walkableTop: false },
  );

  return {
    group,
    colliders,
    update(elapsed: number) {
      coreRing.rotation.y = elapsed * 1.1;
      coreRing.rotation.x = Math.sin(elapsed * 0.9) * 0.35;
      coreCrystal.rotation.y = -elapsed * 1.6;
      coreCrystal.position.y = 2.0 + Math.sin(elapsed * 2.2) * 0.16;
    },
    dispose() {
      sky.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
