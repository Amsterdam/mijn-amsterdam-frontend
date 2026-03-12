import { featureToggle, themaId, themaTitle } from './Parkeren-thema-config.ts';
import type { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo.tsx';

export const parkerensectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Het inzien, aanvragen of wijzigen van een bewonersvergunning'],
  active: featureToggle.parkerenActive,
};
