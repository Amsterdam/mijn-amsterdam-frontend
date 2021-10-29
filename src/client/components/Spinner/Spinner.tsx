import { IconSpinner } from '../../assets/icons';
import styles from './Spinner.module.scss';

interface SpinnerProps {
  width?: number;
  height?: number;
}

export function Spinner({ width = 14, height = 14 }: SpinnerProps) {
  const style = {
    width: width + 'px',
    height: height + 'px',
  };
  return (
    <span aria-hidden="true" className={styles.Spinner} style={style}>
      <IconSpinner
        className={styles.SpinningIcon}
        aria-hidden="true"
        width={width}
        height={height}
      />
    </span>
  );
}
