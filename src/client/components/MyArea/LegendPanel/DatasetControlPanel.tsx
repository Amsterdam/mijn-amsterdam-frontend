import {
  DatasetCategory,
  DatasetCategoryId,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
  MY_AREA_TRACKING_CATEGORY,
} from '../../../../universal/config';
import { trackEventWithProfileType } from '../../../hooks/analytics.hook';
import { useProfileTypeValue } from '../../../hooks/useProfileType';
import { getIcon } from '../datasets';
import MyAreaCollapsiblePanel, { CollapsedState } from './CollapsiblePanel';
import {
  categoryCheckboxState,
  DatasetControlCheckbox,
} from './DatasetControlCheckbox';
import { DatasetPanel } from './DatasetPanel';
import { PanelList, PanelListItem } from './PanelList';

export interface DatasetControlPanelProps {
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
  const profileType = useProfileTypeValue();
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
      label={
        <>
          {getIcon(categoryId, categoryId) || ''}
          <p>{category.title}</p>
        </>
      }
      onChange={() => {
        onControlItemChange('category', datasetIds);
        trackEventWithProfileType(
          {
            category: MY_AREA_TRACKING_CATEGORY,
            name: `Dataset categorie: ${category.title}`,
            action: isChecked ? 'Uit' : 'Aan',
          },
          profileType
        );
      }}
    />
  );

  if (datasetIds.length === 1 && !isSingleDatasetWithFilters) {
    return categoryTitle;
  }

  if (isSingleDatasetWithFilters) {
    return (
      <DatasetPanel
        categoryId={categoryId}
        datasetId={datasetIds[0]}
        dataset={category.datasets[datasetIds[0]]}
        onFilterControlItemChange={onFilterControlItemChange}
        onControlItemChange={onControlItemChange}
        activeDatasetIds={activeDatasetIds}
      />
    );
  }

  const initialState = datasetIds.some((cDatasetId) =>
    activeDatasetIds.includes(cDatasetId)
  )
    ? CollapsedState.Expanded
    : CollapsedState.Collapsed;

  return (
    <MyAreaCollapsiblePanel title={categoryTitle} initialState={initialState}>
      <PanelList>
        {Object.entries(category.datasets).map(([datasetId, dataset]) => {
          return (
            <PanelListItem key={`dataset-${datasetId}`}>
              <DatasetPanel
                categoryId={categoryId}
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
