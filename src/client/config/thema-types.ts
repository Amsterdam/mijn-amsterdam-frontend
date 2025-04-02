import { LinkProps } from 'react-router';

import { TrackingConfig } from './routes';
import { AppRoute } from '../../universal/config/routes';
import { ThemaID } from '../../universal/config/thema';
import { AppState } from '../../universal/types';

export interface ThemaMenuItem extends Omit<LinkProps, 'title' | 'to'> {
  id: ThemaID;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
  title: LinkProps['title'] | ((appState: AppState) => string);
  to: LinkProps['to'] | ((appState: AppState) => string);
  // TODO: Make non optional if all thema menu items are migrated to the thema configs.
  isActive?: IsThemaVisibleFN;
}

export interface ThemaMenuItemTransformed
  extends Omit<ThemaMenuItem, 'title' | 'to'> {
  title: string;
  to: string;
}

export type DocumentTitlesConfig = {
  [key in AppRoute]:
    | string
    | (<T extends Record<string, string>>(
        config: TrackingConfig,
        params: T | null
      ) => string);
};

export type IsThemaVisibleFN = (appState: AppState) => boolean;
