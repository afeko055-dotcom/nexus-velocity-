# Android Target Requirements (Stage 02+ Reference)

NEXUS VELOCITY targets **Android** as its primary standalone platform before desktop/Windows expansion.

## Baseline Constraints
1. **Distribution Format:** Standalone `.apk` (development/QA) and `.aab` (release). No browser tab or external web dependency required to play.
2. **Offline Execution:** Cold boot, Nexus City rendering, Kai Veyron locomotion, Velocity Core mechanics, vehicles, missions, and save/load must work in Airplane Mode.
3. **Device Envelope (Planned):**
   - Minimum baseline: Android 10+ (API 29+), ARM64-v8a, 4 GB RAM.
   - Frame pacing target: Stable 30 FPS minimum on baseline hardware, 60 FPS quality tier on flagship devices.
4. **Asset & Memory Discipline:**
   - Streaming district chunks (`game/world/`) with LODs.
   - Hardware-friendly texture compression (ASTC / ETC2).
   - Bounded draw calls and pooled NPC/vehicle entities.
5. **Stage 02 Evaluation Criteria:** Every candidate engine tested in Stage 02 must prove real APK compilation and clean startup before selection.
