import { ExternalUrls } from 'App.constants';
import { capitalizeFirstLetter, getApiUrl } from 'helpers/App';
import { Centroid, getDistance } from 'helpers/geo';
import { useDataApi } from './api.hook';
import { AbortFunction, ApiState, RefetchFunction } from './api.types';

// Reverse engineered from sourcecode at https://www.amsterdam.nl/afval/afvalwijzer/?adres=Dam%201

const weekdays = [
  'zondag',
  'maandag',
  'dinsdag',
  'woensdag',
  'donderdag',
  'vrijdag',
  'zaterdag',
];

function parseText(text: string, data: Record<string, any> = {}) {
  return text.replace(/\[\w+\]/g, function(match) {
    return data[match.slice(1, -1)] || match;
  });
}

function parsePickupDays(subject: string) {
  return weekdays.reduce(
    function(t, a: string) {
      return (
        new RegExp(a).test(subject.toLowerCase()) &&
          ((subject = subject.replace(a, '')), t.push(a)),
        t
      );
    },
    [] as string[]
  );
}

function getPreviousDay(day: string) {
  const previousDay = weekdays.indexOf(day) - 1;
  return -1 === previousDay ? weekdays[6] : weekdays[previousDay];
}

function formatPickupDays(days: string, timeFrom: string, timeTo: string) {
  const pickupdDays = parsePickupDays(days);

  if (pickupdDays.length < 1) {
    return parseText('ophaaldagen onbekend');
  }

  const fromTime = parsePickupTime(timeFrom);
  const untilTime = parsePickupTime(timeTo || '');

  return fromTime && untilTime
    ? parseInt(fromTime.replace('.', ''), 10) <
      parseInt(untilTime.replace('.', ''), 10)
      ? pickupdDays
          .map(function(day) {
            return parseText('[fromDay] vanaf [fromTime] tot [untilTime] uur', {
              fromDay: day,
              fromTime,
              untilTime,
            });
          })
          .join(' en ')
      : pickupdDays
          .map(function(day) {
            return parseText(
              'vanaf [fromDay] [fromTime] uur tot [untilDay] [untilTime] uur',
              {
                fromDay: getPreviousDay(day),
                fromTime,
                untilDay: day,
                untilTime,
              }
            );
          })
          .join(' en ')
    : fromTime && !untilTime
    ? pickupdDays
        .map(function(day) {
          return parseText('[day] vanaf [fromTime] uur', {
            day,
            fromTime,
          });
        })
        .join(' en ')
    : parseText('Aanbied tijden onbekend');
}

function parsePickupTime(time: string) {
  const timeFinal = time.match(/\b[0-9]{2}\.[0-9]{2}\b/);
  return timeFinal ? timeFinal[0] : void 0;
}

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
  type: 'grofvuil' | 'huisvuil';
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

interface GarbageMoment {
  title: string;
  aanbiedwijze: string;
  stadsdeel: Stadsdeel;
  type: 'grofvuil' | 'huisvuil';
  buitenZetten: string;
  ophaaldag: string;
}

interface GarbageInfoApiResponseFormatted {
  ophalen: GarbageMoment[];
  wegbrengen: GarbagePoint[];
  centroid: Centroid | null;
}

export interface RawGarbageApiState extends ApiState {
  data: GarbageInfoApiResponse;
}

export interface GarbageApiState extends ApiState {
  data: GarbageInfoApiResponseFormatted;
  refetch: (requestData: GarbageApiHookProps) => void;
  abort: AbortFunction;
}

export interface GarbagePoint {
  naam: string;
  stadsdeel: string;
  adres: string;
  telefoon: string;
  centroid: Centroid;
  distance?: number;
  openingstijden?: string;
}

interface GarbageApiHookProps {
  centroid: Centroid;
}

const titles: { [type: string]: string } = {
  huisvuil: 'Restafval',
  grofvuil: 'Grofvuil',
};

export default function useGarbageApi({
  centroid,
}: {
  centroid: Centroid | null;
}): GarbageApiState {
  const [api, refetch, abort]: [
    RawGarbageApiState,
    RefetchFunction,
    AbortFunction
  ] = useDataApi({
    postpone: true,
    url: '',
  });

  const ophalen: GarbageMoment[] =
    api.data.result && api.data.result.features && api.data.result.features
      ? api.data.result.features.map(feature => {
          const {
            properties: {
              type,
              stadsdeel_naam,
              tijd_tot,
              tijd_vanaf,
              ophaaldag,
              opmerking,
              aanbiedwijze,
            },
          } = feature;

          return {
            title: titles[type] || type,
            stadsdeel: stadsdeel_naam,
            type,
            aanbiedwijze:
              aanbiedwijze || `Zet uw ${titles[type].toLowerCase()} op straat`,
            buitenZetten:
              ophaaldag !== 'Op afspraak' && ophaaldag !== null
                ? ophaaldag && tijd_vanaf && tijd_tot
                  ? capitalizeFirstLetter(
                      formatPickupDays(ophaaldag, tijd_vanaf, tijd_tot)
                    )
                  : ophaaldag
                : '',
            ophaaldag:
              ophaaldag === 'Op afspraak' && opmerking !== null
                ? opmerking.replace(
                    /(Maak een afspraak online)/gi,
                    `Maak een afspraak <a rel="external noreferrer noopener" href=${
                      ExternalUrls.AFVAL_AFSPRAAK_MAKEN
                    }>online</a>`
                  )
                : ophaaldag || '',
          };
        })
      : [];

  const wegbrengen: GarbagePoint[] = [
    {
      naam: 'Afvalpunt Rozenburglaan',
      stadsdeel: 'Oost',
      adres: 'Rozenburglaan 1\n1097 HK Amsterdam',
      telefoon: '020 587 6114',
      centroid: [4.937826595666199, 52.33884753701634] as Centroid,
      openingstijden:
        'Open van maandag tot en met zaterdag van 08.00 tot 17.00 uur',
    },
    {
      naam: 'Afvalpunt De Faas (Oost, alleen voor bewoners)',
      stadsdeel: 'Oost',
      adres: 'Faas Wilkesstraat 120\n1095 MD Amsterdam',
      telefoon: '020 5876145',
      centroid: [4.9715818109598615, 52.371030012512854] as Centroid,
      openingstijden:
        'Open van maandag tot en met zaterdag van 08.00 tot 17.00 uur',
    },
    {
      naam: 'Afvalpunt Struisgrasstraat',
      stadsdeel: 'Noord',
      adres: 'Struisgrasstraat 33a\n1032 KE Amsterdam',
      telefoon: '020 587 6122',
      centroid: [4.9082273, 52.3952357] as Centroid,
      openingstijden:
        'Open van maandag tot en met zaterdag van 08.00 tot 17.00 uur',
    },
    {
      naam: 'Afvalpunt Seineweg',
      stadsdeel: 'Nieuw-West',
      adres: 'Seineweg 1\n1043 BE Amsterdam',
      telefoon: '020 587 6144',
      centroid: [4.820452174612768, 52.38620351506657] as Centroid,
      openingstijden:
        'Open van maandag tot en met zaterdag van 08.00 tot 17.00 uur',
    },
    {
      naam: 'Afvalpunt Henk Sneevlietweg',
      stadsdeel: 'Nieuw-West',
      adres: 'Henk Sneevlietweg 22\n1066 VH Amsterdam',
      telefoon: '020 587 6126',
      centroid: [4.8334728456417295, 52.34335754418036] as Centroid,
      openingstijden: `Open van maandag tot en met zaterdag van 08.00 tot 17.00 uur\n\nElke zondag van 10.00 uur tot 16.00 uur open`,
    },
    {
      naam: 'Afvalpunt Meerkerkdreef',
      stadsdeel: 'Zuidoost',
      adres: 'Meerkerkdreef 31\n1106 GZ Amsterdam',
      telefoon: '020 587 6116',
      centroid: [4.977867082426079, 52.302520487487] as Centroid,
      openingstijden:
        'Open van maandag tot en met zaterdag van 08.00 tot 17.00 uur',
    },
  ].map(item => {
    return {
      ...item,
      distance: centroid ? getDistance(centroid, item.centroid) : 0,
    };
  });

  return {
    ...api,
    data: {
      centroid,
      ophalen,
      wegbrengen: wegbrengen.length
        ? wegbrengen.sort((itemA: any, itemB: any) => {
            return itemA.distance - itemB.distance;
          })
        : [],
    },
    refetch({ centroid: [lon, lat] }: GarbageApiHookProps) {
      refetch({
        url: `${getApiUrl('AFVAL_OPHAAL_GEBIEDEN')}?lat=${lat}&lon=${lon}`,
      });
    },
    abort,
  };
}
