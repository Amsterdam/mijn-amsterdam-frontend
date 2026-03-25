import { type MapProps, Map } from '@amsterdam/react-maps';
import 'leaflet/dist/leaflet.css';
import classnames from 'classnames';

import styles from '../MyArea.module.scss';

export interface MaMapProps extends MapProps {
  fullScreen?: boolean;
  children: any;
  className?: any;
}

export default function MaMap({
  children,
  options,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fullScreen,
  className,
  ...otherProps
}: MaMapProps) {
  return (
    <Map
      options={options}
      {...otherProps}
      className={classnames(styles.Map, className)}
    >
      {children}
    </Map>
  );
}
