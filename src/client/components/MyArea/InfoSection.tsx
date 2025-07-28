import { routeConfig, themaId, themaTitle } from './MyArea-thema-config';
import * as generalInfo from '../../pages/GeneralInfo/GeneralInfo';

export const myAreaSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  to: routeConfig.themaPage.path,
  listItems: [
    { text: 'Overzicht van gemeentelijke informatie rond uw woning' },
  ],
};
