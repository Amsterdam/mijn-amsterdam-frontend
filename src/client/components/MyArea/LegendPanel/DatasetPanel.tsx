import { DatasetCategoryId } from '../../../../universal/config';
import {
  DatasetControl,
  DatasetId,
} from '../../../../universal/config/myarea-datasets';
import { getIcon } from '../dataset-icons';
import {
  useActiveDatasetFilters,
  useDatasetFilterSelection,
} from '../MyArea.hooks';
import MyAreaCollapsiblePanel, { CollapsedState } from './CollapsiblePanel';
import {
  datasetCheckboxState,
  DatasetControlCheckbox,
} from './DatasetControlCheckbox';
import { DatasetControlPanelProps } from './DatasetControlPanel';
import { DatasetPropertyFilterPanel } from './DatasetPropertyFilterPanel';
import styles from './DatasetPanel.module.scss';

interface DatasePanelProps {
  categoryId: DatasetCategoryId;
  datasetId: DatasetId;
  dataset: DatasetControl;
  onFilterControlItemChange: DatasetControlPanelProps['onFilterControlItemChange'];
  onControlItemChange: DatasetControlPanelProps['onControlItemChange'];
  activeDatasetIds: DatasetId[];
}

export function DatasetPanel({
  categoryId,
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
      id={categoryId + datasetId}
      label={
        <>
          {getIcon(categoryId, datasetId) || ''}
          <p>{dataset.title}</p>
        </>
      }
      isIndeterminate={isIndeterminate}
      onChange={() => {
        onControlItemChange('dataset', [datasetId]);
      }}
    />
  );

  const renderFilterPanel = (propertyName: string, property: any) => {
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
  };

  const hasFilters = !!(dataset.filters && Object.keys(dataset.filters).length);

  const initialState =
    datasetId in activeFilters
      ? CollapsedState.Expanded
      : CollapsedState.Collapsed;

  const groupedFilters = Object.entries(dataset.filters!).reduce(
    (acc, [propertyName, property]) => {
      if (property.group) {
        if (!acc[property.group]) {
          acc[property.group] = {};
        }
        acc[property.group][propertyName] = property;
      }
      return acc;
    },
    {} as Record<string, Record<string, any>>
  );

  const ungroupedFilters = Object.fromEntries(
    Object.entries(dataset.filters!).filter(([_, property]) => !property.group)
  );

  return (
    <>
      {(!hasFilters || !isChecked) && datasetControl}
      {isChecked && hasFilters && (
        <MyAreaCollapsiblePanel
          title={datasetControl}
          initialState={initialState}
        >
          {Object.entries(groupedFilters).map(([groupName, properties]) => {
            return (
              <div className={styles.FilterGroup} key={groupName}>
                <strong>{groupName}</strong>
                {Object.entries(properties).map(([propertyName, property]) =>
                  renderFilterPanel(propertyName, property)
                )}
              </div>
            );
          })}
          {Object.entries(ungroupedFilters!).map(([propertyName, property]) =>
            renderFilterPanel(propertyName, property)
          )}
        </MyAreaCollapsiblePanel>
      )}
    </>
  );
}
