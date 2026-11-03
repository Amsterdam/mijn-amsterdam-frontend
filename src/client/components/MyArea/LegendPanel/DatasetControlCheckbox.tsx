import type { FormEvent, ReactNode } from 'react';

import classnames from 'classnames';

import { Checkbox } from '../../Checkbox/Checkbox.tsx';
import styles from './PanelComponent.module.scss';

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
