import { Checkmark, Indeterminate } from '@amsterdam/asc-assets';
import classnames from 'classnames';
import {
  ChangeEvent,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './Checkbox.module.scss';

type Props = {
  checked?: boolean;
  disabled?: boolean;
  error?: boolean;
  indeterminate?: boolean;
};

const Checkbox = forwardRef<
  HTMLInputElement,
  Props & HTMLAttributes<HTMLInputElement>
>(
  (
    {
      checked: checkedProp,
      className,
      onChange,
      disabled,
      error,
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
    }, [ref, indeterminate]);

    // Make the label aware of changes in the checked state

    // Make the component aware of changes in the checked prop
    useMemo(() => {
      setChecked(!!checkedProp);
    }, [checkedProp, setChecked]);

    return (
      <span
        className={styles.CheckboxWrapperStyle}
        {...{ className, disabled, checked, error }}
        aria-disabled={disabled}
      >
        <span
          className={classnames(
            styles.CheckboxIcon,
            (checked || indeterminate) && styles.Checked
          )}
          {...{ disabled, checked, error, indeterminate }}
        >
          {!checked && indeterminate && <Indeterminate />}
          {checked && <Checkmark />}
        </span>
        <input
          type="checkbox"
          className={classnames(
            styles.CheckboxInput,
            (checked || indeterminate) && styles.Checked
          )}
          {...{ ...otherProps, disabled, checked, ref }}
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

export default Checkbox;
