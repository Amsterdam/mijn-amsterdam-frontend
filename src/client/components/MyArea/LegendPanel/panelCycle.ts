import { useCallback, useMemo } from 'react';

import { create } from 'zustand/react';

import { useLandScape, useWidescreen } from '../../../hooks/media.hook';

function px(size: number) {
  return size + 'px';
}

const UNIT_SIZE = 4;
const TIP_WIDTH = 0;
const PREVIEW_WIDTH = 60;
const FULL_WIDTH = 160;
const NARROW_TIP_HEIGHT = 15;

export const WIDE_PANEL_TIP_WIDTH = px(TIP_WIDTH * UNIT_SIZE);
export const WIDE_PANEL_PREVIEW_WIDTH = px(PREVIEW_WIDTH * UNIT_SIZE);
export const WIDE_PANEL_WIDTH = px(FULL_WIDTH * UNIT_SIZE);
export const NARROW_PANEL_PREVIEW_HEIGHT = px(60 * UNIT_SIZE);
export const NARROW_PANEL_TIP_HEIGHT = px(NARROW_TIP_HEIGHT * UNIT_SIZE);

export function useLegendPanelCycle() {
  const isWideScreen = useWidescreen();
  const isLandscape = useLandScape();
  const panelCycle = useMemo(() => {
    if (isWideScreen) {
      return {
        filters: [PanelState.Open, PanelState.Tip],
        detail: [PanelState.Closed, PanelState.Open],
      };
    }
    if (isLandscape) {
      return {
        filters: [PanelState.Tip, PanelState.Open],
        detail: [PanelState.Closed, PanelState.Open],
      };
    }
    return {
      filters: [PanelState.Tip, PanelState.Preview, PanelState.Open],
      detail: [PanelState.Closed, PanelState.Preview, PanelState.Open],
    };
  }, [isWideScreen, isLandscape]);

  const filterPanelCycle = usePanelStateCycle(
    'filters',
    panelCycle.filters,
    PanelState.Tip
  );
  const detailPanelCycle = usePanelStateCycle('detail', panelCycle.detail);

  const { state: filterState, set: setFilterPanelState } = filterPanelCycle;
  const { state: detailState, set: setDetailPanelState } = detailPanelCycle;

  return {
    filterPanelCycle,
    detailPanelCycle,
    filterState,
    detailState,
    setFilterPanelState,
    setDetailPanelState,
  };
}

export enum PanelState {
  Closed = 'CLOSED', // Panel is invisible
  Tip = 'TIP', // Only panel toggle button visible on screen
  Preview = 'PREVIEW', // Part of the panel is available
  Open = 'OPEN', // Panel is fully open at $availableHeight
}

// A large height for a narrow screen device so we'l have enough max height
const PHONE_FIXED_AVAILABLE_HEIGHT = 1000;

type PanelStateStore = {
  stateStore: Record<string, PanelState>;
  setStateStore: (store: Record<string, PanelState>) => void;
};

const usePanelStateStore = create<PanelStateStore>((set) => ({
  stateStore: {},
  setStateStore: (store) =>
    set((state) => ({ stateStore: { ...state.stateStore, ...store } })),
}));

export function usePanelStateCycle(
  id: string,
  states: PanelState[],
  initialPanelState?: PanelState
) {
  const { stateStore, setStateStore } = usePanelStateStore();
  const initialState = initialPanelState || states[0];
  const state = stateStore[id] || initialState;

  const setState = useCallback(
    (state: PanelState) => {
      setStateStore({ [id]: state });
    },
    [setStateStore, id]
  );

  const nextPanelState = useCallback(
    (currentState: PanelState): PanelState => {
      const currentStateIndex = states.indexOf(currentState);
      const nextState =
        states.length - 1 === currentStateIndex
          ? states[0]
          : states[currentStateIndex + 1];
      return nextState;
    },
    [states]
  );

  const nextState = useCallback(() => {
    if (state !== states[states.length - 1]) {
      const nextState = nextPanelState(state);
      setState(nextState);
    }
  }, [states, state, setState, nextPanelState]);

  const prevState = useCallback(() => {
    const index = states.indexOf(state);
    if (index !== 0) {
      setState(states[index - 1]);
    }
  }, [states, state, setState]);

  const cycleNext = useCallback(() => {
    const nextState = nextPanelState(state);
    setState(nextState);
  }, [state, setState, nextPanelState]);

  const setInitialState = useCallback(() => {
    return setState(initialState);
  }, [initialState, setState]);

  return useMemo(
    () => ({
      states,
      next: nextState,
      prev: prevState,
      cycle: cycleNext,
      set: setState,
      initial: setInitialState,
      initialState,
      state,
      reset: () => setState(initialState),
    }),
    [
      states,
      nextState,
      prevState,
      cycleNext,
      setState,
      setInitialState,
      state,
      initialState,
    ]
  );
}

export function getPanelSize(
  state: PanelState,
  isNarrowScreen: boolean,
  availableHeight?: number
) {
  let size = '0px';
  let narrowPanelPreviewHeight = NARROW_PANEL_PREVIEW_HEIGHT;

  if (
    availableHeight &&
    availableHeight < parseInt(NARROW_PANEL_PREVIEW_HEIGHT, 10)
  ) {
    narrowPanelPreviewHeight = px(availableHeight);
  }
  switch (state) {
    case PanelState.Tip:
      size = isNarrowScreen ? NARROW_PANEL_TIP_HEIGHT : WIDE_PANEL_TIP_WIDTH;
      break;
    case PanelState.Preview:
      size = isNarrowScreen
        ? narrowPanelPreviewHeight
        : WIDE_PANEL_PREVIEW_WIDTH;
      break;
    case PanelState.Open:
      size = isNarrowScreen
        ? px(availableHeight || PHONE_FIXED_AVAILABLE_HEIGHT)
        : WIDE_PANEL_WIDTH;
      break;
    case PanelState.Closed:
      size = '0px';
      break;
  }
  return size;
}
