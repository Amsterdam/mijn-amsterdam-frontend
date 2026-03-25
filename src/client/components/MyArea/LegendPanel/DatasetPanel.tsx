import { Paragraph } from '@amsterdam/design-system-react';

import type {
  DatasetCategoryId,
  DatasetControl,
  DatasetId,
} from '../../../../universal/config/myarea-datasets.ts';
import { getIcon } from '../dataset-icons.tsx';
import {
  useActiveDatasetFilters,
  useDatasetFilterSelection,
} from '../MyArea.hooks.ts';
import { datasetCheckboxState } from './checkbox-helpers.ts';
import MyAreaCollapsiblePanel, { CollapsedState } from './CollapsiblePanel.tsx';
import { DatasetControlCheckbox } from './DatasetControlCheckbox.tsx';
import type { DatasetControlPanelProps } from './DatasetControlPanel.tsx';
import { DatasetPropertyFilterPanel } from './DatasetPropertyFilterPanel.tsx';

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
  const { activeDatasetFilters } = useActiveDatasetFilters();
  const { filterSelection } = useDatasetFilterSelection();
  const { isChecked, isIndeterminate } = datasetCheckboxState(
    datasetId,
    activeDatasetIds
  );

  const hasFilters = !!(dataset.filters && Object.keys(dataset.filters).length);

  const datasetControl = (
    <DatasetControlCheckbox
      isChecked={isChecked}
      id={categoryId + datasetId}
      label={
        <>
          {getIcon(categoryId, datasetId) || ''}
          <Paragraph>{dataset.title}</Paragraph>
        </>
      }
      isIndeterminate={isIndeterminate}
      onChange={() => {
        onControlItemChange('dataset', [datasetId]);
      }}
    />
  );

  const initialState =
    datasetId in activeDatasetFilters
      ? CollapsedState.Expanded
      : CollapsedState.Collapsed;

  return (
    <>
      {(!hasFilters || !isChecked) && datasetControl}
      {isChecked && hasFilters && (
        <MyAreaCollapsiblePanel
          title={dataset.title}
          heading={datasetControl}
          initialState={initialState}
        >
          {Object.entries(dataset.filters!).map(([propertyName, property]) => {
            const filterSelectionValues =
              filterSelection?.[datasetId]?.[propertyName]?.values;

            const filterSelectionValuesRefined =
              filterSelection?.[datasetId]?.[propertyName]?.valuesRefined;

            const values = property.values || filterSelectionValues || {};

            return (
              <DatasetPropertyFilterPanel
                key={datasetId + propertyName}
                datasetId={datasetId}
                propertyName={propertyName}
                property={property}
                values={values}
                valuesRefined={filterSelectionValuesRefined}
                activeFilters={activeDatasetFilters}
                onFilterControlItemChange={onFilterControlItemChange}
              />
            );
          })}
        </MyAreaCollapsiblePanel>
      )}
    </>
  );
}
