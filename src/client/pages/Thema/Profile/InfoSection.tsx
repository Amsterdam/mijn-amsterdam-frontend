import { featureToggle, themaIdBRP, themaTitle } from './Profile-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const profileSectionProps: Section = {
  id: themaIdBRP,
  title: themaTitle[themaIdBRP],
  listItems: [
    'Uw inschrijving bij de gemeente',
    'Uw contactmomenten met de gemeente',
  ],
  active: featureToggle[themaIdBRP].themaActive,
};
