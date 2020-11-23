import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants';
import { Checkbox, Label, themeSpacing } from '@amsterdam/asc-ui';
import React, { useCallback, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { useDesktopScreen } from '../../hooks';
import Alert from '../Alert/Alert';
import { DatasetControlItem, TOP_LEVEL_CONTROL_ITEM } from './datasets';
import {
  filterActiveDatasets,
  useActiveDatasetIds,
  useControlItemChange,
  useFetchPanelFeature,
  useSelectedFeature,
} from './MyArea.hooks';
import MyAreaCollapsiblePanel from './MyAreaCollapsiblePanel';
import MyAreaPanelContent from './PanelContent/Generic';

const MapPanelContentDetail = styled(MapPanelContent)``;

const DatasetControlList = styled.ol`
  margin: 0;
  /* padding: 0 0 0 ${themeSpacing(1)}; */
  padding: 0;
  list-style-type: none;
  ol {
    padding-left: 2rem;
  }
`;

const DatasetControlListItem = styled.li`
  position: relative;
`;

const StyledCheckbox = styled(Checkbox)`
  padding-left: 0;
  > input {
    left: 0;
  }
`;

const StyledLabel = styled(Label)`
  display: flex;
  align-items: center;
  &:hover + button {
    visibility: visible;
  }
`;

function checkboxState(
  controlItem: DatasetControlItem,
  activeDatasetIds: string[]
) {
  if (controlItem.type === 'category') {
    const activeControlIds = filterActiveDatasets(
      controlItem,
      activeDatasetIds
    );
    const activeLength = activeControlIds.length;
    const isChecked =
      !!activeLength && activeLength === controlItem.collection.length;
    const isIndeterminate =
      !!activeLength && activeLength !== controlItem.collection.length;

    return {
      isChecked,
      isIndeterminate,
    };
  }
  return {
    isChecked: activeDatasetIds.includes(controlItem.id),
    isIndeterminate: false, // TODO: Fix for child filters
  };
}

interface DatasetControlCheckboxProps {
  controlItem: DatasetControlItem;
  onChange: (datasetControlItem: DatasetControlItem) => void;
  isChecked: boolean;
  isIndeterminate: boolean;
}

export function DatasetControlCheckbox({
  controlItem,
  isChecked,
  isIndeterminate,
  onChange,
}: DatasetControlCheckboxProps) {
  return (
    <StyledLabel htmlFor={controlItem.id} label={controlItem.title}>
      <StyledCheckbox
        id={controlItem.id}
        checked={isChecked}
        indeterminate={isIndeterminate}
        onChange={() => onChange(controlItem)}
      />
    </StyledLabel>
  );
}

interface DatasetControlPanelProps {
  onChange: (datasetControlItem: DatasetControlItem) => void;
  controlItem: DatasetControlItem;
  activeDatasetIds: string[];
}

function DatasetControlPanel({
  controlItem,
  onChange,
  activeDatasetIds,
}: DatasetControlPanelProps) {
  const isTopLevelItem = controlItem.id === TOP_LEVEL_CONTROL_ITEM.id;
  const { isChecked, isIndeterminate } = checkboxState(
    controlItem,
    activeDatasetIds
  );
  if (
    controlItem.collection.length <= 1 &&
    !controlItem.collection[0].collection.length
  ) {
    return (
      <DatasetControlCheckbox
        isChecked={isChecked}
        isIndeterminate={isIndeterminate}
        controlItem={controlItem}
        onChange={onChange}
      />
    );
  }
  return (
    <MyAreaCollapsiblePanel
      isTopLevelItem={isTopLevelItem}
      title={
        (!isTopLevelItem && controlItem.type === 'category') ||
        controlItem.type === 'dataset' ? (
          <DatasetControlCheckbox
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            controlItem={controlItem}
            onChange={onChange}
          />
        ) : (
          <strong>{controlItem.title}</strong>
        )
      }
    >
      <DatasetControlList>
        {controlItem.collection.map((controlItem) => {
          const { isChecked, isIndeterminate } = checkboxState(
            controlItem,
            activeDatasetIds
          );
          return (
            <DatasetControlListItem key={controlItem.id}>
              {controlItem.collection.length ? (
                <DatasetControlPanel
                  controlItem={controlItem}
                  onChange={onChange}
                  activeDatasetIds={activeDatasetIds}
                />
              ) : (
                <DatasetControlCheckbox
                  isChecked={isChecked}
                  controlItem={controlItem}
                  isIndeterminate={isIndeterminate}
                  onChange={onChange}
                />
              )}
            </DatasetControlListItem>
          );
        })}
      </DatasetControlList>
    </MyAreaCollapsiblePanel>
  );
}

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
  const [activeDatasetIds] = useActiveDatasetIds();

  useEffect(() => {
    if (selectedFeature !== null) {
      setPositionFromSnapPoint(SnapPoint.Full);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeature]);

  useEffect(() => {
    onSetDrawerPosition(drawerPosition);
  }, [drawerPosition, onSetDrawerPosition]);

  const onChange = useControlItemChange();

  const onCloseDetailPanel = useCallback(() => {
    setSelectedFeature(null);
  }, [setSelectedFeature]);

  useFetchPanelFeature();

  return (
    <PanelComponent>
      <MapPanelContent animate stackOrder={0}>
        <DatasetControlPanel
          controlItem={TOP_LEVEL_CONTROL_ITEM}
          onChange={onChange}
          activeDatasetIds={activeDatasetIds}
        />
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
