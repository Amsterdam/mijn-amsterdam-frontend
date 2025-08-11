import { themaId, themaTitle } from './Afval-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const afvalSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    { text: 'Informatie over afval laten ophalen en wegbrengen in uw buurt' },
  ],
};
