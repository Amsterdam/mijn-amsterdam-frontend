import {
  SUBSIDIES_ROUTE_DEFAULT,
  themaId,
  themaTitle,
  featureToggle,
} from './Subsidies-thema-config.ts';
import { default as SubsidiesIcon } from './SubsidiesIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import { type ThemaMenuItem } from '../../../config/thema-types.ts';

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    return appState.SUBSIDIES?.content?.url || SUBSIDIES_ROUTE_DEFAULT;
  },
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.subsidiesActive &&
      !isLoading(appState.SUBSIDIES) &&
      !!appState.SUBSIDIES.content?.isKnown
    );
  },
  IconSVG: SubsidiesIcon,
};
