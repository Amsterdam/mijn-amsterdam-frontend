import { themaId, themaTitle } from './Bezwaren-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const bezwarenSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Bezwaren tegen een besluit van de gemeente Amsterdam' }],
};
