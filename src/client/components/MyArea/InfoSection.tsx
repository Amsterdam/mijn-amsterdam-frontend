import { routeConfig, themaId, themaTitle } from './MyArea-thema-config';
import { InfoSection_DEPRECATED } from '../../pages/GeneralInfo/GeneralInfo';

export const myAreaSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  to: routeConfig.themaPage.path,
  listItems: ['Overzicht van gemeentelijke informatie rond uw woning'],
  active: true,
};
