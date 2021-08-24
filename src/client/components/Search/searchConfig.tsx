import React, { ReactNode } from 'react';
import { generatePath } from 'react-router-dom';
import { Akte } from '../../../server/services/aktes';
import {
  FocusStadspas,
  FocusStadspasSaldo,
} from '../../../server/services/focus/focus-combined';
import { FocusItem } from '../../../server/services/focus/focus-types';
import {
  ToeristischeVerhuurVergunning,
  ToeristischeVerhuurRegistratie,
} from '../../../server/services/toeristische-verhuur';
import { AppRoutes, DocumentTitles } from '../../../universal/config';
import { getFullAddress, getFullName } from '../../../universal/helpers';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import {
  defaultDateFormat,
  displayDateRange,
} from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { uniqueArray } from '../../../universal/helpers/utils';
import { LinkProps } from '../../../universal/types';
import { BRPData, Identiteitsbewijs } from '../../../universal/types/brp';
import { AppState } from '../../AppState';
import { IconExternalLink } from '../../assets/icons';
import { ExternalUrls } from '../../config/app';
import InnerHtml from '../InnerHtml/InnerHtml';
import styles from './Search.module.scss';
import { WmoItem } from '../../../server/services/wmo';

export interface PageEntry {
  url: string;
  title: string;
  displayTitle?: (term: string) => ReactNode;
  description: string;
  keywords?: string[];
}

export interface ApiSearchConfig {
  // Extract searchable items from the api response
  getApiBaseItems: (
    apiContent: ApiSuccessResponse<any>['content']
  ) => ApiBaseItem[];

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
  getApiBaseItems: (apiContent: ApiSuccessResponse<any>['content']) => {
    // Blindly assume apiContent returns an array with objects
    if (Array.isArray(apiContent)) {
      return apiContent;
    }

    // Blindly assume apiContent returns an object with arrays object filled arrays as key values.
    if (apiContent !== null && typeof apiContent === 'object') {
      return Object.values(apiContent)
        .filter((value) => Array.isArray(value))
        .flatMap((items) => items);
    }

    return [];
  },
  keywordSourceProps: (item: ApiBaseItem): string[] => ['title'],
  keywords: (item: ApiBaseItem): string[] => [],
  title: (item: ApiBaseItem) => item.link.title,
  displayTitle: (item: ApiBaseItem) => (term: string) =>
    displayPath(term, [item.title]),
  url: (item: ApiBaseItem) => item.link.to,
  description: (item: ApiBaseItem) => {
    return `Bekijk ${item.title}`;
  },
};

export function displayPath(
  term: string,
  segments: string[],
  isExternal: boolean = false,
  replaceTerm: boolean = true
) {
  const termSplitted = term.split(/\s/gi);

  return (
    <>
      <span className={styles.DisplayPath}>
        {segments.map((segment, i) => {
          let segmentReplaced = segment;
          if (replaceTerm) {
            termSplitted.forEach((term) => {
              segmentReplaced = segmentReplaced.replace(
                new RegExp(term, 'ig'),
                `<em>$&</em>`
              );
            });
          }
          return (
            <InnerHtml
              key={segment}
              el="span"
              className={styles.DisplayPathSegment}
            >
              {segmentReplaced}
            </InnerHtml>
          );
        })}
      </span>
      {isExternal && (
        <span className={styles.ExternalUrl}>
          <IconExternalLink width="14" height="14" />
        </span>
      )}
    </>
  );
}

const getFocusConfig = (apiName: keyof AppState): ApiSearchConfigEntry => ({
  apiName,
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
  displayTitle: (aanvraag: FocusItem) => {
    return (term: string) => {
      const segments = [`Aanvraag ${aanvraag.productTitle}`];
      if (aanvraag.status === 'Besluit') {
        segments.push(`Besluit ${defaultDateFormat(aanvraag.datePublished)}`);
      }
      return displayPath(term, segments);
    };
  },
});

type ApiSearchConfigEntry = Partial<ApiSearchConfig> & {
  apiName: keyof AppState;
};

export const apiSearchConfigs: Array<ApiSearchConfigEntry> = [
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
      return `${vergunning.title} ${vergunning.identifier}`;
    },
    displayTitle: (vergunning: ApiBaseItem) => (term: string) => {
      return displayPath(term, [
        vergunning.title || 'test',
        vergunning.identifier || 'jup',
      ]);
    },
    keywords: () => ['vergunningsaanvraag'],
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
    keywords: () => [
      'bed',
      'breakfast',
      'bed and breakfast',
      'verhuur',
      'vergunningsaanvraag',
    ],
    title: (vergunning: ApiBaseItem) => {
      return `${vergunning.title} ${defaultDateFormat(
        vergunning.dateStart
      )} ${defaultDateFormat(vergunning.dateEnd)}`;
    },
    displayTitle: (vergunning: ToeristischeVerhuurVergunning) => {
      if (
        [
          'Geplande verhuur',
          'Geannuleerde verhuur',
          'Afgelopen verhuur',
        ].includes(vergunning.title)
      ) {
        return (term: string) =>
          displayPath(term, [
            vergunning.title,
            displayDateRange(
              vergunning.dateStart + '',
              vergunning.dateEnd + ''
            ),
          ]);
      }
      return (term: string) => {
        return displayPath(term, [vergunning.title, vergunning.identifier]);
      };
    },
    getApiBaseItems: (apiContent: {
      registraties: ToeristischeVerhuurRegistratie[];
      vergunningen: ToeristischeVerhuurVergunning[];
    }) => {
      const zaken = apiContent.vergunningen;
      const registratienummers = apiContent.registraties.map((registratie) => {
        return {
          title: 'Landelijk registratienummer',
          identifier: registratie.registrationNumber,
          link: {
            to: AppRoutes.TOERISTISCHE_VERHUUR,
            title: 'Landelijk registratienummer',
          },
        };
      });
      return [...zaken, ...registratienummers];
    },
  },
  {
    apiName: 'WMO',
    keywordSourceProps: (wmoItem: ApiBaseItem): string[] => {
      return ['supplier', 'title', 'voorzieningsoortcode'];
    },
    keywords: (tozo: ApiBaseItem): string[] =>
      uniqueArray(tozo.steps.flatMap((step: any) => [step.title, step.status])),
    displayTitle: (wmoItem: WmoItem) => {
      return (term: string) => {
        const segments = [wmoItem.title];
        if (wmoItem.supplier) {
          segments.push(`door ${wmoItem.supplier}`);
        }
        return displayPath(term, segments);
      };
    },
  },
  {
    apiName: 'FOCUS_STADSPAS',
    getApiBaseItems: (apiContent: FocusStadspasSaldo) => {
      const stadspassen = apiContent?.stadspassen?.map((stadspas) => {
        return {
          ...stadspas,
          title: 'Stadspas',
          link: {
            to: generatePath(AppRoutes['STADSPAS/SALDO'], { id: stadspas.id }),
            title: 'Stadspas',
          },
        };
      });
      return stadspassen || [];
    },
    keywords: () => ['kindtegoed', 'saldo'],
    title: (stadspas: ApiBaseItem) => `Stadspas van ${stadspas.naam}`,
    displayTitle: (stadspas: FocusStadspas) => {
      return (term: string) => {
        const segments = [`Stadspas van ${stadspas.naam}`];
        return displayPath(term, segments);
      };
    },
  },
  getFocusConfig('FOCUS_TOZO'),
  getFocusConfig('FOCUS_TONK'),
  getFocusConfig('FOCUS_AANVRAGEN'),
  {
    apiName: 'BRP',
    getApiBaseItems: (apiContent: BRPData) => {
      const identiteitsBewijzen = apiContent?.identiteitsbewijzen || [];
      const address = getFullAddress(apiContent.adres, true);
      const name = getFullName(apiContent.persoon);
      const brpDataItems: ApiBaseItem[] = [
        {
          title: name || 'Mijn naam',
          link: {
            to: AppRoutes.BRP,
            title: `Mijn naam | ${name}`,
          },
        },
        {
          title: address || 'Mijn adres',
          link: {
            to: AppRoutes.BRP,
            title: `Mijn adres | ${address}`,
          },
        },
      ];
      return [...identiteitsBewijzen, ...brpDataItems];
    },
    displayTitle: (item: Identiteitsbewijs | ApiBaseItem) => {
      return (term: string) => {
        if ('documentType' in item) {
          return displayPath(term, [capitalizeFirstLetter(item.title)]);
        }
        return displayPath(term, [capitalizeFirstLetter(item.title)]);
      };
    },
  },
  {
    apiName: 'AKTES',
    displayTitle: (document: Akte) => {
      return (term: string) =>
        displayPath(term, [capitalizeFirstLetter(document.type)]);
    },
  },
];

export const searchStateKeys: Array<keyof AppState> = apiSearchConfigs.map(
  (config) => {
    return config.apiName;
  }
);

export const staticIndex: PageEntry[] = [
  {
    url: AppRoutes.ROOT,
    title: DocumentTitles[AppRoutes.ROOT],
    displayTitle: (term: string) => displayPath(term, ['Dashboard / Home']),
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
    displayTitle: (term: string) =>
      displayPath(term, ['Informatie over Mijn Amsterdam']),
    description: 'Op dit moment staat deze informatie in Mijn Amsterdam',
    keywords: ['Uitleg', 'About', 'Over', 'Inhoud'],
  },
  {
    url: AppRoutes.BURGERZAKEN,
    title: DocumentTitles[AppRoutes.BURGERZAKEN],
    displayTitle: (term: string) => displayPath(term, ['Burgerzaken']),
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
    displayTitle: (term: string) => displayPath(term, ['Zorg']),
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
    displayTitle: (term: string) => displayPath(term, ['Stadspas']),
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
    displayTitle: (term: string) => displayPath(term, ['Inkomen']),
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
      'Werk en inkomen',
    ],
  },
  {
    url: AppRoutes.INKOMEN,
    title: 'Jaaropgaven & Uikeringsspecificaties',
    displayTitle: (term: string) =>
      displayPath(term, ['Jaaropgaven & Uikeringsspecificaties']),
    description: `Informatie over uw uitkering en de
          ondersteuning die u krijgt omdat u weinig geld hebt.`,
  },
  {
    url: generatePath(AppRoutes.NOTIFICATIONS, { page: 1 }),
    title: DocumentTitles[AppRoutes.NOTIFICATIONS],
    displayTitle: (term: string) => displayPath(term, ['Actuele meldingen']),
    description: `Alle belangrijke meldingen`,
    keywords: ['Nieuws', 'Updates', 'Status', 'Betalen', 'Overzicht'],
  },
  {
    url: AppRoutes.BRP,
    title: DocumentTitles[AppRoutes.BRP],
    displayTitle: (term: string) =>
      displayPath(term, ['Persoonlijke gegevens']),
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
    displayTitle: (term: string) => displayPath(term, ['Mijn onderneming']),
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
    displayTitle: (term: string) => displayPath(term, ['Mijn buurt']),
    description: `Een overzicht van gemeentelijke informatie rond uw eigen woning of bedrijf.`,
    keywords: ['buurt', 'straat', 'adres', 'kaart', 'map', 'Omgeving'],
  },
  {
    url: AppRoutes.TIPS,
    title: DocumentTitles[AppRoutes.TIPS],
    displayTitle: (term: string) => displayPath(term, ['Tips']),
    description: `Tips over voorzieningen en activiteiten in Amsterdam.`,
  },
  {
    url: AppRoutes.AFVAL,
    title: DocumentTitles[AppRoutes.AFVAL],
    displayTitle: (term: string) => displayPath(term, ['Afval']),
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
    displayTitle: (term: string) => displayPath(term, ['Toegankelijkheid']),
    description: `Hieronder vind u een overzicht van uw aanvragen voor toeristische verhuur.`,
    keywords: ['A11Y', 'WCAG', 'Blind', 'Slechtziend', 'Beperking'],
  },
  {
    url: AppRoutes.VERGUNNINGEN,
    title: DocumentTitles[AppRoutes.VERGUNNINGEN],
    displayTitle: (term: string) => displayPath(term, ['Vergunningen']),
    description: `Een overzicht van uw aanvragen voor vergunningen en ontheffingen bij gemeente Amsterdam.`,
    keywords: ['Vergunningen', 'Aanvragen', 'Vergunning'],
  },
  {
    url: AppRoutes.TOERISTISCHE_VERHUUR,
    title: DocumentTitles[AppRoutes.TOERISTISCHE_VERHUUR],
    displayTitle: (term: string) => displayPath(term, ['Toeristische verhuur']),
    description: `Hieronder vind u een overzicht van uw aanvragen voor toeristische verhuur.`,
    keywords: [
      'vergunning airbnb',
      'vergunning B&B',
      'vergunning Bed and Breakfast',
      'vergunning bnb',
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
      'Landelijk registratienummer',
    ],
  },
  {
    url: ExternalUrls.SSO_BELASTINGEN,
    title: 'Belastingen',
    displayTitle: (term: string) => displayPath(term, ['Belastingen']),
    description: `Een overzicht van de belastingen.`,
    keywords: [
      'Incasso',
      'Belasting',
      'Betalen',
      'Gemeente belasting',
      'iDeal betalen',
      'Boete',
      'Aanslagen',
    ],
  },
  {
    url: ExternalUrls.SSO_ERFPACHT + '',
    title: 'Erfpacht',
    displayTitle: (term: string) => displayPath(term, ['Erfpacht']),
    description: `Een overzicht van de erfpacht.`,
    keywords: ['Erfpacht', 'Canon', 'Afkopen', 'Betalen'],
  },
  {
    url: ExternalUrls.SSO_MILIEUZONE + '',
    title: 'Milieuzone',
    displayTitle: (term: string) => displayPath(term, ['Milieuzone']),
    description: `Een overzicht van milieuzone.`,
    keywords: ['Milieuzone', 'Ontheffing'],
  },
];
