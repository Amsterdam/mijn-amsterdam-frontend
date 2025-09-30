import { featureToggle, themaIdBRP, themaTitle } from './Profile-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const profileSectionProps: InfoSection = {
  id: themaIdBRP,
  title: themaTitle[themaIdBRP],
  listItems: [
    'Uw inschrijving bij de gemeente',
    'Uw contactmomenten met de gemeente',
  ],
  active: featureToggle[themaIdBRP].themaActive,
};
