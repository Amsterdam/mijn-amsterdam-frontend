import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants';
import { Checkbox, Label } from '@amsterdam/asc-ui';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDesktopScreen } from '../../hooks';
import Alert from '../Alert/Alert';
import { DatasetControlItem, DATASET_CONTROL_ITEMS } from './datasets';
import {
  useFetchPanelFeature,
  useSelectedFeature,
  useActiveDatasetIds,
} from './MyArea.hooks';
import MyAreaCollapsiblePanel, {
  CollapsedState,
} from './MyAreaCollapsiblePanel';
import MyAreaDatasetControl from './MyAreaDatasetControl';
import MyAreaPanelContent from './PanelContent/Generic';

const MapPanelContentDetail = styled(MapPanelContent)``;
const StyledCheckbox = styled(Checkbox)`
  padding-left: 0;
  > input {
    left: 0;
  }
`;

function filterActiveDatasets(
  controlItem: DatasetControlItem,
  activeDatasetIds: string[]
) {
  return controlItem.collection.filter((dataset) =>
    activeDatasetIds.includes(dataset.id)
  );
}

function useDatasetControlActiveIds(controlItem: DatasetControlItem) {
  const [activeDatasetIds] = useActiveDatasetIds();
  return useMemo(() => {
    return filterActiveDatasets(controlItem, activeDatasetIds);
  }, [activeDatasetIds, controlItem]);
}

const ControlItemTitle = React.memo(function TitleWithCheckbox({
  controlItem,
  onChange,
}: {
  controlItem: DatasetControlItem;
  onChange: (datasetControlItem: DatasetControlItem) => void;
}) {
  const activeControlIds = useDatasetControlActiveIds(controlItem);
  const activeLength = activeControlIds.length;
  const isActive =
    !!activeLength && activeLength === controlItem.collection.length;
  const isInDeterminate =
    !!activeLength && activeLength !== controlItem.collection.length;

  return (
    <Label htmlFor={controlItem.id} label={controlItem.title}>
      <StyledCheckbox
        id={controlItem.id}
        checked={isActive}
        indeterminate={isInDeterminate}
        onChange={() => onChange(controlItem)}
      />
    </Label>
  );
});

interface MyAreaPanels {
  onSetDrawerPosition: (drawerPosition: string) => void;
}

export default function MyAreaPanels({ onSetDrawerPosition }: MyAreaPanels) {
  const isDesktop = useDesktopScreen();
  const PanelComponent = isDesktop ? MapPanel : MapPanelDrawer;
  const { setPositionFromSnapPoint, drawerPosition } = useContext(
    MapPanelContext
  );
  const [selectedFeature, setSelectedFeature] = useSelectedFeature();
  const [activeDatasetIds, setActiveDatasetIds] = useActiveDatasetIds();

  useEffect(() => {
    if (selectedFeature !== null) {
      setPositionFromSnapPoint(SnapPoint.Full);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeature]);

  useEffect(() => {
    onSetDrawerPosition(drawerPosition);
  }, [drawerPosition, onSetDrawerPosition]);

  const checkUncheckAll = useCallback(
    (controlItem: DatasetControlItem) => {
      const total = controlItem.collection.length;
      const threshold = Math.round(total / 2);
      const activeItemsTotal = filterActiveDatasets(
        controlItem,
        activeDatasetIds
      ).length;

      const isActive =
        (activeItemsTotal !== 0 &&
          activeItemsTotal !== total &&
          activeItemsTotal >= threshold) ||
        activeItemsTotal === 0;

      setActiveDatasetIds((datasetIds) => {
        if (!isActive) {
          return datasetIds.filter((id) => {
            const isDatasetIdInControlItem = controlItem.collection.some(
              (dataset) => dataset.id === id
            );
            return !isDatasetIdInControlItem;
          });
        }
        return [...datasetIds, ...controlItem.collection.map(({ id }) => id)];
      });
    },
    [activeDatasetIds, setActiveDatasetIds]
  );

  const onChange = useCallback(
    (controlItem: DatasetControlItem) => checkUncheckAll(controlItem),
    [checkUncheckAll]
  );

  const onCloseDetailPanel = useCallback(() => {
    setSelectedFeature(null);
  }, [setSelectedFeature]);

  useFetchPanelFeature();

  return (
    <PanelComponent>
      <MapPanelContent animate stackOrder={0}>
        {DATASET_CONTROL_ITEMS.map((controlItem) => (
          <MyAreaCollapsiblePanel
            key={controlItem.id}
            initalState={CollapsedState.Collapsed}
            title={
              <ControlItemTitle controlItem={controlItem} onChange={onChange} />
            }
          >
            {controlItem.collection.length > 1 ? (
              <MyAreaDatasetControl collection={controlItem.collection} />
            ) : null}
          </MyAreaCollapsiblePanel>
        ))}
        {selectedFeature?.id && selectedFeature?.datasetId && (
          <MapPanelContentDetail
            stackOrder={3}
            animate
            onClose={onCloseDetailPanel}
          >
            {selectedFeature.markerData !== 'error' ? (
              <MyAreaPanelContent
                datasetId={selectedFeature.datasetId}
                panelItem={selectedFeature.markerData}
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
