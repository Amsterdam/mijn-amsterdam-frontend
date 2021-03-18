import { themeSpacing } from '@amsterdam/asc-ui';
import { useMemo } from 'react';
import styled from 'styled-components';
import { DatasetId } from '../../../../universal/config';
import {
  DatasetFilterSelection,
  DatasetProperty,
  DatasetPropertyName,
  DatasetPropertyValueWithCount,
  MY_AREA_TRACKING_CATEGORY,
} from '../../../../universal/config/buurt';
import { sortAlpha } from '../../../../universal/helpers';
import { trackEventWithProfileType } from '../../../hooks/analytics.hook';
import { useProfileTypeValue } from '../../../hooks/useProfileType';
import { getIcon, getIconChildIdFromValue } from '../datasets';
import {
  DatasetControlCheckbox,
  filterItemCheckboxState,
} from './DatasetControlCheckbox';
import { DatasetControlPanelProps } from './DatasetControlPanel';
import { PanelList, PanelListItem } from './PanelList';

const PropertyFilterPanel = styled.div`
  margin-left: ${themeSpacing(9)};
`;

const FilterPropertyName = styled.strong`
  display: block;
  line-height: 3rem;
`;

const FeatureCount = styled.small``;

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
  const profileType = useProfileTypeValue();
  const valuesSorted = useMemo(
    () =>
      Object.entries(values)
        .map(([propertyValue, count]) => {
          let label = propertyValue;
          if (property.transformValueLabel) {
            label = property.transformValueLabel(label);
          }
          return [propertyValue, count, label] as const;
        })
        .sort(sortAlpha('2')), // Sort on label
    [values, property]
  );

  return (
    <PropertyFilterPanel>
      {property.title && (
        <FilterPropertyName>{property.title}</FilterPropertyName>
      )}
      {!valuesSorted.length && <span>laden...</span>}
      <PanelList>
        {valuesSorted.map(([value, featureCount, label], index) => {
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
                id={datasetId + propertyName + label}
                isDimmed={valuesRefined ? !valuesRefined[value] : false}
                label={
                  <>
                    {getIcon(
                      datasetId,
                      getIconChildIdFromValue(datasetId, value)
                    ) || ''}
                    {label}
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
                onChange={() => {
                  onFilterControlItemChange(datasetId, propertyName, value);
                  trackEventWithProfileType(
                    {
                      category: MY_AREA_TRACKING_CATEGORY,
                      name: `Filter: ${propertyName} ${label}`,
                      action: isChecked ? 'Uit' : 'Aan',
                    },
                    profileType
                  );
                }}
              />
            </PanelListItem>
          );
        })}
      </PanelList>
    </PropertyFilterPanel>
  );
}
