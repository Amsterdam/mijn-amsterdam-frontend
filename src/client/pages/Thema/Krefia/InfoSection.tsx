import { featureToggle, themaId, themaTitle } from './Krefia-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const krefiaSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Informatie over ondersteuning door Kredietbank en Budgetbeheer (FIBU)',
  ],
  active: featureToggle.krefiaActive,
};
