import {
  Map as ReactMap,
  MapProps as ReactMapProps,
} from '@amsterdam/react-maps';
import styles from '../MyArea.module.scss';

export interface MapProps extends ReactMapProps {
  fullScreen?: boolean;
  children: any;
}

export default function Map({
  children,
  options,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fullScreen,
  ...otherProps
}: MapProps) {
  return (
    <ReactMap options={options} {...otherProps} className={styles.Map}>
      {children}
    </ReactMap>
  );
}
