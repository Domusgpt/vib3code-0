import type {
  ClickResponseConfig,
  HoverResponseConfig,
  InteractionProfile,
  ReactivityPreset,
  ScrollableCardConfig,
  VideoExpansionConfig
} from './preset-manager';

export interface InteractionCoordinatorOptions {
  profileName: string;
  profile: InteractionProfile;
  reactivity: ReactivityPreset;
  hoverResponse: HoverResponseConfig;
  clickResponse: ClickResponseConfig;
  scrollableCards: ScrollableCardConfig;
  videoExpansion: VideoExpansionConfig;
}

export interface InteractionState {
  activeProfile: string;
  hoverTarget?: string;
  lastClick?: { target: string; timestamp: number };
  hoverModifiers: {
    target: Record<string, string>;
    others: Record<string, string>;
  };
  clickResponse: ClickResponseConfig;
  scrollableCards: ScrollableCardConfig;
  videoExpansion: VideoExpansionConfig;
  multipliers: {
    hover: number;
    click: number;
    scroll: number;
  };
  reactivity: ReactivityPreset;
}

type Listener = (state: InteractionState) => void;

interface RegisteredElement {
  id: string;
  element: HTMLElement;
  group?: string;
  dispose: () => void;
}

function multiplyDescriptor(value: string, multiplier: number): string {
  const match = value.match(/(-?\d+(?:\.\d+)?)(px|x)?$/);
  if (!match) {
    return `${value} (x${multiplier.toFixed(2)})`;
  }

  const numeric = parseFloat(match[1]);
  if (!Number.isFinite(numeric)) {
    return `${value} (x${multiplier.toFixed(2)})`;
  }

  const scaled = (numeric * multiplier).toFixed(2).replace(/\.00$/, '');
  const suffix = match[2] ?? '';
  return value.replace(match[1] + suffix, `${scaled}${suffix}`);
}

function scaleResponseMap(map: Record<string, string>, multiplier: number): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, multiplyDescriptor(value, multiplier)])
  );
}

export class InteractionCoordinator {
  private state: InteractionState;
  private listeners: Set<Listener> = new Set();
  private elements: Map<string, RegisteredElement> = new Map();
  private hoverBase: HoverResponseConfig;
  private clickBase: ClickResponseConfig;

  constructor(options: InteractionCoordinatorOptions) {
    this.hoverBase = options.hoverResponse;
    this.clickBase = options.clickResponse;

    this.state = {
      activeProfile: options.profileName,
      hoverModifiers: {
        target: scaleResponseMap(options.hoverResponse.target, options.profile.hoverMultiplier),
        others: scaleResponseMap(options.hoverResponse.others, options.profile.hoverMultiplier)
      },
      clickResponse: this.scaleClickResponse(options.clickResponse, options.profile.clickMultiplier),
      scrollableCards: options.scrollableCards,
      videoExpansion: options.videoExpansion,
      multipliers: {
        hover: options.profile.hoverMultiplier,
        click: options.profile.clickMultiplier,
        scroll: options.profile.scrollMultiplier
      },
      reactivity: options.reactivity
    };
  }

  private scaleClickResponse(config: ClickResponseConfig, multiplier: number): ClickResponseConfig {
    return {
      immediate: {
        colorInversion: multiplyDescriptor(config.immediate.colorInversion, multiplier),
        variableInversion: Object.fromEntries(
          Object.entries(config.immediate.variableInversion).map(([key, value]) => [
            key,
            multiplyDescriptor(value, multiplier)
          ])
        ),
        rippleEffect: multiplyDescriptor(config.immediate.rippleEffect, multiplier),
        sparkleGeneration: multiplyDescriptor(config.immediate.sparkleGeneration, multiplier)
      },
      duration: Object.fromEntries(
        Object.entries(config.duration).map(([key, value]) => [
          key,
          multiplyDescriptor(value, multiplier)
        ])
      )
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): InteractionState {
    return this.state;
  }

  setProfile(profileName: string, profile: InteractionProfile, reactivity: ReactivityPreset) {
    this.state = {
      ...this.state,
      activeProfile: profileName,
      hoverModifiers: {
        target: scaleResponseMap(this.hoverBase.target, profile.hoverMultiplier),
        others: scaleResponseMap(this.hoverBase.others, profile.hoverMultiplier)
      },
      clickResponse: this.scaleClickResponse(this.clickBase, profile.clickMultiplier),
      multipliers: {
        hover: profile.hoverMultiplier,
        click: profile.clickMultiplier,
        scroll: profile.scrollMultiplier
      },
      reactivity
    };
    this.notify();
  }

  registerElement(id: string, element: HTMLElement, group?: string) {
    const handleMouseEnter = () => this.handleHover(id);
    const handleMouseLeave = () => this.clearHover(id);
    const handleClick = () => this.handleClick(id);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('click', handleClick);

    const dispose = () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('click', handleClick);
    };

    this.elements.set(id, { id, element, group, dispose });
  }

  unregisterElement(id: string) {
    const registered = this.elements.get(id);
    if (!registered) return;
    registered.dispose();
    this.elements.delete(id);
  }

  private handleHover(id: string) {
    this.state = {
      ...this.state,
      hoverTarget: id
    };
    this.notify();
  }

  private clearHover(id: string) {
    if (this.state.hoverTarget !== id) return;
    this.state = {
      ...this.state,
      hoverTarget: undefined
    };
    this.notify();
  }

  private handleClick(id: string) {
    this.state = {
      ...this.state,
      lastClick: { target: id, timestamp: Date.now() }
    };
    this.notify();
  }

  applyScrollIntensity(velocity: number) {
    const multiplier = this.state.multipliers.scroll;
    const descriptor = multiplyDescriptor('velocity', Math.abs(velocity) * multiplier);
    this.state = {
      ...this.state,
      scrollableCards: {
        ...this.state.scrollableCards,
        scroll_interactions: {
          ...this.state.scrollableCards.scroll_interactions,
          visualizer_response: {
            ...this.state.scrollableCards.scroll_interactions.visualizer_response,
            scroll_velocity: descriptor
          }
        }
      }
    };
    this.notify();
  }

  destroy() {
    for (const registered of this.elements.values()) {
      registered.dispose();
    }
    this.elements.clear();
    this.listeners.clear();
  }
}
