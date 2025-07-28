import { themaId, themaTitle } from './AVG-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const AVGsectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Uw inzage of wijziging persoonsgegevens AVG' }],
};
