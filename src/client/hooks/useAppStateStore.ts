import { create, type StateCreator } from 'zustand';

import type { AppState } from '../../universal/types/App.types';
import { PRISTINE_APPSTATE } from '../AppState';

type AppStateStore = AppState & {
  setAppState: (appState: Partial<AppState>, isReady?: boolean) => void;
  isReady: boolean;
  setIsAppStateReady: (isReady: boolean) => void;
};

export const INITIAL_APPSTATE = Object.seal(PRISTINE_APPSTATE);

export const appStateStoreCreator: StateCreator<AppStateStore> = (set) => ({
  ...INITIAL_APPSTATE,
  isReady: false,
  setAppState: (appState, isReady) => {
    set((state) => {
      return {
        ...appState,
        isReady: isReady ?? state.isReady,
      };
    });
  },
  setIsAppStateReady: (isReady) => set({ isReady }),
});

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
