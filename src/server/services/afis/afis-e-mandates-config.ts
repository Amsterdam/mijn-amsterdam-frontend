import {
  AfisEMandateCreditor,
  EMandateReceiverSource,
  type AfisEMandateSourceStatic,
} from './afis-types';
import { getFromEnv } from '../../helpers/env';

// Voor elke afdeling van de gemeente gebruiken we dezelfde gegevens.
export const eMandateReceiver: EMandateReceiverSource = {
  RecName1: 'Gemeente Amsterdam',
  RecPostal: '1011 PN',
  RecStreet: 'Amstel',
  RecHouse: '1',
  RecCity: 'Amsterdam',
  RecCountry: 'NL',
};

// Public data, see also: https://www.amsterdam.nl/veelgevraagd/facturen-van-de-gemeente-controleren-gegevens-wijzigen-automatische-incasso-regelen-38caa#m4bgm6izgl3skf8ue1p
export const EMandateCreditorsGemeenteAmsterdam: AfisEMandateCreditor[] = [
  {
    name: 'Afval',
    iban: 'NL21RABO0110055004',
    subId: '1',
    refId: 'AFVAL',
  },
  {
    name: 'Begraafplaats',
    iban: 'NL90RABO0110055993',
    subId: '2',
    refId: 'BEGRAAFPLTSN',
  },
  {
    name: 'Erfpacht',
    iban: 'NL41RABO0110022440',
    subId: '3',
    refId: 'ERFPACHT',
  },
  {
    name: 'Huur vastgoed',
    iban: 'NL61RABO0110099001',
    subId: '4',
    refId: 'VASTGOED',
  },
  {
    name: 'Markten',
    iban: 'NL55RABO0110099885',
    subId: '6',
    refId: 'MARKTZAKEN',
  },
  {
    name: 'Overig',
    iban: 'NL78RABO0110011880',
    subId: '7',
    refId: 'OVERIG',
    description:
      'Dit is een algemene rekening voor overige betalingen aan de gemeente Amsterdam.',
  },
  {
    name: 'Parkeren',
    iban: 'NL56RABO0110066111',
    subId: '8',
    refId: 'PARKEREN',
  },
  {
    name: 'Sociale werkplaats',
    iban: 'NL48RABO0110033663',
    subId: '9',
    refId: 'SOCWERKVOORZ',
  },
  {
    name: 'Sportverhuur',
    iban: 'NL03RABO0110066774',
    subId: '10',
    refId: 'SPORT EN BOS',
  },
  {
    name: 'Vergunningen',
    iban: 'NL67RABO0110088999',
    subId: '11',
    refId: 'VERGUNNINGEN',
  },
];

// E-Mandates are always recurring and have a default date far in the future!
export const EMANDATE_ENDDATE_INDICATOR = '9999';
export const AFIS_EMANDATE_RECURRING_DATE_END = `${EMANDATE_ENDDATE_INDICATOR}-12-31T00:00:00`;
export const AFIS_EMANDATE_COMPANY_NAME = 'Gemeente Amsterdam';
export const AFIS_EMANDATE_SIGN_REQUEST_URL_VALIDITY_IN_DAYS = 1;

export const afisEMandatePostbodyStatic: AfisEMandateSourceStatic = {
  PayType: getFromEnv('BFF_AFIS_EMANDATE_PAYTYPE') ?? '',
  SndType: getFromEnv('BFF_AFIS_EMANDATE_SNDTYPE') ?? '',
  RefType: getFromEnv('BFF_AFIS_EMANDATE_REFTYPE') ?? '',
  RecType: getFromEnv('BFF_AFIS_EMANDATE_RECTYPE') ?? '',
  RecId: getFromEnv('BFF_AFIS_EMANDATE_RECID') ?? '',
  Status: getFromEnv('BFF_AFIS_EMANDATE_STATUS') ?? '',
};
