import type { ReactElement, ReactNode } from 'react';

import escapeRegex from 'lodash.escaperegexp';

import styles from './Search.module.scss';
import type { AfisThemaResponse } from '../../../server/services/afis/afis-types.ts';
import type { AVGRequestFrontend } from '../../../server/services/avg/types.ts';
import type { BezwaarFrontend } from '../../../server/services/bezwaren/types.ts';
import type { LoodMetingFrontend } from '../../../server/services/bodem/types.ts';
import type { BrpFrontend } from '../../../server/services/brp/brp-types.ts';
import type {
  ErfpachtDossiersResponse,
  ErfpachtDossierFrontend,
} from '../../../server/services/erfpacht/erfpacht-types.ts';
import type { HLIresponseData } from '../../../server/services/hli/hli-regelingen-types.ts';
import type { HorecaVergunningFrontend } from '../../../server/services/horeca/decos-zaken.ts';
import type { KlachtFrontend } from '../../../server/services/klachten/types.ts';
import type {
  Krefia,
  KrefiaDeepLink,
} from '../../../server/services/krefia/krefia.types.ts';
import type { ParkeerVergunningFrontend } from '../../../server/services/parkeren/config-and-types.ts';
import type { BBVergunningFrontend } from '../../../server/services/toeristische-verhuur/bed-and-breakfast/bed-and-breakfast-types.ts';
import type {
  LVVRegistratie,
  VakantieverhuurVergunningFrontend,
} from '../../../server/services/toeristische-verhuur/toeristische-verhuur.types.ts';
import type {
  VarenRegistratieRederType,
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../server/services/varen/config-and-types.ts';
import type { ZaakFrontendCombined } from '../../../server/services/vergunningen/config-and-types.ts';
import type { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-types.ts';
import type { ApiSuccessResponse } from '../../../universal/helpers/api.ts';
import { getFullAddress, getFullName } from '../../../universal/helpers/brp.ts';
import {
  defaultDateFormat,
  displayDateRange,
} from '../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import { uniqueArray } from '../../../universal/helpers/utils.ts';
import type {
  LinkProps,
  StatusLineItem,
} from '../../../universal/types/App.types.ts';
import type { ThemaMenuItem } from '../../config/thema-types.ts';
import type { AfisFactuurFrontend } from '../../pages/Thema/Afis/Afis-thema-config.ts';
import { themaConfig as avgThemaConfig } from '../../pages/Thema/AVG/AVG-thema-config.ts';
import { themaConfig as themaConfigBezwaren } from '../../pages/Thema/Bezwaren/Bezwaren-thema-config.ts';
import { themaConfig as themaConfigBodem } from '../../pages/Thema/Bodem/Bodem-thema-config.ts';
import { themaConfig as themaConfigHoreca } from '../../pages/Thema/Horeca/Horeca-thema-config.ts';
import { themaConfig as themaConfigKlachten } from '../../pages/Thema/Klachten/Klachten-thema-config.ts';
import { themaConfig as themaConfigKrefia } from '../../pages/Thema/Krefia/Krefia-thema-config.ts';
import { routeConfig as routeConfigProfile } from '../../pages/Thema/Profile/Profile-thema-config.ts';
import { themaConfig as toeristischeVerhuurThemaConfig } from '../../pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import { themaConfig as themaConfigVaren } from '../../pages/Thema/Varen/Varen-thema-config.ts';

export interface SearchEntry {
  url: string;
  themaId?: ThemaMenuItem['id'];
  displayTitle: ((term: string) => ReactElement) | ReactElement;
  description: string;
  keywords: string[];
  profileTypes?: ProfileType[];
  isEnabled?: boolean;
  trailingIcon?: ReactElement;
}

export type RemoteApiSearchConfigs = Record<
  string,
  Partial<Omit<ApiSearchConfig, 'getApiBaseItems' | 'generateKeywords'>>
>;

export interface ApiSearchConfig {
  stateKey: string;
  // Extract searchable items from the api response
  getApiBaseItems: (
    apiContent: ApiSuccessResponse<ApiBaseItem>['content']
  ) => ApiBaseItem[];

  // SearchEntry properties

  // A description that will be used by Fuse to find matching items and is also displayed as description
  // of the SearchEntry on the Search page for Amsterdam.nl Results.
  description:
    | ReactElement
    | ((item: ApiBaseItem, config: ApiSearchConfig) => string);

  // A list of keys of which the values are used for keywords
  keywordsGeneratedFromProps?: string[];

  // A list of static keywords
  keywords?: string[];

  // A function to generate additional keywords derived from the data source
  generateKeywords?: (item: ApiBaseItem, config: ApiSearchConfig) => string[];

  // Return a component that acts as title in the search result list
  displayTitle:
    | ((item: ApiBaseItem) => ReactElement | ((term: string) => ReactElement))
    | ReactElement;

  // The url to link to
  url: string | ((item: ApiBaseItem, config: ApiSearchConfig) => string);

  // For which profile types this api's need to be indexed
  profileTypes: ProfileType[];

  // Whether or not this api is active
  isEnabled?: boolean;
}

// Used any here because the shape of the items can differ greatly between different API's and it's not worth the effort to type them all at the moment.
// There is a ticket on the backlog to add more specific types for the different API's and remove the any type: MIJN-11547
export type ApiBaseItem = any;

export const API_SEARCH_CONFIG_DEFAULT: Optional<ApiSearchConfig, 'stateKey'> =
  {
    getApiBaseItems: (apiContent: ApiSuccessResponse<unknown>['content']) => {
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
    displayTitle: (item: ApiBaseItem) => (term: string) => {
      return displayPath(term, [item.title]);
    },
    url: (item: ApiBaseItem) => item.link?.to || '/',
    description: (item: ApiBaseItem) => {
      return `Bekijk ${item.title}`;
    },
    profileTypes: ['private'] as ProfileType[],
    keywordsGeneratedFromProps: ['title', 'description'],
  };

export function displayPath(
  term: string,
  segments: ReactNode[],
  replaceTerm: boolean = true
): ReactElement {
  const termSplitted = term.trim().split(/\s+/g);
  return (
    <>
      <span className={styles.DisplayPath}>
        {segments.map((segment, i) => {
          if (typeof segment !== 'string' || !replaceTerm) {
            return (
              <span
                key={`${i}-${typeof segment === 'string' ? segment : 'node'}`}
                className={styles.DisplayPathSegment}
              >
                {segment}
              </span>
            );
          } else if (typeof segment === 'string' && replaceTerm) {
            let segmentReplaced = segment;
            if (replaceTerm) {
              termSplitted.forEach((termPart) => {
                const replaced = segmentReplaced?.replace(
                  new RegExp(escapeRegex(termPart), 'ig'),
                  `<em>$&</em>`
                );
                if (replaced) {
                  segmentReplaced = replaced;
                }
              });
            }
            return (
              <span
                key={`${i}-${segment}`}
                className={styles.DisplayPathSegment}
                dangerouslySetInnerHTML={{
                  __html: segmentReplaced,
                }}
              />
            );
          }
        })}
      </span>
    </>
  );
}

const getWpiConfig = (
  stateKey: string
): Pick<
  ApiSearchConfig,
  'stateKey' | 'displayTitle' | 'profileTypes' | 'generateKeywords'
> => ({
  stateKey,
  generateKeywords: (aanvraag: ApiBaseItem) =>
    'steps' in aanvraag && Array.isArray(aanvraag.steps)
      ? uniqueArray(
          aanvraag.steps.flatMap((step: StatusLineItem) => [
            step.description,
            step.status,
          ])
        )
      : [],
  displayTitle: (aanvraag: ApiBaseItem) => {
    return (term: string) => {
      const segments =
        aanvraag.about === 'Bbz'
          ? ['Uw Bbz overzicht']
          : [`Aanvraag ${aanvraag.about}`];
      if (
        aanvraag.statusId === 'besluit' &&
        typeof aanvraag.datePublished === 'string'
      ) {
        segments.push(`Besluit ${defaultDateFormat(aanvraag.datePublished)}`);
      }
      return displayPath(term, segments);
    };
  },
  profileTypes: (stateKey === 'WPI_AANVRAGEN'
    ? ['private']
    : ['private', 'commercial']) as ProfileType[],
});

export type ApiSearchConfigRemote = Record<
  string,
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
  [key: string]: unknown;
}

export const apiSearchConfigs: ApiSearchConfig[] = [
  {
    stateKey: 'VERGUNNINGEN',
    displayTitle: (vergunning: ZaakFrontendCombined) => (term: string) => {
      return displayPath(term, [
        vergunning.title,
        vergunning.identifier as string,
      ]);
    },
    keywordsGeneratedFromProps: ['identifier'],
  },
  {
    stateKey: 'PARKEREN',
    getApiBaseItems: (apiContent: {
      vergunningen: ParkeerVergunningFrontend[];
    }) => {
      return apiContent?.vergunningen ?? [];
    },
    displayTitle: (vergunning: ParkeerVergunningFrontend) => (term: string) => {
      return displayPath(term, [vergunning.title, vergunning.identifier]);
    },
    keywordsGeneratedFromProps: ['identifier'],
  },
  {
    stateKey: 'ERFPACHT',
    getApiBaseItems: (
      erfpachtDossiersResponse: ErfpachtDossiersResponse
    ): ErfpachtDossierFrontend[] => {
      return erfpachtDossiersResponse?.dossiers?.dossiers ?? [];
    },
    displayTitle: (dossier: ErfpachtDossierFrontend) => (term: string) => {
      return displayPath(term, [dossier.title]);
    },
  },
  {
    stateKey: 'TOERISTISCHE_VERHUUR',
    profileTypes: ['private', 'commercial'] as ProfileType[],
    getApiBaseItems: (apiContent: {
      lvvRegistraties: LVVRegistratie[];
      vakantieverhuurVergunningen: VakantieverhuurVergunningFrontend[];
      bbVergunningen: BBVergunningFrontend[];
    }) => {
      const registratienummers = apiContent.lvvRegistraties?.map(
        (registratie) => {
          return {
            title: 'Landelijk registratienummer',
            identifier: registratie.registrationNumber,
            link: {
              to: toeristischeVerhuurThemaConfig.route.path,
              title: 'Landelijk registratienummer',
            },
          };
        }
      );
      const zaken = apiContent.vakantieverhuurVergunningen;
      const zaken2 = apiContent.bbVergunningen;
      return [
        ...(zaken || []),
        ...(zaken2 || []),
        ...(registratienummers || []),
      ];
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
    keywordsGeneratedFromProps: ['identifier'],
  },
  {
    stateKey: 'WMO',
    generateKeywords: (wmoItem: WMOVoorzieningFrontend): string[] =>
      uniqueArray(
        wmoItem.steps.flatMap((step) => [step.description, step.status])
      ),
    displayTitle: (wmoItem: WMOVoorzieningFrontend) => {
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
    stateKey: 'HLI',
    getApiBaseItems: (apiContent: HLIresponseData) => {
      const stadspassen =
        apiContent?.stadspas?.stadspassen?.map((stadspas) => {
          return {
            ...stadspas,
            title: `Stadspas van ${stadspas.owner.firstname}`,
          };
        }) || [];
      const regelingen = apiContent?.regelingen || [];
      return [...stadspassen, ...regelingen];
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
  {
    stateKey: 'AFIS',
    profileTypes: ['private', 'commercial'] as ProfileType[],
    generateKeywords: (factuur: AfisFactuurFrontend): string[] =>
      uniqueArray([
        factuur.factuurNummer,
        factuur.statusDescription,
        factuur.afzender,
      ]),
    getApiBaseItems: (data: AfisThemaResponse) => {
      if (data?.facturen) {
        return Object.values(data.facturen).flatMap(
          (byState) => byState?.facturen ?? []
        );
      }
      return [];
    },
    displayTitle: (item: AfisFactuurFrontend) => {
      return (term: string) => {
        return displayPath(term, [
          `Factuur ${item.factuurNummer}`,
          item.paymentDueDateFormatted,
          item.statusDescription,
        ]);
      };
    },
  },
  getWpiConfig('WPI_TOZO'),
  getWpiConfig('WPI_TONK'),
  getWpiConfig('WPI_BBZ'),
  getWpiConfig('WPI_AANVRAGEN'),
  {
    stateKey: 'BRP',
    getApiBaseItems: (apiContent: BrpFrontend) => {
      const address = getFullAddress(apiContent.adres, true);
      const name = getFullName(apiContent.persoon);
      const brpDataItems = [
        {
          title: name || 'Mijn naam',
          link: {
            to: routeConfigProfile.themaPageBRP.path,
            title: `Mijn naam | ${name}`,
          },
        },
        {
          title: address || 'Mijn adres',
          link: {
            to: routeConfigProfile.themaPageBRP.path,
            title: `Mijn adres | ${address}`,
          },
        },
      ];
      return brpDataItems;
    },
    displayTitle: (item: ApiBaseItem) => {
      return (term: string) =>
        displayPath(term, [capitalizeFirstLetter(item.title)]);
    },
  },
  {
    isEnabled: themaConfigKrefia.featureToggle.active,
    stateKey: 'KREFIA',
    getApiBaseItems: (apiContent: Omit<Krefia, 'notificationTriggers'>) => {
      const deepLinks =
        !!apiContent?.deepLinks &&
        apiContent.deepLinks
          .filter((deepLink: KrefiaDeepLink) => deepLink !== null)
          .map((deepLink) => {
            return {
              ...deepLink,
              title: deepLink.link.title,
              link: deepLink.link,
            };
          });
      return deepLinks || [];
    },
  },
  {
    isEnabled: themaConfigBezwaren.featureToggle.active,
    stateKey: 'BEZWAREN',
    profileTypes: ['private', 'commercial'] as ProfileType[],
    displayTitle(item: BezwaarFrontend) {
      return (term: string) =>
        displayPath(term, [`Bezwaar ${item.identificatie}`]);
    },
  },
  {
    isEnabled: themaConfigKlachten.featureToggle.active,
    stateKey: 'KLACHTEN',
    profileTypes: ['private', 'commercial'] as ProfileType[],
    displayTitle(item: KlachtFrontend) {
      return (term: string) =>
        displayPath(term, [
          `Klacht ${item.id}${item.onderwerp ? ` - ${item.onderwerp}` : ''}`,
        ]);
    },
    keywordsGeneratedFromProps: [
      'onderwerp',
      'omschrijving',
      'gewensteOplossing',
      'locatie',
    ],
  },
  {
    isEnabled: true,
    stateKey: 'SVWI',
    displayTitle(item: { title: string }) {
      return (term: string) => displayPath(term, [item.title]);
    },
  },
  {
    isEnabled: themaConfigBodem.featureToggle.active,
    stateKey: 'BODEM',
    profileTypes: ['private', 'commercial'] as ProfileType[],
    displayTitle(item: LoodMetingFrontend) {
      return (term: string) => displayPath(term, [item.title, item.adres]);
    },
  },
  {
    isEnabled: avgThemaConfig.featureToggle.active,
    stateKey: 'AVG',
    profileTypes: ['private', 'commercial'] as ProfileType[],
    displayTitle(item: AVGRequestFrontend) {
      return (term: string) => displayPath(term, [item.title]);
    },
  },
  {
    isEnabled: themaConfigHoreca.featureToggle.active,
    stateKey: 'HORECA',
    profileTypes: ['private', 'commercial'] as ProfileType[],
    displayTitle: (vergunning: HorecaVergunningFrontend) => (term: string) => {
      return displayPath(term, [vergunning.title, vergunning.identifier]);
    },
    keywordsGeneratedFromProps: ['identifier'],
  },
  {
    isEnabled: themaConfigVaren.featureToggle.active,
    stateKey: 'VAREN',
    profileTypes: ['commercial'] as ProfileType[],
    getApiBaseItems: (apiContent: {
      reder: VarenRegistratieRederType;
      zaken: VarenZakenFrontend[];
      vergunningen: VarenVergunningFrontend[];
    }) => {
      const zaken =
        apiContent?.zaken.map((zaak) => ({
          ...zaak,
          vergunningKenmerk:
            zaak.vergunningKenmerk || zaak.vergunning?.vergunningKenmerk,
        })) ?? [];
      const vergunningen =
        apiContent?.vergunningen.map((vergunning) => ({
          ...vergunning,
        })) ?? [];
      if (!apiContent.reder) {
        return [...zaken, ...vergunningen];
      }
      const reder = {
        ...apiContent.reder,
        link: {
          to: themaConfigVaren.route.path,
          title: themaConfigVaren.title,
        },
      };
      return [reder, ...zaken, ...vergunningen];
    },
    displayTitle:
      (
        item:
          | VarenRegistratieRederType
          | VarenZakenFrontend
          | VarenVergunningFrontend
      ) =>
      (term: string) => {
        const vesselName = 'vesselName' in item ? item.vesselName : null;
        const vergunningKenmerk =
          ('vergunningKenmerk' in item && item.vergunningKenmerk) || null;
        return displayPath(term, [
          item.title,
          vesselName || vergunningKenmerk || item.identifier,
        ]);
      },
    keywordsGeneratedFromProps: [
      'identifier',
      'vesselName',
      'vesselNameNew',
      'vergunningKenmerk',
      'eniNumber',
    ],
    keywords: ['passagiersvaart', 'beroepsvaart', 'varen'],
  },
].map((apiConfig) => {
  return {
    ...API_SEARCH_CONFIG_DEFAULT,
    ...apiConfig,
  };
});
