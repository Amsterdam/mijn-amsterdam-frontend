import { useEffect, useMemo } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import type { LatLngLiteral } from 'leaflet';

import styles from './LocationModal.module.scss';
import type {
  BAGAdreseerbaarObject,
  BAGQueryParams,
  BAGSourceData,
} from '../../../server/services/bag/bag.types.ts';
import { LOCATION_ZOOM } from '../../../universal/config/myarea-datasets.ts';
import type { LatLngWithAddress } from '../../../universal/helpers/bag.ts';
import {
  extractAddressParts,
  getLatLngWithAddress,
  getLatLonByAddress,
  isLocatedInWeesp,
} from '../../../universal/helpers/bag.ts';
import { useBffApi } from '../../hooks/api/useBffApi.ts';
import { ModalAndButton } from '../Modal/Modal.tsx';
import { BaseLayerType } from '../MyArea/Map/BaseLayerToggle.tsx';
import type { MapLocationMarker } from '../MyArea/MyArea.hooks.ts';
import { MyAreaLoader } from '../MyArea/MyAreaLoader.tsx';

const BAG_ADRESSEERBARE_OBJECTEN_URL =
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

type LocationMapProps = {
  address: string | null;
  latlng?: LatLngLiteral;
  markerLabel: string;
};

function LocationMap({ address, latlng, markerLabel }: LocationMapProps) {
  const bagApi = useBffApi<BAGSourceData>(
    address ? `${BAG_ADRESSEERBARE_OBJECTEN_URL}?address=${address}` : null,
    {
      init: {
        headers: {
          'X-Api-Key': import.meta.env.REACT_APP_DATA_AMSTERDAM_API_KEY,
        },
      },
      fetchImmediately: false,
    }
  );
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
        label: markerLabel ?? address ?? `${latlng?.lat},${latlng?.lng}`,
      }
    : null;

  const hasLocationDataAndCenterMarker = !!centerMarker;

  useEffect(() => {
    if (bagApi.isDirty || bagApi.isLoading || querySearchAddress === null) {
      return;
    }
    const { openbareruimteNaam, huisnummer, postcode } = querySearchAddress;

    if (!(huisnummer && (openbareruimteNaam || postcode))) {
      return;
    }

    const bagApiUrl = new URL(BAG_ADRESSEERBARE_OBJECTEN_URL);
    const params = new URLSearchParams(querySearchAddress);
    bagApiUrl.search = params.toString();

    bagApi.fetch(bagApiUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Exclude some dependencies to prevent unwanted re-fetches
  }, [querySearchAddress, bagApi.isDirty, bagApi.isLoading]);

  return (
    <>
      {bagApi.isLoading && <Paragraph>Het adres wordt opgezocht..</Paragraph>}
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
          Het adres{address ? ` ${address}` : null} kan niet getoond worden op
          de kaart.
        </Paragraph>
      )}
    </>
  );
}

export interface LocationModalProps {
  // The address for determining latlng
  address?: string | null;
  // Label for InfoDetail
  label?: string;
  buttonLabel?: string;
  // Title of the Modal
  modalTitle?: string;
  // Explicit latlng
  latlng?: LatLngLiteral;
  buttonClassName?: string;
  buttonVariant?: 'primary' | 'secondary' | 'tertiary' | 'ma-link-like';
}

export function LocationModal({
  address = null,
  latlng,
  modalTitle,
  label,
  buttonLabel = 'Bekijk op de kaart',
  buttonClassName = '',
  buttonVariant = 'secondary',
}: LocationModalProps) {
  const hasLocationData = !!(address || latlng);
  const title = modalTitle ?? label ?? address ?? 'Locatie';
  const modalProps = useMemo(() => {
    return {
      pollingQuerySelector: '#map-zoom',
      giveUpOnReadyPollingAfterMs: 5000,
      title,
    };
  }, [title]);
  return (
    hasLocationData && (
      <>
        <ModalAndButton
          buttonClassName={classNames(
            styles.LocationModalLink,
            buttonClassName
          )}
          buttonVariant={buttonVariant}
          buttonLabel={buttonLabel}
          modal={modalProps}
        >
          <div className={styles.LocationModalInner}>
            <LocationMap
              address={address}
              latlng={latlng}
              markerLabel={title}
            />
          </div>
        </ModalAndButton>
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
