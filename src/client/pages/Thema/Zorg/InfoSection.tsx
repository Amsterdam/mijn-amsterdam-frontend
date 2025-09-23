import { featureToggle, themaId, themaTitle } from './Zorg-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const zorgSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw Wmo-regelingen (Wmo: wet maatschappelijke ondersteuning)'],
  active: featureToggle.zorgActive,
};
