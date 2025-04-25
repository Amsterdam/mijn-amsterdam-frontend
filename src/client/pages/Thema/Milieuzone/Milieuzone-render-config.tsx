import {
  MILIEUZONE_ROUTE_DEFAULT,
  themaId,
  themaTitle,
  featureToggle,
} from './Milieuzone-thema-config';
import { default as MilieuzoneIcon } from './MilieuzoneIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import { type ThemaMenuItem } from '../../../config/thema-types';

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    return appState.MILIEUZONE?.content?.url ?? MILIEUZONE_ROUTE_DEFAULT;
  },
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.milieuzoneActive &&
      !isLoading(appState.MILIEUZONE) &&
      !!appState.MILIEUZONE?.content?.isKnown
    );
  },
  IconSVG: MilieuzoneIcon,
};
