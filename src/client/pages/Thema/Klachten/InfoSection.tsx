import { themaTitle } from './Klachten-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const klachtenSectionProps: generalInfo.SectionProps = {
  title: themaTitle,
  listItems: [{ text: 'Uw ingediende klachten' }],
};
