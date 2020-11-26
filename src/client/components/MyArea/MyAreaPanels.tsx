import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants';
import { Checkbox, Label, themeSpacing } from '@amsterdam/asc-ui';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
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
  createDatasetControlItems,
  DatasetCategoryItem,
  DatasetControlItem,
} from './datasets';
import {
  filterActiveDatasets,
  useActiveDatasetFilters,
  useActiveDatasetIds,
  useControlItemChange,
  useDatasetFilterSelection,
  useFetchPanelFeature,
  useFilterControlItemChange,
  useSelectedFeature,
} from './MyArea.hooks';
import MyAreaCollapsiblePanel, {
  CollapsedState,
} from './MyAreaCollapsiblePanel';
import MyAreaPanelContent from './PanelContent/Generic';
import { IconFilter } from '../../assets/icons';

const MapPanelContentDetail = styled(MapPanelContent)``;

const DatasetCategoryList = styled.ol`
  margin: 0;
  padding: 0;
  list-style-type: none;
`;

const DatasetControlList = styled(DatasetCategoryList)`
  padding-left: 3.6rem;
`;

const DatasetFilterControlCagegoryList = styled(DatasetControlList)``;

const DatasetFilterControlList = styled(DatasetCategoryList)``;

const DatasetControlListItem = styled.li`
  position: relative;
`;

const FilterPropertyName = styled.strong`
  display: block;
  line-height: 3rem;
  /* margin: 5px; */
`;

const StyledCheckbox = styled(Checkbox)`
  padding-left: 0;
  /* transform: scale(0.8); */
  /* padding: 0; */
  /* margin: 0; */
  /* width: 16px;
  height: 16px; */
  > input {
    left: 0;
  }
`;

const StyledLabel = styled(Label)`
  display: flex;
  align-items: center;
  /* > span {
    margin: 0.5rem;
  } */
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
  return {
    isChecked: !!(
      activeFilters[datasetId] &&
      activeFilters[datasetId][propertyName] &&
      activeFilters[datasetId][propertyName].values.includes(propertyValue)
    ),
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
    isIndeterminate: false, // TODO: Fix for non-category items
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
              {(!controlItem.collection.length || !isChecked) && datasetControl}
              {isChecked && !!controlItem.collection.length && (
                <MyAreaCollapsiblePanel title={datasetControl}>
                  <DatasetFilterControlCagegoryList>
                    {controlItem.collection.map((filterCategory) => {
                      return (
                        <DatasetControlListItem key={filterCategory.id}>
                          <FilterPropertyName>
                            {filterCategory.title}
                          </FilterPropertyName>
                          <DatasetFilterControlList>
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
                          </DatasetFilterControlList>
                        </DatasetControlListItem>
                      );
                    })}
                  </DatasetFilterControlCagegoryList>
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
  const [filterSelection] = useDatasetFilterSelection();

  const datasetControlItems = useMemo(() => {
    return createDatasetControlItems(filterSelection);
  }, [filterSelection]);

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
        <DatasetCategoryList>
          {datasetControlItems.map((controlItemCategory) => (
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
        </DatasetCategoryList>
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
