import { capitalizeFirstLetter } from '../../../universal/helpers';
import { GarbageRetrievalMoment, Stadsdeel } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers/source-api-request';

const AFVAL_AFSPRAAK_MAKEN =
  'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Grofvuil.aspx';

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
////// CODE FROM AMSTERDAM.NL/AFVAL
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

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
  return text.replace(/\[\w+\]/g, function (match) {
    return data[match.slice(1, -1)] || match;
  });
}

function parsePickupDays(subject: string) {
  return weekdays.reduce(function (t, a: string) {
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
          .map(function (day) {
            return parseText('[fromDay] vanaf [fromTime] tot [untilTime] uur', {
              fromDay: day,
              fromTime,
              untilTime,
            });
          })
          .join(' en ')
      : pickupdDays
          .map(function (day) {
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
        .map(function (day) {
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

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
////// END CODE
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

interface AfvalOphaalGebied {
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

const titles: { [type: string]: string } = {
  huisvuil: 'Restafval',
  grofvuil: 'Grof afval',
};

interface AFVALSourceData {
  result: {
    features: Array<{
      properties: AfvalOphaalGebied;
    }>;
  };
}

export function transformGarbageRetrievalData(
  afvalSourceData: AFVALSourceData
) {
  const ophalen: GarbageRetrievalMoment[] = afvalSourceData?.result?.features
    ? afvalSourceData.result.features.map((feature) => {
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
                  `<a rel="external noreferrer noopener" href="${AFVAL_AFSPRAAK_MAKEN}">online</a>`
                )
              : '',
        };
      })
    : [];

  return ophalen;
}

export async function fetchAfvalmomenten(
  sessionID: SessionID,
  center: LatLngObject | null
) {
  const params = { lat: center?.lat, lon: center?.lng };
  const garbageMomentData = await requestData<GarbageRetrievalMoment[]>(
    getApiConfig('AFVAL', {
      params,
      transformResponse: transformGarbageRetrievalData,
    }),
    sessionID
  );

  return garbageMomentData;
}
