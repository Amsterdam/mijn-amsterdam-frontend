import { Link } from '@amsterdam/design-system-react';
import { LatLngLiteral } from 'leaflet';
import { ReactNode, useEffect, useState } from 'react';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  LOCATION_ZOOM,
} from '../../../universal/config/myarea-datasets';
import {
  extractAddress,
  getLatLonByAddress,
  isLocatedInWeesp,
} from '../../../universal/helpers/bag';
import { Modal } from '../../components';
import { BaseLayerType } from '../../components/MyArea/Map/BaseLayerToggle';
import MyAreaLoader from '../../components/MyArea/MyAreaLoader';
import { trackPageView } from '../../hooks/analytics.hook';
import { useDataApi } from '../../hooks/api/useDataApi';
import styles from './LocationModal.module.scss';

export interface LocationModalProps {
  // The address for determining latlng
  location?: string | null;
  // Label for InfoDetail
  label?: string;
  // Title of the Modal
  modalTitle?: string;
  // Explicit latlng
  latlng?: LatLngLiteral;
  // Custom tracking url
  trackPageViewUrl?: string;
  // Custom tracking title
  trackPageViewTitle?: string;
  children?: ReactNode;
}

export function LocationModal({
  // Addres
  location = null,
  latlng,
  modalTitle,
  label,
  trackPageViewUrl,
  trackPageViewTitle,
  children,
}: LocationModalProps) {
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [hasLocationData, setHasLocationData] = useState(false);
  const [bagApi, fetchBag] = useDataApi<LatLngLiteral | null>(
    {
      url: '',
      postpone: true,
      headers: {
        'X-Api-Key': import.meta.env.REACT_APP_DATA_AMSTERDAM_API_KEY,
      },
    },
    null
  );

  useEffect(() => {
    if (!!location || !!latlng) {
      setHasLocationData(true);
    }
  }, [bagApi, location, latlng]);

  useEffect(() => {
    if (bagApi.isDirty || location === null) {
      return;
    }
    if (isLocationModalOpen) {
      const address = extractAddress(location);
      const isWeesp = isLocatedInWeesp(location);

      fetchBag({
        url: `https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=${address}`,
        transformResponse: (response) =>
          getLatLonByAddress(response?.results, address, isWeesp),
      });
    }
  }, [
    isLocationModalOpen,
    location,
    fetchBag,
    bagApi.isDirty,
    trackPageViewTitle,
    trackPageViewUrl,
  ]);

  useEffect(() => {
    if (isLocationModalOpen && trackPageViewTitle && trackPageViewUrl) {
      trackPageView(trackPageViewUrl);
    }
  }, [isLocationModalOpen, trackPageViewTitle, trackPageViewUrl]);

  return (
    <>
      {hasLocationData ? (
        <Link
          className={styles.LocationModalLink}
          variant="inline"
          onClick={() => setLocationModalOpen(true)}
        >
          {children ?? 'Bekijk op de kaart'}
        </Link>
      ) : null}
      {hasLocationData && (
        <Modal
          isOpen={isLocationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          title={modalTitle ?? label ?? 'Locatie'}
          contentWidth="62rem"
        >
          <div className={styles.LocationModalInner}>
            {bagApi.isLoading && <p>Het adres wordt opgezocht..</p>}
            {hasLocationData ? (
              <MyAreaLoader
                showPanels={false}
                zoom={LOCATION_ZOOM}
                datasetIds={[]}
                activeBaseLayerType={BaseLayerType.Aerial}
                centerMarker={{
                  latlng: latlng ??
                    bagApi.data ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
                  label: label ?? location ?? `${latlng?.lat},${latlng?.lng}`,
                }}
              />
            ) : (
              <p>Adres kan niet getoond worden</p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
