import { ExternalUrls } from 'App.constants';

export const panelConfig = {
  me: {
    title: 'Persoonlijke gegevens',
    actionLinks: [
      {
        label: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
      },
    ],
  },
  partner: {
    title: 'Partner',
    actionLinks: [
      {
        label: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
      },
    ],
  },
  legalCommitment: {
    title: 'Verbintenis',
    actionLinks: [
      {
        label: 'Trouwen en partnerschap',
        url: ExternalUrls.TROUWEN_EN_PARTNERSCHAP,
      },
      {
        label: 'Echtscheiding',
        url: ExternalUrls.ECHTSCHEIDING,
      },
    ],
  },
  address: {
    title: 'Huidig woonadres',
    actionLinks: [
      {
        label: 'Verhuizing doorgeven',
        url: ExternalUrls.REPORT_RELOCATION,
      },
    ],
  },
};

export const brpInfoLabels = {
  FirstName: 'Voornamen',
  LastName: 'Achternaam',
  Gender: 'Geslacht',
  BSN: 'Bsn',
  DateOfBirth: 'Geboortedatum',
  PlaceOfBirth: 'Geboorteplaats',
  CountryOfBirth: 'Geboorteland',
  Nationality: 'Nationaliteit',
  Date: 'Datum',
  Place: 'Plaats',
  Country: 'Land',
  DateStarted: 'Sinds',
};
