import { featureToggle, themaId, themaTitle } from './Afis-thema-config.ts';
import type { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo.tsx';

export const afisSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van facturen', 'Betalen van facturen'],
  active: featureToggle.AfisActive,
};
