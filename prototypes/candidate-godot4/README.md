# Candidate B — Godot 4 (Forward+ / Mobile Renderer) Evaluation Notes

> **Status:** **UNAVAILABLE IN CURRENT CLOUD SANDBOX (`ENV-004`)**  
> **Engine Decision Status:** **UNDECIDED** — Do not treat Candidate A (Three.js) as the automatic final engine until Candidate B (Godot 4) is benchmarked on a workstation/CI runner with Android SDK tooling.

---

## 1. Why Godot 4 Is a Serious Primary Candidate

NEXUS VELOCITY's Master Blueprint targets a **genuine standalone offline-capable 3D open-world Android APK/AAB** (with future Windows builds). Compared with browser/WebView runtimes, Godot 4 offers:

1. **Native Android Export Pipeline:** Built-in `.apk` and Play Store `.aab` exports via Vulkan/GLES3 Mobile renderer without wrapping a browser WebView.
2. **Offline Open-World Capabilities:** Native `CharacterBody3D`, `GridMap`/chunk streaming (`ResourceLoader.load_threaded_request`), ASTC/ETC2 compressed GPU textures, and deterministic local disk saves (`FileAccess` / SQLite extensions).
3. **Text-Based Scene & Script Format:** `.tscn` scenes and `.gd` GDScript files are clean plain text ideal for Git diffs and multi-AI collaboration (Claude, Replit, Qwen, Google AI Studio).
4. **Windows Portability:** Single project exports natively to Android ARM64 and Windows x64.

---

## 2. Verified Environment Limitation (`ENV-004`)

Command executed in the active Linux container:

```bash
which godot godot4 unity adb gradle sdkmanager java
# Result: exit code 1 / empty (none installed in sandbox)
```

Because **Godot 4**, **OpenJDK**, **Gradle**, and the **Android SDK (`adb`, `sdkmanager`)** are not installed in this cloud Node/Vite sandbox:
- No playable Godot 4 binary or Android `.apk` can be compiled or executed inside this environment.
- Per project honesty rules, **no fake 2D simulation or mocked Android build** has been fabricated here.

---

## 3. Recommended Stage 02 Completion Step Outside Sandbox

When continuing on a local machine or GitHub Actions runner with Godot 4.3+ and Android SDK 34+:
1. Create an isolated Godot 4 equivalent of the Nexus Plaza test scene (`CharacterBody3D` Kai Veyron placeholder, `SpringArm3D` third-person camera, touchscreen `VirtualJoystick` + `TouchScreenButton` jump, `StaticBody3D` district colliders, FPS HUD, and Reset button).
2. Export a signed debug `.apk` to compare binary size, cold boot time, thermal stability, and 30/60 FPS frame pacing on a mid-tier Android device against Candidate A before closing `DECISIONS.md` (`UNRESOLVED-01`).
