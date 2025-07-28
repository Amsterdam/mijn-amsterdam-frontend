import { themaId, themaTitle } from './Erfpacht-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const erfpachtSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Overzicht van uw erfpachtgegevens' }],
};
