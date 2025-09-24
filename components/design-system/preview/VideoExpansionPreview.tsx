'use client';

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useDesignSystem } from '@/lib/design-system/context';

const stateLabels: Record<'thumbnail' | 'playing' | 'fullscreen', string> = {
  thumbnail: 'Thumbnail',
  playing: 'Playing',
  fullscreen: 'Fullscreen',
};

const mapSizeToStyle = (mode: 'thumbnail' | 'playing' | 'fullscreen', size: string): CSSProperties => {
  switch (size) {
    case '100%_of_card':
      return { width: '100%', height: '220px' };
    case '150%_of_original':
      return { width: '100%', height: '260px', transform: 'scale(1.05)' };
    case '100vw_100vh':
      return { width: '100%', height: '320px', transform: 'scale(1.1)' };
    default:
      if (size.includes('x')) {
        const match = size.match(/([0-9.]+)x/);
        if (match) {
          const factor = parseFloat(match[1]);
          if (!Number.isNaN(factor)) {
            return { width: '100%', height: `${200 * factor}px` };
          }
        }
      }
      return { width: '100%', height: '240px' };
  }
};

const mapBackgroundBlur = (value?: string): CSSProperties => {
  if (!value) {
    return {};
  }
  if (value === 'other_elements') {
    return { backdropFilter: 'blur(6px)' };
  }
  return {};
};

export function VideoExpansionPreview() {
  const { videoState, setVideoMode, presetManager } = useDesignSystem();

  const config = presetManager.videoExpansion;
  const stateConfig = config.expansion_states[videoState.mode];

  const containerStyle = useMemo(() => {
    const baseStyle: CSSProperties = {
      borderRadius: '1.5rem',
      border: '1px solid rgba(94, 234, 212, 0.2)',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(59, 130, 246, 0.2))',
      overflow: 'hidden',
      position: 'relative',
      transition: 'transform 300ms ease, box-shadow 300ms ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    };

    return {
      ...baseStyle,
      ...mapSizeToStyle(videoState.mode, stateConfig.size),
      ...mapBackgroundBlur(stateConfig.background_blur),
      boxShadow: videoState.mode === 'fullscreen'
        ? '0 0 50px rgba(59, 130, 246, 0.45)'
        : '0 0 30px rgba(59, 130, 246, 0.25)',
    };
  }, [stateConfig.size, stateConfig.background_blur, videoState.mode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-cyan-300">Video Expansion System</h3>
          <p className="text-xs text-cyan-200/70">Visualizer role: {stateConfig.visualizer_role.replace(/_/g, ' ')}</p>
        </div>
        <div className="flex gap-2">
          {Object.keys(stateLabels).map((key) => (
            <button
              key={key}
              onClick={() => setVideoMode(key as keyof typeof stateLabels)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                videoState.mode === key ? 'bg-cyan-500/30 text-white border border-cyan-400/40' : 'bg-white/5 text-cyan-200 hover:bg-white/10'
              }`}
            >
              {stateLabels[key as keyof typeof stateLabels]}
            </button>
          ))}
        </div>
      </div>

      <div style={containerStyle}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.3),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.2),transparent)]" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
          <div className="text-sm uppercase tracking-wider text-cyan-100/80">{stateLabels[videoState.mode]}</div>
          <div className="text-2xl font-semibold text-white">Immersive Demo Clip</div>
          <p className="text-sm text-cyan-100/70 max-w-md">
            Transitions:
            {videoState.mode === 'thumbnail' && ' ready to expand via ambient → reactive morph.'}
            {videoState.mode === 'playing' && ` morphing to immersive in ${config.transitions.playing_to_fullscreen.duration}.`}
            {videoState.mode === 'fullscreen' && ' stabilized in immersive visualizer space.'}
          </p>
          <div className="flex gap-3">
            <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-cyan-200/80">Controls: {stateConfig.controls ?? 'card actions'}</div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-cyan-200/80">Role: {stateConfig.visualizer_role}</div>
          </div>
          {stateConfig.play_button_overlay && (
            <div className="mt-4 flex items-center gap-2 text-xs text-cyan-100/80">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/40 text-white">
                ▶
              </span>
              <span>Play overlay: {stateConfig.play_button_overlay}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
