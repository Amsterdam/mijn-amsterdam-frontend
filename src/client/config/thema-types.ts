import { type Params } from 'react-router';

import { SomeOtherString } from '../../universal/helpers/types';
import {
  AppState,
  LinkProps,
  SVGComponent,
} from '../../universal/types/App.types';

// InfoSection: een simpel info-blok met (optionele) titel en lijst
export type Section = {
  title?: string; // titel mag leeg zijn; dus voor elkaar krijgen dat titel wel verplicht is als het meer dan 1 sectie is
  listItems: string[]; // altijd een lijst van tekstjes; dit is zo afgesproken in de opdracht/pseudocode
};

// Menu item config (alleen data)
// export type MenuItemConfig = {
//   to: string; // pad of url
//   redactedScope?: 'full' | 'content' | 'none'; // optioneel
//   isAlwaysVisible?: boolean; // optioneel vlaggetje
// };

// ThemaConfig: basis-gegevens per thema (backend-safe)
export type ThemaConfigBase = {
  id: string; // uniek id van het thema (bijvoorbeeld:  'BODEM')
  title: string; // naam/titel van het thema
  profileTypes: ProfileType[];
  featureToggle: { themaActive: boolean };
  // TODO: ROUTECONFIG
  // TODO: MENUITEM > IS INTERFACE THEMAMENUITEM
  // TODO: SEARCG TOEVOEGEN HTTPS://gemeente-amsterdam
  // TODO:
  // listPageParamKind: {
  //   inProgress: 'lopende-aanvragen' | string;
  //   completed: 'afgehandelde-aanvragen' | string;
  // };
  linkListItems: LinkProps[]; // optioneel
  uitlegPageSections: Section[];
  route: {
    path: string;
    documentTitle: `${string} | ${string}`; //bijv
  };
  redactedScope: 'full' | 'content' | 'none';
  // themaTitleDetail?: string;  // ThemaTitleDetail is optioneel. Het wordt niet in elk thema gebruikt
  // featureToggle: { [key: string]: boolean }; // toggles aan/uit (bijvoorbeeld: BodemActive: true })
  // routeConfig: ThemaRoutesConfig;            // routes van het thema (detail, lijst, thema)
  //   listPageParamKind: {
  //    inProgress: 'lopende-aanvragen' | string,
  //    completed: 'afgehandelde-aanvragen',
  // }
};

export type WithDetailPage = {
  detailPage: {
    title: string;
    route: {
      path: string;
      trackingUrl: string;
      documentTitle: string; //bijv `Lood in de bodem-check | ${themaConfig.title}`
    };
  };
};

export type WithListPage = {
  listPage: {
    route: {
      path: string;
      documentTitle: (params: { kind: string }) => `${string} | ${string}`; //bijv (params) =>`${params?.kind === themaConfig.tableHeaders.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${ themaConfig.title } `,
    };
  };
};

export type withThemaPage = {
  ThemaPage: {
    title: string;
    route: {
      path: string;
      documentTitle: `${string} | ${string}`; //bijv`${themaConfig.title} | overzicht`,
    };
  };
};

// type ExtendedFeatureToggle = {
//   thema: boolean,
//   betalen: boolean,
//   facturen: {emandaat: boolean}
// }

// type AfisThemaConfig = ThemaConfig

// type WithBareFeaturetoggle = { featuretoggle: boolean }
// type withExtendedFeaturetoggle = { featuretoggle: { thema: boolean } & Record<string, boolean> }

// type ThemaConfig = ThemaConfig & WithBareFeaturetoggle

export type IsThemaVisibleFN = (appState: AppState) => boolean;

export interface ThemaMenuItem<ID extends string = string>
  extends Omit<LinkProps, 'title' | 'to' | 'rel'> {
  id: ID;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
  /** Scope 'content' automatically hides all thema content outside the thema. Content inside the thema should be manually redacted. Add the redacted class to the tag using getRedactedClass('themaId', 'content')  */
  redactedScope: 'full' | 'content' | 'none';
  title:
    | LinkProps['title']
    | ((appState: AppState, profileType?: ProfileType) => string);
  to:
    | LinkProps['to']
    | ((appState: AppState, profileType?: ProfileType) => string);
  // TODO: Make non optional if all thema menu items are migrated to the thema configs.
  isActive?: IsThemaVisibleFN;
  IconSVG?: SVGComponent;
}

export interface CategoryMenuItem<ID extends string> extends LinkProps {
  id: ID;
  submenuItems?: ThemaMenuItem[];
  profileTypes?: ProfileType[];
}

export interface ThemaMenuItemTransformed<ID extends string = string>
  extends Omit<ThemaMenuItem<ID>, 'title' | 'to'> {
  title: string;
  to: string;
}

type ThemaPageType =
  | `themaPage${string}`
  | `listPage${string}`
  | `detailPage${string}`
  | SomeOtherString;

type DocumenttitleFN = <T extends Params<string>>(params: T | null) => string;

type TrackinUrlFN = <T extends Params<string>>(params: T | null) => string;

export type ThemaRouteConfig = {
  path: string;
  // Only needed for routes with variable path segments
  trackingUrl?: string | TrackinUrlFN;
  documentTitle: string | DocumenttitleFN;
};

export type ThemaRoutesConfig = {
  [themaPageType in ThemaPageType]: ThemaRouteConfig;
};

export type PatroonCRoutesConfig = {
  [profileType in ProfileType]: string;
};

export type ThemaRenderRouteConfig = {
  route: string;
  Component: React.ElementType;
  isActive?: boolean;
};
