import type { VIB34DSystem, VIB34DState } from '../core/visualizer-engine';

export interface CustomAdapterConfig<T> {
  compute: (state: VIB34DState) => T;
  onUpdate?: (payload: T, state: VIB34DState) => void;
}

export interface CustomAdapter<T> {
  dispose(): void;
  getCurrent(): T;
  updateCompute(fn: (state: VIB34DState) => T): void;
}

export function createCustomAdapter<T>(system: VIB34DSystem, config: CustomAdapterConfig<T>): CustomAdapter<T> {
  let compute = config.compute;
  let currentState = system.getState();
  let payload = compute(currentState);

  const unsubscribe = system.subscribe((state) => {
    currentState = state;
    payload = compute(state);
    config.onUpdate?.(payload, state);
  });

  return {
    dispose() {
      unsubscribe();
    },
    getCurrent() {
      return payload;
    },
    updateCompute(fn: (state: VIB34DState) => T) {
      compute = fn;
      payload = compute(currentState);
      config.onUpdate?.(payload, currentState);
    }
  };
}

export default createCustomAdapter;
