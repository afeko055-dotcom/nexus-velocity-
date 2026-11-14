# NEXUS VELOCITY — Stage 02 Technology & Android Packaging Evaluation

> **Decision Status:** **`UNDECIDED` (`UNRESOLVED-01` OPEN)**  
> **Gate Status:** Stage 02 packaging & physical Android testing remain **`BLOCKED`** by missing native toolchains (`ENV-004`). Stage 02B must **not** begin until an authoritative decision is approved and recorded in `DECISIONS.md` and Stage 02 passes independent QA.

---

## 1. Candidates Evaluated

1. **Candidate A — Three.js (WebGL2) + Capacitor / Android WebView Shell**
   - *Implemented Prototype:* `prototypes/candidate-threejs/` (playable 3D proof verified in headless Chromium SwiftShader).
   - *Packaging Strategy (Unbuilt here):* Bundle Vite static assets (`dist/`) into a Capacitor Android Gradle wrapper targeting `minSdk 29` (`Android 10+`), forced landscape orientation in `AndroidManifest.xml`.
2. **Candidate B — Godot 4 (Forward+ / Mobile Renderer, Native ARM64)**
   - *Evaluation Notes:* `prototypes/candidate-godot4/README.md`.
   - *Packaging Strategy (Unbuilt here):* Native Godot 4 Android export template producing ARM64 `.apk` / `.aab` with GLES3/Vulkan Mobile backend.
3. **Candidate C — Unity (2022 LTS / Unity 6, Assessed for Fit Only)**
   - *Assessment:* Excluded from primary recommendation for this multi-AI workflow due to heavy Editor RAM footprint (struggles on the project's **8 GB RAM** development machine), large project metadata overhead, and licensing complexity compared to Godot 4.

---

## 2. Eleven-Criteria Comparative Matrix

| Criterion | Candidate A: Three.js + Capacitor/WebView | Candidate B: Godot 4 (Mobile / GLES3 Native) | Assessment & Trade-Offs |
| :--- | :--- | :--- | :--- |
| **1. Android Packaging & Installation** | Requires Node + Capacitor + Android SDK + Gradle + JDK; ships WebView + JS bundle (~5–15 MB base + assets). Not tested here (`ENV-004`). | Native single-click/CLI `.apk`/`.aab` export via Godot export templates + Android SDK + JDK; true native binary with zero browser wrapper. Not tested here (`ENV-004`). | **Godot 4** is cleaner for a genuine standalone game; Capacitor/WebView adds WebView lifecycle quirks. |
| **2. Standalone Windows Build** | Requires Electron or Tauri wrapper around Vite bundle (~80–150 MB extra runtime). | Native single-command Windows `.exe` export from the same project. | **Godot 4** wins cleanly for desktop parity. |
| **3. 3D Rendering** | Solid WebGL2 PBR (`MeshStandardMaterial`, procedural textures, dynamic lights); verified in prototype. Lacks built-in terrain/LOD/occlusion culling out of box. | Built-in PBR, baked/realtime lightmaps, SDFGI/reflection probes, built-in LOD, occlusion culling, custom spatial shaders, Mobile GLES3 & Vulkan renderers. | **Godot 4** provides engine-level 3D world tools required for open-world scale. |
| **4. Mobile Performance** | Runs inside Chromium Android System WebView; JS GC pauses + WebGL driver overhead; memory cap tighter inside WebView process. | Native C++ engine core, compiled GDScript/GDExtension, ASTC/ETC2 VRAM texture compression, lower thermal/memory overhead. | **Godot 4** strongly favored for mid-range 4 GB Android open-world frame pacing. |
| **5. Touchscreen Input** | Multi-touch Pointer Events (`setPointerCapture`) verified in desktop browser prototype; multi-pointer mobile hardware untested. | Native `TouchScreenButton` / multi-touch `InputEventScreenTouch` + `InputEventScreenDrag` built into OS event loop. | Both viable; **Godot 4** avoids browser viewport/gesture conflicts. |
| **6. Offline Operation** | Vite `dist/` bundles offline inside Capacitor `assets/`; `localStorage`/`IndexedDB`/Capacitor SQLite possible. | 100% native offline binary; `FileAccess` / `ConfigFile` / SQLite native disk storage. | Both support offline play; **Godot 4** avoids browser storage eviction risks. |
| **7. Multiplayer Architecture** | Standard WebSockets / HTTPS REST / WebRTC (`fetch`/SDKs) to external backend. | Built-in `MultiplayerAPI`, WebSocket/HTTPRequest/ENet clients to external authoritative server. | Parity for client integration against server-authoritative APIs. |
| **8. Asset Pipeline** | GLTF/GLB loader (`three/examples/jsm/...`); manual LOD, texture compression (KTX2/Basis), and asset chunking setup required. | Automatic `.glb`/`.gltf`/Blender import pipeline with auto-LOD generation and automatic ETC2/ASTC Android texture compression. | **Godot 4** dramatically reduces manual pipeline engineering. |
| **9. Development Requirements (8 GB RAM PC)** | Light (~300–600 MB RAM for Vite + editor); runs directly in this cloud sandbox. | Very light (~350 MB binary, ~600–900 MB RAM editor); ideal for an **8 GB RAM** dev PC. *(Absent in this Node sandbox.)* | Both fit 8 GB RAM far better than Unity/Unreal; Three.js wins only in cloud Node sandboxes. |
| **10. Compatibility with Existing Code** | Matches `prototypes/candidate-threejs/` (`TypeScript` + `Three.js` + Vite scaffold). Zero migration needed to iterate in browser preview. | Requires porting prototype logic from TypeScript/Three.js (`prototypes/candidate-threejs/`) to GDScript (`CharacterBody3D`, `SpringArm3D`, `.tscn`). | **Three.js** preserves current prototype code directly; **Godot 4** requires Stage 03 clean port from `prototypes/`. |
| **11. Maintenance & Future Expansion** | Every open-world system (physics, navmesh, audio occlusion, streaming chunks, vehicle suspension, save encryption) must be integrated from disparate JS libraries. | Integrated physics (Jolt/GodotPhysics), `NavigationServer3D`, `VehicleBody3D`, `AudioStreamPlayer3D`, `AnimationTree`, and plain-text `.tscn`/`.gd` Git files. | **Godot 4** scales far more sustainably across Stages 03–36. |

---

## 3. Verified Toolchain Availability & Exact Missing Dependencies (`ENV-004`)

Checked inside `/app/applet`:
- **Available:** Node.js `v22.23.2`, npm `10.9.8`, Bun `1.4.4`, Vite `8.3.8`, Three.js `0.187.0`, Playwright `chromium_headless_shell-1247` (SwiftShader software WebGL).
- **Missing (`which godot godot4 unity adb gradle sdkmanager java javac keytool android` -> exit `1`):**
  - `godot` / `godot4` (native engine + Android export templates)
  - `java` / `javac` / `keytool` (OpenJDK 17 required by Android Gradle Plugin)
  - `sdkmanager` / Android SDK Build-Tools & Platform-Tools (`adb`)
  - `gradle` (Android build system — needed for **both** Godot 4 Android exports AND Capacitor Android `.apk` builds)
  - Physical Android ARM64 hardware / Android Emulator (`avd`)

---

## 4. Test Environment Separation

| Environment | Status | Recorded Observations |
| :--- | :--- | :--- |
| **Software-Rendered Browser (`SwiftShader` Headless Chromium)** | **TESTED (Prototype Only)** | Rendered Candidate A at 20–36 FPS (`1280×720`); verified movement, jump physics, AABB collision, camera look, joystick, reset, zero JS/HTTP errors. **Not valid as an Android GPU benchmark.** |
| **Android Emulator** | **NOT TESTED** | No Android SDK / emulator image available (`ENV-004`). |
| **Physical Android Device** | **NOT TESTED** | No USB/ADB device or `.apk` artifact available (`ENV-004`). |

---

## 5. Provisional Recommendation & Closing Criteria for `UNRESOLVED-01`

- **Provisional Engineering Recommendation:** **Godot 4 (Mobile / GLES3)** is the strongest fit for NEXUS VELOCITY's standalone offline Android + Windows open-world target on an 8 GB RAM workstation, with **Three.js + Capacitor** remaining viable **only** if the project intentionally commits to a browser-hybrid runtime and accepts WebView constraints.
- **Why `UNRESOLVED-01` Remains OPEN:** Neither Godot 4 nor Three.js+Capacitor has compiled and booted a real Android `.apk` on Android hardware/CI (`ANDROID_TARGET_REQUIREMENTS.md` §5), and the project decision-makers have not signed off on a runtime choice.
- **Required External Action to Close Stage 02:** Run an Android `.apk` export build test on a workstation or GitHub Actions runner with OpenJDK 17, Android SDK 34+, Gradle, and Godot 4.3+ (or Capacitor Android for Candidate A), record real device/APK evidence, and obtain explicit approval to lock `DECISIONS.md` (`UNRESOLVED-01`).
