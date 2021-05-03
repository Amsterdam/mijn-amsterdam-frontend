import { BaseLayerType } from '@amsterdam/arm-core/lib/components/BaseLayerToggle';
import { LatLngLiteral } from 'leaflet';
import { useState, useEffect } from 'react';
import { LOCATION_ZOOM } from '../../../universal/config';
import { Button, InfoDetail, Modal } from '../../components';
import MyAreaLoader from '../../components/MyArea/MyAreaLoader';
import { useDataApi } from '../../hooks/api/useDataApi';
import styles from './VergunningDetail.module.scss';

interface LocationProps {
  location: string;
}

export function Location({ location }: LocationProps) {
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  const [bagApi, fetchBag] = useDataApi<LatLngLiteral | null>(
    {
      url: '',
      postpone: true,
    },
    null
  );

  useEffect(() => {
    if (bagApi.isDirty) {
      return;
    }
    if (isLocationModalOpen) {
      const address = location
        .replace(/\sAmsterdam/gi, '')
        .replace(/([1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2})/i, '')
        .trim();
      fetchBag({
        url: `https://api.data.amsterdam.nl/atlas/search/adres/?q=${address}`,
        transformResponse: (response) => {
          const result1 = response?.results[0];
          if (
            result1 &&
            result1.adres.toLowerCase() === address.toLowerCase() &&
            result1.centroid
          ) {
            const [lng, lat] = result1.centroid;
            return { lat, lng };
          }
          return null;
        },
      });
    }
  }, [isLocationModalOpen, location, fetchBag, bagApi.isDirty]);

  return (
    <>
      <InfoDetail
        className={styles.LocationInfo}
        label="Locatie"
        value={
          <>
            {location || '-'}{' '}
            {location && (
              <>
                <Button
                  className={styles.MapLink}
                  variant="inline"
                  lean={true}
                  onClick={() => setLocationModalOpen(true)}
                >
                  Bekijk op de kaart
                </Button>
              </>
            )}
          </>
        }
      />
      {location && (
        <Modal
          isOpen={isLocationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          title={`Vergunningslocatie`}
          contentWidth={'62rem'}
        >
          {bagApi.isLoading && <p>Het adres wordt opgezocht..</p>}
          {!!bagApi.data ? (
            <MyAreaLoader
              showHeader={false}
              showPanels={false}
              zoom={LOCATION_ZOOM}
              datasetIds={[]}
              activeBaseLayerType={BaseLayerType.Aerial}
              centerMarker={{
                latlng: bagApi.data,
                label: location,
              }}
              height="40rem"
            />
          ) : (
            <p>Adres kan niet getoond worden</p>
          )}
        </Modal>
      )}
    </>
  );
}
