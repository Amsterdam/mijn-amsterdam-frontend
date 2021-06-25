import React, { ReactNode } from 'react';
import { generatePath } from 'react-router-dom';
import { AppRoutes, DocumentTitles } from '../../../universal/config';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import { LinkProps } from '../../../universal/types';
import { AppState } from '../../AppState';
import { IconChevronRight } from '../../assets/icons';
import { ExternalUrls } from '../../config/app';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { uniqueArray } from '../../../universal/helpers';

export interface PageEntry {
  url: string;
  title: string;
  displayTitle?: ReactNode;
  description: string;
  keywords?: string[];
}

export interface ApiSearchConfig {
  apiName: keyof Partial<AppState> | '';

  // Extract searchable items from the api response
  getApiBaseItems: (apiContent: ApiSuccessResponse<any>) => ApiBaseItem[];

  // PageEntry properties
  // A description that will be used by Fuse to find  matching items
  description:
    | ReactNode
    | ((item: ApiBaseItem, config: ApiSearchConfig) => ReactNode);

  // A title that will be used by Fuse to find  matching items
  title: string | ((item: ApiBaseItem, config: ApiSearchConfig) => string);

  // A list of keys of which the values are used for keywords
  keywordSourceProps:
    | string[]
    | ((item: ApiBaseItem, config: ApiSearchConfig) => string[]);

  // A list of keywords
  keywords:
    | string[]
    | ((item: ApiBaseItem, config: ApiSearchConfig) => string[]);

  // Return a component that acts as title in the search result list
  displayTitle:
    | ReactNode
    | ((item: ApiBaseItem, config: ApiSearchConfig) => ReactNode);

  // The url to link to
  url: string | ((item: ApiBaseItem, config: ApiSearchConfig) => string);
}

export interface ApiBaseItem {
  title: string;
  link: LinkProps;
  [key: string]: any;
}

export const API_SEARCH_CONFIG_DEFAULT: ApiSearchConfig = {
  apiName: '',
  getApiBaseItems: (apiContent: ApiSuccessResponse<any>) => {
    // Blindly assume apiContent returns an array with objects
    if (Array.isArray(apiContent)) {
      return apiContent;
    }

    // Blindly assume apiContent returns an object with arrays object filled arrays as key values.
    if (apiContent !== null && typeof apiContent === 'object') {
      console.log('Object.values(apiContent)', Object.values(apiContent));
      return Object.values(apiContent)
        .filter((value) => Array.isArray(value))
        .flatMap((items) => items);
    }

    return [];
  },
  keywordSourceProps: (item: ApiBaseItem): string[] => ['title'],
  keywords: (item: ApiBaseItem): string[] => [],
  title: (item: ApiBaseItem) => item.link.title,
  displayTitle: (item: ApiBaseItem) => displayPath([item.link.title]),
  url: (item: ApiBaseItem) => item.link.to,
  description: (item: ApiBaseItem) => {
    return `Bekijk ${item.title}`;
  },
};

export function displayPath(segments: string[]) {
  return (
    <span>
      {segments.map((segment, i) => (
        <React.Fragment key={segment + i}>
          <IconChevronRight width="14" height="14" />
          {segment}
        </React.Fragment>
      ))}
    </span>
  );
}

export const apiSearchConfigs: Array<Partial<ApiSearchConfig>> = [
  {
    apiName: 'VERGUNNINGEN',
    keywordSourceProps: (vergunning: ApiBaseItem): string[] => {
      const props = ['caseType', 'title', 'status', 'decision', 'identifier'];
      switch (vergunning.caseType) {
        case 'Evenement melding':
          return props.concat(['eventType', 'activities', 'location']);
        default:
          return props;
      }
    },
    title: (vergunning: ApiBaseItem) => {
      return `Vergunning ${vergunning.caseType}`;
    },
    displayTitle: (vergunning: ApiBaseItem) => {
      return displayPath([
        'Vergunning',
        vergunning.caseType,
        vergunning.identifier,
      ]);
    },
  },
  {
    apiName: 'TOERISTISCHE_VERHUUR',
    keywordSourceProps: (vergunning: ApiBaseItem): string[] => {
      const props = ['caseType', 'title', 'status', 'decision', 'identifier'];
      switch (vergunning.caseType) {
        default:
          return props;
      }
    },
    displayTitle: (vergunning: ApiBaseItem) => {
      return displayPath([
        'Toeristische verhuur',
        vergunning.title,
        vergunning.identifier,
      ]);
    },
  },
  {
    apiName: 'NOTIFICATIONS',
    keywordSourceProps: (notification: ApiBaseItem) => {
      return ['title', 'description'];
    },
    displayTitle: (notification: ApiBaseItem) => {
      return displayPath(['Actueel', notification.title]);
    },
  },
  {
    apiName: 'FOCUS_TOZO',
    keywordSourceProps: (tozo: ApiBaseItem): string[] => {
      return [
        'title',
        'status',
        'decision',
        'productTitle',
        ...tozo.steps.map((step: any) => step.title),
      ];
    },
    keywords: (tozo: ApiBaseItem): string[] =>
      uniqueArray(tozo.steps.flatMap((step: any) => [step.title, step.status])),
    displayTitle: (tozo: ApiBaseItem) => {
      return displayPath(['Inkomen', tozo.productTitle]);
    },
  },
  {
    apiName: 'FOCUS_AANVRAGEN',
    keywordSourceProps: (aanvraag: ApiBaseItem): string[] => {
      return ['title', 'status', 'decision', 'productTitle'];
    },
    keywords: (aanvraag: ApiBaseItem) =>
      uniqueArray(
        aanvraag.steps.flatMap((step: any) => [step.title, step.status])
      ),
    title: (aanvraag: ApiBaseItem) => {
      return `Aanvraag ${aanvraag.productTitle.toLowerCase()} (${defaultDateFormat(
        aanvraag.dateStart
      )})`;
    },
    displayTitle: (aanvraag: ApiBaseItem) => {
      return displayPath([
        'Inkomen',
        `Aanvraag ${aanvraag.productTitle.toLowerCase()} (${defaultDateFormat(
          aanvraag.dateStart
        )})`,
      ]);
    },
  },
];

export const searchStateKeys = apiSearchConfigs.map((config) => {
  return config.apiName;
});

export const staticIndex: PageEntry[] = [
  {
    url: AppRoutes.ROOT,
    title: DocumentTitles[AppRoutes.ROOT],
    displayTitle: displayPath([DocumentTitles[AppRoutes.ROOT]]),
    description:
      'Dashboard pagina met overzicht van wat u hebt op Mijn Amsterdam.',
    keywords: [
      'Home',
      'Dashboard',
      'Start',
      'Updates',
      'Nieuws',
      'Zaken',
      'Lopende zaken',
      'Recente zaken',
      'Melding',
      'Lopende aanvragen',
      'Aanvragen',
      'Themas',
    ],
  },
  {
    url: AppRoutes.GENERAL_INFO,
    title: DocumentTitles[AppRoutes.GENERAL_INFO],
    displayTitle: displayPath([DocumentTitles[AppRoutes.GENERAL_INFO]]),
    description: 'Op dit moment staat deze informatie in Mijn Amsterdam',
    keywords: ['Uitleg', 'About', 'Over', 'Inhoud'],
  },
  {
    url: AppRoutes.BURGERZAKEN,
    title: DocumentTitles[AppRoutes.BURGERZAKEN],
    displayTitle: displayPath([DocumentTitles[AppRoutes.BURGERZAKEN]]),
    description: `Informatie over uw officiële documenten, zoals uw
          paspoort of aktes. Als u gaat trouwen of een partnerschap aangaat, dan
          ziet u hier de aankondiging.`,
    keywords: [
      'Burgerdingen',
      'Burgerzaken',
      'Paspoort',
      'Passport',
      'Huwelijk',
      'Huwelijksakte',
      'Trouwen',
      'Partnerschap',
      'Akte',
      'Aktes',
      'ID/id',
      'ID kaart',
      'ID bewijs',
      'Identiteitsbewijs',
      'Identiteitskaart',
      'Reis document',
      'Document',
    ],
  },
  {
    url: AppRoutes.ZORG,
    title: DocumentTitles[AppRoutes.ZORG],
    displayTitle: displayPath([DocumentTitles[AppRoutes.ZORG]]),
    description: `Uw regelingen en hulpmiddelen vanuit de Wmo.`,
    keywords: [
      'Zorg',
      'Scootmobiel',
      'Rollator',
      'Thuishulp',
      'Hulp in huis',
      'Thuiszorg',
      'WMO',
      'Zorgvoorziening',
      'Voorziening',
      'Zorgproduct',
      'Recht op zorg',
      'Aanvraag',
      'Zorgaanvraag',
      'Bijzondere bijstand',
      'Taxi',
      'BBZ',
    ],
  },
  {
    url: AppRoutes.STADSPAS,
    title: DocumentTitles[AppRoutes.STADSPAS],
    displayTitle: displayPath([DocumentTitles[AppRoutes.STADSPAS]]),
    description: `Informatie over uw eigen Stadspas.`,
    keywords: [
      'Stadspas',
      'Groene stip',
      'Blauwe ruit',
      'Gratis pas',
      'Saldo checken',
      'stadspasnummer',
      'pasnummer',
      'pas nummer',
      'einddatum stadspas',
      'besluit aanvraag',
      'Geld ',
      'Afschrijvingen',
      'Gratis pas',
      'Pas',
      'Transacties',
      'Hoeveel heb ik uitgegeven?',
    ],
  },
  {
    url: AppRoutes.INKOMEN,
    title: DocumentTitles[AppRoutes.INKOMEN],
    displayTitle: displayPath([DocumentTitles[AppRoutes.INKOMEN]]),
    description: `Informatie over uw uitkering en de
          ondersteuning die u krijgt omdat u weinig geld hebt.`,
    keywords: [
      'Geld',
      'Uitkering',
      'bijstandsuitkering',
      'Bijstand',
      'Werkloos',
      'Aanvragen',
      'Jaaropgave',
      'Vakantiegeld',
      'Tozo',
      'Tonk',
      'Specificaties',
    ],
  },
  {
    url: generatePath(AppRoutes.NOTIFICATIONS, { page: 1 }),
    title: DocumentTitles[AppRoutes.NOTIFICATIONS],
    displayTitle: displayPath([DocumentTitles[AppRoutes.NOTIFICATIONS]]),
    description: `Alle belangrijke meldingen`,
    keywords: ['Nieuws', 'Updates', 'Status', 'Betalen', 'Overzicht'],
  },
  {
    url: AppRoutes.BRP,
    title: DocumentTitles[AppRoutes.BRP],
    displayTitle: displayPath([DocumentTitles[AppRoutes.BRP]]),
    description: `In de Basisregistratie Personen legt de gemeente persoonsgegevens over
          u vast. Het gaat hier bijvoorbeeld om uw naam, adres, geboortedatum of
          uw burgerlijke staat.`,
    keywords: [
      'gegevens',
      'profiel',
      'bevolkingsregister',
      'uittreksel',
      'adressen',
      'woningen',
      'partners',
      'huwelijk',
      'wijzigen',
      'adreswijziging',
      'aangifte',
      'verhuizen',
      'kinderen',
      'bewoners',
      'aantal bewoners',
      'ingeschreven',
      'adres',
      'naam',
    ],
  },
  {
    url: AppRoutes.KVK,
    title: DocumentTitles[AppRoutes.KVK],
    displayTitle: displayPath([DocumentTitles[AppRoutes.KVK]]),
    description: `Hier ziet u hoe uw onderneming ingeschreven staat in het
          Handelsregister van de Kamer van Koophandel. In dat register staan
          onder meer uw bedrijfsnaam, vestigingsadres en KvK-nummer.`,
    keywords: [
      'Zakelijk',
      'gegevens',
      'bedrijf',
      'zzp',
      'kvk',
      'kamer van koophandel',
      'handelsregister',
      'bedrijfsgegevens',
      'Onderneming',
      'Mijn gegevens',
      'Vestigingen',
      'Handelsnamen',
      'Hoofdvestiging',
      'Functionarissen',
    ],
  },
  {
    url: AppRoutes.BUURT,
    title: DocumentTitles[AppRoutes.BUURT],
    displayTitle: displayPath([DocumentTitles[AppRoutes.BUURT]]),
    description: `Een overzicht van gemeentelijke informatie rond uw eigen woning of bedrijf.`,
    keywords: ['buurt', 'straat', 'adres', 'kaart', 'map', 'Omgeving'],
  },
  {
    url: AppRoutes.TIPS,
    title: DocumentTitles[AppRoutes.TIPS],
    displayTitle: displayPath([DocumentTitles[AppRoutes.TIPS]]),
    description: `Tips over voorzieningen en activiteiten in Amsterdam.`,
    keywords: [
      'Tips',
      'Index van alle tip titels + beschrijvingen doorzoeken?',
      'Persoonlijk',
      'Gegevens',
    ],
  },
  {
    url: AppRoutes.AFVAL,
    title: DocumentTitles[AppRoutes.AFVAL],
    displayTitle: displayPath([DocumentTitles[AppRoutes.AFVAL]]),
    description: ` Bekijk waar u uw afval kwijt kunt en hoe u uw afval kunt scheiden.`,
    keywords: [
      'Containers',
      'Afval containers',
      'Afvalcontainers',
      'Grofvuilen ophalen',
      'Ophaaldagen',
      'Afvalbrengplaats',
      'Milieustraat',
      'Afvalstraat',
      'Afval wegbrngen',
      'Afval Inlveren',
      'Verf',
      'Puin storten',
      'Dichtbij afval',
    ],
  },
  {
    url: AppRoutes.ACCESSIBILITY,
    title: DocumentTitles[AppRoutes.ACCESSIBILITY],
    displayTitle: displayPath([DocumentTitles[AppRoutes.ACCESSIBILITY]]),
    description: `Hieronder vind u een overzicht van uw aanvragen voor toeristische verhuur.`,
    keywords: [
      'A11Y',
      'WCAG',
      'Blind',
      'SZ',
      'Slechtziend',
      'Grote letters',
      'Tekstgrootte',
      'Contrast',
    ],
  },
  {
    url: AppRoutes.VERGUNNINGEN,
    title: DocumentTitles[AppRoutes.VERGUNNINGEN],
    displayTitle: displayPath([DocumentTitles[AppRoutes.VERGUNNINGEN]]),
    description: `Een overzicht van uw aanvragen voor vergunningen en ontheffingen bij gemeente Amsterdam.`,
    keywords: ['Vergunningen', 'Aanvragen', 'Vergunning'],
  },
  {
    url: AppRoutes.TOERISTISCHE_VERHUUR,
    title: DocumentTitles[AppRoutes.TOERISTISCHE_VERHUUR],
    displayTitle: displayPath([DocumentTitles[AppRoutes.TOERISTISCHE_VERHUUR]]),
    description: `Hieronder vind u een overzicht van uw aanvragen voor toeristische verhuur.`,
    keywords: [
      'Airbnb',
      'Verhuur',
      'Vakantie verhuur',
      'Vakantieverhuur',
      'Vakantiewoning',
      'Kamer verhuren',
      'Toeristen',
      'Bed Breakfast',
      'B&B',
      'Vergunning',
      'Afmelden',
      'Verhuur plannen',
      'Cancel verhuur',
      'Afmelden',
    ],
  },
  {
    url: ExternalUrls.SSO_BELASTINGEN,
    title: 'Belastingen',
    displayTitle: displayPath(['Belastingen']),
    description: `Een overzicht van de belastingen.`,
    keywords: [
      'Incasso',
      'Belasting',
      'Betalen',
      'Gemeente belasting',
      'iDeal betalen',
      'Boete',
    ],
  },
  {
    url: ExternalUrls.SSO_ERFPACHT + '',
    title: 'Erfpacht',
    displayTitle: displayPath(['Erfpacht']),
    description: `Een overzicht van de erfpacht.`,
    keywords: ['Erfpacht', 'Canon', 'Afkopen', 'Betalen'],
  },
  {
    url: ExternalUrls.SSO_MILIEUZONE + '',
    title: 'Milieuzone',
    displayTitle: displayPath(['Milieuzone']),
    description: `Een overzicht van milieuzone.`,
    keywords: ['Milieuzone', 'Ontheffing'],
  },
];
