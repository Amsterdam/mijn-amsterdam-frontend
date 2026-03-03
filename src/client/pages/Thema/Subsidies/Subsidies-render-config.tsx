import { themaConfig } from './Subsidies-thema-config';
import { default as SubsidiesIcon } from './SubsidiesIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import { type ThemaMenuItem } from '../../../config/thema-types';

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: (appState: AppState) => {
    return appState.SUBSIDIES?.content?.url || themaConfig.route.path;
  },
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.SUBSIDIES) &&
      !!appState.SUBSIDIES.content?.isKnown
    );
  },
  IconSVG: SubsidiesIcon,
};
