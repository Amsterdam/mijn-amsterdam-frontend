import type { ChangeEvent, HTMLAttributes } from 'react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import classnames from 'classnames';

import { IconCheckmark, IconIndeterminate } from '../../assets/icons/index.tsx';
import styles from './Checkbox.module.scss';

type CheckboxProps = {
  checked?: boolean;
  disabled?: boolean;
  error?: boolean;
  indeterminate?: boolean;
  className?: string;
};

export const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps & HTMLAttributes<HTMLInputElement>
>(
  (
    {
      checked: checkedProp,
      className,
      onChange,
      disabled,
      indeterminate,
      ...otherProps
    },
    externalRef
  ) => {
    const [checked, setChecked] = useState(!!checkedProp);
    const ref = useRef<HTMLInputElement>(null);

    useImperativeHandle(externalRef, () => ref.current as HTMLInputElement);

    useEffect(() => {
      if (ref.current) {
        ref.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    // Make the label aware of changes in the checked state

    // Make the component aware of changes in the checked prop
    useMemo(() => {
      setChecked(!!checkedProp);
    }, [checkedProp]);

    return (
      <span
        className={classnames(styles.CheckboxWrapperStyle, className)}
        aria-disabled={disabled}
      >
        <span
          className={classnames(
            styles.CheckboxIcon,
            (checked || indeterminate) && styles.Checked
          )}
        >
          {!checked && indeterminate && <IconIndeterminate />}
          {checked && <IconCheckmark />}
        </span>
        <input
          type="checkbox"
          className={classnames(
            styles.CheckboxInput,
            (checked || indeterminate) && styles.Checked
          )}
          {...{ ...otherProps, disabled, ref, checked }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
              onChange(e);
            }
            if (typeof checkedProp === 'undefined') {
              setChecked(!checked);
            }
          }}
        />
      </span>
    );
  }
);

Checkbox.displayName = 'Checkbox';
