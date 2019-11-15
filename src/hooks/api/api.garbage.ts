import { getApiUrl } from 'helpers/App';
import { useDataApi } from './api.hook';
import { ApiState, RefetchFunction } from './api.types';

type StadsdeelNaam =
  | 'West'
  | 'Zuid'
  | 'Zuid-Oost'
  | 'Centrum'
  | 'Noord'
  | 'Oost'
  | 'Nieuw-West'
  | 'Oud-zuid';

interface AfvalOphaalGebiedProperty {
  aanbiedwijze: string;
  dataset: string;
  mutatie: string;
  ophaaldag: string | null;
  opmerking: string | null;
  stadsdeel_code: string;
  stadsdeel_id: number;
  stadsdeel_naam: StadsdeelNaam;
  tijd_tot: string | null;
  tijd_vanaf: string | null;
  type: string;
  website: string | null;
  ophalen: 'ja' | 'nee';
  frequentie: string | null;
}

interface GarbageInfoApiResponse {
  result: {
    features: Array<{
      properties: AfvalOphaalGebiedProperty;
    }>;
  };
}

type GarbageInfoApiResponseFormatted = any[];

export interface RawGarbageApiState extends ApiState {
  data: GarbageInfoApiResponse;
}

export interface GarbageApiState extends ApiState {
  data: GarbageInfoApiResponseFormatted;
  refetch: (requestData: GarbageApiHookProps) => void;
}

type Lat = number;
type Lon = number;

interface GarbageApiHookProps {
  centroid: [Lat, Lon];
}

export default function useGarbageApi(): GarbageApiState {
  const [api, refetch]: [RawGarbageApiState, RefetchFunction] = useDataApi({
    postpone: true,
    url: '',
  });

  const data =
    api.data.result && api.data.result.features && api.data.result.features
      ? api.data.result.features.map(feature => {
          const {
            properties: {
              type,
              stadsdeel_naam,
              tijd_tot,
              tijd_vanaf,
              ophalen,
              ophaaldag,
              opmerking,
              frequentie,
              aanbiedwijze,
            },
          } = feature;

          // return [
          //   {
          //     title: 'Aanbiedwijze',
          //     description: aanbiedwijze || `Zet uw ${type} op straat`,
          //   },
          //   {
          //     title: 'Ophaaldag',
          //     description:
          // ophaaldag === 'Op afspraak'
          //   ? opmerking
          //   : `${ophaaldag} tussen ${tijd_vanaf} ${tijd_tot}`,
          //   },
          // ];

          return {
            title: type,
            // stadsdeel: stadsdeel_naam,
            // tijdVan: tijd_vanaf,
            // tijdTot: tijd_tot,
            aanbiedwijze: aanbiedwijze || `Zet uw ${type} op straat`,
            ophaaldag:
              ophaaldag === 'Op afspraak'
                ? opmerking
                : ophaaldag
                ? `${ophaaldag} tussen ${tijd_vanaf} ${tijd_tot}`
                : null,
          };
        })
      : [];

  return {
    ...api,
    data,
    refetch({ centroid: [lat, lon] }: GarbageApiHookProps) {
      refetch({
        url: `${getApiUrl('AFVAL_OPHAAL_GEBIEDEN')}?lat=${lat}&lon=${lon}`,
      });
    },
  };
}
