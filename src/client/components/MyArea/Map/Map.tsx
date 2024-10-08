import {
  Map as ReactMap,
  MapProps as ReactMapProps,
} from '@amsterdam/react-maps';

import 'leaflet/dist/leaflet.css';
import classnames from 'classnames';

import styles from '../MyArea.module.scss';

export interface MapProps extends ReactMapProps {
  fullScreen?: boolean;
  children: any;
  className?: any;
}

export default function Map({
  children,
  options,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fullScreen,
  className,
  ...otherProps
}: MapProps) {
  return (
    <ReactMap
      options={options}
      {...otherProps}
      className={classnames(styles.Map, className)}
    >
      {children}
    </ReactMap>
  );
}
