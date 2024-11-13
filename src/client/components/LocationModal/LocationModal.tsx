import { ReactNode, useEffect, useState } from 'react';

import { Link } from '@amsterdam/design-system-react';
import { LatLngLiteral } from 'leaflet';

import styles from './LocationModal.module.scss';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  LOCATION_ZOOM,
} from '../../../universal/config/myarea-datasets';
import {
  extractAddress,
  getLatLngWithAddress,
  getLatLonByAddress,
  isLocatedInWeesp,
  LatLngWithAddress,
} from '../../../universal/helpers/bag';
import { BAGSearchResult, BAGSourceData } from '../../../universal/types/bag';
import { Modal } from '../../components';
import { BaseLayerType } from '../../components/MyArea/Map/BaseLayerToggle';
import MyAreaLoader from '../../components/MyArea/MyAreaLoader';
import { trackPageView } from '../../hooks/analytics.hook';
import { useDataApi } from '../../hooks/api/useDataApi';
import { MapLocationMarker } from '../MyArea/MyArea.hooks';

function transformBagSearchResultsResponse(
  response: BAGSourceData,
  querySearchAddress: string,
  isWeesp: boolean
): LatLngWithAddress[] | null {
  const results = response?.results ?? [];

  // Try to get exact match
  const latlng = getLatLonByAddress(results, querySearchAddress, isWeesp);
  if (latlng && results.length === 1) {
    return [latlng];
  }

  // No exact match, return all results
  if (results.length) {
    return results.map((result: BAGSearchResult) =>
      getLatLngWithAddress(result)
    );
  }

  // No results
  return null;
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
  // Custom tracking url
  trackPageViewUrl?: string;
  // Custom tracking title
  trackPageViewTitle?: string;
  children?: ReactNode;
}

export function LocationModal({
  // Addres
  address = null,
  latlng,
  modalTitle,
  label,
  trackPageViewUrl,
  trackPageViewTitle,
  children,
}: LocationModalProps) {
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [hasLocationData, setHasLocationData] = useState(false);
  const [bagApi, fetchBag] = useDataApi<LatLngWithAddress[] | null>(
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
    if (address || latlng) {
      setHasLocationData(true);
    }
  }, [bagApi, address, latlng]);

  useEffect(() => {
    if (bagApi.isDirty || address === null) {
      return;
    }
    if (isLocationModalOpen) {
      const querySearchAddress = extractAddress(address);
      const isWeesp = isLocatedInWeesp(address);

      // Updates bagApi state
      fetchBag({
        url: `https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=${querySearchAddress}`,
        transformResponse(responseData: BAGSourceData) {
          const latlngResults = transformBagSearchResultsResponse(
            responseData,
            querySearchAddress,
            isWeesp
          );

          return latlngResults;
        },
      });
    }
  }, [
    isLocationModalOpen,
    address,
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

  const latlngFromBagSearch = bagApi.data?.[0];

  const centerMarker: MapLocationMarker = {
    latlng: latlng ??
      latlngFromBagSearch ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
    label: label ?? address ?? `${latlng?.lat},${latlng?.lng}`,
  };

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
          onClose={() => {
            setLocationModalOpen(false);
          }}
          title={
            modalTitle ?? label ?? latlngFromBagSearch?.address ?? 'Locatie'
          }
        >
          <div className={styles.LocationModalInner}>
            {bagApi.isLoading && <p>Het adres wordt opgezocht..</p>}
            {hasLocationData ? (
              <MyAreaLoader
                showPanels={false}
                zoom={LOCATION_ZOOM}
                datasetIds={[]}
                activeBaseLayerType={BaseLayerType.Aerial}
                centerMarker={centerMarker}
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
