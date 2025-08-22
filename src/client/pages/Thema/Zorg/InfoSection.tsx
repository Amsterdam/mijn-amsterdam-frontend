import { featureToggle, themaId, themaTitle } from './Zorg-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const zorgSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw Wmo-regelingen (Wmo: wet maatschappelijke ondersteuning)'],
  active: featureToggle.zorgActive,
};
