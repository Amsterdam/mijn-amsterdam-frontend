import { themaId, themaTitle } from './Parkeren-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const parkerensectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    { text: 'Het inzien, aanvragen of wijzigen van een bewonersvergunning' },
  ],
};
