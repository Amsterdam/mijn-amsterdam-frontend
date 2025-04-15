import { PathMatch } from 'react-router';

import { TrackingConfig } from './routes';
import { SomeOtherString } from '../../universal/helpers/types';
import { AppState, LinkProps, SVGComponent } from '../../universal/types';

export type IsThemaVisibleFN = (appState: AppState) => boolean;

export interface ThemaMenuItem extends Omit<LinkProps, 'title' | 'to'> {
  id: string;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
  title: LinkProps['title'] | ((appState: AppState) => string);
  to: LinkProps['to'] | ((appState: AppState) => string);
  // TODO: Make non optional if all thema menu items are migrated to the thema configs.
  isActive?: IsThemaVisibleFN;
  IconSVG?: SVGComponent;
}

export interface ThemaMenuItemTransformed
  extends Omit<ThemaMenuItem, 'title' | 'to'> {
  title: string;
  to: string;
}

type ThemaPageType =
  | `themaPage${string}`
  | `listPage${string}`
  | `detailPage${string}`
  | SomeOtherString;

type DocumenttitleFN = <T extends Record<string, string>>(
  config: TrackingConfig,
  params: T | null
) => string;

type TrackinUrlFN = (match: PathMatch) => string;

export type ThemaRouteConfig = {
  path: string;
  trackingUrl?: string | TrackinUrlFN;
  documentTitle: string | DocumenttitleFN;
};

export type ThemaRoutesConfig = {
  [themaPageType in ThemaPageType]: ThemaRouteConfig;
};

/**
 * @deprecated Use `ThemaRoutesConfig` instead.
 */
export type DocumentTitlesConfig = {
  [key: string]: string | DocumenttitleFN;
};
