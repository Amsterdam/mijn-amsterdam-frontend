import { featureToggle, themaIdBRP, themaTitle } from './Profile-thema-config.ts';
import type { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo.tsx';

export const profileSectionProps: InfoSection_DEPRECATED = {
  id: themaIdBRP,
  title: themaTitle[themaIdBRP],
  listItems: [
    'Uw inschrijving bij de gemeente',
    'Uw contactmomenten met de gemeente',
  ],
  active: featureToggle[themaIdBRP].themaActive,
};
