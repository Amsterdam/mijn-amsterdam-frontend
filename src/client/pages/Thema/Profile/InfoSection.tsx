import { themaConfig } from './Profile-thema-config.ts';
import type { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo.tsx';

export const profileSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.BRP.id,
  title: themaConfig.BRP.title,
  listItems: [
    'Uw inschrijving bij de gemeente',
    'Uw contactmomenten met de gemeente',
  ],
  active: themaConfig.BRP.featureToggle.active,
};
