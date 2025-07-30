import { themaId, themaTitle } from './Krefia-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const krefiaSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    {
      text: 'Informatie over ondersteuning door Kredietbank en Budgetbeheer (FIBU)',
    },
  ],
};
