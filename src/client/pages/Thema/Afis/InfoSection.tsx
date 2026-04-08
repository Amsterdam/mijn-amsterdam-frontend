import { featureToggle, themaConfig } from './Afis-thema-config.ts';
import type { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo.tsx';

export const afisSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ['Overzicht van facturen', 'Betalen van facturen'],
  active: featureToggle.AfisActive,
};
