import { featureToggle, themaId, themaTitle } from './Krefia-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const krefiaSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Informatie over ondersteuning door Kredietbank en Budgetbeheer (FIBU)',
  ],
  active: featureToggle.krefiaActive,
};
