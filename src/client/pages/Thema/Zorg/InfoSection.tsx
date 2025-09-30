import { featureToggle, themaId, themaTitle } from './Zorg-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const zorgSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw Wmo-regelingen (Wmo: wet maatschappelijke ondersteuning)'],
  active: featureToggle.zorgActive,
};
