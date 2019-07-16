import { useDataApi } from './api.hook';

export const BAG_SEARCH_ENDPOINT_URL =
  'https://api.data.amsterdam.nl/atlas/search/adres/?q=';

export const MAP_URL =
  'https://data.amsterdam.nl/data/?modus=kaart&achtergrond=topo_rd_zw&embed=true';
export const DEFAULT_LAT = 52.3717228;
export const DEFAULT_LON = 4.8927377;
export const DEFAULT_ZOOM = 8;
export const LOCATION_ZOOM = 14;
export const LAYERS_CONFIG =
  'lagen=pvg%3A1%7Cuitzpvg%3A1%7Coverig%3A1%7Cverreg%3A1%7Cverbes%3A1%7Cterras%3A1%7Csplits%3A1%7Cspeela%3A1%7Crectif%3A1%7Coptijd%3A1%7Conttre%3A1%7Comgver%3A1%7Cmeldin%3A1%7Cmedede%3A1%7Cligpla%3A1%7Ckapver%3A1%7Cinspra%3A1%7Cexploi%3A1%7Cevever%3A1%7Cdrahor%3A1%7Cbespla%3A1%7Cwlokca%3A1%7Cwlotxtl%3A1%7Cwlopls%3A1%7Cwlogls%3A1%7Cwloppr%3A1%7Cwlorst%3A1%7Ctcevt%3A1';
export default function useMyMap(address?: string, simpleMap: boolean = false) {
  const [{ data, isLoading, isDirty }] = useDataApi({
    url: BAG_SEARCH_ENDPOINT_URL + address,
  });

  let url;
  let showLegend = '';
  let layers = '';

  if (data.results && data.results.length) {
    const {
      results: [
        {
          centroid: [lat, lon],
        },
      ],
    } = data;

    if (!simpleMap) {
      layers = LAYERS_CONFIG;
      showLegend = '&legenda=true';
    }
    url = `${MAP_URL}&center=${lon}%2C${lat}&zoom=${LOCATION_ZOOM}&marker=${lon}%2C${lat}&marker-icon=home${showLegend}&${layers}`;
  } else {
    url = `${MAP_URL}&center=${DEFAULT_LON}%2C${DEFAULT_LAT}&zoom=${DEFAULT_ZOOM}`;
  }

  return { url, isDirty, isLoading };
}
