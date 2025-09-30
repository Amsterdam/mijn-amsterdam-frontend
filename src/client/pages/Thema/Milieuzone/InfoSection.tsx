import { featureToggle, themaId, themaTitle } from './Milieuzone-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const milieuzonesectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Inzien van uw ontheffingen in de milieuzone'],
  active: featureToggle.milieuzoneActive,
};
