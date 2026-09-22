import {
  getBelastingenSSOUrl,
  themaConfig,
} from './Belastingen-thema-config.ts';
import { default as BelastingenIcon } from './BelastingenIcon.svg?react';
import { isLoading } from '../../../../../helpers/api.ts';
import { type AppState } from '../../../../../../universal/types/App.types.ts';
import { type ThemaMenuItem } from '../../../../../../universal/types/thema-types.ts';

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: (_appState, profileType) => getBelastingenSSOUrl(profileType),
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState, profileType) {
    return (
      themaConfig.featureToggle.active &&
      (profileType === 'commercial' ||
        (!isLoading(appState.BELASTINGEN) &&
          !!appState.BELASTINGEN?.content?.isKnown))
    );
  },
  IconSVG: BelastingenIcon,
};
