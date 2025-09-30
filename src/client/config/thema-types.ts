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
  featureToggle: { themaActive: boolean };
  profileTypes: ProfileType[];
  uitlegPageSections: {
    title?: string;
    listItems: string[];
  };
  links: LinkProps[];
  route: {
    path: string;
    documentTitle: string;
  }; ///of ThemaRouteConfig
  redactedScope: 'full' | 'content' | 'none';
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

export type WithListPage = {
  listPage: {
    paramKind: {
      inProgress: string;
      completed: string;
    };
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
