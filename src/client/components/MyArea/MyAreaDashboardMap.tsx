import BaseLayer from './Map/BaseLayer';
import Map from './Map/Map';
import { LatLngLiteral } from 'leaflet';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress, isLoading } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { HomeIconMarker } from './MyAreaMarker';
import styles from './MyAreaDashboard.module.scss';

export default function MyAreaDashboard() {
  const { MY_LOCATION } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const center =
    MY_LOCATION.content?.latlng ||
    (DEFAULT_MAP_OPTIONS.center as LatLngLiteral);
  return (
    <Map
      className={styles.DashboardMap}
      fullScreen={true}
      aria-label={`Kaart van ${termReplace(ChapterTitles.BUURT).toLowerCase()}`}
      options={{
        ...DEFAULT_MAP_OPTIONS,
        zoom: HOOD_ZOOM,
        center,
      }}
    >
      <BaseLayer />
      {!!MY_LOCATION.content?.address && center && (
        <HomeIconMarker
          label={
            MY_LOCATION.content?.address
              ? getFullAddress(MY_LOCATION.content.address, true)
              : ''
          }
          center={center}
          zoom={HOOD_ZOOM}
        />
      )}
      {!MY_LOCATION.content?.latlng && isLoading(MY_LOCATION) && (
        <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
      )}
    </Map>
  );
}
