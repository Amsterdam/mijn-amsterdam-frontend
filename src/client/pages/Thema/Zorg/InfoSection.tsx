import { themaConfig, themaId, themaTitle } from './Zorg-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const zorgSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw Wmo-regelingen (Wmo: wet maatschappelijke ondersteuning)'],
  active: themaConfig.featureToggle.Active,
};
