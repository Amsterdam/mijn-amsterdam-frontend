import { useCallback, useMemo, useState } from 'react';
import { ExternalUrls } from '../../../universal/config';
import {
  capitalizeFirstLetter,
  getApiUrl,
  getDistance,
} from '../../../universal/helpers';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

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
  return weekdays.reduce(function(t, a: string) {
    return (
      new RegExp(a).test(subject.toLowerCase()) &&
        ((subject = subject.replace(a, '')), t.push(a)),
      t
    );
  }, [] as string[]);
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

export interface GarbageMoment {
  title: string;
  aanbiedwijze: string;
  stadsdeel: Stadsdeel;
  type: 'grofvuil' | 'huisvuil';
  buitenZetten: string;
  ophaaldag: string;
  opmerking: string;
}

interface GarbageInfoApiResponseFormatted {
  ophalen: GarbageMoment[];
  wegbrengen: GarbagePoint[];
  centroid: Centroid | undefined;
}

export type GarbageApiState = ApiState<GarbageInfoApiResponseFormatted> & {
  refetch: (data: GarbageApiHookProps) => void;
};

export interface GarbagePoint {
  naam: string;
  adres: string;
  telefoon: string;
  email: string;
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

export default function useGarbageApi(centroid?: Centroid): GarbageApiState {
  const [theCentroid, setTheCentroid] = useState(centroid);

  const [api, refetch] = useDataApi<GarbageInfoApiResponse>(
    {
      postpone: true,
      url: '',
    },
    {} as GarbageInfoApiResponse
  );

  const ophalen: GarbageMoment[] = api.data?.result?.features
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
            frequentie,
          },
        } = feature;

        return {
          title: titles[type] || type,
          stadsdeel: stadsdeel_naam,
          type,
          aanbiedwijze,
          buitenZetten:
            ophaaldag !== null
              ? ophaaldag && tijd_vanaf && tijd_tot
                ? capitalizeFirstLetter(
                    formatPickupDays(ophaaldag, tijd_vanaf, tijd_tot)
                  )
                : ''
              : '',
          ophaaldag:
            ophaaldag !== null
              ? ophaaldag + (frequentie ? `, ${frequentie}` : '')
              : /* fallback to*/ frequentie || '',
          opmerking:
            opmerking !== null
              ? opmerking.replace(
                  /(online)/gi,
                  `<a rel="external noreferrer noopener" href="${ExternalUrls.AFVAL_AFSPRAAK_MAKEN}">online</a>`
                )
              : '',
        };
      })
    : [];

  const wegbrengen: GarbagePoint[] = useMemo(
    () =>
      [
        {
          naam: 'Afvalpunt Henk Sneevlietweg (Nieuw-West)',
          centroid: [4.83347291303415, 52.3433575455427] as Centroid,
          adres: 'Henk Sneevlietweg 22&#xA0;<br>1066 VH&#xA0;&#xA0;Amsterdam',
          telefoon: '020 587 6126',
          email: 'afvalpunten@aebamsterdam.nl',
          openingstijden:
            'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\n Het afvalpunt Henk Sneevlietweg is elke zondag open van 10.00 tot 16.00 uur.',
        },
        {
          naam: 'Afvalpunt Marie Baronlaan (Oost, geen bedrijfsafval)',
          centroid: [4.97156727996261, 52.3710209755361] as Centroid,
          adres: 'Marie Baronlaan <br>1095 MV Amsterdam',
          telefoon: '020 5876145',
          email: 'afvalpunten@aebamsterdam.nl',
          openingstijden:
            'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\n Het afvalpunt Henk Sneevlietweg is elke zondag open van 10.00 tot 16.00 uur.',
        },
        {
          naam: 'Afvalpunt Meerkerkdreef (Zuidoost)',
          centroid: [4.97786715111811, 52.302520488967] as Centroid,
          adres: 'Meerkerkdreef 31&#xA0;<br>1106 GZ &#xA0;Amsterdam',
          telefoon: '020 587 6116',
          email: 'afvalpunten@aebamsterdam.nl',
          openingstijden:
            'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\n Het afvalpunt Henk Sneevlietweg is elke zondag open van 10.00 tot 16.00 uur.',
        },
        {
          naam: 'Afvalpunt Rozenburglaan (Oost)',
          centroid: [4.93782666381194, 52.3388475386366] as Centroid,
          adres: 'Rozenburglaan 1&#xA0;<br>1097 HK &#xA0;Amsterdam',
          telefoon: '020 587 6114',
          email: 'afvalpunten@aebamsterdam.nl',
          openingstijden:
            'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\n Het afvalpunt Henk Sneevlietweg is elke zondag open van 10.00 tot 16.00 uur.',
        },
        {
          naam: 'Afvalpunt Seineweg (Nieuw-West)',
          centroid: [4.82017500674289, 52.386058385908] as Centroid,
          adres: 'Seineweg 1&#xA0;<br>1043 BE&#xA0; Amsterdam',
          telefoon: '020 587 6144',
          email: 'afvalpunten@aebamsterdam.nl',
          openingstijden:
            'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\n Het afvalpunt Henk Sneevlietweg is elke zondag open van 10.00 tot 16.00 uur.',
        },
        {
          naam: 'Afvalpunt Struisgrasstraat (Noord)',
          centroid: [4.90786592615004, 52.3957390236765] as Centroid,
          adres: 'Struisgrasstraat 33a <br>1032 KE &#xA0;Amsterdam',
          telefoon: '020 587 6122',
          email: 'afvalpunten@aebamsterdam.nl',
          openingstijden:
            'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\n Het afvalpunt Henk Sneevlietweg is elke zondag open van 10.00 tot 16.00 uur.',
        },
      ].map(item => {
        return {
          ...item,
          distance: centroid ? getDistance(centroid, item.centroid) : 0,
        };
      }),
    [centroid]
  );

  const refetchCallback = useCallback(
    ({ centroid }: GarbageApiHookProps) => {
      setTheCentroid(centroid);
      const [lon, lat] = centroid;
      const url = `${getApiUrl('AFVAL_OPHAAL_GEBIEDEN')}?lat=${lat}&lon=${lon}`;

      refetch({
        url,
      });
    },
    [refetch]
  );

  return {
    ...api,
    data: {
      centroid: theCentroid,
      ophalen,
      wegbrengen: wegbrengen.length
        ? wegbrengen.sort((itemA: any, itemB: any) => {
            return itemA.distance - itemB.distance;
          })
        : [],
    },
    refetch: refetchCallback,
  };
}
