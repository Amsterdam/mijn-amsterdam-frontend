import { themaConfig } from './Belastingen-thema-config';
import { default as BelastingenIcon } from './BelastingenIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import { type ThemaMenuItem } from '../../../config/thema-types';

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: (appState: AppState) => {
    return appState.BELASTINGEN?.content?.url || themaConfig.route.path;
  },
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return (
      themaConfig.featureToggle.active &&
      !isLoading(appState.BELASTINGEN) &&
      !!appState.BELASTINGEN.content?.isKnown
    );
  },
  IconSVG: BelastingenIcon,
};
