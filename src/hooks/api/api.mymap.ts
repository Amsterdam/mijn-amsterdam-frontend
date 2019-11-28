import { getApiUrl } from 'helpers/App';
import { usePhoneScreen } from 'hooks/media.hook';
import { useEffect, useState } from 'react';
import { Centroid } from '../../helpers/geo';
import { useCounter } from '../timer.hook';
import { useDataApi } from './api.hook';

export const BAG_SEARCH_ENDPOINT_URL = `${getApiUrl('BAG')}?q=`;

export const MAP_URL = process.env.REACT_APP_EMBED_MAP_URL;
export const DEFAULT_LAT = 52.3717228;
export const DEFAULT_LON = 4.8927377;
export const DEFAULT_ZOOM = 8;
export const LOCATION_ZOOM = 14;
export const LAYERS_CONFIG =
  'lagen=overig%3A1%7Cverreg%3A1%7Cverbes%3A1%7Cterras%3A1%7Csplits%3A1%7Cspeela%3A1%7Crectif%3A1%7Coptijd%3A1%7Conttre%3A1%7Comgver%3A1%7Cmeldin%3A1%7Cmedede%3A1%7Cligpla%3A1%7Ckapver%3A1%7Cinspra%3A1%7Cexploi%3A1%7Cevever%3A1%7Cdrahor%3A1%7Cbespla%3A1%7Cwlokca%3A1%7Cwlotxtl%3A1%7Cwlopls%3A1%7Cwlogls%3A1%7Cwloppr%3A1%7Cwlorst%3A1%7Ctcevt%3A1%7Cpvg%3A0%7Cuitzpvg%3A0';

export function useBagSearch(address?: string) {
  return useDataApi({
    url: BAG_SEARCH_ENDPOINT_URL + address,
    postpone: !address,
  });
}

export interface MyMapApiState {
  url: {
    advanced: string;
    simple: string;
  };
  centroid: Centroid | null;
  isDirty: boolean;
  isLoading: boolean;
  refetch: (address: string) => void;
}

export default function useMyMap(address?: string): MyMapApiState {
  const [{ data, isLoading, isDirty }, refetch] = useBagSearch(address);

  let [urls, setUrls] = useState({ simple: '', advanced: '' });
  const [centroid, setCentroid] = useState<Centroid | null>(null);
  let [isDefaultMapLocation, setIsDefaultMapLocation] = useState(false);
  const showLegenda = !usePhoneScreen();
  const hasData = !!(data && data.results && data.results.length);

  useEffect(() => {
    if ((!isLoading && isDirty) || isDefaultMapLocation) {
      if (hasData) {
        const {
          results: [{ centroid }],
        } = data;

        const [lon, lat] = centroid;

        setUrls({
          advanced: `${MAP_URL}&center=${lat}%2C${lon}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lon}&marker-icon=home&${LAYERS_CONFIG}&legenda=${showLegenda}`,
          simple: `${MAP_URL}&center=${lat}%2C${lon}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lon}&marker-icon=home`,
        });

        setCentroid(centroid);
      } else {
        setUrls({
          advanced: `${MAP_URL}&center=${DEFAULT_LAT}%2C${DEFAULT_LON}&zoom=${DEFAULT_ZOOM}`,
          simple: `${MAP_URL}&center=${DEFAULT_LAT}%2C${DEFAULT_LON}&zoom=${DEFAULT_ZOOM}`,
        });
      }
    }
  }, [isLoading, isDefaultMapLocation]);

  // Show default address after 5 seconds
  useCounter({
    maxCount: 5,
    onMaxCount: () => {
      if (!hasData) {
        setIsDefaultMapLocation(true);
      }
    },
  });

  return {
    url: urls,
    centroid,
    isDirty,
    isLoading,
    refetch: (address: string) => {
      refetch({ url: BAG_SEARCH_ENDPOINT_URL + address });
    },
  };
}
