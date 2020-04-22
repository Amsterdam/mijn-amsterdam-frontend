import {
  capitalizeFirstLetter,
  getApproximateDistance,
} from '../../universal/helpers';
import { requestData } from '../helpers/request';
import { ApiUrls, getApiConfigValue } from './config';
import {
  Stadsdeel,
  GarbagePoint,
  GarbageMoment,
  AFVALData,
} from '../../universal/types';

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
  grofvuil: 'Grofvuil',
};

const garbagePoints: GarbagePoint[] = [
  {
    naam: 'Afvalpunt Henk Sneevlietweg (Nieuw-West)',
    latlng: { lat: 52.3433575455427, lng: 4.83347291303415 },
    adres: 'Henk Sneevlietweg 22&#xA0;<br>1066 VH&#xA0;&#xA0;Amsterdam',
    telefoon: '020 587 6126',
    email: 'afvalpunten@aebamsterdam.nl',
    openingstijden:
      'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\nHet Afvalpunt Marie Baronlaan aan de Faas Wilkesstraat is voorlopig gesloten.',
  },
  {
    naam: 'Afvalpunt Marie Baronlaan (Oost, geen bedrijfsafval)',
    latlng: { lat: 52.3710209755361, lng: 4.97156727996261 },
    adres: 'Marie Baronlaan <br>1095 MV Amsterdam',
    telefoon: '020 5876145',
    email: 'afvalpunten@aebamsterdam.nl',
    openingstijden:
      'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\nHet Afvalpunt Marie Baronlaan aan de Faas Wilkesstraat is voorlopig gesloten.',
  },
  {
    naam: 'Afvalpunt Meerkerkdreef (Zuidoost)',
    latlng: { lat: 52.302520488967, lng: 4.97786715111811 },
    adres: 'Meerkerkdreef 31&#xA0;<br>1106 GZ &#xA0;Amsterdam',
    telefoon: '020 587 6116',
    email: 'afvalpunten@aebamsterdam.nl',
    openingstijden:
      'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\nHet Afvalpunt Marie Baronlaan aan de Faas Wilkesstraat is voorlopig gesloten.',
  },
  {
    naam: 'Afvalpunt Rozenburglaan (Oost)',
    latlng: { lat: 52.3388475386366, lng: 4.93782666381194 },
    adres: 'Rozenburglaan 1&#xA0;<br>1097 HK &#xA0;Amsterdam',
    telefoon: '020 587 6114',
    email: 'afvalpunten@aebamsterdam.nl',
    openingstijden:
      'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\nHet Afvalpunt Marie Baronlaan aan de Faas Wilkesstraat is voorlopig gesloten.',
  },
  {
    naam: 'Afvalpunt Seineweg (Nieuw-West)',
    latlng: { lat: 52.386058385908, lng: 4.82017500674289 },
    adres: 'Seineweg 1&#xA0;<br>1043 BE&#xA0; Amsterdam',
    telefoon: '020 587 6144',
    email: 'afvalpunten@aebamsterdam.nl',
    openingstijden:
      'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\nHet Afvalpunt Marie Baronlaan aan de Faas Wilkesstraat is voorlopig gesloten.',
  },
  {
    naam: 'Afvalpunt Struisgrasstraat (Noord)',
    latlng: { lat: 52.3957390236765, lng: 4.90786592615004 },
    adres: 'Struisgrasstraat 33a <br>1032 KE &#xA0;Amsterdam',
    telefoon: '020 587 6122',
    email: 'afvalpunten@aebamsterdam.nl',
    openingstijden:
      'De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00 tot 17.00 uur.\n\nHet Afvalpunt Marie Baronlaan aan de Faas Wilkesstraat is voorlopig gesloten.',
  },
];

interface AFVALSourceData {
  result: {
    features: Array<{
      properties: AfvalOphaalGebied;
    }>;
  };
}

export function formatAFVALData(
  responseData: AFVALSourceData,
  center: LatLngObject | null
): AFVALData {
  const ophalen: GarbageMoment[] = responseData?.result?.features
    ? responseData.result.features.map(feature => {
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

  const wegbrengen = garbagePoints.map(item => {
    return {
      ...item,
      distance: center ? getApproximateDistance(center, item.latlng) : 0,
    };
  });

  return {
    ophalen,
    wegbrengen,
  };
}

export function fetchAFVAL(sessionID: SessionID, center: LatLngObject | null) {
  const params = { lat: center?.lat, lon: center?.lng };

  return requestData<AFVALData>(
    {
      url: ApiUrls.AFVAL,
      params,
      transformResponse: data => formatAFVALData(data, center),
    },
    sessionID,
    getApiConfigValue('AFVAL', 'postponeFetch', false)
  );
}
