import { featureToggle, themaId, themaTitle } from './Afval-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const afvalSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Informatie over afval laten ophalen en wegbrengen in uw buurt'],
  active: featureToggle.AfvalActive,
};
