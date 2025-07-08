import {
  SVWI_ROUTE_DEFAULT,
  themaId,
  themaTitle,
  featureToggle,
} from './Svwi-thema-config.ts';
import { default as SvwiIcon } from './SvwiIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import { type ThemaMenuItem } from '../../../config/thema-types.ts';

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    return appState.SVWI?.content?.url || SVWI_ROUTE_DEFAULT;
  },
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.svwiActive &&
      !isLoading(appState.SVWI) &&
      !!appState.SVWI.content?.isKnown
    );
  },
  IconSVG: SvwiIcon,
};
