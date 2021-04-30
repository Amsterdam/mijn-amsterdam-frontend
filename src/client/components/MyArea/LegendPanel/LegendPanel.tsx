import { useEffect, useRef } from 'react';
import useMedia from 'use-media';
import { useWidescreen } from '../../../hooks';
import {
  useFetchPanelFeature,
  useLoadingFeature,
  useResetMyAreaState,
  useSetLoadingFeature,
} from '../MyArea.hooks';
import { DatasetCategoryPanel } from './DatasetCategoryPanel';
import { PanelComponent, PanelState } from './PanelComponent';
import MyAreaDetailPanel from './PanelContent/MyAreaDetailPanel';
import { useLegendPanelCycle } from './panelCycle';

interface LegendPanelProps {
  availableHeight: number;
}

export function LegendPanel({ availableHeight }: LegendPanelProps) {
  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
  const isLandscape = useMedia('(orientation: landscape)');
  const [loadingFeature] = useLoadingFeature();
  const prevFilterPanelState = useRef<PanelState | null>(null);
  const resetMyAreaState = useResetMyAreaState();
  const setLoadingFeature = useSetLoadingFeature();

  useFetchPanelFeature();

  const {
    detailState,
    filterState,
    setFilterPanelState,
    setDetailPanelState,
    detailPanelCycle,
    filterPanelCycle,
  } = useLegendPanelCycle();

  useEffect(() => {
    if (isWideScreen) {
      setFilterPanelState(PanelState.Open);
    }
  }, [isWideScreen, setFilterPanelState]);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      detailPanelCycle.reset();
      filterPanelCycle.reset();
      resetMyAreaState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetMyAreaState]);

  // Set panel state without explicit panel interaction. Effect reacts to loading detailed features.
  useEffect(() => {
    if (!loadingFeature) {
      return;
    }
    if (isNarrowScreen) {
      if (isLandscape) {
        setDetailPanelState(PanelState.Open);
      } else {
        setDetailPanelState(PanelState.Preview);
      }
    } else {
      setDetailPanelState(PanelState.Open);
    }
    // Only react on loadingFeature changes. This wil result in re-render which causes the currentPanel state to be up-to-date.
  }, [loadingFeature, isNarrowScreen, setDetailPanelState, isLandscape]);

  // If Detail panel is opened set FiltersPanel to a TIP state and store the State it's in, if Detail panel is closed restore the Filters panel state to the state it was in.
  useEffect(() => {
    if (detailState !== PanelState.Closed && !prevFilterPanelState.current) {
      prevFilterPanelState.current = filterState;
      setFilterPanelState(PanelState.Tip);
    } else if (
      detailState === PanelState.Closed &&
      prevFilterPanelState.current
    ) {
      setFilterPanelState(prevFilterPanelState.current);
      prevFilterPanelState.current = null;
    }
  }, [detailState, filterState, setFilterPanelState]);

  return (
    <>
      <PanelComponent
        id="filters"
        cycle={filterPanelCycle}
        availableHeight={availableHeight}
      >
        <DatasetCategoryPanel />
      </PanelComponent>
      <PanelComponent
        id="detail"
        cycle={detailPanelCycle}
        availableHeight={availableHeight}
        onClose={() => setLoadingFeature(null)}
        showCloseButton={isWideScreen || detailState === PanelState.Open}
      >
        <MyAreaDetailPanel />
      </PanelComponent>
    </>
  );
}
