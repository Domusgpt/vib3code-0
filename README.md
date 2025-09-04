# VIB3CODE-0: Holographic AI Blog

**A fully agentic, research-and-writing powered blog with holographic transitions and 4D visualizations**

![VIB3CODE-0](https://img.shields.io/badge/VIB3CODE-Holographic%20AI%20Blog-00ffff)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React Three Fiber](https://img.shields.io/badge/R3F-WebGL-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## 🌟 Features

- **🎭 Holographic Transitions** - Scrolling feels like expanding dimensional space
- **🔮 Multi-Canvas WebGL** - Every section runs multiple visualizers with complementary parameters
- **🧠 Exact Parameter Vocabulary** - 10 core parameters with deterministic section derivations
- **🎨 Unique Section Rules** - Each section defines its own relationship to home parameters
- **📱 Device Orientation 4D** - Tilt mapping to 4D perspective transformations
- **🎵 Audio Reactivity** - FFT analysis drives visual parameters
- **🤖 Agentic Content Pipeline** - AI-generated articles with visual parameter matching

## 🏗️ Architecture

Built with the exact tech stack from specification:

- **Next.js 14** - App Router architecture
- **React Three Fiber** - WebGL canvas management
- **GSAP ScrollTrigger + Lenis** - Smooth scroll navigation  
- **Zustand** - Global parameter state management
- **TypeScript** - Type-safe development

## 📊 Parameter System

### Core Parameters (Exact PDF Specification)
```typescript
interface Params {
  hue: number;        // base hue (0–1)
  density: number;    // particle/mesh instance density
  morph: number;      // shape morph factor (0–1)
  chaos: number;      // turbulence/noise amplitude
  noiseFreq: number;  // domain noise frequency
  glitch: number;     // glitch intensity (0–1)
  dispAmp: number;    // displacement amplitude
  chromaShift: number;// RGB shift amount
  timeScale: number;  // shader time multiplier
  beatPhase: number;  // musical/clock phase [0–1)
}
```

### Section Derivations (Deterministic)
```typescript
// PDF formulas implemented exactly
hue_i = mod(home.hue + hueShift[i], 1.0)
density_i = clamp(home.density * densMul[i] + densAdd[i], 0.0, 1.0)
morph_i = clamp(home.morph * morphMul[i] + morphAdd[i], 0.0, 1.0)
chaos_i = clamp(home.chaos * chaosMul[i] + chaosAdd[i], 0.0, 1.0)
glitch_i = max(0.0, home.glitch + glitchBias[i])
```

## 🎨 Section Implementations

### 🏠 Home Section
- **Transition In**: Radial hologram expand
- **Transition Out**: Dissolve into portal field
- **Parameters**: `glitchBias=+0.05`

### 📰 AI News Section  
- **Transition In**: Oppose & Snap (hover-driven counter-motion)
- **Transition Out**: Spring return with chroma trail
- **Parameters**: `hueShift=+0.07, densMul=0.9`

### 💻 Vibe Coding Section
- **Transition In**: Morph/Chaos Swap (focused clarity)
- **Transition Out**: Peripheral frenzy decay
- **Parameters**: `chaosMul=1.1, morphMul=1.2`

### 📊 Info Theory Section
- **Transition In**: Spectral slice intro (chromaShift↑)
- **Transition Out**: Spectral merge
- **Parameters**: `noiseFreqMul=0.8, dispAmp+0.05`

### 🧠 Philosophy Section
- **Transition In**: Slow portal peel (dispAmp↑)
- **Transition Out**: Reseal with low glitch
- **Parameters**: `glitchBias=-0.03, timeScale=0.9, densAdd=0.05`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vib3code-0.git
cd vib3code-0

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the holographic interface.

## 📁 Project Structure

```
VIB3CODE-0/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main holographic interface
│   ├── layout.tsx         # Root layout with fonts
│   └── globals.css        # Holographic styling system
├── components/
│   ├── sections/          # Section-specific visualizers
│   │   ├── HomeSection.tsx
│   │   ├── AINewsSection.tsx
│   │   ├── VibeCodingSection.tsx
│   │   ├── InfoTheorySection.tsx
│   │   └── PhilosophySection.tsx
│   └── ui/               # UI components
│       ├── ParameterPanel.tsx
│       └── ScrollController.tsx
├── lib/
│   └── store.ts          # Zustand parameter store
├── CLAUDE.md             # Development documentation
└── package.json
```

## 🎭 Interaction Patterns

### Oppose & Snap Pattern
```typescript
// Focused section counters hover
density_k(t) = lerp(density_k0, 1.0 - density_k0, hoverEase(t))

// Non-focused sections invert hue
hue_j = 1.0 - hue_j

// Clock snap: meet-in-middle
density_i ← 0.5 * (density_i + (1.0 - density_i))
```

### Morph/Chaos Swap Pattern
```typescript
// Focused: crystalline calm
morph_k → 0.0, chaos_k → 0.0

// Background: rapid eruption  
chaos_P ← min(1.0, chaos_P + 0.7)
timeScale_P += 0.25
```

## 🎵 Audio Reactivity

- **Low bands** (kick/bass) → `CLOCK_BEAT()` trigger
- **Midrange** → modulates `morph` subtly
- **Highs** → `chromaShift` bursts  
- **Overall level** → drives `glitch`, `chaos`, `density`

## 📱 Device Integration

### 4D Perspective Mapping
```typescript
// Device orientation → 4D rotations
rot4dXW: baseRotations.rot4dXW + (betaNorm * π/180 * dramatic4DScale)
rot4dYW: baseRotations.rot4dYW + (gammaNorm * π/180 * dramatic4DScale)
rot4dZW: baseRotations.rot4dZW + (alphaNorm * π/180 * dramatic4DScale)
```

## 🔧 Development

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Environment Setup
The system initializes automatically with:
- Device orientation listeners
- Parameter binding to CSS custom properties
- Beat phase animation loop
- WebGL context management

## 🎨 Shader System

Each section uses custom GLSL shaders with:
- **Vertex shaders** for geometric displacement
- **Fragment shaders** for color/effects
- **Uniform binding** with exact parameter vocabulary
- **Real-time updates** from Zustand store

### Example Uniform Mapping
```typescript
const UNIFORM_MAP = {
  hue: 'uHue', density: 'uDensity', morph: 'uMorph',
  chaos: 'uChaos', noiseFreq: 'uNoiseFreq', glitch: 'uGlitch',
  dispAmp: 'uDispAmp', chromaShift: 'uChromaShift',
  timeScale: 'uTimeScale', beatPhase: 'uBeatPhase'
};
```

## 🤖 Future: Agentic Content Pipeline

Planned integration with AI agents for:
- Daily content scraping and summarization
- Article drafting with visual parameter generation
- Human review interface
- Automated publishing pipeline

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built on research from VIB34D Ultimate Viewer
- Inspired by Visual Codex holographic demos
- Implements exact PDF specification requirements

---

**VIB3CODE-0** - Where AI content meets holographic visualization ✨
---

# 🌟 A Paul Phillips Manifestation

**Send Love, Hate, or Opportunity to:** Paul@clearseassolutions.com  
**Join The Exoditical Moral Architecture Movement today:** [Parserator.com](https://parserator.com)  

> *"The Revolution Will Not be in a Structured Format"*

---

**© 2025 Paul Phillips - Clear Seas Solutions LLC**  
**All Rights Reserved - Proprietary Technology**

**Philosophy:** "The Revolution Will Not be in a Structured Format" - Paul Phillips

---
