import { useMemo } from 'react';
import useMedia from 'use-media';
import { useWidescreen } from '../../../hooks';
import { PanelState, usePanelStateCycle } from './PanelComponent';

export function useLegendPanelCycle() {
  const isWideScreen = useWidescreen();
  const isLandscape = useMedia('(orientation: landscape)');

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
    PanelState.Preview
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
