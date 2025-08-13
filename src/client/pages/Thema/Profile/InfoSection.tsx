import { themaIdBRP, themaTitle } from './Profile-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const profileSectionProps: SectionProps = {
  id: themaIdBRP,
  title: themaTitle[themaIdBRP],
  listItems: [
    'Uw inschrijving bij de gemeente',
    'Uw contactmomenten met de gemeente',
  ],
};
