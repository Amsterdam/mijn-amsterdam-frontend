import type { InfoSection_DEPRECATED } from '../../apps/bob/pages/GeneralInfo/GeneralInfo.tsx';
import { routeConfig, themaId, themaTitle } from './MyArea-thema-config.ts';

export const myAreaSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  href: routeConfig.themaPage.path,
  listItems: ['Overzicht van gemeentelijke informatie rond uw woning'],
  active: true,
};
