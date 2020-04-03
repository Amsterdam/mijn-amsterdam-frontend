import { ApiState, useDataApi } from './api.hook';
import { ApiUrls, DEFAULT_LAT, DEFAULT_LON } from '../../../universal/config';
import {
  DEFAULT_ZOOM,
  LAYERS_CONFIG,
  LOCATION_ZOOM,
  MAP_URL,
} from '../../components/MyArea/MyArea.constants';
import { useCallback, useEffect, useState } from 'react';

import { usePhoneScreen } from '../../hooks/media.hook';

export const BAG_SEARCH_ENDPOINT_URL = `${ApiUrls.BAG}?q=`;
const SET_DEFAULT_ADDRESS_TIMEOUT = 10000;

interface BagApiResult {
  results: Array<{ centroid: Centroid }>;
}

export function useBagSearch(address?: string) {
  return useDataApi<BagApiResult>(
    {
      url:
        BAG_SEARCH_ENDPOINT_URL + (address ? encodeURIComponent(address) : ''),
      postpone: !address,
    },
    { results: [] }
  );
}

export type MyAreaApiState = ApiState<{
  url: {
    advanced: string;
    simple: string;
  };
  centroid: Centroid | undefined;
}> & {
  refetch: (address: string) => void;
};

export default function useMyArea(address?: string): MyAreaApiState {
  const [api, refetch] = useBagSearch(address);
  const { data, isDirty } = api;
  const [urls, setUrls] = useState({ simple: '', advanced: '' });
  const [centroid, setCentroid] = useState<Centroid>();
  const [isDefaultMapLocation, setIsDefaultMapLocation] = useState(false);
  const showLegenda = !usePhoneScreen();

  const advancedUrl = urls.advanced;

  useEffect(() => {
    const locationCentroid = !!data?.results.length
      ? data.results[0].centroid
      : null;

    if (!advancedUrl && (isDirty || isDefaultMapLocation)) {
      if (!!locationCentroid && locationCentroid.length) {
        const [lon, lat] = locationCentroid;

        setUrls({
          advanced: `${MAP_URL}&center=${lat}%2C${lon}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lon}&marker-icon=home&${LAYERS_CONFIG}&legenda=${showLegenda}`,
          simple: `${MAP_URL}&center=${lat}%2C${lon}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lon}&marker-icon=home`,
        });

        setCentroid([lon, lat]);
      } else {
        setUrls({
          advanced: `${MAP_URL}&center=${DEFAULT_LAT}%2C${DEFAULT_LON}&zoom=${DEFAULT_ZOOM}`,
          simple: `${MAP_URL}&center=${DEFAULT_LAT}%2C${DEFAULT_LON}&zoom=${DEFAULT_ZOOM}`,
        });
      }
    }
  }, [isDefaultMapLocation, isDirty, showLegenda, advancedUrl, data]);

  const onMaxCount = useCallback(() => {
    if (!advancedUrl) {
      setIsDefaultMapLocation(true);
    }
  }, [advancedUrl, setIsDefaultMapLocation]);

  // Show default address after 5 seconds
  useEffect(() => {
    const to = setTimeout(() => {
      onMaxCount();
    }, SET_DEFAULT_ADDRESS_TIMEOUT);
    return () => clearTimeout(to);
  }, [onMaxCount]);

  const refetchCallback = useCallback(
    (address: string) => {
      refetch({ url: BAG_SEARCH_ENDPOINT_URL + encodeURIComponent(address) });
    },
    [refetch]
  );

  return {
    ...api,
    data: {
      url: urls,
      centroid,
    },
    refetch: refetchCallback,
  };
}
