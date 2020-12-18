import { Checkbox, Label, themeColor, themeSpacing } from '@amsterdam/asc-ui';
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
  DatasetProperty,
  DatasetPropertyValueWithCount,
} from '../../../universal/config/buurt';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { getIcon, getIconChildIdFromValue } from './datasets';
import {
  filterActiveDatasets,
  useActiveDatasetFilters,
  useActiveDatasetIds,
  useControlItemChange,
  useDatasetFilterSelection,
  useFilterControlItemChange,
} from './MyArea.hooks';
import MyAreaCollapsiblePanel from './MyAreaCollapsiblePanel';

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
  > ol > li {
    margin-left: ${themeSpacing(9)};
  }
`;

const PropertyFilterPanel = styled.div`
  margin-left: ${themeSpacing(9)};
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
  > span {
    display: flex;
    align-items: center;
    > small {
      display: inline-block;
      margin-top: 2px;
      margin-left: 4px;
    }
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
  propertyName: DatasetPropertyName;
  property: DatasetProperty;
  values: DatasetPropertyValueWithCount;
  valuesRefined?: DatasetPropertyValueWithCount;
  activeFilters: DatasetFilterSelection;
  onFilterControlItemChange: DatasetControlPanelProps['onFilterControlItemChange'];
}

export function DatasetPropertyFilterPanel({
  datasetId,
  propertyName,
  property,
  values,
  valuesRefined,
  activeFilters,
  onFilterControlItemChange,
}: DatasetPropertyFilterPanelProps) {
  const valuesSorted = useMemo(() => {
    return Object.entries(values).sort((a, b) => {
      return b[1] - a[1];
    });
  }, [values]);

  return (
    <PropertyFilterPanel>
      {property.title && (
        <FilterPropertyName>{property.title}</FilterPropertyName>
      )}
      <PanelList>
        {valuesSorted.map(([value, featureCount], index) => {
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
            propertyName,
            value
          );

          return (
            <PanelListItem key={`property-${datasetId + propertyName + index}`}>
              <DatasetControlCheckbox
                isChecked={isChecked}
                id={label}
                isDimmed={valuesRefined ? !valuesRefined[value] : false}
                label={
                  <>
                    {getIcon(
                      datasetId,
                      getIconChildIdFromValue(datasetId, value)
                    ) || ''}
                    {capitalizeFirstLetter(label)}{' '}
                    {featureCount >= 1 ? (
                      <FeatureCount>
                        (
                        {valuesRefined
                          ? valuesRefined[value] || 0
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
                  onFilterControlItemChange(datasetId, propertyName, value)
                }
              />
            </PanelListItem>
          );
        })}
      </PanelList>
    </PropertyFilterPanel>
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
  const [filterSelection] = useDatasetFilterSelection();

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
          {Object.entries(dataset.filters!).map(([propertyName, property]) => {
            const filterSelectionValues =
              filterSelection[datasetId] &&
              filterSelection[datasetId][propertyName] &&
              filterSelection[datasetId][propertyName].values;

            const filterSelectionValuesRefined =
              filterSelection[datasetId] &&
              filterSelection[datasetId][propertyName] &&
              filterSelection[datasetId][propertyName].valuesRefined;

            const values = property.values || filterSelectionValues || {};

            return (
              <DatasetPropertyFilterPanel
                key={datasetId + propertyName}
                datasetId={datasetId}
                propertyName={propertyName}
                property={property}
                values={values}
                valuesRefined={filterSelectionValuesRefined}
                activeFilters={activeFilters}
                onFilterControlItemChange={onFilterControlItemChange}
              />
            );
          })}
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
            <PanelListItem key={`dataset-${datasetId}`}>
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
      {datasets
        .filter(([categoryId, category]) => !category.isDisabled)
        .map(([categoryId, category]) => (
          <PanelListItem key={`category-${categoryId}`}>
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
