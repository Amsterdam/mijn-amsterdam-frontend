import { LatLngLiteral } from 'leaflet';
import { BAGData } from '../../../server/services';
import { ThemaTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress, isLoading } from '../../../universal/helpers';
import iconUrlCommercialSecondary from '../../assets/icons/map/homeSecondaryCommercial.svg';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { FitBounds } from './FitBounds';
import BaseLayer from './Map/BaseLayer';
import Map from './Map/Map';
import styles from './MyAreaDashboard.module.scss';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { CustomLatLonMarker, HomeIconMarker } from './MyAreaMarker';

export default function MyAreaDashboard() {
  const { MY_LOCATION } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const locations = (MY_LOCATION.content || []).filter(
    (location: BAGData | null): location is BAGData => !!location?.latlng
  );
  const [primaryLocation, ...secondaryLocations] = locations;
  let center: LatLngLiteral | undefined =
    primaryLocation?.latlng || DEFAULT_MAP_OPTIONS.center;

  return (
    <Map
      className={styles.DashboardMap}
      fullScreen={true}
      aria-label={`Kaart van ${termReplace(ThemaTitles.BUURT).toLowerCase()}`}
      options={{
        ...DEFAULT_MAP_OPTIONS,
        zoom: HOOD_ZOOM,
        center,
      }}
    >
      <BaseLayer />
      {!!primaryLocation?.address && center && (
        <HomeIconMarker
          label={
            primaryLocation?.address
              ? getFullAddress(primaryLocation.address, true)
              : ''
          }
          center={center}
          zoom={HOOD_ZOOM}
          autCenterOnLocationChange={true}
        />
      )}
      {!!secondaryLocations?.length &&
        secondaryLocations.map(
          (location) =>
            !!location?.latlng && (
              <CustomLatLonMarker
                key={location?.latlng.lat + location?.latlng.lng}
                label={
                  location?.address
                    ? getFullAddress(location.address, true)
                    : ''
                }
                center={location.latlng}
                zoom={HOOD_ZOOM}
                iconUrl={iconUrlCommercialSecondary}
              />
            )
        )}
      {!primaryLocation?.latlng && isLoading(MY_LOCATION) && (
        <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
      )}
      {!!secondaryLocations?.length && (
        <FitBounds
          latlngs={locations
            .map((location) => location?.latlng)
            .filter(
              (latlng: LatLngLiteral | null): latlng is LatLngLiteral =>
                !!latlng
            )}
        />
      )}
    </Map>
  );
}
