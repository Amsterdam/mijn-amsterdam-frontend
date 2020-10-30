import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants';
import { Checkbox, Label } from '@amsterdam/asc-ui';
import React, { useCallback, useContext, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useDesktopScreen } from '../../hooks';
import Alert from '../Alert/Alert';
import { DatasetControlItem } from './datasets';
import { useSelectedMarkerDataValue } from './MyArea.hooks';
import MyAreaCollapsiblePanel, {
  CollapsedState,
} from './MyAreaCollapsiblePanel';
import MyAreaDatasetControl, {
  datasetControlItemsAtom,
  useUpdateDatasetControlItems,
} from './MyAreaDatasetControl';
import MyAreaPanelContent from './PanelContent/Generic';

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
const StyledCheckbox = styled(Checkbox)`
  padding-left: 0;
  > input {
    left: 0;
  }
`;

const TitleWithCheckbox = React.memo(
  ({
    controlItem,
    onChange,
  }: {
    controlItem: DatasetControlItem;
    onChange: (datasetControlItem: DatasetControlItem) => void;
  }) => (
    <Label htmlFor={controlItem.id} label={controlItem.title}>
      <StyledCheckbox
        id={controlItem.id}
        checked={isCheckedControl(controlItem.collection)}
        indeterminate={isIndeterminateControl(controlItem.collection)}
        onChange={() => onChange(controlItem)}
      />
    </Label>
  )
);

interface MyAreaPanelsProps {
  onCloseDetailPanel: () => void;
}

export default function MyAreaPanels({
  onCloseDetailPanel,
}: MyAreaPanelsProps) {
  const isDesktop = useDesktopScreen();
  const PanelComponent = isDesktop ? MapPanel : MapPanelDrawer;
  const { setPositionFromSnapPoint } = useContext(MapPanelContext);
  // const openPanels = useRecoilValue(openPanelsSelector);
  const datasetControlItems = useRecoilValue(datasetControlItemsAtom);
  const selectedMarkerData = useSelectedMarkerDataValue();

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
          <MyAreaCollapsiblePanel
            key={controlItem.id}
            initalState={CollapsedState.Collapsed}
            title={
              <TitleWithCheckbox
                controlItem={controlItem}
                onChange={onChange}
              />
            }
          >
            {controlItem.collection.length > 1 ? (
              <MyAreaDatasetControl collection={controlItem.collection} />
            ) : null}
          </MyAreaCollapsiblePanel>
        ))}
        {selectedMarkerData?.id && selectedMarkerData?.datasetId && (
          <MapPanelContentDetail
            stackOrder={3}
            animate
            onClose={onCloseDetailPanel}
          >
            {selectedMarkerData.markerData !== 'error' ? (
              <MyAreaPanelContent
                datasetId={selectedMarkerData.datasetId}
                panelItem={selectedMarkerData.markerData}
              />
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
