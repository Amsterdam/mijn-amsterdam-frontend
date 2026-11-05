import type { AppState } from '../../../../../../universal/types/App.types.ts';
import type { ThemaMenuItem } from '../../../../../../universal/types/thema-types.ts';
import { isLoading } from '../../../../../helpers/api.ts';
import {
  featureToggle,
  SVWI_ROUTE_DEFAULT,
  themaId,
  themaTitle,
} from './Svwi-thema-config.ts';
import { default as SvwiIcon } from './SvwiIcon.svg?react';

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    return appState.SVWI?.content?.url || SVWI_ROUTE_DEFAULT;
  },
  redactedScope: 'full',
  profileTypes: ['private', 'commercial'],
  isActive(appState) {
    return (
      featureToggle.svwiActive &&
      !isLoading(appState.SVWI) &&
      !!appState.SVWI.content?.isKnown
    );
  },
  IconSVG: SvwiIcon,
};
