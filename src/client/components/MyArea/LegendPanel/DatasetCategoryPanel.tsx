import { useMemo } from 'react';
import { DATASETS } from '../../../../universal/config';
import { useProfileTypeValue } from '../../../hooks/useProfileType';
import {
  useActiveDatasetIds,
  useControlItemChange,
  useFilterControlItemChange,
} from '../MyArea.hooks';
import { DatasetControlPanel } from './DatasetControlPanel';
import styles from './PanelComponent.module.scss';
import classnames from 'classnames';

export function DatasetCategoryPanel() {
  const profileType = useProfileTypeValue();
  const onControlItemChange = useControlItemChange();
  const onFilterControlItemChange = useFilterControlItemChange();
  const [activeDatasetIds] = useActiveDatasetIds();

  const datasets = useMemo(() => {
    return Object.entries(DATASETS).filter(([categoryId, category]) => {
      return (
        !Array.isArray(category.profileType) ||
        category.profileType.includes(profileType)
      );
    });
  }, [profileType]);

  return (
    <ol
      className={classnames(styles.CategoryPanel, styles.PanelList)}
      id="skip-to-id-LegendPanel"
    >
      {datasets
        .filter(([categoryId, category]) => !category.isDisabled)
        .map(([categoryId, category]) => (
          <li className={styles.PanelListItem} key={`category-${categoryId}`}>
            <DatasetControlPanel
              categoryId={categoryId}
              category={category}
              onControlItemChange={onControlItemChange}
              onFilterControlItemChange={onFilterControlItemChange}
              activeDatasetIds={activeDatasetIds}
            />
          </li>
        ))}
    </ol>
  );
}
