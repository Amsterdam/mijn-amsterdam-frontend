import { Spinner as SpinnerIcon } from '@amsterdam/asc-assets';
import { FunctionComponent } from 'react';
import styles from './Spinner.module.scss';

export type SpinnerProps = {
  color?: string;
  size?: number;
};

const Spinner: FunctionComponent<SpinnerProps> = ({ color, ...otherProps }) => (
  <div className={styles.SpinnerStyle} {...otherProps}>
    <div className={styles.Icon}>
      <SpinnerIcon />
    </div>
  </div>
);

Spinner.defaultProps = {
  size: 20,
};

export default Spinner;
