import { themaConfig } from './Belastingen-thema-config.ts';
import { default as BelastingenIcon } from './BelastingenIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import { type ThemaMenuItem } from '../../../config/thema-types.ts';

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: (_appState: AppState, profileType?: string) => {
    const path =
      profileType === 'commercial'
        ? '/eherkenning.saml.php?start'
        : '/digid.saml.php?start';
    return `${themaConfig.route.path + path}`;
  },
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState, profileType) {
    return (
      themaConfig.featureToggle.active &&
      (profileType === 'commercial' ||
        (!isLoading(appState.BELASTINGEN) &&
          !!appState.BELASTINGEN.content?.isKnown))
    );
  },
  IconSVG: BelastingenIcon,
};
