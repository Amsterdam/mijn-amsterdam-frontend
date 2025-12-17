import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router';

import { useLandScape, useWidescreen } from '../../../hooks/media.hook';
import { useFetchPanelFeature, useLoadingFeature } from '../MyArea.hooks';
import { DatasetCategoryPanel } from './DatasetCategoryPanel';
import { PanelComponent } from './PanelComponent';
import MyAreaDetailPanel from './PanelContent/MyAreaDetailPanel';
import { PanelState, useLegendPanelCycle } from './panelCycle';

interface LegendPanelProps {
  availableHeight: number;
}

export function LegendPanel({ availableHeight }: LegendPanelProps) {
  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
  const isLandscape = useLandScape();
  const { loadingFeature, setLoadingFeature } = useLoadingFeature();
  const prevFilterPanelState = useRef<PanelState | null>(null);
  const location = useLocation();

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
    };
  }, []);

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

  // If Detail panel is opened, set FiltersPanel to a TIP state and store the State it's in.
  // If Detail panel is closed, restore the Filters panel state to the state it was in.
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

  // If detailpanel is open and a search result is clicked, the detail panel should close.
  useEffect(() => {
    if (
      (detailState === PanelState.Open || detailState === PanelState.Preview) &&
      loadingFeature === null
    ) {
      setDetailPanelState(isNarrowScreen ? PanelState.Tip : PanelState.Closed);
    }
  }, [
    detailState,
    location.pathname,
    loadingFeature,
    setDetailPanelState,
    isNarrowScreen,
  ]);

  return (
    <div id="skip-to-id-LegendPanel">
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
    </div>
  );
}
