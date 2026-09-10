import {
  getBelastingenSSOUrl,
  themaConfig,
} from './Belastingen-thema-config.ts';
import { default as BelastingenIcon } from './BelastingenIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type ThemaMenuItem } from '../../../config/thema-types.ts';

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: getBelastingenSSOUrl,
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
