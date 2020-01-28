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
import { useDataApi } from './api.hook';

export const BAG_SEARCH_ENDPOINT_URL = `${getApiUrl('BAG')}?q=`;
const SET_DEFAULT_ADDRESS_TIMEOUT = 10000;

export function useBagSearch(address?: string) {
  return useDataApi({
    url: BAG_SEARCH_ENDPOINT_URL + (address ? encodeURIComponent(address) : ''),
    postpone: !address,
  });
}

export interface MyAreaApiState {
  url: {
    advanced: string;
    simple: string;
  };
  centroid: Centroid | null;
  isDirty: boolean;
  isLoading: boolean;
  refetch: (address: string) => void;
}

export default function useMyArea(address?: string): MyAreaApiState {
  const [{ data, isLoading, isDirty }, refetch] = useBagSearch(address);
  const [urls, setUrls] = useState({ simple: '', advanced: '' });
  const [centroid, setCentroid] = useState<Centroid | null>(null);
  const [isDefaultMapLocation, setIsDefaultMapLocation] = useState(false);
  const showLegenda = !usePhoneScreen();

  const advancedUrl = urls.advanced;

  useEffect(() => {
    const locationCentroid = !!(data && data.results && data.results.length)
      ? data.results[0].centroid
      : [];

    if (!advancedUrl && (isDirty || isDefaultMapLocation)) {
      if (!!locationCentroid.length) {
        const [lon, lat] = locationCentroid;

        setUrls({
          advanced: `${MAP_URL}&center=${lat}%2C${lon}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lon}&marker-icon=home&${LAYERS_CONFIG}&legenda=${showLegenda}`,
          simple: `${MAP_URL}&center=${lat}%2C${lon}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lon}&marker-icon=home`,
        });

        setCentroid([lat, lon]);
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
    url: urls,
    centroid,
    isDirty,
    isLoading,
    refetch: refetchCallback,
  };
}
