import { themaId, themaTitle } from './Erfpacht-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const erfpachtSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Overzicht van uw erfpachtgegevens' }],
};
