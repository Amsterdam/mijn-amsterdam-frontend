import { ReactNode, useMemo } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import { filterItemCheckboxState } from './checkbox-helpers';
import {
  DatasetFilterSelection,
  DatasetId,
  DatasetProperty,
  DatasetPropertyName,
  DatasetPropertyValueWithCount,
} from '../../../../universal/config/myarea-datasets';
import { sortAlpha } from '../../../../universal/helpers/utils';
import { getIcon, getIconChildIdFromValue } from '../dataset-icons';
import { DatasetControlCheckbox } from './DatasetControlCheckbox';
import { DatasetControlPanelProps } from './DatasetControlPanel';
import styles from './PanelComponent.module.scss';
import { PanelList, PanelListItem } from './PanelList';

interface DatasetPropertyFilterPanelProps {
  datasetId: DatasetId;
  propertyName: DatasetPropertyName;
  property: DatasetProperty;
  values: DatasetPropertyValueWithCount;
  valuesRefined?: DatasetPropertyValueWithCount;
  activeFilters: DatasetFilterSelection;
  onFilterControlItemChange: DatasetControlPanelProps['onFilterControlItemChange'];
}

function PropertyFilterPanel({ children }: { children: ReactNode }) {
  return <div className={styles.PropertyFilterPanel}>{children}</div>;
}

function FilterPropertyName({ children }: { children: ReactNode }) {
  return <strong className={styles.FilterPropertyName}>{children}</strong>;
}

function FeatureCount({ children }: { children: ReactNode }) {
  return <small>{children}</small>;
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
  const valuesSorted = useMemo(
    () => {
      const valueEntries = Object.entries(values);
      if (property.sort) {
        return valueEntries.sort(sortAlpha('0', property.sort));
      }
      return valueEntries;
    }, // Sort on label
    [values, property]
  );
  return (
    <PropertyFilterPanel>
      {property.title && (
        <FilterPropertyName>{property.title}</FilterPropertyName>
      )}
      {!valuesSorted.length && <span>laden...</span>}
      <PanelList>
        {valuesSorted.map(([value, featureCount], index) => {
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
                id={datasetId + propertyName + value}
                isDimmed={valuesRefined ? !valuesRefined[value] : false}
                label={
                  <>
                    {getIcon(
                      datasetId,
                      getIconChildIdFromValue(datasetId, value)
                    ) || ''}
                    <Paragraph>{value}</Paragraph>
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
                }}
              />
            </PanelListItem>
          );
        })}
      </PanelList>
    </PropertyFilterPanel>
  );
}
