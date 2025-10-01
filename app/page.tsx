'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import type { BlogPost } from '@/lib/blog-config';
import { contentCategories } from '@/lib/blog-config';
import {
  SECTION_CONFIGS,
  useEvents,
  useHomeParams,
  useSectionParams,
  useStore,
} from '@/lib/store';
import type { VIB3GeometryParams } from '@/lib/vib34d-geometries';

const ParameterPanel = dynamic(() => import('@/components/ui/ParameterPanel'), {
  ssr: false,
  loading: () => null,
});

const VIB3Engine = dynamic(() => import('@/components/engines/VIB3Engine'), {
  ssr: false,
});

type SectionId = keyof typeof SECTION_CONFIGS;

interface AvantSection {
  id: SectionId;
  title: string;
  subtitle: string;
  description: string;
  narrative: string;
  posts: BlogPost[];
  theme: typeof contentCategories[keyof typeof contentCategories]['holographicTheme'] | {
    hue: number;
    density: number;
    intensity: number;
    theme: string;
    primaryColor: string;
  };
}

const heroStatements = [
  'Cascading intelligence across crystalline dimensions.',
  'Editorial choreography for synthetic cognition.',
  'Research fragments refracted through hypercolor lattices.',
  'Strategic futures encoded in harmonic phase space.',
];

const sectionNarratives: Record<SectionId, string> = {
  home: 'Command center for the hyperjournal — every transmission tuned to the geometry of insight.',
  'ai-news': 'Intercepted lab signals, translated into luminous bulletins and orbital briefings.',
  'vibe-coding': 'Algorithmic improvisations rendered as tactile, playful instrument panels.',
  'info-theory': 'Mathematical reveries about entropy, bandwidth, and elegant proof structures.',
  philosophy: 'Speculative ethics and sentient aesthetics, rendered as soft quantum corridors.',
};

const geometryMap: Record<SectionId, number> = {
  home: 1,
  'ai-news': 3,
  'vibe-coding': 5,
  'info-theory': 2,
  philosophy: 6,
};

const heroTheme = {
  hue: 0.58,
  density: 0.52,
  intensity: 0.45,
  theme: 'origin-gate',
  primaryColor: '#22d3ee',
};

function formatLabel(label: string): string {
  return label
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function buildPlaceholderPosts(
  category: keyof typeof contentCategories,
  count = 3,
): BlogPost[] {
  const base = contentCategories[category];
  const now = Date.now();
  return Array.from({ length: count }).map((_, index) => ({
    id: `placeholder-${category}-${index}`,
    title: `${base.name.split(' ')[0]} Signal ${index + 1}`,
    slug: `${category}-signal-${index + 1}`,
    excerpt: `${base.description} — speculative transmission ${index + 1} exploring future scenarios and design praxis.`,
    content: `# ${base.name} Transmission\n\nSynthesized narrative for prototype presentation.`,
    author: {
      name: 'VIB3CODE Collective',
      avatar: '/avatars/vib3code.png',
    },
    publishedAt: new Date(now - index * 86400000),
    updatedAt: new Date(now - index * 86400000),
    tags: [base.name.split(' ')[0], 'VIB3CODE'],
    category,
    readingTime: 6 + index,
    seo: {
      metaTitle: `${base.name} Signal ${index + 1}`,
      metaDescription: `${base.description} avant-garde digest.`,
    },
    holographicParams: base.holographicTheme,
  }));
}

function useResolvedParams(sectionId: SectionId) {
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams(sectionId);
  return sectionParams || homeParams;
}
function AvantGardeBackground({
  activeSection,
  sections,
}: {
  activeSection: SectionId;
  sections: AvantSection[];
}) {
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams(activeSection);
  const resolved = sectionParams || homeParams;
  const sectionVisualState = useStore(
    (state) => state.designSystem.sectionStates[activeSection]
  );
  const layerStates = sectionVisualState?.layers;
  const backgroundState = layerStates?.background;
  const shadowState = layerStates?.shadow;
  const contentState = layerStates?.content;
  const highlightState = layerStates?.highlight;
  const accentState = layerStates?.accent;
  const accentChannel = sectionVisualState?.accentChannel;
  const complementaryChannel = sectionVisualState?.complementaryChannel;
  const accentEnvelope = sectionVisualState?.accentEnvelope;
  const complementaryEnvelope = sectionVisualState?.complementaryEnvelope;

  const geometryIndex = geometryMap[activeSection] ?? 1;
  const highlightGeometry = (geometryIndex + 2) % 8;
  const accentGeometry = (geometryIndex + 5) % 8;
  const backgroundGeometry = (geometryIndex + 7) % 8;
  const shadowGeometry = (geometryIndex + 4) % 8;

  const accentEnvelopeAmplitude = accentEnvelope?.amplitude ?? 0;
  const accentEnvelopeVelocity = accentEnvelope?.velocity ?? 0;
  const complementEnvelopeAmplitude = complementaryEnvelope?.amplitude ?? 0;
  const complementEnvelopeVelocity = complementaryEnvelope?.velocity ?? 0;

  const accentAmplitude = (accentChannel?.amplitude ?? 0) + accentEnvelopeAmplitude * 0.5;
  const complementAmplitude =
    (complementaryChannel?.amplitude ?? 0) + complementEnvelopeAmplitude * 0.5;

  const foundationParams: VIB3GeometryParams = useMemo(
    () => ({
      geometry: geometryIndex,
      morph: Math.min(
        2,
        resolved.morph * (contentState?.reactivity ?? 1) + accentEnvelopeVelocity * 0.1,
      ),
      chaos: Math.min(
        1,
        resolved.chaos * 0.9 * (contentState?.reactivity ?? 1) +
          0.02 +
          accentAmplitude * 0.05 +
          accentEnvelopeAmplitude * 0.08 -
          complementEnvelopeAmplitude * 0.04,
      ),
      density: Math.min(
        1,
        resolved.density * 0.92 * (contentState?.gridDensity ?? 1) + 0.03 + accentEnvelopeAmplitude * 0.02,
      ),
      hue: (resolved.hue + accentAmplitude * 0.015 + accentEnvelopeVelocity * 0.01) % 1,
      noiseFreq:
        resolved.noiseFreq * (1 - complementAmplitude * 0.05 - complementEnvelopeAmplitude * 0.04),
      dispAmp:
        resolved.dispAmp *
        (1 +
          ((highlightState?.depth ?? 0) * 0.002 + accentAmplitude * 0.02 + accentEnvelopeAmplitude * 0.015)),
      timeScale:
        resolved.timeScale *
        (sectionVisualState?.reactivity ?? 1) *
        (1 + accentAmplitude * 0.05 + accentEnvelopeAmplitude * 0.04 - complementEnvelopeAmplitude * 0.02),
      beatPhase: resolved.beatPhase,
    }),
    [
      geometryIndex,
      resolved.morph,
      resolved.chaos,
      resolved.density,
      resolved.hue,
      resolved.noiseFreq,
      resolved.dispAmp,
      resolved.timeScale,
      resolved.beatPhase,
      contentState?.reactivity,
      contentState?.gridDensity,
      highlightState?.depth,
      sectionVisualState?.reactivity,
      accentAmplitude,
      accentEnvelopeAmplitude,
      accentEnvelopeVelocity,
      complementAmplitude,
      complementEnvelopeAmplitude,
    ],
  );

  const highlightParams: VIB3GeometryParams = useMemo(
    () => ({
      geometry: highlightGeometry,
      morph: Math.min(
        2,
        resolved.morph * 1.05 * (highlightState?.gridDensity ?? 1) + 0.05 + accentEnvelopeVelocity * 0.12,
      ),
      chaos: Math.min(
        1,
        resolved.chaos * 1.2 * (highlightState?.reactivity ?? 1) +
          0.05 +
          accentAmplitude * 0.08 +
          accentEnvelopeAmplitude * 0.12,
      ),
      density: Math.min(
        1,
        resolved.density * 1.05 * (highlightState?.gridDensity ?? 1) + 0.04 + accentEnvelopeAmplitude * 0.06,
      ),
      hue: (resolved.hue + 0.14 + accentAmplitude * 0.04 + accentEnvelopeVelocity * 0.02) % 1,
      noiseFreq: resolved.noiseFreq * (1.1 + accentAmplitude * 0.05 + accentEnvelopeAmplitude * 0.05),
      dispAmp:
        resolved.dispAmp *
        (1.1 + (highlightState?.depth ?? 0) * 0.01 + accentEnvelopeAmplitude * 0.02),
      timeScale:
        resolved.timeScale * 1.15 * (highlightState?.reactivity ?? 1) * (1 + accentEnvelopeAmplitude * 0.08),
      beatPhase: resolved.beatPhase,
    }),
    [
      highlightGeometry,
      resolved.morph,
      resolved.chaos,
      resolved.density,
      resolved.hue,
      resolved.noiseFreq,
      resolved.dispAmp,
      resolved.timeScale,
      resolved.beatPhase,
      highlightState?.gridDensity,
      highlightState?.reactivity,
      highlightState?.depth,
      accentAmplitude,
      accentEnvelopeAmplitude,
      accentEnvelopeVelocity,
    ],
  );

  const accentParams: VIB3GeometryParams = useMemo(
    () => ({
      geometry: accentGeometry,
      morph: resolved.morph * 0.8 * (accentState?.reactivity ?? 1),
      chaos: Math.min(
        1,
        resolved.chaos * 0.6 * (accentState?.reactivity ?? 1) +
          accentAmplitude * 0.1 +
          accentEnvelopeAmplitude * 0.14,
      ),
      density: Math.min(1, resolved.density * 0.7 * (accentState?.gridDensity ?? 1)),
      hue: (resolved.hue + 0.32 + accentAmplitude * 0.06 + accentEnvelopeVelocity * 0.025) % 1,
      noiseFreq: resolved.noiseFreq * 0.85,
      dispAmp: resolved.dispAmp * (0.7 + accentAmplitude * 0.1 + accentEnvelopeAmplitude * 0.12),
      timeScale:
        resolved.timeScale * 0.75 * (accentState?.reactivity ?? 1) * (1 + accentEnvelopeAmplitude * 0.1),
      beatPhase: resolved.beatPhase,
    }),
    [
      accentGeometry,
      resolved.morph,
      resolved.chaos,
      resolved.density,
      resolved.hue,
      resolved.noiseFreq,
      resolved.dispAmp,
      resolved.timeScale,
      resolved.beatPhase,
      accentState?.reactivity,
      accentState?.gridDensity,
      accentAmplitude,
      accentEnvelopeAmplitude,
      accentEnvelopeVelocity,
    ],
  );

  const backgroundParams: VIB3GeometryParams = useMemo(
    () => ({
      geometry: backgroundGeometry,
      morph: resolved.morph * 0.55 * (backgroundState?.reactivity ?? 1),
      chaos: Math.min(1, resolved.chaos * 0.35 + complementAmplitude * 0.08),
      density: Math.min(1, resolved.density * 0.6 * (backgroundState?.gridDensity ?? 1)),
      hue: (resolved.hue + 0.58 - complementEnvelopeVelocity * 0.02) % 1,
      noiseFreq: resolved.noiseFreq * 0.85 * (1 - complementEnvelopeAmplitude * 0.05),
      dispAmp: resolved.dispAmp * Math.max(0.3, 0.5 - complementEnvelopeAmplitude * 0.05),
      timeScale:
        resolved.timeScale * 0.65 * Math.max(0.3, 1 - complementEnvelopeAmplitude * 0.04),
      beatPhase: resolved.beatPhase,
    }),
    [
      backgroundGeometry,
      resolved.morph,
      resolved.chaos,
      resolved.density,
      resolved.hue,
      resolved.noiseFreq,
      resolved.dispAmp,
      resolved.timeScale,
      resolved.beatPhase,
      backgroundState?.reactivity,
      backgroundState?.gridDensity,
      complementAmplitude,
      complementEnvelopeAmplitude,
      complementEnvelopeVelocity,
    ],
  );

  const shadowParams: VIB3GeometryParams = useMemo(
    () => ({
      geometry: shadowGeometry,
      morph: resolved.morph * 0.7 * (shadowState?.reactivity ?? 1),
      chaos: Math.min(1, resolved.chaos * 0.5 + complementAmplitude * 0.05),
      density: Math.min(1, resolved.density * 0.8 * (shadowState?.gridDensity ?? 1)),
      hue: (resolved.hue + 0.45 - complementEnvelopeVelocity * 0.015) % 1,
      noiseFreq: resolved.noiseFreq * 0.95 * (1 - complementEnvelopeAmplitude * 0.03),
      dispAmp: resolved.dispAmp * Math.max(0.35, 0.65 - complementEnvelopeAmplitude * 0.03),
      timeScale:
        resolved.timeScale * 0.85 * Math.max(0.4, 1 - complementEnvelopeAmplitude * 0.05),
      beatPhase: resolved.beatPhase,
    }),
    [
      shadowGeometry,
      resolved.morph,
      resolved.chaos,
      resolved.density,
      resolved.hue,
      resolved.noiseFreq,
      resolved.dispAmp,
      resolved.timeScale,
      resolved.beatPhase,
      shadowState?.reactivity,
      shadowState?.gridDensity,
      complementAmplitude,
      complementEnvelopeAmplitude,
      complementEnvelopeVelocity,
    ],
  );

  const baseOpacity = Math.min(
    1,
    0.85 + accentAmplitude * 0.05 + accentEnvelopeAmplitude * 0.04,
  );
  const highlightOpacity = Math.min(
    1,
    0.55 + accentAmplitude * 0.1 + accentEnvelopeAmplitude * 0.08,
  );
  const accentOpacity = Math.min(
    1,
    0.38 + accentAmplitude * 0.15 + accentEnvelopeAmplitude * 0.12,
  );
  const shadowOpacity = Math.min(
    1,
    0.32 + complementAmplitude * 0.12 + complementEnvelopeAmplitude * 0.1,
  );
  const backgroundOpacity = Math.min(
    1,
    0.22 + complementAmplitude * 0.15 + complementEnvelopeAmplitude * 0.12,
  );

  const contentPointSize =
    2.2 + (contentState?.gridDensity ?? 1) * 0.2 + accentEnvelopeVelocity * 0.08;
  const highlightPointSize =
    2.8 + (highlightState?.reactivity ?? 1) * 0.2 + accentEnvelopeAmplitude * 0.12;
  const accentPointSize =
    1.6 + (accentState?.reactivity ?? 1) * 0.3 + accentEnvelopeAmplitude * 0.1;
  const shadowPointSize =
    1.9 + (shadowState?.gridDensity ?? 1) * 0.15 + complementEnvelopeAmplitude * 0.08;
  const backgroundPointSize =
    1.2 + (backgroundState?.gridDensity ?? 1) * 0.1 + complementEnvelopeVelocity * 0.05;

  const toAlphaHex = (alpha: number) =>
    Math.round(Math.min(1, Math.max(0, alpha)) * 255)
      .toString(16)
      .padStart(2, '0');

  const activeTheme = sections.find((section) => section.id === activeSection)?.theme;
  const accentColor = activeTheme?.primaryColor ?? '#22d3ee';
  const accentGradientAlpha = toAlphaHex(
    0.2 + accentAmplitude * 0.25 + accentEnvelopeAmplitude * 0.2,
  );
  const complementGradientAlpha = toAlphaHex(
    0.1 + complementAmplitude * 0.2 + complementEnvelopeAmplitude * 0.18,
  );

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 opacity-55 mix-blend-soft-light">
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 0, 9], fov: 48 }}
        >
          <Suspense fallback={null}>
            <VIB3Engine
              sectionId={activeSection}
              layerType="background"
              params={backgroundParams}
              opacity={backgroundOpacity}
              pointSize={backgroundPointSize}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 opacity-62 mix-blend-screen">
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 0, 7.4], fov: 50 }}
        >
          <Suspense fallback={null}>
            <VIB3Engine
              sectionId={activeSection}
              layerType="shadow"
              params={shadowParams}
              opacity={shadowOpacity}
              pointSize={shadowPointSize}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 opacity-90 mix-blend-screen">
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 0, 6], fov: 45 }}
        >
          <color attach="background" args={['#040510']} />
          <Suspense fallback={null}>
            <VIB3Engine
              sectionId={activeSection}
              layerType="content"
              params={foundationParams}
              opacity={baseOpacity}
              pointSize={contentPointSize}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 mix-blend-plus-lighter opacity-65">
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 0, 7], fov: 52 }}
        >
          <Suspense fallback={null}>
            <VIB3Engine
              sectionId={activeSection}
              layerType="highlight"
              params={highlightParams}
              opacity={highlightOpacity}
              pointSize={highlightPointSize}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 mix-blend-screen opacity-45">
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 0, 5.5], fov: 50 }}
        >
          <Suspense fallback={null}>
            <VIB3Engine
              sectionId={activeSection}
              layerType="accent"
              params={accentParams}
              opacity={accentOpacity}
              pointSize={accentPointSize}
            />
          </Suspense>
        </Canvas>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(circle at 20% 20%, ${accentColor}${accentGradientAlpha}, transparent 55%),` +
            `radial-gradient(circle at 80% 70%, ${accentColor}${complementGradientAlpha}, transparent 60%)`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff0d,transparent_65%)]" />
    </div>
  );
}

function HeroSection({
  section,
  onExplore,
}: {
  section: AvantSection;
  onExplore: () => void;
}) {
  const events = useEvents();
  const params = useHomeParams();
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % heroStatements.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id={`section-${section.id}`}
      data-section-id={section.id}
      className="snap-start min-h-screen relative flex items-center py-32"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(4,7,18,0.65) 0%, rgba(9,15,32,0.1) 55%, rgba(4,7,18,0.65) 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="space-y-8"
        >
          <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-cyan-200/70">
            <span className="h-0.5 w-10 bg-cyan-200/60" />
            Hyperjournal Signal
          </span>

          <h1 className="text-6xl md:text-7xl xl:text-8xl font-black leading-[0.95] text-white">
            VIB3CODE <span className="text-cyan-300">HyperJournal</span>
          </h1>

          <div className="h-16 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="text-lg md:text-xl text-cyan-100/80 max-w-2xl"
              >
                {heroStatements[lineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-base md:text-lg text-cyan-100/70 max-w-3xl">
            {section.narrative}
          </p>

          <div className="flex flex-wrap gap-6">
            {[
              { label: 'Hue', value: `${Math.round(params.hue * 360)}°` },
              { label: 'Density', value: `${Math.round(params.density * 100)}%` },
              { label: 'Morph', value: params.morph.toFixed(2) },
              { label: 'Chaos', value: `${Math.round(params.chaos * 100)}%` },
            ].map((metric) => (
              <div
                key={metric.label}
                className="px-5 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-sm font-mono text-cyan-200/80"
              >
                <span className="text-cyan-100/40 mr-3">{metric.label}</span>
                {metric.value}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-6">
            <button
              onClick={() => {
                events.APPLY_CLICK_RESPONSE('home');
                onExplore();
              }}
              onMouseEnter={() => events.HOVER_START('home')}
              onMouseLeave={() => events.HOVER_END('home')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-400 text-white text-sm uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-transform duration-500 hover:scale-105"
            >
              Enter Transmission Grid
            </button>
            <span className="text-xs text-cyan-100/50 uppercase tracking-[0.4em]">
              Scroll • Navigate • Interact
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-6 bg-cyan-500/10 blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-8 space-y-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-cyan-100/70">
              <span>System Overview</span>
              <span>VIB34D</span>
            </div>

            <div className="space-y-4 text-sm text-cyan-100/60">
              <p>• Layered geometry engine orchestrated through preset choreography.</p>
              <p>• Interaction multiplexing links hover, scroll, and beat-synced modulation.</p>
              <p>• Editor-ready parameter banks for designing entire realities instantly.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-cyan-100/60">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-100/40 mb-2">Incoming Transition</div>
                <div className="text-sm text-white">{formatLabel(SECTION_CONFIGS.home.transitionIn)}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-100/40 mb-2">Outgoing Transition</div>
                <div className="text-sm text-white">{formatLabel(SECTION_CONFIGS.home.transitionOut)}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs uppercase tracking-[0.3em] text-cyan-100/40">
              Fully synchronized with the VIB34D preset banks and editor interface.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
function AvantPostCard({
  post,
  sectionId,
  accentColor,
}: {
  post: BlogPost;
  sectionId: SectionId;
  accentColor: string;
}) {
  const events = useEvents();
  const visualState = useStore((state) => state.designSystem.sectionStates[sectionId]);
  const accentPulse = visualState?.accentEnvelope?.amplitude ?? 0;
  const accentVelocity = visualState?.accentEnvelope?.velocity ?? 0;
  const complementPulse = visualState?.complementaryEnvelope?.amplitude ?? 0;

  const cardGlow = Math.min(0.55, 0.18 + accentPulse * 0.12);
  const borderOpacity = Math.min(0.45, 0.18 + complementPulse * 0.1);
  const toAlpha = (value: number) =>
    Math.round(Math.min(1, Math.max(0, value)) * 255)
      .toString(16)
      .padStart(2, '0');

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, rotateX: 4, rotateY: -3 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 cursor-pointer"
      onHoverStart={() => events.HOVER_START(sectionId)}
      onHoverEnd={() => events.HOVER_END(sectionId)}
      onClick={() => events.APPLY_CLICK_RESPONSE(sectionId)}
      style={{
        boxShadow: `0 0 ${18 + accentPulse * 18}px ${accentColor}${toAlpha(cardGlow * 0.9)}`,
        borderColor: `${accentColor}${toAlpha(borderOpacity)}`,
        background:
          `linear-gradient(135deg, rgba(10,12,26,0.68) 0%, rgba(9,14,28,0.35) 45%, rgba(7,10,20,0.68) 100%),` +
          `radial-gradient(circle at 80% 20%, ${accentColor}${toAlpha(borderOpacity * 0.8)}, transparent 65%)`,
        transition: 'box-shadow 0.45s ease, border-color 0.45s ease, background 0.45s ease',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${accentColor}${toAlpha(cardGlow)}, transparent 60%)`,
        }}
      />
      <div
        className="absolute -inset-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background:
            `conic-gradient(from 90deg at 50% 50%, transparent 0deg, ${accentColor}${toAlpha(
              0.18 + accentPulse * 0.08,
            )} 120deg, transparent 300deg)`,
          transform: `rotate(${accentVelocity * 12}deg)`,
        }}
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-cyan-100/60">
          <span>{post.category.replace('-', ' ')}</span>
          <span>{post.readingTime} min</span>
        </div>
        <h3 className="text-2xl font-bold text-white leading-tight">
          {post.title}
        </h3>
        <p className="text-sm text-cyan-100/70 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-cyan-100/60">
          <span>{post.author.name}</span>
          <time>
            {post.publishedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.3em] text-cyan-100/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function AvantSectionPanel({
  section,
  index,
}: {
  section: AvantSection;
  index: number;
}) {
  const params = useResolvedParams(section.id);
  const accentColor = section.theme?.primaryColor ?? '#22d3ee';
  const visualState = useStore((state) => state.designSystem.sectionStates[section.id]);
  const accentPulse = visualState?.accentEnvelope?.amplitude ?? 0;
  const complementPulse = visualState?.complementaryEnvelope?.amplitude ?? 0;
  const accentChannel = visualState?.accentChannel;
  const complementaryChannel = visualState?.complementaryChannel;

  const metrics = [
    { label: 'Hue', value: `${Math.round((params.hue % 1) * 360)}°` },
    { label: 'Density', value: `${Math.round(params.density * 100)}%` },
    { label: 'Morph', value: params.morph.toFixed(2) },
    { label: 'Chaos', value: `${Math.round(params.chaos * 100)}%` },
  ];

  const channelMetrics = [
    { label: 'Accent Pulse', value: accentPulse.toFixed(2) },
    { label: 'Accent Layer', value: accentChannel?.layer ?? '—' },
    { label: 'Complement Pulse', value: complementPulse.toFixed(2) },
    { label: 'Complement Layer', value: complementaryChannel?.layer ?? '—' },
  ];

  const transitions = SECTION_CONFIGS[section.id];

  return (
    <motion.section
      id={`section-${section.id}`}
      data-section-id={section.id}
      className="snap-start min-h-screen relative flex items-center py-28"
      initial={{ opacity: 0, y: 120 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(6,10,20,0.65) 0%, rgba(8,12,25,0.35) 50%, rgba(6,10,20,0.7) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(circle at ${20 + index * 12}% 20%, ${accentColor}1b, transparent 55%),` +
            `radial-gradient(circle at ${70 - index * 8}% 75%, ${accentColor}12, transparent 65%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 lg:grid-cols-[0.95fr_1.05fr] items-start">
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-cyan-100/50">
              <span className="h-0.5 w-8 bg-cyan-100/40" />
              {section.subtitle}
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-[1.05]">
              {section.title}
            </h2>
            <p className="text-base md:text-lg text-cyan-100/75 max-w-xl">
              {section.description}
            </p>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/40">
              {section.narrative}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl px-6 py-5 text-sm text-cyan-100/70"
              >
                <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-100/40 mb-2">
                  {metric.label}
                </div>
                <div className="text-xl font-semibold text-white">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-cyan-100/60">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-100/35 mb-2">Transition In</div>
              <div className="text-sm text-white">{formatLabel(transitions.transitionIn)}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-100/35 mb-2">Transition Out</div>
              <div className="text-sm text-white">{formatLabel(transitions.transitionOut)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {channelMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl px-5 py-4 text-[11px] uppercase tracking-[0.3em] text-cyan-100/60"
              >
                <div className="text-cyan-100/35 mb-1">{metric.label}</div>
                <div className="text-lg text-white tracking-normal">
                  {typeof metric.value === 'string' ? metric.value : metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {section.posts.map((post) => (
            <AvantPostCard
              key={post.id}
              post={post}
              sectionId={section.id}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function SectionNavigation({
  sections,
  currentSection,
}: {
  sections: AvantSection[];
  currentSection: SectionId;
}) {
  const events = useEvents();

  return (
    <div className="hidden xl:flex flex-col gap-4 fixed top-1/2 right-12 -translate-y-1/2 z-40">
      {sections.map((section) => (
        <button
          key={section.id}
          onMouseEnter={() => events.HOVER_START(section.id)}
          onMouseLeave={() => events.HOVER_END(section.id)}
          onClick={() => {
            events.APPLY_CLICK_RESPONSE(section.id);
            document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`group relative flex items-center gap-3 text-xs uppercase tracking-[0.35em] transition-all duration-500 ${
            currentSection === section.id
              ? 'text-white'
              : 'text-cyan-100/40 hover:text-white'
          }`}
        >
          <span
            className={`h-px w-12 transition-all duration-500 ${
              currentSection === section.id ? 'bg-white w-16' : 'bg-cyan-100/40 group-hover:bg-white'
            }`}
          />
          {section.title}
        </button>
      ))}
    </div>
  );
}

function SectionTelemetry({ currentSection }: { currentSection: SectionId }) {
  const config = SECTION_CONFIGS[currentSection];
  const visualState = useStore((state) => state.designSystem.sectionStates[currentSection]);
  const accentPulse = visualState?.accentEnvelope?.amplitude ?? 0;
  const complementPulse = visualState?.complementaryEnvelope?.amplitude ?? 0;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-6 rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl px-6 py-3 text-[10px] uppercase tracking-[0.4em] text-cyan-100/50">
        <span className="flex items-center gap-2 text-white">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          {config.name}
        </span>
        <span>In · {formatLabel(config.transitionIn)}</span>
        <span>Out · {formatLabel(config.transitionOut)}</span>
        <span>Beat · {config.id === 'home' ? 'Origin' : 'Sustained'}</span>
        <span>Accent · {accentPulse.toFixed(2)}</span>
        <span>Complement · {complementPulse.toFixed(2)}</span>
      </div>
    </div>
  );
}
export default function AvantGardeBlogPage() {
  const events = useEvents();
  const homeParams = useHomeParams();
  const [sections, setSections] = useState<AvantSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<SectionId>('home');

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      setLoading(true);
      const heroSection: AvantSection = {
        id: 'home',
        title: 'Singular Foresight',
        subtitle: 'Holographic Dispatch',
        description: 'An avant-garde research magazine where transitions, presets, and ideas align in luminous synchrony.',
        narrative: sectionNarratives.home,
        posts: [],
        theme: heroTheme,
      };

      try {
        const { contentAPI } = await import('@/lib/content-api');
        const categoryKeys = Object.keys(contentCategories) as Array<keyof typeof contentCategories>;

        const contentSections = await Promise.all(
          categoryKeys.map(async (categoryKey) => {
            try {
              const result = await contentAPI.getPostsByCategory(categoryKey);
              const posts = result.posts.length ? result.posts : buildPlaceholderPosts(categoryKey);

              return {
                id: categoryKey as SectionId,
                title: contentCategories[categoryKey].name,
                subtitle: contentCategories[categoryKey].name,
                description: contentCategories[categoryKey].description,
                narrative: sectionNarratives[categoryKey as SectionId],
                posts,
                theme: result.theme,
              } satisfies AvantSection;
            } catch (error) {
              console.warn('Failed to load posts for', categoryKey, error);
              return {
                id: categoryKey as SectionId,
                title: contentCategories[categoryKey].name,
                subtitle: contentCategories[categoryKey].name,
                description: contentCategories[categoryKey].description,
                narrative: sectionNarratives[categoryKey as SectionId],
                posts: buildPlaceholderPosts(categoryKey),
                theme: contentCategories[categoryKey].holographicTheme,
              } satisfies AvantSection;
            }
          }),
        );

        if (!cancelled) {
          setSections([heroSection, ...contentSections]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize sections', error);
        if (!cancelled) {
          const fallbackCategoryIds = ['ai-news', 'vibe-coding', 'info-theory', 'philosophy'] as const;
          const fallbackSections: AvantSection[] = [
            heroSection,
            ...fallbackCategoryIds.map((categoryId) => ({
              id: categoryId,
              title: contentCategories[categoryId].name,
              subtitle: contentCategories[categoryId].name,
              description: contentCategories[categoryId].description,
              narrative: sectionNarratives[categoryId],
              posts: buildPlaceholderPosts(categoryId),
              theme: contentCategories[categoryId].holographicTheme,
            })),
          ];
          setSections(fallbackSections);
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id') as SectionId | null;
            if (id) {
              setCurrentSection(id);
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const frame = requestAnimationFrame(function loop() {
      events.TICK(0.016);
      requestAnimationFrame(loop);
    });
    const beat = setInterval(() => events.CLOCK_BEAT(), 2000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(beat);
    };
  }, [events]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const direction = event.deltaY > 0 ? 'down' : 'up';
      const velocity = Math.min(1, Math.abs(event.deltaY) / 900 + 0.05);
      events.APPLY_SCROLL_RESPONSE(direction, velocity);
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [events]);

  useEffect(() => {
    Object.entries(homeParams).forEach(([key, value]) => {
      const cssName = `--param-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      document.documentElement.style.setProperty(cssName, `${value}`);
    });
  }, [homeParams]);

  useEffect(() => {
    const focusIndex = sections.findIndex((section) => section.id === currentSection);
    if (focusIndex >= 0) {
      const progress = focusIndex / Math.max(1, sections.length - 1);
      document.documentElement.style.setProperty('--focus-section', `'${currentSection}'`);
      document.documentElement.style.setProperty('--scroll-progress', `${progress}`);
      document.documentElement.style.setProperty('--bg-offset-x', `${(progress - 0.5) * 160}px`);
      document.documentElement.style.setProperty('--bg-offset-y', `${(progress - 0.5) * 60}px`);
      document.documentElement.style.setProperty('--bg-scale', `${1 + (progress - 0.5) * 0.08}`);
      document.documentElement.style.setProperty('--bg-rotation', `${(progress - 0.5) * 16}deg`);
    }
    events.SET_FOCUS(currentSection);
  }, [currentSection, sections, events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="holographic-spinner">
          <div className="spinner-ring" />
          <div className="spinner-text">Calibrating holographic blog...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <AvantGardeBackground activeSection={currentSection} sections={sections} />
      <SectionNavigation sections={sections} currentSection={currentSection} />

      <main className="relative z-10">
        {sections.map((section, index) =>
          section.id === 'home' ? (
            <HeroSection
              key={section.id}
              section={section}
              onExplore={() =>
                document.getElementById('section-ai-news')?.scrollIntoView({ behavior: 'smooth' })
              }
            />
          ) : (
            <AvantSectionPanel key={section.id} section={section} index={index} />
          ),
        )}
      </main>

      <SectionTelemetry currentSection={currentSection} />

      <Suspense fallback={null}>
        <ParameterPanel />
      </Suspense>
    </div>
  );
}
