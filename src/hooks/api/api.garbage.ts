import { getApiUrl } from 'helpers/App';
import { useDataApi } from './api.hook';
import { ApiState, RefetchFunction } from './api.types';

enum Stadsdeel {
  centrum = 'Centrum',
  nieuwWest = 'Nieuw-West',
  noord = 'Noord',
  oost = 'Oost',
  west = 'West',
  zuid = 'Zuid',
  zuidoost = 'Zuidoost',
}

interface AfvalOphaalGebiedProperty {
  aanbiedwijze: string;
  dataset: string;
  mutatie: string;
  ophaaldag: string | null;
  opmerking: string | null;
  stadsdeel_code: string;
  stadsdeel_id: number;
  stadsdeel_naam: Stadsdeel;
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

interface GarbageInfoApiResponseFormatted {
  ophalen: any[];
  wegbrengen: any[];
}

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

const titles: { [type: string]: string } = {
  huisvuil: 'Restafval',
  grofvuil: 'Grofvuil',
};

export default function useGarbageApi(): GarbageApiState {
  const [api, refetch]: [RawGarbageApiState, RefetchFunction] = useDataApi({
    postpone: true,
    url: '',
  });

  const ophalen =
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

          return {
            title: titles[type] || type,
            stadsdeel: stadsdeel_naam,
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

  const wegbrengen = [
    {
      naam: 'Afvalpunt Rozenburglaan',
      stadsdeel: 'Oost',
      adres: 'Rozenburglaan 1\n1097 HK Amsterdam',
      telefoon: '020 587 6114',
    },
    {
      naam: 'Afvalpunt De Faas (Oost, alleen voor bewoners)',
      stadsdeel: 'Oost',
      adres: 'Faas Wilkesstraat 120\n1095 MD Amsterdam',
      telefoon: '020 5876145',
    },
    {
      naam: 'Afvalpunt Struisgrasstraat',
      stadsdeel: 'Noord',
      adres: 'Struisgrasstraat 33a\n1032 KE Amsterdam',
      telefoon: '020 587 6122',
    },
    {
      naam: 'Afvalpunt Seineweg',
      stadsdeel: 'Nieuw-West',
      adres: 'Seineweg 1\n1043 BE Amsterdam',
      telefoon: '020 587 6144',
    },
    {
      naam: 'Afvalpunt Henk Sneevlietweg',
      stadsdeel: 'Nieuw-West',
      adres: 'Henk Sneevlietweg 22\n1066 VH Amsterdam',
      telefoon: '020 587 6126',
    },
    {
      naam: 'Afvalpunt Meerkerkdreef',
      stadsdeel: 'Zuidoost',
      adres: 'Meerkerkdreef 31\n1106 GZ Amsterdam',
      telefoon: '020 587 6116',
    },
  ];

  return {
    ...api,
    data: {
      ophalen,
      wegbrengen: ophalen.length
        ? wegbrengen.sort((item: any) => {
            return item.stadsdeel.toLowerCase() ===
              ophalen[0].stadsdeel.toLowerCase()
              ? 1
              : 0;
          })
        : [],
    },
    refetch({ centroid: [lat, lon] }: GarbageApiHookProps) {
      refetch({
        url: `${getApiUrl('AFVAL_OPHAAL_GEBIEDEN')}?lat=${lat}&lon=${lon}`,
      });
    },
  };
}
