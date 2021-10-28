import escapeRegex from 'lodash.escaperegexp';
import { ReactNode } from 'react';
import { generatePath } from 'react-router-dom';
import type {
  FinancieleHulp,
  KrefiaDeepLink,
  Vergunning,
} from '../../../server/services';
import type {
  FocusStadspas,
  FocusStadspasSaldo,
} from '../../../server/services/focus/focus-combined';
import type { FocusItem } from '../../../server/services/focus/focus-types';
import type {
  ToeristischeVerhuurRegistratie,
  ToeristischeVerhuurVergunning,
} from '../../../server/services/toeristische-verhuur';
import type { WmoItem } from '../../../server/services/wmo';
import {
  AppRoutes,
  DocumentTitles,
  FeatureToggle,
} from '../../../universal/config';
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

export interface SearchEntry {
  url: string;
  displayTitle: (term: string) => ReactNode;
  description: string;
  keywords: string[];
  profileTypes?: ProfileType[];
  isEnabled?: boolean;
}

export interface ApiSearchConfig {
  // Extract searchable items from the api response
  getApiBaseItems: (
    apiContent: ApiSuccessResponse<any>['content']
  ) => ApiBaseItem[];

  // SearchEntry properties

  // A description that will be used by Fuse to find matching items and is also displayed as description
  // of the SearchEntry on the Search page for Amsterdam.nl Results.
  description: ReactNode | ((item: any, config: ApiSearchConfig) => ReactNode);

  // A list of keys of which the values are used for keywords
  keywordsGeneratedFromProps:
    | string[]
    | ((item: any, config: ApiSearchConfig) => string[]);

  // A list of keywords
  keywords: string[] | ((item: any, config: ApiSearchConfig) => string[]);

  // Return a component that acts as title in the search result list
  displayTitle: (item: any, config: ApiSearchConfig) => ReactNode;

  // The url to link to
  url: string | ((item: any, config: ApiSearchConfig) => string);

  // For which profile types this api's need to be indexed
  profileTypes: ProfileType[];

  // Whether or not this api is active
  isEnabled?: boolean;
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
  keywordsGeneratedFromProps: (item: any): string[] => ['title'],
  keywords: (item: any): string[] => [],
  displayTitle: (item: any) => (term: string) =>
    displayPath(term, [item.title]),
  url: (item: any) => item.link.to,
  description: (item: any) => {
    return `Bekijk ${item.title}`;
  },
  profileTypes: ['private'],
};

export function displayPath(
  term: string,
  segments: string[],
  isExternal: boolean = false,
  replaceTerm: boolean = true
) {
  const termSplitted = term.trim().split(/\s+/g);

  return (
    <>
      <span className={styles.DisplayPath}>
        {segments.map((segment, i) => {
          let segmentReplaced = segment;
          if (replaceTerm) {
            termSplitted.forEach((term) => {
              segmentReplaced = segmentReplaced.replace(
                new RegExp(escapeRegex(term), 'ig'),
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
  keywordsGeneratedFromProps: (): string[] => {
    return ['title', 'status', 'decision', 'productTitle'];
  },
  keywords: (aanvraag: FocusItem) =>
    uniqueArray(
      aanvraag.steps.flatMap((step: any) => [step.title, step.status])
    ),
  displayTitle: (aanvraag: FocusItem) => {
    return (term: string) => {
      const segments = [`Aanvraag ${aanvraag.productTitle}`];
      if (aanvraag.status === 'Besluit') {
        segments.push(`Besluit ${defaultDateFormat(aanvraag.datePublished)}`);
      }
      return displayPath(term, segments);
    };
  },
  profileTypes:
    apiName === 'FOCUS_AANVRAGEN'
      ? ['private']
      : ['private', 'private-commercial', 'commercial'],
});

type ApiSearchConfigEntry = Partial<ApiSearchConfig> & {
  apiName: keyof AppState;
};

export type ApiSearchConfigRemote = Record<
  keyof AppState,
  Pick<
    ApiSearchConfig,
    'keywords' | 'keywordsGeneratedFromProps' | 'description'
  >
>;

export type staticSearchEntriesRemote = Record<
  keyof AppState,
  Pick<ApiSearchConfig, 'keywords' | 'description'>
>;

export interface SearchConfigRemote {
  staticSearchEntries: staticSearchEntriesRemote;
  apiSearchConfigs: ApiSearchConfigRemote;
}

interface ToeristischRegistratieItem {
  title: string;
  identifier: string;
  link: LinkProps;
  [key: string]: any;
}

export function getApiSearchConfigs(
  profileType: ProfileType,
  searchConfigsRemote?: SearchConfigRemote
) {
  return apiSearchConfigs
    .map((config) => {
      const apiConfig: ApiSearchConfig & {
        apiName: keyof AppState;
      } = {
        ...API_SEARCH_CONFIG_DEFAULT,
        ...config,
      };
      if (searchConfigsRemote?.apiSearchConfigs?.[config.apiName]) {
        // TODO: Merge deep strategy here.
        Object.assign(
          apiConfig,
          searchConfigsRemote.apiSearchConfigs[config.apiName]
        );
      }
      return apiConfig;
    })
    .filter((config) => config.profileTypes?.includes(profileType));
}

export const apiSearchConfigs: Array<ApiSearchConfigEntry> = [
  {
    apiName: 'VERGUNNINGEN',
    keywordsGeneratedFromProps: (vergunning: Vergunning): string[] => {
      const props = [
        'caseType',
        'title',
        'status',
        'decision',
        'identifier',
        'description',
      ];

      return props;
    },
    displayTitle: (vergunning: Vergunning) => (term: string) => {
      return displayPath(term, [vergunning.title, vergunning.identifier]);
    },
    keywords: () => ['vergunningsaanvraag'],
    profileTypes: ['private', 'private-commercial', 'commercial'],
  },
  {
    apiName: 'TOERISTISCHE_VERHUUR',
    getApiBaseItems: (apiContent: {
      registraties: ToeristischeVerhuurRegistratie[];
      vergunningen: ToeristischeVerhuurVergunning[];
    }): ToeristischRegistratieItem[] => {
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
      const zaken = apiContent.vergunningen.map(
        (vergunning: ToeristischeVerhuurVergunning) => {
          const title = vergunning.title;
          return {
            ...vergunning,
            title,
            identifier: vergunning.identifier,
            link: vergunning.link,
          };
        }
      );
      return [...zaken, ...registratienummers];
    },
    keywordsGeneratedFromProps: (): string[] => {
      return ['caseType', 'title', 'status', 'decision', 'identifier'];
    },
    keywords: () => [
      'bed',
      'breakfast',
      'bed and breakfast',
      'verhuur',
      'vergunningsaanvraag',
    ],
    displayTitle: (toeristischVerhuurItem: ToeristischRegistratieItem) => {
      if (
        [
          'Geplande verhuur',
          'Geannuleerde verhuur',
          'Afgelopen verhuur',
        ].includes(toeristischVerhuurItem.title)
      ) {
        return (term: string) =>
          displayPath(term, [
            toeristischVerhuurItem.title,
            displayDateRange(
              toeristischVerhuurItem.dateStart + '',
              toeristischVerhuurItem.dateEnd + ''
            ),
          ]);
      }
      return (term: string) => {
        return displayPath(term, [
          toeristischVerhuurItem.title,
          toeristischVerhuurItem.identifier,
        ]);
      };
    },

    profileTypes: ['private', 'private-commercial'],
  },
  {
    apiName: 'WMO',
    keywordsGeneratedFromProps: (): string[] => {
      return ['supplier', 'title', 'voorzieningsoortcode'];
    },
    keywords: (wmoItem: WmoItem): string[] =>
      uniqueArray(wmoItem.steps.flatMap((step) => [step.title, step.status])),
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
    keywords: () => [
      'saldo',
      'kind',
      'budget',
      'tegoed',
      'stadspas',
      'stad',
      'pas',
    ],
    displayTitle: (stadspas: FocusStadspas) => {
      return (term: string) => {
        const segments = [`Stadspas van ${stadspas.naam}`];
        return displayPath(term, segments);
      };
    },
  },
  getFocusConfig('FOCUS_TOZO'),
  getFocusConfig('FOCUS_TONK'),
  getFocusConfig('FOCUS_BBZ'),
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
    isEnabled: FeatureToggle.financieleHulpActive,
    apiName: 'FINANCIELE_HULP',
    getApiBaseItems: (
      apiContent: Omit<FinancieleHulp, 'notificationTriggers'>
    ) => {
      const deepLinks =
        !!apiContent?.deepLinks &&
        Object.values(apiContent.deepLinks)
          .filter(
            (deepLink: KrefiaDeepLink): deepLink is KrefiaDeepLink =>
              deepLink !== null
          )
          .map((deepLink) => {
            return {
              ...deepLink,
              title: deepLink.title,
              link: {
                to: deepLink.url,
                title: deepLink.title,
              },
            };
          });
      return deepLinks || [];
    },
    keywords: () => [
      'lening',
      'fibu',
      'schuldhulpregeling',
      'regeling',
      'krediet',
      'budgetbeheer',
    ],
  },
];

export const staticSearchEntries: Array<
  Optional<SearchEntry, 'keywords' | 'description'>
> = [
  {
    url: AppRoutes.ROOT,
    displayTitle: (term: string) => displayPath(term, ['Dashboard / Home']),
  },
  {
    url: AppRoutes.GENERAL_INFO,
    displayTitle: (term: string) =>
      displayPath(term, ['Informatie over Mijn Amsterdam']),
  },
  {
    url: AppRoutes.BURGERZAKEN,
    displayTitle: (term: string) => displayPath(term, ['Burgerzaken']),
    profileTypes: ['private'],
  },
  {
    url: AppRoutes.ZORG,
    displayTitle: (term: string) => displayPath(term, ['Zorg']),
    profileTypes: ['private'],
  },
  {
    url: AppRoutes.STADSPAS,
    displayTitle: (term: string) => displayPath(term, ['Stadspas']),
    profileTypes: ['private'],
  },
  {
    url: AppRoutes.INKOMEN,
    displayTitle: (term: string) => displayPath(term, ['Inkomen']),
    profileTypes: ['private'],
  },
  {
    url: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      type: 'uitkering',
    }),
    displayTitle: (term: string) =>
      displayPath(term, ['Jaaropgaven & Uikeringsspecificaties']),
    profileTypes: ['private'],
  },
  {
    url: generatePath(AppRoutes.NOTIFICATIONS, { page: 1 }),
    displayTitle: (term: string) => displayPath(term, ['Actuele meldingen']),
  },
  {
    url: AppRoutes.BRP,
    displayTitle: (term: string) =>
      displayPath(term, ['Persoonlijke gegevens (BRP)']),
  },
  {
    url: AppRoutes.BRP,
    displayTitle: (term: string) =>
      displayPath(term, ['Persoonlijke gegevens']),
    profileTypes: ['private'],
  },
  {
    url: AppRoutes.KVK,
    displayTitle: (term: string) => displayPath(term, ['Mijn onderneming']),
    profileTypes: ['private-commercial', 'commercial'],
  },
  {
    url: AppRoutes.BUURT,
    displayTitle: (term: string) => displayPath(term, ['Mijn buurt']),
  },
  {
    url: AppRoutes.TIPS,
    displayTitle: (term: string) => displayPath(term, ['Tips']),
  },
  {
    url: AppRoutes.AFVAL,
    displayTitle: (term: string) => displayPath(term, ['Afval']),
  },
  {
    url: AppRoutes.ACCESSIBILITY,
    displayTitle: (term: string) => displayPath(term, ['Toegankelijkheid']),
  },
  {
    url: AppRoutes.VERGUNNINGEN,
    displayTitle: (term: string) => displayPath(term, ['Vergunningen']),
  },
  {
    url: AppRoutes.TOERISTISCHE_VERHUUR,
    displayTitle: (term: string) => displayPath(term, ['Toeristische verhuur']),
    profileTypes: ['private'],
  },
  {
    url: ExternalUrls.SSO_BELASTINGEN,
    displayTitle: (term: string) => displayPath(term, ['Belastingen']),
  },
  {
    url: ExternalUrls.SSO_ERFPACHT + '',
    displayTitle: (term: string) => displayPath(term, ['Erfpacht']),
  },
  {
    url: ExternalUrls.SSO_MILIEUZONE + '',
    displayTitle: (term: string) => displayPath(term, ['Milieuzone']),
  },
  {
    isEnabled: FeatureToggle.financieleHulpActive,
    url: AppRoutes.FINANCIELE_HULP,
    displayTitle: (term: string) => displayPath(term, ['Financiële hulp']),
    profileTypes: ['private', 'private-commercial'],
  },
];
