import { routeConfig, themaId, themaTitle } from './MyArea-thema-config';
import { Section } from '../../pages/GeneralInfo/GeneralInfo';

export const myAreaSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  to: routeConfig.themaPage.path,
  listItems: ['Overzicht van gemeentelijke informatie rond uw woning'],
  active: true,
};
