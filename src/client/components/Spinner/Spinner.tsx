import styles from './Spinner.module.scss';
import { IconSpinner } from '../../assets/icons/index.tsx';

interface SpinnerProps {
  width?: number;
  height?: number;
}

const DEFAULT_WIDTH = 14;
const DEFAULT_HEIGHT = 14;
export function Spinner({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}: SpinnerProps) {
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
