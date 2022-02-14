import { LatLngLiteral } from 'leaflet';
import { useEffect, useState } from 'react';
import { getOtapEnvItem, LOCATION_ZOOM } from '../../../universal/config';
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
      const address = extractAddress(location);
      const isWeesp = isLocatedInWeesp(location);
      fetchBag({
        url: `${getOtapEnvItem('bagUrl')}${address}`,
        transformResponse: (response) =>
          getLatLonByAddress(response?.results, address, isWeesp),
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
