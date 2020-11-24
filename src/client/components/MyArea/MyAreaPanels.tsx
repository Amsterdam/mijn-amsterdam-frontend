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
import {
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
} from '../../../universal/config';
import { useDesktopScreen } from '../../hooks';
import Alert from '../Alert/Alert';
import {
  DatasetCategoryItem,
  DatasetControlItem,
  DATASET_CONTROL_ITEMS,
} from './datasets';
import {
  filterActiveDatasets,
  useActiveDatasetFilters,
  useActiveDatasetIds,
  useControlItemChange,
  useFetchPanelFeature,
  useFilterControlItemChange,
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

export function filterItemCheckboxState(
  activeFilters: DatasetFilterSelection,
  datasetId: DatasetId,
  propertyName: DatasetPropertyName,
  propertyValue: DatasetPropertyValue
) {
  // console.log(activeFilters[datasetId][propertyName]);
  return {
    isChecked:
      activeFilters[datasetId] &&
      activeFilters[datasetId][propertyName] &&
      activeFilters[datasetId][propertyName].includes(propertyValue),
  };
}

function controlItemCheckboxState(
  controlItem: DatasetControlItem | DatasetCategoryItem,
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
  controlItem: any;
  onChange: (controlItem: any) => void;
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
  onControlItemChange: (
    datasetControlItem: DatasetCategoryItem | DatasetControlItem
  ) => void;
  onFilterControlItemChange: (
    datasetId: DatasetId,
    propertyName: DatasetPropertyName,
    propertyValue: DatasetPropertyValue
  ) => void;
  controlItemCategory: DatasetCategoryItem;
  activeDatasetIds: string[];
  activeFilters: DatasetFilterSelection;
}

function DatasetControlPanel({
  controlItemCategory,
  onControlItemChange,
  onFilterControlItemChange,
  activeDatasetIds,
  activeFilters,
}: DatasetControlPanelProps) {
  const { isChecked, isIndeterminate } = controlItemCheckboxState(
    controlItemCategory,
    activeDatasetIds
  );

  const hasCollection = controlItemCategory.collection.length > 1;

  const categoryTitle = (
    <DatasetControlCheckbox
      isChecked={isChecked}
      isIndeterminate={isIndeterminate}
      controlItem={controlItemCategory}
      onChange={onControlItemChange}
    />
  );

  if (!hasCollection) {
    return categoryTitle;
  }

  return (
    <MyAreaCollapsiblePanel title={categoryTitle}>
      <DatasetControlList>
        {controlItemCategory.collection.map((controlItem) => {
          const { isChecked, isIndeterminate } = controlItemCheckboxState(
            controlItem,
            activeDatasetIds
          );
          const datasetControl = (
            <DatasetControlCheckbox
              isChecked={isChecked}
              controlItem={controlItem}
              isIndeterminate={isIndeterminate}
              onChange={onControlItemChange}
            />
          );
          return (
            <DatasetControlListItem key={controlItem.id}>
              {!controlItem.collection.length ? (
                datasetControl
              ) : (
                <MyAreaCollapsiblePanel title={datasetControl}>
                  <DatasetControlList>
                    {controlItem.collection.map((filterCategory) => {
                      return (
                        <DatasetControlListItem key={filterCategory.id}>
                          <MyAreaCollapsiblePanel title={filterCategory.title}>
                            <DatasetControlList>
                              {filterCategory.collection.map(
                                (controlItemFilter) => {
                                  const { isChecked } = filterItemCheckboxState(
                                    activeFilters,
                                    controlItem.id,
                                    filterCategory.id,
                                    controlItemFilter.id
                                  );
                                  return (
                                    <DatasetControlCheckbox
                                      key={controlItemFilter.id}
                                      isChecked={isChecked}
                                      controlItem={controlItemFilter}
                                      isIndeterminate={false}
                                      onChange={() =>
                                        onFilterControlItemChange(
                                          controlItem.id,
                                          filterCategory.id,
                                          controlItemFilter.id
                                        )
                                      }
                                    />
                                  );
                                }
                              )}
                            </DatasetControlList>
                          </MyAreaCollapsiblePanel>
                        </DatasetControlListItem>
                      );
                    })}
                  </DatasetControlList>
                </MyAreaCollapsiblePanel>
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
  const [activeFilters] = useActiveDatasetFilters();

  useEffect(() => {
    if (selectedFeature !== null) {
      setPositionFromSnapPoint(SnapPoint.Full);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeature]);

  useEffect(() => {
    onSetDrawerPosition(drawerPosition);
  }, [drawerPosition, onSetDrawerPosition]);

  const onControlItemChange = useControlItemChange();
  const onFilterControlItemChange = useFilterControlItemChange();

  const onCloseDetailPanel = useCallback(() => {
    setSelectedFeature(null);
  }, [setSelectedFeature]);

  useFetchPanelFeature();

  return (
    <PanelComponent>
      <MapPanelContent animate stackOrder={0}>
        <DatasetControlList>
          {DATASET_CONTROL_ITEMS.map((controlItemCategory) => (
            <DatasetControlListItem key={controlItemCategory.id}>
              <DatasetControlPanel
                key={controlItemCategory.id}
                controlItemCategory={controlItemCategory}
                onControlItemChange={onControlItemChange}
                onFilterControlItemChange={onFilterControlItemChange}
                activeDatasetIds={activeDatasetIds}
                activeFilters={activeFilters}
              />
            </DatasetControlListItem>
          ))}
        </DatasetControlList>
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
