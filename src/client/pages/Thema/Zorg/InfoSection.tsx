import { themaId, themaTitle } from './Zorg-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const zorgSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    { text: 'Uw Wmo-regelingen (Wmo: wet maatschappelijke ondersteuning)' },
  ],
};
