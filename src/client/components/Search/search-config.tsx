import { ReactNode } from 'react';

import escapeRegex from 'lodash.escaperegexp';

import styles from './Search.module.scss';
import {
  AfisThemaResponse,
  AfisFactuur,
} from '../../../server/services/afis/afis-types';
import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { BezwaarFrontend } from '../../../server/services/bezwaren/types';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import type {
  ErfpachtDossiersResponse,
  ErfpachtDossierFrontend,
} from '../../../server/services/erfpacht/erfpacht-types';
import { HLIresponseData } from '../../../server/services/hli/hli-regelingen-types';
import type { HorecaVergunningFrontend } from '../../../server/services/horeca/decos-zaken';
import type { KlachtFrontend } from '../../../server/services/klachten/types';
import type {
  Krefia,
  KrefiaDeepLink,
} from '../../../server/services/krefia/krefia.types';
import type { ParkeerVergunningFrontend } from '../../../server/services/parkeren/config-and-types';
import type {
  BRPData,
  IdentiteitsbewijsFrontend,
} from '../../../server/services/profile/brp.types';
import { BBVergunningFrontend } from '../../../server/services/toeristische-verhuur/bed-and-breakfast/bed-and-breakfast-types';
import {
  LVVRegistratie,
  VakantieverhuurVergunningFrontend,
} from '../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import {
  VarenRegistratieRederType,
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../server/services/varen/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import { getFullAddress, getFullName } from '../../../universal/helpers/brp';
import {
  defaultDateFormat,
  displayDateRange,
} from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { uniqueArray } from '../../../universal/helpers/utils';
import {
  AppStateKey,
  LinkProps,
  StatusLineItem,
} from '../../../universal/types/App.types';
import { featureToggle as featureToggleAVG } from '../../pages/Thema/AVG/AVG-thema-config';
import { featureToggle as featureToggleBezwaren } from '../../pages/Thema/Bezwaren/Bezwaren-thema-config';
import { featureToggle as featureToggleBodem } from '../../pages/Thema/Bodem/Bodem-thema-config';
import { featureToggle as featureToggleHoreca } from '../../pages/Thema/Horeca/Horeca-thema-config';
import { featureToggle as featureToggleKlachten } from '../../pages/Thema/Klachten/Klachten-thema-config';
import { featureToggle as featureToggleKrefia } from '../../pages/Thema/Krefia/Krefia-thema-config';
import { routeConfig as routeConfigProfile } from '../../pages/Thema/Profile/Profile-thema-config';
import { routeConfig as routeConfigToeristischeVerhuur } from '../../pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import {
  featureToggle as featureToggleVaren,
  routeConfig as routeConfigVaren,
  themaTitle as themaTitleVaren,
} from '../../pages/Thema/Varen/Varen-thema-config';

export interface SearchEntry {
  url: string;
  displayTitle: ((term: string) => ReactNode) | ReactNode;
  description: string;
  keywords: string[];
  profileTypes?: ProfileType[];
  isEnabled?: boolean;
  trailingIcon?: ReactNode;
}

export type RemoteApiSearchConfigs = Record<
  AppStateKey,
  Partial<Omit<ApiSearchConfig, 'getApiBaseItems' | 'generateKeywords'>>
>;

export interface ApiSearchConfig {
  stateKey: AppStateKey;
  // Extract searchable items from the api response
  getApiBaseItems: (
    apiContent: ApiSuccessResponse<ApiBaseItem>['content']
  ) => ApiBaseItem[];

  // SearchEntry properties

  // A description that will be used by Fuse to find matching items and is also displayed as description
  // of the SearchEntry on the Search page for Amsterdam.nl Results.
  description:
    | ReactNode
    | ((item: ApiBaseItem, config: ApiSearchConfig) => ReactNode);

  // A list of keys of which the values are used for keywords
  keywordsGeneratedFromProps?: string[];

  // A list of static keywords
  keywords?: string[];

  // A function to generate additional keywords derived from the data source
  generateKeywords?: (item: ApiBaseItem, config: ApiSearchConfig) => string[];

  // Return a component that acts as title in the search result list
  displayTitle:
    | ((item: ApiBaseItem) => ReactNode | ((term: string) => ReactNode))
    | ReactNode;

  // The url to link to
  url: string | ((item: ApiBaseItem, config: ApiSearchConfig) => string);

  // For which profile types this api's need to be indexed
  profileTypes: ProfileType[];

  // Whether or not this api is active
  isEnabled?: boolean;
}

export type ApiBaseItem<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  title: string;
  link?: LinkProps;
} & T;

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
              key={segment}
              className={styles.DisplayPathSegment}
              dangerouslySetInnerHTML={{
                __html: segmentReplaced,
              }}
            />
          );
        })}
      </span>
    </>
  );
}

const getWpiConfig = (
  stateKey: AppStateKey
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
  profileTypes:
    stateKey === 'WPI_AANVRAGEN' ? ['private'] : ['private', 'commercial'],
});

export type ApiSearchConfigRemote = Record<
  AppStateKey,
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
    displayTitle: (vergunning: VergunningFrontend) => (term: string) => {
      return displayPath(term, [vergunning.title, vergunning.identifier]);
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
    profileTypes: ['private', 'commercial'],
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
              to: routeConfigToeristischeVerhuur.themaPage.path,
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
    profileTypes: ['private', 'commercial'],
    getApiBaseItems: (data: AfisThemaResponse) => {
      if (data?.facturen) {
        return Object.values(data.facturen).flatMap(
          (byState) => byState?.facturen ?? []
        );
      }
      return [];
    },
    displayTitle: (
      item: ApiBaseItem<
        Pick<
          AfisFactuur,
          'factuurNummer' | 'paymentDueDateFormatted' | 'statusDescription'
        >
      >
    ) => {
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
    getApiBaseItems: (apiContent: BRPData) => {
      const identiteitsBewijzen = apiContent?.identiteitsbewijzen || [];
      const address = getFullAddress(apiContent.adres, true);
      const name = getFullName(apiContent.persoon);
      const brpDataItems: ApiBaseItem<{ title: string; link: LinkProps }>[] = [
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
      return [...identiteitsBewijzen, ...brpDataItems];
    },
    displayTitle: (item: IdentiteitsbewijsFrontend | ApiBaseItem) => {
      return (term: string) =>
        displayPath(term, [capitalizeFirstLetter(item.title)]);
    },
  },
  {
    isEnabled: featureToggleKrefia.krefiaActive,
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
    isEnabled: featureToggleBezwaren.BezwarenActive,
    stateKey: 'BEZWAREN',
    profileTypes: ['private', 'commercial'],
    displayTitle(item: BezwaarFrontend) {
      return (term: string) =>
        displayPath(term, [`Bezwaar ${item.identificatie}`]);
    },
  },
  {
    isEnabled: featureToggleKlachten.klachtenActive,
    stateKey: 'KLACHTEN',
    profileTypes: ['private', 'commercial'],
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
    isEnabled: featureToggleBodem.BodemActive,
    stateKey: 'BODEM',
    profileTypes: ['private', 'commercial'],
    displayTitle(item: LoodMetingFrontend) {
      return (term: string) => displayPath(term, [item.title, item.adres]);
    },
  },
  {
    isEnabled: featureToggleAVG.avgActive,
    stateKey: 'AVG',
    profileTypes: ['private', 'commercial'],
    displayTitle(item: AVGRequestFrontend) {
      return (term: string) => displayPath(term, [item.title]);
    },
  },
  {
    isEnabled: featureToggleHoreca.horecaActive,
    stateKey: 'HORECA',
    profileTypes: ['private', 'commercial'],
    displayTitle: (vergunning: HorecaVergunningFrontend) => (term: string) => {
      return displayPath(term, [vergunning.title, vergunning.identifier]);
    },
    keywordsGeneratedFromProps: ['identifier'],
  },
  {
    isEnabled: featureToggleVaren.varenActive,
    stateKey: 'VAREN',
    profileTypes: ['commercial'],
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
          to: routeConfigVaren.themaPage.path,
          title: themaTitleVaren,
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
