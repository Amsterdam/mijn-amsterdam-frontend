import { ApiUrls } from 'App.constants';
import { useEffect, useState } from 'react';
import { useDataApi } from './api.hook';

export const BAG_SEARCH_ENDPOINT_URL = `${ApiUrls.BAG}?q=`;

export const MAP_URL = process.env.REACT_APP_EMBED_MAP_URL;
export const DEFAULT_LAT = 52.3717228;
export const DEFAULT_LON = 4.8927377;
export const DEFAULT_ZOOM = 8;
export const LOCATION_ZOOM = 14;
export const LAYERS_CONFIG =
  'lagen=overig%3A1%7Cverreg%3A1%7Cverbes%3A1%7Cterras%3A1%7Csplits%3A1%7Cspeela%3A1%7Crectif%3A1%7Coptijd%3A1%7Conttre%3A1%7Comgver%3A1%7Cmeldin%3A1%7Cmedede%3A1%7Cligpla%3A1%7Ckapver%3A1%7Cinspra%3A1%7Cexploi%3A1%7Cevever%3A1%7Cdrahor%3A1%7Cbespla%3A1%7Cwlokca%3A1%7Cwlotxtl%3A1%7Cwlopls%3A1%7Cwlogls%3A1%7Cwloppr%3A1%7Cwlorst%3A1%7Ctcevt%3A1%7Cpvg%3A0%7Cuitzpvg%3A0&legenda=true';

export default function useMyMap(address?: string) {
  const [{ data, isLoading, isDirty }, refetch] = useDataApi({
    url: BAG_SEARCH_ENDPOINT_URL + address,
    postpone: !address,
  });

  let [urls, setUrls] = useState({ simple: '', advanced: '' });

  useEffect(() => {
    if (!isLoading && isDirty) {
      const hasData = !!(data && data.results && data.results.length);
      if (hasData) {
        const {
          results: [
            {
              centroid: [lat, lon],
            },
          ],
        } = data;

        setUrls({
          advanced: `${MAP_URL}&center=${lon}%2C${lat}&zoom=${LOCATION_ZOOM}&marker=${lon}%2C${lat}&marker-icon=home&legenda=true&${LAYERS_CONFIG}`,
          simple: `${MAP_URL}&center=${lon}%2C${lat}&zoom=${LOCATION_ZOOM}&marker=${lon}%2C${lat}&marker-icon=home`,
        });
      } else {
        setUrls({
          advanced: `${MAP_URL}&center=${DEFAULT_LON}%2C${DEFAULT_LAT}&zoom=${DEFAULT_ZOOM}`,
          simple: `${MAP_URL}&center=${DEFAULT_LON}%2C${DEFAULT_LAT}&zoom=${DEFAULT_ZOOM}`,
        });
      }
    }
  }, [isLoading]);

  return {
    url: urls,
    isDirty,
    isLoading,
    refetch: (address: string) =>
      refetch({ url: BAG_SEARCH_ENDPOINT_URL + address }),
  };
}
