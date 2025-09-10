import { ReactNode, useEffect, useMemo, useState } from 'react';

import { Button, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { LatLngLiteral } from 'leaflet';

import styles from './LocationModal.module.scss';
import {
  BAGAdreseerbaarObject,
  BAGQueryParams,
  BAGSourceData,
} from '../../../server/services/bag/bag.types';
import { LOCATION_ZOOM } from '../../../universal/config/myarea-datasets';
import {
  extractAddressParts,
  getLatLngWithAddress,
  getLatLonByAddress,
  isLocatedInWeesp,
  LatLngWithAddress,
} from '../../../universal/helpers/bag';
import { BaseLayerType } from '../../components/MyArea/Map/BaseLayerToggle';
import { MyAreaLoader } from '../../components/MyArea/MyAreaLoader';
import { createApiHook } from '../../hooks/api/useDataApi-v2';
import { Modal } from '../Modal/Modal';
import { MapLocationMarker } from '../MyArea/MyArea.hooks';

export const BAG_ADRESSEERBARE_OBJECTEN_URL =
  'https://api.data.amsterdam.nl/v1/benkagg/adresseerbareobjecten/';

function transformBagSearchResultsResponse(
  response: BAGSourceData,
  querySearchAddress: BAGQueryParams,
  isWeesp: boolean
): LatLngWithAddress[] {
  const adresseerbareObjecten = response?._embedded.adresseerbareobjecten ?? [];

  // Try to get exact match
  const latlngWithAddress = getLatLonByAddress(
    adresseerbareObjecten,
    querySearchAddress,
    isWeesp
  );

  if (latlngWithAddress && adresseerbareObjecten.length === 1) {
    return [latlngWithAddress];
  }

  // No exact match, return all results
  if (adresseerbareObjecten.length) {
    return adresseerbareObjecten.map((result: BAGAdreseerbaarObject) =>
      getLatLngWithAddress(result)
    );
  }

  // No results
  return [];
}

export interface LocationModalProps {
  // The address for determining latlng
  address?: string | null;
  // Label for InfoDetail
  label?: string;
  // Title of the Modal
  modalTitle?: string;
  // Explicit latlng
  latlng?: LatLngLiteral;
  children?: ReactNode;
}

const useBagApi = createApiHook<BAGSourceData>({
  init: {
    headers: {
      'X-Api-Key': import.meta.env.REACT_APP_DATA_AMSTERDAM_API_KEY,
    },
  },
});

export function LocationModal({
  // Addres
  address = null,
  latlng,
  modalTitle,
  label,
  children,
}: LocationModalProps) {
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const hasLocationData = !!(address || latlng);
  const bagApi = useBagApi();
  const querySearchAddress = useMemo(
    () => (address ? extractAddressParts(address) : null),
    [address]
  );

  const isWeesp = address ? isLocatedInWeesp(address) : false;

  const latlngResults =
    bagApi.data?.content && querySearchAddress
      ? transformBagSearchResultsResponse(
          bagApi.data.content,
          querySearchAddress,
          isWeesp
        )
      : [];
  const latlngFromBagSearch = latlngResults[0];
  const latlngFound = latlng ?? latlngFromBagSearch;

  const centerMarker: MapLocationMarker | null = latlngFound
    ? {
        latlng: latlngFound,
        label: label ?? address ?? `${latlng?.lat},${latlng?.lng}`,
      }
    : null;

  const hasLocationDataAndCenterMarker = hasLocationData && centerMarker;

  useEffect(() => {
    if (!bagApi.isPristine || querySearchAddress === null) {
      return;
    }
    if (isLocationModalOpen) {
      const { openbareruimteNaam, huisnummer, postcode } = querySearchAddress;

      if (!(huisnummer && (openbareruimteNaam || postcode))) {
        return;
      }

      const bagApiUrl = new URL(BAG_ADRESSEERBARE_OBJECTEN_URL);
      const params = new URLSearchParams(querySearchAddress);
      bagApiUrl.search = params.toString();

      bagApi.fetch(bagApiUrl);
    }
  }, [isLocationModalOpen, querySearchAddress, bagApi.isPristine]);

  return (
    hasLocationData && (
      <>
        <Button
          className={styles.LocationModalLink}
          variant="secondary"
          onClick={() => setLocationModalOpen(true)}
        >
          {children ?? 'Bekijk op de kaart'}
        </Button>
        <Modal
          isOpen={isLocationModalOpen}
          pollingQuerySelector="#map-zoom"
          giveUpOnReadyPollingAfterMs={5000}
          onClose={() => {
            setLocationModalOpen(false);
          }}
          title={
            modalTitle ?? label ?? latlngFromBagSearch?.address ?? 'Locatie'
          }
        >
          <div className={styles.LocationModalInner}>
            {bagApi.isLoading && (
              <Paragraph>Het adres wordt opgezocht..</Paragraph>
            )}
            {hasLocationDataAndCenterMarker && (
              <MyAreaLoader
                showPanels={false}
                zoom={LOCATION_ZOOM}
                datasetIds={[]}
                activeBaseLayerType={BaseLayerType.Aerial}
                centerMarker={centerMarker}
                showHomeLocationMarker={false}
                showSecondaryLocationMarkers={false}
              />
            )}
            {!bagApi.isLoading && !hasLocationDataAndCenterMarker && (
              <Paragraph>
                Het adres{address ? ` ${address}` : null} kan niet getoond
                worden op de kaart.
              </Paragraph>
            )}
          </div>
        </Modal>
      </>
    )
  );
}

export interface AddressDisplayAndModalProps {
  address: string;
  label?: string;
}

export function AddressDisplayAndModal({
  address,
  label,
}: AddressDisplayAndModalProps) {
  return (
    <>
      <span className={classNames(styles.Address, 'ams-mb-s')}>
        {label ?? address}
      </span>
      <LocationModal address={address} label={label ?? address} />
    </>
  );
}
