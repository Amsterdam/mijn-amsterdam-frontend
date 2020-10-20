import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants';
import { Checkbox, Label } from '@amsterdam/asc-ui';
import React, { useCallback, useContext, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useDesktopScreen } from '../../hooks';
import LoadingContent from '../LoadingContent/LoadingContent';
import { DatasetControlItem, getIcon } from './datasets';
import MyAreaCollapisblePanel, {
  CollapsedState,
} from './MyAreaCollapsiblePanel';
import MyAreaDatasetControl, {
  datasetControlItemsAtom,
  useUpdateDatasetControlItems,
} from './MyAreaDatasetControl';
import { selectedMarkerDataAtom } from './MyAreaDatasets';
import MyAreaPanelContent from './MyAreaPanelContent';
import Alert from '../Alert/Alert';

function initialCollapsedState(datasets: Array<{ isActive: boolean }>) {
  return datasets.some((dataset) => dataset.isActive)
    ? CollapsedState.Expanded
    : CollapsedState.Collapsed;
}

function isIndeterminateControl(datasets: Array<{ isActive: boolean }>) {
  return (
    !datasets.every((dataset) => dataset.isActive) &&
    datasets.some((dataset) => dataset.isActive)
  );
}

function isCheckedControl(datasets: Array<{ isActive: boolean }>) {
  return datasets.every((dataset) => dataset.isActive);
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
      {datasetGroupId || datasetId}
    </span>
  );
}

const TitleWithCheckbox = React.memo(
  ({
    controlItem,
    onChange,
  }: {
    controlItem: DatasetControlItem;
    onChange: (datasetControlItem: DatasetControlItem) => void;
  }) => (
    <Label htmlFor={controlItem.id} label={controlItem.title}>
      <Checkbox
        id={controlItem.id}
        checked={isCheckedControl(controlItem.collection)}
        indeterminate={isIndeterminateControl(controlItem.collection)}
        onChange={() => onChange(controlItem)}
      />
    </Label>
  )
);

export default function MyAreaPanels() {
  const isDesktop = useDesktopScreen();
  const PanelComponent = isDesktop ? MapPanel : MapPanelDrawer;
  const { setPositionFromSnapPoint } = useContext(MapPanelContext);
  // const openPanels = useRecoilValue(openPanelsSelector);
  const datasetControlItems = useRecoilValue(datasetControlItemsAtom);
  const [selectedMarkerData, setSelectedMarkerData] = useRecoilState(
    selectedMarkerDataAtom
  );

  const updateDatasetControlItems = useUpdateDatasetControlItems();

  useEffect(() => {
    if (selectedMarkerData !== null) {
      setPositionFromSnapPoint(SnapPoint.Full);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarkerData]);

  const checkUncheckAll = useCallback(
    (controlItem: DatasetControlItem) => {
      const total = controlItem.collection.length;
      const threshold = Math.round(total / 2);
      const activeItemsTotal = controlItem.collection.filter(
        (item) => item.isActive
      ).length;

      const isActive =
        (activeItemsTotal !== 0 &&
          activeItemsTotal !== total &&
          activeItemsTotal >= threshold) ||
        activeItemsTotal === 0;

      updateDatasetControlItems(
        controlItem.collection.map((item) => item.id),
        isActive
      );
    },
    [updateDatasetControlItems]
  );

  const onChange = useCallback(
    (controlItem: DatasetControlItem) => checkUncheckAll(controlItem),
    [checkUncheckAll]
  );

  return (
    <PanelComponent>
      <MapPanelContent animate stackOrder={0}>
        {datasetControlItems.map((controlItem) => (
          <MyAreaCollapisblePanel
            key={controlItem.id}
            initalState={initialCollapsedState(controlItem.collection)}
            title={
              <TitleWithCheckbox
                controlItem={controlItem}
                onChange={onChange}
              />
            }
          >
            <MyAreaDatasetControl collection={controlItem.collection} />
          </MyAreaCollapisblePanel>
        ))}
        {selectedMarkerData && (
          <MapPanelContentDetail
            title={selectedMarkerData.markerData?.title}
            subTitle={
              <PanelSubTitle
                datasetId={selectedMarkerData?.datasetId}
                datasetGroupId={selectedMarkerData?.datasetGroupId}
              />
            }
            stackOrder={3}
            animate
            onClose={() => setSelectedMarkerData(null)}
          >
            {selectedMarkerData.markerData !== 'error' ? (
              <MyAreaPanelContent panelItem={selectedMarkerData.markerData} />
            ) : (
              <Alert type="warning">
                <p>
                  Er kan op dit moment niet meer informatie getoond worden over
                  dit item.
                </p>
              </Alert>
            )}
          </MapPanelContentDetail>
        )}
      </MapPanelContent>
    </PanelComponent>
  );
}
