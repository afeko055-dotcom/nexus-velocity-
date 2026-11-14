# Module Boundaries & Dependency Rules

All future code under `game/` and `website/` must obey strict unidirectional boundaries:

1. **`game/core/`** has zero dependencies on `game/world/`, `game/missions/`, `game/vehicles/`, `game/characters/`, or `website/`.
2. **`game/data/`** contains pure declarative schemas and balancing tables with zero runtime logic.
3. **`game/systems/`** provides platform-agnostic interfaces (input, physics, storage, optional AI adapter) implemented by `game/runtime/`.
4. **Feature Domains (`game/player/`, `game/world/`, `game/missions/`, `game/vehicles/`, `game/characters/`, `game/ui/`, `game/audio/`)** communicate via `game/core/` contracts and events rather than tight circular imports.
5. **`game/assets/`** stores mobile-budgeted original 3D models, textures, and shaders only.
6. **`website/`** may never be imported by `game/`, and `game/` may never require `website/` to boot or play.
