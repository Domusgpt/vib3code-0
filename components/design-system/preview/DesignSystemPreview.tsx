'use client';

import { useMemo } from 'react';
import { useDesignSystem } from '@/lib/design-system/context';
import { InteractiveCardGrid } from './InteractiveCardGrid';
import { VideoExpansionPreview } from './VideoExpansionPreview';

export function DesignSystemPreview() {
  const { transitionCoordinator, settings } = useDesignSystem();

  const outgoing = useMemo(
    () => transitionCoordinator.getOutgoingPhases(settings.advanced.transition_duration_multiplier),
    [transitionCoordinator, settings.advanced.transition_duration_multiplier],
  );
  const incoming = useMemo(
    () => transitionCoordinator.getIncomingPhases(settings.advanced.transition_duration_multiplier),
    [transitionCoordinator, settings.advanced.transition_duration_multiplier],
  );
  const relationships = transitionCoordinator.getMathematicalRelationships();

  return (
    <div className="space-y-10">
      <InteractiveCardGrid />
      <VideoExpansionPreview />
      <div className="grid gap-6 md:grid-cols-2">
        <TransitionPhaseTable title="Outgoing Sequence" phases={outgoing} accent="from-cyan-500/30" />
        <TransitionPhaseTable title="Incoming Sequence" phases={incoming} accent="from-purple-500/30" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-cyan-100/80 backdrop-blur-md">
        <div className="mb-2 text-xs uppercase tracking-widest text-cyan-200/70">Mathematical Relationships</div>
        <ul className="space-y-2">
          <li>Density Conservation: {relationships.density_conservation}</li>
          <li>Color Harmonics: {relationships.color_harmonic}</li>
          <li>Geometric Morphing: {relationships.geometric_morphing}</li>
        </ul>
      </div>
    </div>
  );
}

function TransitionPhaseTable({
  title,
  phases,
  accent,
}: {
  title: string;
  phases: { phase: string; start: number; end: number }[];
  accent: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accent} to-transparent p-6 backdrop-blur`}
      style={{ minHeight: '220px' }}
    >
      <div className="mb-4 text-sm font-semibold text-white/80">{title}</div>
      <div className="space-y-3 text-xs text-cyan-100/80">
        {phases.map((phase) => (
          <div key={phase.phase} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="font-semibold text-white/90">{phase.phase.replace(/_/g, ' ')}</div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300">
              {Math.round(phase.start)}ms → {Math.round(phase.end)}ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
