import {
  OVERTREDINGEN_ROUTE_DEFAULT,
  themaId,
  themaTitle,
  featureToggle,
} from './Overtredingen-thema-config.ts';
import { default as OvertredingenIcon } from './OvertredingenIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import { type ThemaMenuItem } from '../../../config/thema-types.ts';

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    return appState.OVERTREDINGEN?.content?.url ?? OVERTREDINGEN_ROUTE_DEFAULT;
  },
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.overtredingenActive &&
      !isLoading(appState.OVERTREDINGEN) &&
      !!appState.OVERTREDINGEN?.content &&
      !!appState.MILIEUZONE?.content?.isKnown
    );
  },
  IconSVG: OvertredingenIcon,
};
