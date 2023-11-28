import { LatLngLiteral } from 'leaflet';
import { useEffect, useState } from 'react';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  LOCATION_ZOOM,
} from '../../../universal/config';
import {
  extractAddress,
  getLatLonByAddress,
  isLocatedInWeesp,
} from '../../../universal/helpers/bag';
import { Button, InfoDetail, Modal } from '../../components';
import { BaseLayerType } from '../../components/MyArea/Map/BaseLayerToggle';
import MyAreaLoader from '../../components/MyArea/MyAreaLoader';
import { useDataApi } from '../../hooks/api/useDataApi';
import styles from './VergunningDetail.module.scss';
import { trackPageView } from '../../hooks';

interface LocationProps {
  // The address for determining latlng
  location?: string | null;
  // Label for InfoDetail
  label?: string;
  // Title of the Modal
  modalTitle?: string;
  // Text content above the "Modal open" link
  text?: string;
  // Explicit latlng
  latlng?: LatLngLiteral;
  // Custom tracking url
  trackPageViewUrl?: string;
  // Custom tracking title
  trackPageViewTitle?: string;
}

export function Location({
  // Addres
  location = null,
  latlng,
  modalTitle,
  text,
  label,
  trackPageViewUrl,
  trackPageViewTitle,
}: LocationProps) {
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [hasLocationData, setHasLocationData] = useState(false);
  const [bagApi, fetchBag] = useDataApi<LatLngLiteral | null>(
    {
      url: '',
      postpone: true,
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
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
      <InfoDetail
        className={styles.LocationInfo}
        label={label ?? 'Locatie'}
        value={
          <>
            {hasLocationData ? (
              <>
                {!!text && <>{text}</>}
                {!text && !!location && <>{location}</>}
                <Button
                  className={styles.MapLink}
                  variant="inline"
                  lean={true}
                  onClick={() => setLocationModalOpen(true)}
                >
                  Bekijk op de kaart
                </Button>
              </>
            ) : (
              '-'
            )}
          </>
        }
      />

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
    </>
  );
}
