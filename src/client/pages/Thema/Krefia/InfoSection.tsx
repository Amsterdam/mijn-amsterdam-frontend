import { featureToggle, themaId, themaTitle } from './Krefia-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const krefiaSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Informatie over ondersteuning door Kredietbank en Budgetbeheer (FIBU)',
  ],
  active: featureToggle.krefiaActive,
};
