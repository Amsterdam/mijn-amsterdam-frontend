import { ExternalUrls } from 'App.constants';

export const panelConfig = {
  person: {
    title: 'Persoonlijke gegevens',
    actionLinks: [
      {
        title: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
        external: true,
      },
      {
        title: 'Trouwen en partnerschap',
        url: ExternalUrls.TROUWEN_EN_PARTNERSCHAP,
      },
      {
        title: 'Voorgenomen huwelijk doorgeven',
        url: ExternalUrls.VOORGENOMEN_HUWELIJK,
      },
    ],
  },
  address: {
    title: 'Woonadres',
    actionLinks: [
      {
        title: 'Verhuizing doorgeven',
        url: ExternalUrls.REPORT_RELOCATION,
        external: true,
      },
    ],
  },
  partner: {
    title: 'Partner',
    actionLinks: [
      {
        title: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
        external: true,
      },
      {
        title: 'Echtscheiding',
        url: ExternalUrls.ECHTSCHEIDING,
      },
    ],
  },
};

export const brpInfoLabels = {
  FirstName: 'Voornamen',
  LastName: 'Achternaam',
  Gender: 'Geslacht',
  BSN: 'BSN',
  DateOfBirth: 'Geboortedatum',
  PlaceOfBirth: 'Geboorteplaats',
  CountryOfBirth: 'Geboorteland',
  Nationality: 'Nationaliteit',
  Date: 'Datum',
  Place: 'Plaats',
  Country: 'Land',
  DateStarted: 'Sinds',
  MaritalStatusType: 'Soort verbintenis',
};
