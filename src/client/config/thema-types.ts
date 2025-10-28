import { type Params } from 'react-router';

import { SomeOtherString } from '../../universal/helpers/types';
import {
  AppState,
  LinkProps,
  SVGComponent,
} from '../../universal/types/App.types';

export type WithPageConfig<K extends string, T extends object = object> = {
  [P in K]: T & { route: ThemaRouteConfig };
};

export type ListItems = Array<{ text?: string; listItems?: string[] } | string>;

export type IsThemaVisibleFN = (appState: AppState) => boolean;

export type ThemaConfigBase = {
  id: string;
  title: string;
  featureToggle: ThemaFeatureToggle;
  profileTypes: ProfileType[];
  uitlegPageSections: InfoSection;
  pageLinks: LinkProps[];
  route: ThemaRouteConfig;
  redactedScope: RedactedScope;
};

export type WithDetailPage = PageConfig<'detailPage'>;
export type WithListPage = PageConfig<'listPage'>;

type FeatureToggle = Record<string, boolean>;
type ThemaFeatureToggle = { themaActive: boolean } & FeatureToggle;
type RedactedScope = 'full' | 'content' | 'none';

type PageConfig<T extends string> = {
  [key in T]: {
    title?: string;
    documentTitle?: string;
    route: ThemaRouteConfig;
  };
};

type InfoSection = {
  title: string;
  listItems: Array<{ text?: string; listItems?: string[] } | string>;
};

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
  isActive?: IsThemaVisibleFN;
  IconSVG?: SVGComponent;
}

export interface CategoryMenuItem<ID extends string> extends LinkProps {
  id: ID;
  submenuItems?: ThemaMenuItem[];
  profileTypes?: ProfileType[];
}

export interface ThemaMenuItemTransformed<ID extends string = string>
  extends Omit<ThemaMenuItem<ID>, 'title' | 'to' | 'isActive'> {
  title: string;
  to: string;
  isActive: boolean;
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
  trackingUrl: null | string | TrackinUrlFN;
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
