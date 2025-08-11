import { themaId, themaTitle } from './Afis-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const afisSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    { text: 'Overzicht van facturen' },
    { text: 'Betalen van facturen' },
  ],
};
