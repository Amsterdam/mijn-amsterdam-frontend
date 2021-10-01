import classnames from 'classnames';
import { FormEvent, ReactNode } from 'react';
import {
  DatasetCategory,
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
} from '../../../../universal/config';
import Checkbox from '../../Checkbox/Checkbox';
import { filterActiveDatasets } from '../MyArea.hooks';
import styles from './PanelComponent.module.scss';

export function datasetCheckboxState(
  datasetId: DatasetId,
  activeDatasetIds: string[]
) {
  return {
    isChecked: activeDatasetIds.includes(datasetId),
    isIndeterminate: false, // Dataset checkboxes don't need indeterminate state
  };
}

export function categoryCheckboxState(
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

interface DatasetControlCheckboxProps {
  id: string;
  label: ReactNode;
  onChange: (event: FormEvent<HTMLInputElement>) => void;
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
    <label
      htmlFor={id}
      className={classnames(styles.LabelStyle, isDimmed && styles.IsDimmed)}
    >
      <span className={styles.LabelText}>{label}</span>
      <Checkbox
        id={id}
        checked={isChecked}
        indeterminate={isIndeterminate}
        onChange={onChange}
      />
    </label>
  );
}
