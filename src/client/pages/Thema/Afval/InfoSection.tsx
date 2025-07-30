import { themaId, themaTitle } from './Afval-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const afvalSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    { text: 'Informatie over afval laten ophalen en wegbrengen in uw buurt' },
  ],
};
