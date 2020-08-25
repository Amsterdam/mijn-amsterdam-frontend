import { MapPanel, MapPanelContent, MapPanelDrawer } from '@datapunt/arm-core';
import React from 'react';
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil';
import { useDesktopScreen } from '../../hooks';
import MyAreaCollapisblePanel, {
  CollapsedState,
} from './MyAreaCollapsiblePanel';
import MyAreaDatasetControl, {
  datasetControlItemsAtom,
} from './MyAreaDatasetControl';
import styled from 'styled-components';
import { selectedMarkerDataAtom } from './MyAreaDatasets';
import { getIcon } from './datasets';

interface MyAreaPanel {
  title: string;
  id: string;
  open: boolean;
  active: boolean;
}

const panelConfig: Record<string, MyAreaPanel> = {
  datasets: {
    title: 'Kaartlagen',
    id: 'kaartlagen',
    open: true,
    active: true,
  },
};

const panelStateAtom = atom({
  key: 'MyAreaPanelState',
  default: panelConfig,
});

export const openPanelsSelector = selector({
  key: 'openPanels',
  get: ({ get }) => {
    const appState = get(panelStateAtom);
    return Object.values(appState)
      .filter((state) => state.open === true)
      .map((state) => state.id);
  },
});

function isOpen(panel: MyAreaPanel) {
  return panel.active && panel.open;
}

function collapsedState(datasets: Array<{ isActive: boolean }>) {
  return datasets.some((dataset) => dataset.isActive)
    ? CollapsedState.Expanded
    : CollapsedState.Collapsed;
}

const MapPanelContentDetail = styled(MapPanelContent)``;

interface PanelSubTitleProps {
  datasetId: string;
  datasetGroupId: string;
}

function PanelSubTitle({ datasetId, datasetGroupId }: PanelSubTitleProps) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {getIcon(datasetId)}
      {datasetGroupId}
    </span>
  );
}

export default function MyAreaPanels() {
  const isDesktop = useDesktopScreen();
  const PanelComponent = isDesktop ? MapPanel : MapPanelDrawer;
  // const mapPanel = useContext(MapPanelContext);
  // const openPanels = useRecoilValue(openPanelsSelector);
  const [panelState /*setPanelState*/] = useRecoilState(panelStateAtom);
  const datasetControlItems = useRecoilValue(datasetControlItemsAtom);
  const [selectedMarkerData, setSelectedMarkerData] = useRecoilState(
    selectedMarkerDataAtom
  );
  // useEffect(() => {
  //   if (
  //     openPanels.length &&
  //     !mapPanel.matchPositionWithSnapPoint(SnapPoint.Halfway)
  //   ) {
  //     mapPanel.setPositionFromSnapPoint(SnapPoint.Full);
  //   }
  // }, [openPanels, mapPanel]);

  // const closePanelContent = useCallback(
  //   (panelId: string) => {
  //     const updatedPanels = openPanels.filter(id => id !== panelId);

  //     if (!updatedPanels.length) {
  //       mapPanel.setPositionFromSnapPoint(SnapPoint.Closed);
  //     }

  //     setPanelState(panelState => {
  //       return { ...panelState, x: { ...panelState.x, open: false } };
  //     });
  //   },
  //   [openPanels, mapPanel, setPanelState]
  // );

  return (
    <PanelComponent>
      {isOpen(panelState.datasets) && (
        <MapPanelContent animate stackOrder={0}>
          {datasetControlItems.map((controlItem) => (
            <MyAreaCollapisblePanel
              key={controlItem.id}
              state={collapsedState(controlItem.collection)}
              title={`${controlItem.title}`}
            >
              <MyAreaDatasetControl collection={controlItem.collection} />
            </MyAreaCollapisblePanel>
          ))}
          {selectedMarkerData && (
            <MapPanelContentDetail
              title={selectedMarkerData.markerData.title}
              subTitle={
                <PanelSubTitle
                  datasetId={selectedMarkerData.datasetId}
                  datasetGroupId={selectedMarkerData.datasetGroupId}
                />
              }
              stackOrder={3}
              animate
              onClose={() => setSelectedMarkerData(null)}
            >
              {!!selectedMarkerData.markerData.description && (
                <p>{selectedMarkerData.markerData.description}</p>
              )}
            </MapPanelContentDetail>
          )}
        </MapPanelContent>
      )}
    </PanelComponent>
  );
}
