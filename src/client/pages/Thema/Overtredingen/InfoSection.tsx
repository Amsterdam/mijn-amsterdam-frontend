import { themaId, themaTitle } from './Overtredingen-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const overtredingensectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Inzien van uw overtredingen in de milieuzone' }],
};
