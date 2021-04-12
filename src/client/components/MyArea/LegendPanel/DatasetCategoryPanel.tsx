import { useMemo } from 'react';
import styled from 'styled-components';
import { DATASETS } from '../../../../universal/config';
import { useProfileTypeValue } from '../../../hooks/useProfileType';
import {
  useActiveDatasetIds,
  useControlItemChange,
  useFilterControlItemChange,
} from '../MyArea.hooks';
import { DatasetControlPanel } from './DatasetControlPanel';
import { PanelList, PanelListItem } from './PanelList';

export const CategoryPanel = styled(PanelList)`
  margin-top: 2rem;

  > li:first-child {
    border-top: 0;
  }
`;

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
    <CategoryPanel id="skip-to-id-LegendPanel">
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
