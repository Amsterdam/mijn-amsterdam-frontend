import { themaIdBRP, themaTitle } from './Profile-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const profileSectionProps: generalInfo.SectionProps = {
  id: themaIdBRP,
  title: themaTitle[themaIdBRP],
  listItems: [
    { text: 'Uw inschrijving bij de gemeente' },
    { text: 'Uw contactmomenten met de gemeente' },
  ],
};
