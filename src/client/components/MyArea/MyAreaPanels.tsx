import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants';
import { Checkbox, Label } from '@amsterdam/asc-ui';
import React, { ReactNode, useCallback, useContext, useEffect } from 'react';
import styled from 'styled-components';
import {
  DatasetCategory,
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
  DATASETS,
} from '../../../universal/config';
import {
  DatasetCategoryId,
  DatasetPropertyFilter,
} from '../../../universal/config/buurt';
import { useDesktopScreen } from '../../hooks';
import Alert from '../Alert/Alert';
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
import MyAreaCollapsiblePanel from './MyAreaCollapsiblePanel';
import MyAreaPanelContent from './PanelContent/Generic';

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

const FeatureCount = styled.small`
  padding-left: 1rem;
`;

export function filterItemCheckboxState(
  activeFilters: DatasetFilterSelection,
  datasetId: DatasetId,
  propertyName: DatasetPropertyName,
  propertyValue: DatasetPropertyValue
) {
  const propertyValues =
    activeFilters[datasetId] &&
    activeFilters[datasetId][propertyName] &&
    activeFilters[datasetId][propertyName].values;
  return {
    isChecked: !!propertyValues && propertyValue in propertyValues,
  };
}

function categoryCheckboxState(
  category: DatasetCategory,
  activeDatasetIds: DatasetId[]
) {
  const datasetIds = Object.keys(category.datasets);
  const activeControlIds = filterActiveDatasets(datasetIds, activeDatasetIds);
  const activeLength = activeControlIds.length;
  const datasetCount = datasetIds.length;
  const isChecked = !!activeLength && activeLength === datasetCount;
  const isIndeterminate = !!activeLength && activeLength !== datasetCount;

  return {
    isChecked,
    isIndeterminate,
  };
}

function datasetCheckboxState(
  datasetId: DatasetId,
  activeDatasetIds: string[]
) {
  return {
    isChecked: activeDatasetIds.includes(datasetId),
    isIndeterminate: false, // Dataset checkboxes don't need indeterminate state
  };
}

interface DatasetControlCheckboxProps {
  id: string;
  label: ReactNode;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
  isChecked: boolean;
  isIndeterminate: boolean;
}

export function DatasetControlCheckbox({
  id,
  label,
  isChecked,
  isIndeterminate,
  onChange,
}: DatasetControlCheckboxProps) {
  return (
    <StyledLabel htmlFor={id} label={label}>
      <StyledCheckbox
        id={id}
        checked={isChecked}
        indeterminate={isIndeterminate}
        onChange={onChange}
      />
    </StyledLabel>
  );
}

interface DatasetPropertyFilterPanelProps {
  datasetId: DatasetId;
  filters: DatasetPropertyFilter;
  activeFilters: DatasetFilterSelection;
  onFilterControlItemChange: DatasetControlPanelProps['onFilterControlItemChange'];
}

function DatasetPropertyFilterPanel({
  datasetId,
  filters,
  activeFilters,
  onFilterControlItemChange,
}: DatasetPropertyFilterPanelProps) {
  const [filterSelection] = useDatasetFilterSelection();
  return (
    <DatasetFilterControlCagegoryList>
      {Object.entries(filters).map(([propertyId, property]) => {
        const hasStaticValues = !!(
          property.values && Object.keys(property.values).length
        );
        const propertyValues = Object.entries(
          hasStaticValues
            ? property.values
            : filterSelection[datasetId] &&
              filterSelection[datasetId][propertyId]
            ? filterSelection[datasetId][propertyId].values
            : {}
        );
        return (
          <DatasetControlListItem key={propertyId}>
            {property.title && (
              <FilterPropertyName>{property.title}</FilterPropertyName>
            )}
            <DatasetFilterControlList>
              {propertyValues.map(([value, featureCount]) => {
                const { isChecked } = filterItemCheckboxState(
                  activeFilters,
                  datasetId,
                  propertyId,
                  value
                );
                return (
                  <DatasetControlCheckbox
                    key={value}
                    isChecked={isChecked}
                    id={value}
                    label={
                      <>
                        {value}{' '}
                        {featureCount > 1 ? (
                          <FeatureCount>{featureCount}</FeatureCount>
                        ) : (
                          ''
                        )}
                      </>
                    }
                    isIndeterminate={false}
                    onChange={() =>
                      onFilterControlItemChange(datasetId, propertyId, value)
                    }
                  />
                );
              })}
            </DatasetFilterControlList>
          </DatasetControlListItem>
        );
      })}
    </DatasetFilterControlCagegoryList>
  );
}

interface DatasetControlPanelProps {
  onControlItemChange: (type: 'category' | 'dataset', ids: string[]) => void;
  onFilterControlItemChange: (
    datasetId: DatasetId,
    propertyName: DatasetPropertyName,
    propertyValue: DatasetPropertyValue
  ) => void;
  categoryId: DatasetCategoryId;
  category: DatasetCategory;
  activeDatasetIds: string[];
  activeFilters: DatasetFilterSelection;
}

function DatasetControlPanel({
  categoryId,
  category,
  onControlItemChange,
  onFilterControlItemChange,
  activeDatasetIds,
  activeFilters,
}: DatasetControlPanelProps) {
  const { isChecked, isIndeterminate } = categoryCheckboxState(
    category,
    activeDatasetIds
  );
  const datasetIds = Object.keys(category.datasets);
  const hasDatasets =
    !!category.datasets && Object.keys(category.datasets).length > 1;

  const categoryTitle = (
    <DatasetControlCheckbox
      isChecked={isChecked}
      isIndeterminate={isIndeterminate}
      id={categoryId}
      label={category.title}
      onChange={() => onControlItemChange('category', datasetIds)}
    />
  );

  if (!hasDatasets) {
    return categoryTitle;
  }

  return (
    <MyAreaCollapsiblePanel title={categoryTitle}>
      <DatasetControlList>
        {Object.entries(category.datasets).map(([datasetId, dataset]) => {
          const { isChecked, isIndeterminate } = datasetCheckboxState(
            datasetId,
            activeDatasetIds
          );
          const datasetControl = (
            <DatasetControlCheckbox
              isChecked={isChecked}
              id={datasetId}
              label={dataset.title}
              isIndeterminate={isIndeterminate}
              onChange={() => onControlItemChange('dataset', [datasetId])}
            />
          );
          const hasFilters = !!(
            dataset.filters && Object.keys(dataset.filters).length
          );
          return (
            <DatasetControlListItem key={datasetId}>
              {(!hasFilters || !isChecked) && datasetControl}
              {isChecked && hasFilters && (
                <MyAreaCollapsiblePanel title={datasetControl}>
                  <DatasetPropertyFilterPanel
                    datasetId={datasetId}
                    filters={dataset.filters!}
                    activeFilters={activeFilters}
                    onFilterControlItemChange={onFilterControlItemChange}
                  />
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
        <DatasetCategoryList>
          {Object.entries(DATASETS).map(([categoryId, category]) => (
            <DatasetControlListItem key={categoryId}>
              <DatasetControlPanel
                categoryId={categoryId}
                category={category}
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
