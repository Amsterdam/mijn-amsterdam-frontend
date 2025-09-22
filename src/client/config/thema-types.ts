import { type Params } from 'react-router';

import { SomeOtherString } from '../../universal/helpers/types';
import {
  AppState,
  LinkProps,
  SVGComponent,
} from '../../universal/types/App.types';

export type IsThemaVisibleFN = (appState: AppState) => boolean;

export type ThemaConfigBase = {
  id: string;
  title: string;
  featureToggle: { themaAcive: boolean };
  profileTypes: ProfileType[];
  uitlegPageSections: InfoSections[];
  links: LinkProps[];
  route: {
    listPageParamKind?: {
      inProgress: string;
      completed: string;
    };
    path: string;
    documentTitle: string;
  };
  //   isLoading: {
  //    redactedScope: 'none',
  //     isActive(appState: AppState) {
  //   return (
  //     themaConfig.featureToggle.themaActive &&
  //     !isLoading(appState.BODEM) && /// hier wil voor BODEM ${themaConfig.id}
  //     !!appState.BODEM.content?.length /// hier wil voor BODEM ${themaConfig.id}
  //   );
  // };
  //     }
  //TO DO menuItem > is interface ThemaMenuItem
  /// TO DO SEARCH TOEVOEGEN https://gemeente-amsterdam.atlassian.net/browse/MIJN-11547
};

export type WithDetailPage = {
  detailPage: {
    title: string;
    route: {
      path: string;
      trackingUrl: string;
      documentTitle: string;
    };
  };
};

// type TableConfig<T> = {
//   title: string;
//   sort: (item: T) => number; // TODO: -1 | 0 | 1 ? Type ergens anders gedefinieerd?
//   filter: (item: T) => boolean;
//   listPageRoute: string;
//   displayProps: DisplayProps<T>;
//   maxItems: number;
// };

export type WithListPage = {
  listPage: {
    route: {
      path: string;
      documentTitle: (params: { kind: string }) => `${string} | ${string}`;
    };
  };
  //tableConfig: Record<string, TableConfig<T>>;
};

export type InfoSections = {
  title?: ''; //titel wel verplicht wanneer meer dan een sectie
  listItems: string[];
};

///TO DO hieronder zou ik het liefts ook meenemen in de ThemaConfig
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
