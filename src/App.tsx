import { useState } from 'react';
import { AlertTriangle, Box, FileCheck2, FolderTree, Layers } from 'lucide-react';
import { ThreeCandidatePrototype } from '../prototypes/candidate-threejs/ThreeCandidatePrototype';

type TabId = 'candidate-threejs' | 'candidate-godot4' | 'foundation';

const ROOT_DOCUMENTS = [
  'README.md',
  'PROJECT_RULES.md',
  'ARCHITECTURE.md',
  'AI_HANDOFF.md',
  'STAGE_TRACKER.md',
  'COMPLETED_FEATURES.md',
  'KNOWN_BUGS.md',
  'DECISIONS.md',
  'TEST_PLAN.md',
];

const RESERVED_DIRECTORIES = [
  'game/runtime/',
  'game/core/',
  'game/systems/',
  'game/player/',
  'game/world/',
  'game/missions/',
  'game/vehicles/',
  'game/characters/',
  'game/assets/',
  'game/ui/',
  'game/audio/',
  'game/data/',
  'builds/development/',
  'builds/releases/',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('candidate-threejs');

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* Slim Stage 02 Candidate Switcher Header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold tracking-wider text-white">NEXUS VELOCITY</span>
          </div>
          <span className="hidden sm:inline-block rounded border border-cyan-500/35 bg-cyan-950/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
            Stage 02 Bench · Engine: UNDECIDED
          </span>
        </div>

        <nav className="flex items-center gap-1.5" aria-label="Stage 02 Candidate Views">
          <button
            type="button"
            onClick={() => setActiveTab('candidate-threejs')}
            data-testid="tab-threejs"
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === 'candidate-threejs'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            Candidate A: Three.js 3D (Playable)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('candidate-godot4')}
            data-testid="tab-godot4"
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === 'candidate-godot4'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            Candidate B: Godot 4 (Unavailable)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('foundation')}
            data-testid="tab-foundation"
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === 'foundation'
                ? 'bg-slate-200 text-slate-950 font-semibold'
                : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            Foundation Boundaries
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      {activeTab === 'candidate-threejs' && (
        <main className="relative flex-1 min-h-0">
          <ThreeCandidatePrototype />
        </main>
      )}

      {activeTab === 'candidate-godot4' && (
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/25 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h1 className="text-base font-semibold">
                  Candidate B — Godot 4 (Mobile / Forward+) Unavailable in Cloud Sandbox
                </h1>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                This container has Node.js / Vite tooling only. No native Godot binary, OpenJDK,
                Gradle, or Android SDK is installed, so a Godot 4 playable executable or signed
                Android <code className="font-mono text-amber-200">.apk</code> cannot be compiled or
                launched here. Per project rules, no fake 2D substitute or mocked binary has been
                created.
              </p>
              <pre className="overflow-x-auto rounded border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-amber-200">
{`$ which godot godot4 unity adb gradle sdkmanager java
# Exit status 1 — none of these binaries exist in this sandbox`}
              </pre>
            </div>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Layers className="h-4 w-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Why Godot 4 Remains Top Final Candidate
                  </h2>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <li>
                    Native Android ARM64 <code className="font-mono text-cyan-300">.apk</code> /{' '}
                    <code className="font-mono text-cyan-300">.aab</code> export without WebView overhead.
                  </li>
                  <li>
                    Built-in <code className="font-mono text-cyan-300">CharacterBody3D</code>,{' '}
                    <code className="font-mono text-cyan-300">SpringArm3D</code>, and Vulkan/GLES3 Mobile renderer.
                  </li>
                  <li>
                    Plain-text <code className="font-mono text-cyan-300">.tscn</code> /{' '}
                    <code className="font-mono text-cyan-300">.gd</code> files suited for multi-AI Git collaboration.
                  </li>
                  <li>Direct offline local storage and Windows x64 cross-export.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Engine Decision Status: UNDECIDED
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Candidate A (Three.js WebGL) demonstrates real 3D movement, touch joystick, jump
                  physics, sliding collision, and camera look inside this browser sandbox while{' '}
                  <code className="font-mono text-cyan-300">game/runtime/</code> stays untouched.
                  Final engine lock-in waits until Godot 4 vs. Capacitor/WebView APK packaging is
                  benchmarked on an environment with Android SDK 34+.
                </p>
              </div>
            </section>
          </div>
        </main>
      )}

      {activeTab === 'foundation' && (
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-2">
              <h1 className="text-lg font-semibold text-white">
                Stage 01 / Stage 02 Isolation Boundaries
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                All Stage 02 interactive 3D prototype modules live strictly under{' '}
                <code className="font-mono text-cyan-300">prototypes/candidate-threejs/</code>. All
                14 mandatory <code className="font-mono text-cyan-300">game/*</code> and{' '}
                <code className="font-mono text-cyan-300">builds/*</code> directories retain their{' '}
                <code className="font-mono text-cyan-300">.gitkeep</code> markers until Stage 02
                selects the final engine.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <FolderTree className="h-4 w-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    14 Mandatory Preserved Directories (.gitkeep)
                  </h2>
                </div>
                <ul className="grid grid-cols-2 gap-1 font-mono text-xs text-slate-300">
                  {RESERVED_DIRECTORIES.map((dir) => (
                    <li key={dir}>{dir}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <FileCheck2 className="h-4 w-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    9 Governance Documents
                  </h2>
                </div>
                <ul className="grid grid-cols-2 gap-1 font-mono text-xs text-slate-300">
                  {ROOT_DOCUMENTS.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
