import { themaId, themaTitle } from './Milieuzone-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const milieuzonesectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Inzien van uw ontheffingen in de milieuzone' }],
};
