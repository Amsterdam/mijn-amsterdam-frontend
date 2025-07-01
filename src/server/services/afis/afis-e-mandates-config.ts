import { AfisEMandateAcceptant, EMandateReceiverSource } from './afis-types';

// TODO: Uitvinden of de receiver mogelijk per Acceptant kan verschillen
export const eMandateReceiver: EMandateReceiverSource = {
  RecName1: 'Gemeente Amsterdam',
  RecPostal: '1011 PN',
  RecStreet: 'Amstel',
  RecHouse: '1',
  RecCity: 'Amsterdam',
  RecCountry: 'NL',
};

// Public data, see also: https://www.amsterdam.nl/veelgevraagd/facturen-van-de-gemeente-controleren-gegevens-wijzigen-automatische-incasso-regelen-38caa#m4bgm6izgl3skf8ue1p
export const EMandateAcceptantenGemeenteAmsterdam: AfisEMandateAcceptant[] = [
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
  {
    name: 'Zwembaden',
    iban: 'NL10RABO0110077997',
    subId: '12',
    refId: '',
  },
];
