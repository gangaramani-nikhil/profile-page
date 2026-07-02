# nikhil@mumbai:~$ — AI Engineer Portfolio

Single-page "Neon Terminal / Hacker OS" portfolio for **Nikhil Gangaramani**
(AI Engineer, Mumbai IN). A scroll-driven WebGL data pipeline is the site's
connective tissue: raw text nodes chunk and convert into glowing vector
embeddings as visitors scroll from `./init` to `./contact`.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS 3 · `motion` v12 ·
Three.js + React Three Fiber · raw WebGL · `cmdk` · `sonner`

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production bundle
npm run preview    # serve the production build
```

---

## Implementation plan → what shipped

### 1. Performance & WebGL architecture
- **GPU instancing** — every heavy particle system is one draw call:
  - Global pipeline: 1,500 particles (520 on mobile) on a single
    `InstancedBufferGeometry` with per-instance `aStart/aChunk/aEmbed/aSeed`
    attributes; the raw-text → chunk → embedding morph runs entirely in the
    vertex shader (`src/components/three/pipelineShaders.ts`).
  - Routing sim: 2,600 particles whose bezier lane motion is computed
    per-vertex on the GPU (`RoutingSim.tsx`) — CPU only updates `uTime`.
- **Scroll-gated on-demand rendering** — every R3F canvas uses
  `frameloop="demand"`. The global canvas invalidates only while scroll is
  settling or a ripple is decaying; project-card canvases unmount entirely
  when their DOM rect leaves the viewport (IntersectionObserver in
  `SimCanvas.tsx`) and pause when the tab is hidden.
- **KTX2 asset policy** — all scenes are procedural (zero texture fetches);
  `src/lib/ktx2.ts` is the single factory any future texture/model must go
  through so GPU-native Basis/KTX2 transcoding is enforced from day one.

### 2. Scroll-driven 3D data pipeline
- `PipelineCanvas.tsx` is a fixed full-viewport canvas behind the page. Scroll
  progress flies the camera ~62 units down a ringed tunnel; floating terminal
  tokens (real text via cached `CanvasTexture`s, no font fetches) fade out as
  particles cascade from green raw-text motes → amber chunks → cyan embedding
  constellations.
- **Dynamic shaders**: `uNoiseAmp` modulates ambient displacement; hovering or
  clicking a project card emits a screen-space ripple through `rippleBus.ts`
  that splashes the shader "ink" outward from the card's own position.

### 3. `03. ./projects` — tailored live previews
- **MI Buddy (RAG)**: a 13F filing wireframe continuously sheds chunks that
  fly into an instanced vector-space cloud; every 7s a query pulse fires from
  the answer panel, nearest embeddings flare, retrieval beams return, and the
  answer rows stream in.
- **High-Throughput Routing**: ingress lanes converge on a rotating router
  core and fan out to color-coded sinks, with a live "routed today" odometer
  ticking at the real 40–100M points/day rate (~460–1,150 events/sec).

### 4. `04. ./log` — metrics-first experience timeline
- The ISS entry leads with a terminal-green counter that rips from `0%` to
  `+75%` the moment it enters the viewport — the Simfund (MarketPulse) query
  performance win is the first thing read.
- Background SVG motifs are accurate systems sketches: Go scheduler with
  buffered channels and worker fan-out, JVM generational GC (eden/survivor/
  tenured + STW budget), and a Python ETL DAG (`logArt.tsx`).

### 5. Command palette & interactive API mocking
- `⌘K` opens a cmdk palette with executable dummy processes:
  `> start mi_buddy`, `> optimize_queries`, `> router_core --stress`,
  `> inject --ripple`, `sudo hire-me` — each plays a toast sequence and
  drives the page (scroll, ripple) like a real shell.
- CV is one click from the hero and nav (`↓ download cv.pdf`); the palette adds
  `fetch cv --pdf`, `fetch cv --view` (LaTeX pager), and `fetch cv --download`
  (`.tex` source). Both files live in `public/cv/`.
- The contact section hosts a functional terminal: type a natural-language
  query, it pings the mocked MI Buddy backend (`mockBackend.ts`) and streams
  the JSON response token-by-token with status line + latency.

### 6. Edge cases & identity
- **Dead links** never render as buttons — `GhostLink.tsx` prints them as raw
  terminal text (`[STATUS: OFFLINE]`, `[WIP]`) using the `--ghost` CSS token.
- **Mobile fallback**: ≤767px the WebGL `NeuralCanvas` is disabled and the 2D
  `FlowField` runs at 2.3× density / 1.9× speed; the global pipeline drops to
  ~⅓ particle count and clamped DPR.
- **Identity injection**: everything (sections, palette, CV, mock backend)
  reads from `src/data/profile.ts` — Nikhil Gangaramani, Mumbai IN.
- `prefers-reduced-motion` disables the boot sequence, counters, streaming,
  and shader motion.

## Layout

```
src/
  data/profile.ts          # single source of identity + content
  lib/                     # hooks, ripple bus, KTX2 policy, mock backend
  components/
    three/                 # PipelineCanvas, sims, shaders, SimCanvas gate
    hero/                  # Hero, FlowField (2D), NeuralCanvas (raw WebGL)
    sections/              # whoami, stack, projects, log (+SVG art), contact
    CommandPalette.tsx     # cmdk shell
    CvModal.tsx            # LaTeX CV pager
public/cv/                 # nikhil_gangaramani_cv.tex
```

> Dates/links in `profile.ts` marked `null` or approximate are placeholders —
> edit that one file to update the whole site.
