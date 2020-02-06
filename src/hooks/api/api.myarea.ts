import {
  Centroid,
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_ZOOM,
  LAYERS_CONFIG,
  LOCATION_ZOOM,
  MAP_URL,
} from 'config/Map.constants';
import { getApiUrl } from 'helpers/App';
import { usePhoneScreen } from 'hooks/media.hook';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CENTROID } from '../../config/Map.constants';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

export const BAG_SEARCH_ENDPOINT_URL = `${getApiUrl('BAG')}?q=`;
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
  centroid: Centroid;
}> & {
  refetch: (address: string) => void;
};

export default function useMyArea(address?: string): MyAreaApiState {
  const [api, refetch] = useBagSearch(address);
  const { data, isDirty } = api;
  const [urls, setUrls] = useState({ simple: '', advanced: '' });
  const [centroid, setCentroid] = useState<Centroid>(DEFAULT_CENTROID);
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
