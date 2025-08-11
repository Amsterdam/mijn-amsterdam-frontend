import { themaId, themaTitle } from './Parkeren-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const parkerensectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    { text: 'Het inzien, aanvragen of wijzigen van een bewonersvergunning' },
  ],
};
