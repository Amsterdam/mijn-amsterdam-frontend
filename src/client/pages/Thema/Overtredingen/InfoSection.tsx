import { themaId, themaTitle } from './Overtredingen-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const overtredingensectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Inzien van uw overtredingen in de milieuzone' }],
};
