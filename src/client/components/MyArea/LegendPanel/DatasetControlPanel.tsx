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
import styles from './PanelComponent.module.scss';

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
          {category.title}
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
      <ol className={styles.PanelList}>
        {Object.entries(category.datasets).map(([datasetId, dataset]) => {
          return (
            <li className={styles.PanelListItem} key={`dataset-${datasetId}`}>
              <DatasetPanel
                categoryId={categoryId}
                datasetId={datasetId}
                dataset={dataset}
                onFilterControlItemChange={onFilterControlItemChange}
                onControlItemChange={onControlItemChange}
                activeDatasetIds={activeDatasetIds}
              />
            </li>
          );
        })}
      </ol>
    </MyAreaCollapsiblePanel>
  );
}
