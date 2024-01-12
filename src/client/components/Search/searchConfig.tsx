import escapeRegex from 'lodash.escaperegexp';
import { ReactNode } from 'react';
import type {
  HorecaVergunningen,
  Krefia,
  KrefiaDeepLink,
  Vergunning,
} from '../../../server/services';
import type {
  ToeristischeVerhuurRegistratieDetail,
  ToeristischeVerhuurVergunning,
} from '../../../server/services/toeristische-verhuur';
import type { WmoItem } from '../../../server/services/wmo';
import type {
  WpiRequestProcess,
  WpiStadspasResponseData,
} from '../../../server/services/wpi/wpi-types';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { getFullAddress, getFullName } from '../../../universal/helpers';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import {
  defaultDateFormat,
  displayDateRange,
} from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { uniqueArray } from '../../../universal/helpers/utils';
import {
  BRPData,
  Identiteitsbewijs,
  LinkProps,
  StatusLine,
} from '../../../universal/types';
import { AppState } from '../../AppState';
import InnerHtml from '../InnerHtml/InnerHtml';
import styles from './Search.module.scss';
import { Bezwaar } from '../../../server/services/bezwaren/types';
import { LoodMeting } from '../../../server/services/bodem/types';
import { SIAItem } from '../../../server/services/sia';
import { AVGRequest } from '../../../server/services/avg/types';
import {
  ErfpachtV2Dossier,
  ErfpachtV2DossiersResponse,
} from '../../../server/services/simple-connect/erfpacht';

export interface SearchEntry {
  url: string;
  displayTitle: ((term: string) => ReactNode) | ReactNode;
  description: string;
  keywords: string[];
  profileTypes?: ProfileType[];
  isEnabled?: boolean;
  trailingIcon?: ReactNode;
}

export interface ApiSearchConfig {
  stateKey: keyof AppState;
  // Extract searchable items from the api response
  getApiBaseItems: (
    apiContent: ApiSuccessResponse<any>['content']
  ) => ApiBaseItem[];

  // SearchEntry properties

  // A description that will be used by Fuse to find matching items and is also displayed as description
  // of the SearchEntry on the Search page for Amsterdam.nl Results.
  description: ReactNode | ((item: any, config: ApiSearchConfig) => ReactNode);

  // A list of keys of which the values are used for keywords
  keywordsGeneratedFromProps?: string[];

  // A list of static keywords
  keywords?: string[];

  // A function to generate additional keywords derived from the data source
  generateKeywords?: (item: any, config: ApiSearchConfig) => string[];

  // Return a component that acts as title in the search result list
  displayTitle:
    | ((item: any) => ReactNode | ((term: string) => ReactNode))
    | ReactNode;

  // The url to link to
  url: string | ((item: any, config: ApiSearchConfig) => string);

  // For which profile types this api's need to be indexed
  profileTypes: ProfileType[];

  // Whether or not this api is active
  isEnabled?: boolean;
}

export interface ApiBaseItem {
  title: string;
  link?: LinkProps;
  [key: string]: any;
}

export const API_SEARCH_CONFIG_DEFAULT: Optional<ApiSearchConfig, 'stateKey'> =
  {
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
    displayTitle: (item: any) => (term: string) => {
      return displayPath(term, [item.title]);
    },
    url: (item: any) => item.link?.to || '/',
    description: (item: any) => {
      return `Bekijk ${item.title}`;
    },
    profileTypes: ['private'],
    keywordsGeneratedFromProps: ['title', 'description'],
  };

export function displayPath(
  term: string,
  segments: string[],
  replaceTerm: boolean = true
): ReactNode {
  const termSplitted = term.trim().split(/\s+/g);
  return (
    <>
      <span className={styles.DisplayPath}>
        {segments.map((segment, i) => {
          let segmentReplaced = segment;
          if (replaceTerm) {
            termSplitted.forEach((termPart) => {
              const replaced = segmentReplaced.replace(
                new RegExp(escapeRegex(termPart), 'ig'),
                `<em>$&</em>`
              );
              if (replaced) {
                segmentReplaced = replaced;
              }
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
    </>
  );
}

const getWpiConfig = (
  stateKey: keyof AppState
): Pick<
  ApiSearchConfig,
  'stateKey' | 'displayTitle' | 'profileTypes' | 'generateKeywords'
> => ({
  stateKey,
  generateKeywords: (aanvraag: StatusLine) =>
    uniqueArray(
      aanvraag.steps.flatMap((step: any) => [step.title, step.status])
    ),
  displayTitle: (aanvraag: StatusLine) => {
    return (term: string) => {
      const segments =
        aanvraag.about === 'Bbz'
          ? ['Uw Bbz overzicht']
          : [`Aanvraag ${aanvraag.about}`];
      if (aanvraag.statusId === 'besluit') {
        segments.push(`Besluit ${defaultDateFormat(aanvraag.datePublished)}`);
      }
      return displayPath(term, segments);
    };
  },
  profileTypes:
    stateKey === 'WPI_AANVRAGEN' ? ['private'] : ['private', 'commercial'],
});

export type ApiSearchConfigRemote = Record<
  keyof AppState,
  Pick<
    ApiSearchConfig,
    'keywords' | 'keywordsGeneratedFromProps' | 'description'
  >
>;

export interface SearchConfigRemote {
  staticSearchEntries: SearchEntry[];
  apiSearchConfigs: ApiSearchConfigRemote;
}

interface ToeristischRegistratieItem {
  title: string;
  identifier: string;
  link: LinkProps;
  [key: string]: any;
}

export const apiSearchConfigs: ApiSearchConfig[] = [
  {
    stateKey: 'VERGUNNINGEN' as keyof AppState,
    displayTitle: (vergunning: Vergunning) => (term: string) => {
      return displayPath(term, [vergunning.title, vergunning.identifier]);
    },
  },
  {
    stateKey: 'ERFPACHTv2' as keyof AppState,
    getApiBaseItems: (
      erfpachtV2DossiersResponse: ErfpachtV2DossiersResponse
    ): ErfpachtV2Dossier[] => {
      return erfpachtV2DossiersResponse?.dossiers?.dossiers ?? [];
    },
    displayTitle: (dossier: ErfpachtV2Dossier) => (term: string) => {
      return displayPath(term, [dossier.title]);
    },
  },
  {
    stateKey: 'TOERISTISCHE_VERHUUR' as keyof AppState,
    getApiBaseItems: (apiContent: {
      registraties: ToeristischeVerhuurRegistratieDetail[];
      vergunningen: ToeristischeVerhuurVergunning[];
    }): ToeristischRegistratieItem[] => {
      const registratienummers = apiContent.registraties?.map((registratie) => {
        return {
          title: 'Landelijk registratienummer',
          identifier: registratie.registrationNumber,
          link: {
            to: AppRoutes.TOERISTISCHE_VERHUUR,
            title: 'Landelijk registratienummer',
          },
        };
      });
      const zaken = apiContent.vergunningen?.map(
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
      return [...(zaken || []), ...(registratienummers || [])];
    },
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
  },
  {
    stateKey: 'WMO' as keyof AppState,
    generateKeywords: (wmoItem: WmoItem): string[] =>
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
    stateKey: 'WPI_STADSPAS' as keyof AppState,
    getApiBaseItems: (
      apiContent: WpiStadspasResponseData & {
        aanvragen?: WpiRequestProcess[];
      }
    ) => {
      const stadspassen =
        apiContent?.stadspassen?.map((stadspas) => {
          return {
            ...stadspas,
            title: `Stadspas van ${stadspas.owner}`,
          };
        }) || [];
      const aanvragen = apiContent?.aanvragen || [];
      return [...stadspassen, ...aanvragen];
    },
    displayTitle: (item: {
      title: string;
      about?: string;
      datePublished: string;
      statusId?: string;
    }) => {
      return (term: string) => {
        const segments = item.about ? [`Aanvraag ${item.about}`] : [item.title];
        if (item.statusId === 'besluit') {
          segments.push(`Besluit ${defaultDateFormat(item.datePublished)}`);
        }
        return displayPath(term, segments);
      };
    },
  },
  getWpiConfig('WPI_TOZO'),
  getWpiConfig('WPI_TONK'),
  getWpiConfig('WPI_BBZ'),
  getWpiConfig('WPI_AANVRAGEN'),
  {
    stateKey: 'BRP' as keyof AppState,
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
      return (term: string) =>
        displayPath(term, [capitalizeFirstLetter(item.title)]);
    },
  },
  {
    isEnabled: FeatureToggle.krefiaActive,
    stateKey: 'KREFIA' as keyof AppState,
    getApiBaseItems: (apiContent: Omit<Krefia, 'notificationTriggers'>) => {
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
  },
  {
    isEnabled: FeatureToggle.bezwarenActive,
    stateKey: 'BEZWAREN' as keyof AppState,
    displayTitle(item: Bezwaar) {
      return (term: string) =>
        displayPath(term, [`Bezwaar ${item.zaakkenmerk}`]);
    },
  },
  {
    isEnabled: FeatureToggle.bodemActive,
    stateKey: 'BODEM' as keyof AppState,
    displayTitle(item: LoodMeting) {
      return (term: string) =>
        displayPath(term, [`Loodmeting ${item.aanvraagNummer}`]);
    },
  },
  {
    isEnabled: FeatureToggle.avgActive,
    stateKey: 'AVG' as keyof AppState,
    displayTitle(item: AVGRequest) {
      return (term: string) => displayPath(term, [`AVG verzoek ${item.id}`]);
    },
  },
  {
    isEnabled: FeatureToggle.horecaActive,
    stateKey: 'HORECA' as keyof AppState,
    displayTitle(item: HorecaVergunningen) {
      return (term: string) =>
        displayPath(term, [`Horecavergunning ${item.title}`]);
    },
  },
  {
    isEnabled: FeatureToggle.siaActive,
    stateKey: 'SIA' as keyof AppState,
    displayTitle(item: SIAItem) {
      return (term: string) =>
        displayPath(term, [`Melding ${item.identifier}`]);
    },
  },
].map((apiConfig) => {
  return {
    ...API_SEARCH_CONFIG_DEFAULT,
    ...apiConfig,
  };
});
