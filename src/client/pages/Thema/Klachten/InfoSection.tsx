import { themaId, themaTitle } from './Klachten-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const klachtenSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Uw ingediende klachten' }],
};
