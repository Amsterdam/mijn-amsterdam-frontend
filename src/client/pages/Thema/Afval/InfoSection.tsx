import { featureToggle, themaConfig } from './Afval-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const afvalSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ['Informatie over afval laten ophalen en wegbrengen in uw buurt'],
  active: featureToggle.AfvalActive,
};
