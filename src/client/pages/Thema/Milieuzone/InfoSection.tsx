import { featureToggle, themaId, themaTitle } from './Milieuzone-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const milieuzonesectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Inzien van uw ontheffingen in de milieuzone'],
  active: featureToggle.milieuzoneActive,
};
