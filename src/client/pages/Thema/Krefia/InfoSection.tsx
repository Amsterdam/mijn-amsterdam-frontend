import { featureToggle, themaId, themaTitle } from './Krefia-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const krefiaSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Informatie over ondersteuning door Kredietbank en Budgetbeheer (FIBU)',
  ],
  active: featureToggle.krefiaActive,
};
