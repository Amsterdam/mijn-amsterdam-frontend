import { themaId, themaTitle } from './Burgerzaken-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const burgerzakenSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Gegevens van uw paspoort of ID-kaart' }],
};
