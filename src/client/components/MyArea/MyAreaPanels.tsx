import { Checkbox, Label, themeColor } from '@amsterdam/asc-ui';
import React, { ReactNode, useMemo } from 'react';
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
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import {
  filterActiveDatasets,
  useActiveDatasetFilters,
  useActiveDatasetIds,
  useControlItemChange,
  useDatasetFilterSelection,
  useFilterControlItemChange,
} from './MyArea.hooks';
import MyAreaCollapsiblePanel from './MyAreaCollapsiblePanel';

const LegendControlButton = styled.div`
  left: 100%;
  position: relative;
`;

export const PanelList = styled.ol<{ indent?: number }>`
  padding: 0;
  list-style-type: none;
  margin: 0;
  padding-left: ${(props) => (props.indent || 0) + 'rem'};
`;

export const CategoryPanel = styled(PanelList)`
  margin-top: 2rem;

  > li:first-child {
    border-top: 0;
  }
`;

export const PanelListItem = styled.li`
  position: relative;
  border-top: 1px solid ${themeColor('tint', 'level3')};
  > ol > li > ol > li {
    border-top: 0;
  }
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

const StyledLabel = styled(Label)<{ isDimmed?: boolean }>`
  display: flex;
  align-items: center;
  opacity: ${(props) => (props.isDimmed ? '0.5' : 1)};
  font-weight: ${(props) => (props.isDimmed ? 'normal' : '500')};
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
  isDimmed?: boolean;
}

export function DatasetControlCheckbox({
  id,
  label,
  isChecked,
  isIndeterminate,
  isDimmed,
  onChange,
}: DatasetControlCheckboxProps) {
  return (
    <StyledLabel htmlFor={id} label={label} isDimmed={isDimmed}>
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

export function DatasetPropertyFilterPanel({
  datasetId,
  filters,
  activeFilters,
  onFilterControlItemChange,
}: DatasetPropertyFilterPanelProps) {
  const [filterSelection] = useDatasetFilterSelection();
  const filterEntries = useMemo(() => Object.entries(filters), [filters]);
  return (
    <>
      {filterEntries.map(([propertyId, property]) => {
        const filterSelectionValues =
          filterSelection[datasetId] &&
          filterSelection[datasetId][propertyId] &&
          filterSelection[datasetId][propertyId].values;

        const filterSelectionValuesRefined =
          filterSelection[datasetId] &&
          filterSelection[datasetId][propertyId] &&
          filterSelection[datasetId][propertyId].valuesRefined;

        const values = property.values
          ? property.values
          : filterSelectionValues
          ? filterSelectionValues
          : {};

        const propertyValues = Object.entries(values).sort((a, b) => {
          return b[1] - a[1];
        });

        return (
          <>
            {property.title && (
              <FilterPropertyName>{property.title}</FilterPropertyName>
            )}
            <PanelList>
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
                  <PanelListItem key={datasetId + propertyId}>
                    <DatasetControlCheckbox
                      key={label}
                      isChecked={isChecked}
                      id={label}
                      isDimmed={
                        filterSelectionValuesRefined
                          ? !filterSelectionValuesRefined[value]
                          : false
                      }
                      label={
                        <>
                          {capitalizeFirstLetter(label)}{' '}
                          {featureCount >= 1 ? (
                            <FeatureCount>
                              (
                              {filterSelectionValuesRefined
                                ? filterSelectionValuesRefined[value] || 0
                                : featureCount}
                              )
                            </FeatureCount>
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
                  </PanelListItem>
                );
              })}
            </PanelList>
          </>
        );
      })}
    </>
  );
}

interface DatasePanelProps {
  datasetId: DatasetId;
  dataset: DatasetControl;
  onFilterControlItemChange: DatasetControlPanelProps['onFilterControlItemChange'];
  onControlItemChange: DatasetControlPanelProps['onControlItemChange'];
  activeDatasetIds: DatasetId[];
}

export function DatasetPanel({
  datasetId,
  dataset,
  onFilterControlItemChange,
  onControlItemChange,
  activeDatasetIds,
}: DatasePanelProps) {
  const [activeFilters] = useActiveDatasetFilters();

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

  const hasFilters = !!(dataset.filters && Object.keys(dataset.filters).length);

  return (
    <>
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
    </>
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

export function DatasetControlPanel({
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

  const isSingleDatasetWithFilters = !!(
    datasetIds.length === 1 && category.datasets[datasetIds[0]].filters
  );

  const categoryTitle = (
    <DatasetControlCheckbox
      isChecked={isChecked}
      isIndeterminate={isIndeterminate}
      id={categoryId}
      label={category.title}
      onChange={() => onControlItemChange('category', datasetIds)}
    />
  );

  if (datasetIds.length === 1 && !isSingleDatasetWithFilters) {
    return categoryTitle;
  }

  if (isSingleDatasetWithFilters) {
    return (
      <DatasetPanel
        datasetId={datasetIds[0]}
        dataset={category.datasets[datasetIds[0]]}
        onFilterControlItemChange={onFilterControlItemChange}
        onControlItemChange={onControlItemChange}
        activeDatasetIds={activeDatasetIds}
      />
    );
  }

  return (
    <MyAreaCollapsiblePanel title={categoryTitle}>
      <PanelList>
        {Object.entries(category.datasets).map(([datasetId, dataset]) => {
          return (
            <PanelListItem key={datasetId}>
              <DatasetPanel
                datasetId={datasetId}
                dataset={dataset}
                onFilterControlItemChange={onFilterControlItemChange}
                onControlItemChange={onControlItemChange}
                activeDatasetIds={activeDatasetIds}
              />
            </PanelListItem>
          );
        })}
      </PanelList>
    </MyAreaCollapsiblePanel>
  );
}

export function MyAreaLegendPanel() {
  const profileType = useProfileTypeValue();

  const datasets = useMemo(() => {
    return Object.entries(DATASETS).filter(([categoryId, category]) => {
      return (
        !Array.isArray(category.profileType) ||
        category.profileType.includes(profileType)
      );
    });
  }, [profileType]);

  const onControlItemChange = useControlItemChange();
  const onFilterControlItemChange = useFilterControlItemChange();
  const [activeDatasetIds] = useActiveDatasetIds();

  return (
    <CategoryPanel>
      {datasets.map(([categoryId, category]) => (
        <PanelListItem key={categoryId}>
          <DatasetControlPanel
            categoryId={categoryId}
            category={category}
            onControlItemChange={onControlItemChange}
            onFilterControlItemChange={onFilterControlItemChange}
            activeDatasetIds={activeDatasetIds}
          />
        </PanelListItem>
      ))}
    </CategoryPanel>
  );
}
