import merge from 'lodash.merge';
import type { PartialDeep } from 'type-fest';
import { create, type StateCreator } from 'zustand';

import type { AppState } from '../../universal/types/App.types.ts';
import { PRISTINE_APPSTATE } from '../AppState.ts';

export type AppStateStore = AppState & {
  setAppState: (appState: Partial<AppState>, isReady?: boolean) => void;
  mergeAppState: <K extends keyof AppState>(
    appStateKey: K,
    appStatePartial: PartialDeep<AppState[K]>
  ) => void;
  isReady: boolean;
  setIsAppStateReady: (isReady: boolean) => void;
};

export const INITIAL_APPSTATE = Object.seal(PRISTINE_APPSTATE);

export const appStateStoreCreator: StateCreator<AppStateStore> = (set) => ({
  ...INITIAL_APPSTATE,
  isReady: false,
  setAppState: (appState, isReady) => {
    // Performs a partial update.
    set((state) => {
      return {
        ...appState,
        isReady: isReady ?? state.isReady,
      };
    });
  },
  setIsAppStateReady: (isReady) => set({ isReady }),
  mergeAppState: (appStateKey, appStatePartial) => {
    set((state) => ({
      ...merge(
        {},
        { [appStateKey]: state[appStateKey] },
        {
          [appStateKey]: appStatePartial,
        }
      ),
    }));
  },
});

export const STATE_STORE_UTILITY_KEYS: string[] = [
  'setAppState',
  'mergeAppState',
  'setIsAppStateReady',
  'isReady',
] as const;

export function createAppStateStoreHook() {
  return create<AppStateStore>(appStateStoreCreator);
}

export const useAppStateStore = createAppStateStoreHook();

export function useAppStateGetter() {
  return useAppStateStore.getState();
}

export function useAppStateReady() {
  return useAppStateStore((state) => state.isReady);
}
