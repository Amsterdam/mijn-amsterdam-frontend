import { getApiUrl } from 'helpers/App';
import { Centroid } from 'helpers/geo';
import { usePhoneScreen } from 'hooks/media.hook';
import { useCallback, useEffect, useState } from 'react';
import { useDataApi } from './api.hook';

export const BAG_SEARCH_ENDPOINT_URL = `${getApiUrl('BAG')}?q=`;
export const MAP_URL = process.env.REACT_APP_EMBED_MAP_URL;
export const DEFAULT_LAT = 52.3717228;
export const DEFAULT_LON = 4.8927377;
export const DEFAULT_ZOOM = 8;
export const LOCATION_ZOOM = 14;
export const LAYERS_CONFIG =
  'lagen=overig%3A1%7Cverreg%3A1%7Cverbes%3A1%7Cterras%3A1%7Csplits%3A1%7Cspeela%3A1%7Crectif%3A1%7Coptijd%3A1%7Conttre%3A1%7Comgver%3A1%7Cmeldin%3A1%7Cmedede%3A1%7Cligpla%3A1%7Ckapver%3A1%7Cinspra%3A1%7Cexploi%3A1%7Cevever%3A1%7Cdrahor%3A1%7Cbespla%3A1%7Cwlokca%3A1%7Cwlotxtl%3A1%7Cwlopls%3A1%7Cwlogls%3A1%7Cwloppr%3A1%7Cwlorst%3A1%7Ctcevt%3A1%7Cpvg%3A0%7Cuitzpvg%3A0';

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

export interface MyMapApiState {
  url: {
    advanced: string;
    simple: string;
  };
  centroid: Nullable<Centroid>;
  isDirty: boolean;
  isLoading: boolean;
  refetch: (address: string) => void;
}

export default function useMyMap(address?: string): MyMapApiState {
  const [{ data, isLoading, isDirty }, refetch] = useBagSearch(address);
  const [urls, setUrls] = useState({ simple: '', advanced: '' });
  const [centroid, setCentroid] = useState<Nullable<Centroid>>(null);
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

        setCentroid(locationCentroid);
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
