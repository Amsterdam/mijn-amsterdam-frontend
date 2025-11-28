import { featureToggle, themaId, themaTitle } from './Milieuzone-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const milieuzonesectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Inzien van uw ontheffingen in de milieuzone'],
  active: featureToggle.milieuzoneActive,
};
