import { featureToggle, themaId, themaTitle } from './Zorg-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const zorgSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw Wmo-regelingen (Wmo: wet maatschappelijke ondersteuning)'],
  active: featureToggle.zorgActive,
};
