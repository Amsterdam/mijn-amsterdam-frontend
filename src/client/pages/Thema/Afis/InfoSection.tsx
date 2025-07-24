import { themaTitle } from './Afis-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const afisSectionProps: generalInfo.SectionProps = {
  title: themaTitle,
  listItems: [
    { text: 'Overzicht van facturen' },
    { text: 'Betalen van facturen' },
  ],
};
