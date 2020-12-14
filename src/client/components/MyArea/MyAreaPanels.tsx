import { Checkbox, Label, themeSpacing } from '@amsterdam/asc-ui';
import React, { ReactNode, useCallback, useEffect, useMemo } from 'react';
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
import { usePhoneScreen } from '../../hooks/media.hook';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import {
  filterActiveDatasets,
  useActiveDatasetFilters,
  useActiveDatasetIds,
  useControlItemChange,
  useDatasetFilterSelection,
  useFetchPanelFeature,
  useFilterControlItemChange,
  useLoadingFeature,
  useSelectedFeature,
} from './MyArea.hooks';
import MyAreaCollapsiblePanel from './MyAreaCollapsiblePanel';
import {
  PanelComponent,
  PanelComponentProps,
  PanelState,
  usePanelState,
} from './MyAreaPanelComponent';
import MyAreaPanelContent from './PanelContent/Generic';
import { Title } from './PanelContent/GenericBase';

const DatasetList = styled.ol`
  padding: 0;
  list-style-type: none;
`;

const DatasetCategoryList = styled(DatasetList)`
  margin: ${themeSpacing(4, 0, 4, 0)};
`;

const DatasetControlList = styled(DatasetList)<{ noIndent?: boolean }>`
  padding-left: ${(props) => (props.noIndent ? '0' : '4rem')};
`;

const DatasetFilterControlCagegoryList = styled(DatasetControlList)``;

const DatasetFilterControlList = styled(DatasetList)``;

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

const StyledLabel = styled(Label)<{ isDimmed?: boolean }>`
  display: flex;
  align-items: center;
  opacity: ${(props) => (props.isDimmed ? '0.5' : 1)};
  font-weight: ${(props) => (props.isDimmed ? 'normal' : '500')};
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
  const profileType = useProfileTypeValue();

  const datasetsVisible = useMemo(() => {
    return Object.entries(datasets).filter(([datasetId, dataset]) => {
      return (
        !Array.isArray(dataset.profileType) ||
        dataset.profileType.includes(profileType)
      );
    });
  }, [profileType, datasets]);

  return (
    <DatasetControlList noIndent={noIndent}>
      {datasetsVisible.map(([datasetId, dataset]) => {
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
  onTogglePanel: PanelComponentProps['onTogglePanel'];
  availableHeight: number;
}

export default function MyAreaPanels({
  onTogglePanel,
  availableHeight,
}: MyAreaPanels) {
  const profileType = useProfileTypeValue();
  const [, setSelectedFeature] = useSelectedFeature();
  const [loadingFeature] = useLoadingFeature();
  const [activeDatasetIds] = useActiveDatasetIds();
  const onControlItemChange = useControlItemChange();
  const onFilterControlItemChange = useFilterControlItemChange();
  const isPhone = usePhoneScreen();
  const [, setPanelState] = usePanelState();

  useFetchPanelFeature();

  const onCloseDetailPanel = useCallback(() => {
    setSelectedFeature(null);
  }, [setSelectedFeature]);

  const datasets = useMemo(() => {
    return Object.entries(DATASETS).filter(([categoryId, category]) => {
      return (
        !Array.isArray(category.profileType) ||
        category.profileType.includes(profileType)
      );
    });
  }, [profileType]);

  // Set panel state without explicit panel interaction. Effect reacts to loading detailed features.
  useEffect(() => {
    if (!loadingFeature) {
      return;
    }
    if (isPhone) {
      setPanelState((store) => ({
        ...store,
        detail: PanelState.Preview,
      }));
    } else {
      setPanelState((store) => ({
        ...store,
        detail: PanelState.Open,
      }));
    }
    // Only react on loadingFeature changes. This wil result in re-render which causes the currentPanel state to be up-to-date.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFeature, isPhone]);

  const filtersPanelCycle = useMemo(() => {
    if (isPhone) {
      return [PanelState.Tip, PanelState.Open];
    }
    return [PanelState.Open, PanelState.Tip];
  }, [isPhone]);

  const detailPanelCycle = useMemo(() => {
    if (isPhone) {
      return [PanelState.Closed, PanelState.Preview, PanelState.Open];
    }
    return [PanelState.Closed, PanelState.Open];
  }, [isPhone]);

  return (
    <>
      <PanelComponent
        id="filters"
        cycle={filtersPanelCycle}
        onTogglePanel={onTogglePanel}
        availableHeight={availableHeight}
      >
        <DatasetCategoryList>
          {datasets.map(([categoryId, category]) => (
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
      </PanelComponent>

      <PanelComponent
        id="detail"
        cycle={detailPanelCycle}
        onTogglePanel={onTogglePanel}
        onClose={onCloseDetailPanel}
        availableHeight={availableHeight}
      >
        <MyAreaPanelContent />
      </PanelComponent>
    </>
  );
}
