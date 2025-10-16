import { ReactNode, useMemo } from 'react';

import { DATASETS } from '../../../../universal/config/myarea-datasets';
import { useProfileTypeValue } from '../../../hooks/useProfileType';
import {
  useActiveDatasetIds,
  useControlItemChange,
  useFilterControlItemChange,
} from '../MyArea.hooks';
import { DatasetControlPanel } from './DatasetControlPanel';
import styles from './PanelComponent.module.scss';
import { PanelList, PanelListItem } from './PanelList';

export function CategoryPanel({ children }: { children: ReactNode }) {
  return <PanelList className={styles.CategoryPanel}>{children}</PanelList>;
}

export function DatasetCategoryPanel() {
  const profileType = useProfileTypeValue();
  const onControlItemChange = useControlItemChange();
  const onFilterControlItemChange = useFilterControlItemChange();
  const { activeDatasetIds } = useActiveDatasetIds();
  const datasets = useMemo(() => {
    return Object.entries(DATASETS).filter(([categoryId, category]) => {
      return (
        !Array.isArray(category.profileType) ||
        category.profileType.includes(profileType)
      );
    });
  }, [profileType]);

  return (
    <CategoryPanel>
      {datasets
        .filter(([categoryId, category]) => !category.isDisabled)
        .map(([categoryId, category]) => (
          <PanelListItem
            className={styles.PanelListItem}
            key={`category-${categoryId}`}
          >
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
