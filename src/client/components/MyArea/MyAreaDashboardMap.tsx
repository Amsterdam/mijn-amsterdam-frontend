import type { LatLngLiteral } from 'leaflet';

import { FitBounds } from './FitBounds.tsx';
import BaseLayer from './Map/BaseLayer.tsx';
import Map from './Map/Map.tsx';
import styles from './MyAreaDashboard.module.scss';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator.tsx';
import { CustomLatLonMarker, HomeIconMarker } from './MyAreaMarker.tsx';
import type { BAGLocation } from '../../../server/services/bag/bag.types.ts';
import { HOOD_ZOOM } from '../../../universal/config/myarea-datasets.ts';
import { isLoading } from '../../../universal/helpers/api.ts';
import { getFullAddress } from '../../../universal/helpers/brp.ts';
import iconUrlCommercialSecondary from '../../assets/icons/map/homeSecondaryCommercial.svg';
import { DEFAULT_MAP_OPTIONS } from '../../config/map.ts';
import { useAppStateGetter } from '../../hooks/useAppStateStore.ts';

export function MyAreaDashboardMap() {
  const { MY_LOCATION } = useAppStateGetter();
  const locations = (MY_LOCATION.content || []).filter(
    (location: BAGLocation | null): location is BAGLocation =>
      !!location?.latlng
  );
  const [primaryLocation, ...secondaryLocations] = locations;
  const center: LatLngLiteral | undefined =
    primaryLocation?.latlng || DEFAULT_MAP_OPTIONS.center;

  return (
    <Map
      className={styles.DashboardMap}
      fullScreen={true}
      aria-label="Kaart van de buurt"
      options={{
        ...DEFAULT_MAP_OPTIONS,
        zoom: HOOD_ZOOM,
        center,
      }}
    >
      <BaseLayer />
      {!!primaryLocation?.title && center && (
        <HomeIconMarker
          label={
            primaryLocation.title ||
            (primaryLocation.address
              ? getFullAddress(primaryLocation.address, true)
              : '')
          }
          center={center}
          zoom={HOOD_ZOOM}
          autCenterOnLocationChange={true}
        />
      )}
      {!!secondaryLocations?.length &&
        secondaryLocations.map(
          (location) =>
            !!location.latlng && (
              <CustomLatLonMarker
                key={location.latlng.lat + location.latlng.lng}
                label={
                  location.title ||
                  (location.address
                    ? getFullAddress(location.address, true)
                    : '')
                }
                center={location.latlng}
                zoom={HOOD_ZOOM}
                iconUrl={iconUrlCommercialSecondary}
              />
            )
        )}
      {isLoading(MY_LOCATION) && (
        <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
      )}
      {!!secondaryLocations?.length && (
        <FitBounds
          latlngs={locations
            .map((location) => location.latlng)
            .filter(
              (latlng: LatLngLiteral | null): latlng is LatLngLiteral =>
                !!latlng
            )}
        />
      )}
    </Map>
  );
}

export default MyAreaDashboardMap;
