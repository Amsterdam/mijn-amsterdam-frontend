import { Checkbox, Label } from '@amsterdam/asc-ui';
import { FormEvent, ReactNode } from 'react';
import styled from 'styled-components';
import {
  DatasetCategory,
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
} from '../../../../universal/config';
import { filterActiveDatasets } from '../MyArea.hooks';

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

const StyledCheckbox = styled(Checkbox)`
  padding-left: 0;
  > input {
    left: 0;
  }
`;

const StyledLabel = styled(Label)<{ isDimmed?: boolean }>`
  display: flex;
  align-items: center;
  opacity: ${(props) => (props.isDimmed ? '0.5' : 1)};
  font-weight: ${(props) => (props.isDimmed ? 'normal' : '500')};
  > span {
    display: flex;
    align-items: center;
    > small {
      display: inline-block;
      margin-top: 2px;
      margin-left: 4px;
    }
  }
`;

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
    <StyledLabel htmlFor={id} label={label} isDimmed={isDimmed}>
      <StyledCheckbox
        id={id}
        checked={isChecked}
        indeterminate={isIndeterminate}
        onChange={onChange}
      />
    </StyledLabel>
  );
}
