import { LatLngLiteral } from 'leaflet';
import { useEffect, useState } from 'react';
import { LOCATION_ZOOM } from '../../../universal/config';
import { Button, InfoDetail, Modal } from '../../components';
import { BaseLayerType } from '../../components/MyArea/Map/BaseLayerToggle';
import MyAreaLoader from '../../components/MyArea/MyAreaLoader';
import { useDataApi } from '../../hooks/api/useDataApi';
import styles from './VergunningDetail.module.scss';

interface LocationProps {
  location: string | null;
  label?: string;
}

export function Location({ location, label = 'Locatie' }: LocationProps) {
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  const [bagApi, fetchBag] = useDataApi<LatLngLiteral | null>(
    {
      url: '',
      postpone: true,
    },
    null
  );

  useEffect(() => {
    if (bagApi.isDirty || location === null) {
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
          if (result1 && result1.adres && result1.centroid) {
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
        label={label}
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
          title="Vergunningslocatie"
          contentWidth="62rem"
        >
          <div className={styles.LocationModalInner}>
            {bagApi.isLoading && <p>Het adres wordt opgezocht..</p>}
            {!bagApi.isError && !!bagApi.data ? (
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
