import { themaConfig } from './Milieuzone-thema-config.ts';
import { default as MilieuzoneIcon } from './MilieuzoneIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import { type ThemaMenuItem } from '../../../config/thema-types.ts';

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: (appState: AppState) => {
    return appState.MILIEUZONE?.content?.url ?? themaConfig.route.path;
  },
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.MILIEUZONE) &&
      !!appState.MILIEUZONE?.content?.isKnown
    );
  },
  IconSVG: MilieuzoneIcon,
};
