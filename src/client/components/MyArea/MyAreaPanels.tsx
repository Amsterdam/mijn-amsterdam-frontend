import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants';
import { Checkbox, Label } from '@amsterdam/asc-ui';
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
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
  DatasetControl,
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

const DatasetControlList = styled(DatasetCategoryList)<{ noIndent?: boolean }>`
  padding-left: ${(props) => (props.noIndent ? '0' : '4rem')};
`;

const DatasetFilterControlCagegoryList = styled(DatasetControlList)``;

const DatasetFilterControlList = styled(DatasetCategoryList)``;

const DatasetControlListItem = styled.li`
  position: relative;
`;

const FilterPropertyName = styled.strong`
  display: block;
  line-height: 3rem;
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
  > span {
    margin: 0.5rem;
  }
  &:hover + button {
    visibility: visible;
  }
`;

const FeatureCount = styled.small``;

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
  const filterEntries = useMemo(() => Object.entries(filters), [filters]);
  return (
    <DatasetFilterControlCagegoryList>
      {filterEntries.map(([propertyId, property]) => {
        const filterSelectionValues =
          filterSelection[datasetId] &&
          filterSelection[datasetId][propertyId] &&
          filterSelection[datasetId][propertyId].values;

        const values = property.values
          ? property.values
          : filterSelectionValues
          ? filterSelectionValues
          : {};

        const propertyValues = Object.entries(values).sort((a, b) => {
          return b[1] - a[1];
        });
        return (
          <DatasetControlListItem key={propertyId}>
            {property.title && (
              <FilterPropertyName>{property.title}</FilterPropertyName>
            )}
            <DatasetFilterControlList>
              {propertyValues.map(([value, featureCount]) => {
                let label = value;
                const valueConfig = property.valueConfig
                  ? property.valueConfig[value]
                  : undefined;
                if (valueConfig?.title) {
                  label = valueConfig?.title;
                }
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
                        {label}{' '}
                        {featureCount > 1 ? (
                          <FeatureCount>({featureCount})</FeatureCount>
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

interface DatasePanelProps {
  noIndent?: boolean;
  datasets: Record<DatasetCategoryId, DatasetControl>;
  onFilterControlItemChange: DatasetControlPanelProps['onFilterControlItemChange'];
  onControlItemChange: DatasetControlPanelProps['onControlItemChange'];
  activeDatasetIds: DatasetId[];
}

function DatasetPanel({
  noIndent,
  datasets,
  onFilterControlItemChange,
  onControlItemChange,
  activeDatasetIds,
}: DatasePanelProps) {
  const [activeFilters] = useActiveDatasetFilters();
  return (
    <DatasetControlList noIndent={noIndent}>
      {Object.entries(datasets).map(([datasetId, dataset]) => {
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
  activeDatasetIds: DatasetId[];
}

function DatasetControlPanel({
  categoryId,
  category,
  onControlItemChange,
  onFilterControlItemChange,
  activeDatasetIds,
}: DatasetControlPanelProps) {
  const { isChecked, isIndeterminate } = categoryCheckboxState(
    category,
    activeDatasetIds
  );
  const datasetIds = Object.keys(category.datasets);
  const hasDatasets = !!datasetIds.length;

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

  const isSingleDatasetWithFilters = !!(
    datasetIds.length === 1 && category.datasets[datasetIds[0]].filters
  );

  if (isSingleDatasetWithFilters) {
    return (
      <DatasetPanel
        noIndent={true}
        datasets={category.datasets}
        onFilterControlItemChange={onFilterControlItemChange}
        onControlItemChange={onControlItemChange}
        activeDatasetIds={activeDatasetIds}
      />
    );
  }

  return (
    <MyAreaCollapsiblePanel title={categoryTitle}>
      <DatasetPanel
        datasets={category.datasets}
        onFilterControlItemChange={onFilterControlItemChange}
        onControlItemChange={onControlItemChange}
        activeDatasetIds={activeDatasetIds}
      />
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
