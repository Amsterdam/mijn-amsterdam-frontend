import {
  featureToggle,
  themaId,
  themaTitle,
} from './Overtredingen-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const overtredingensectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Inzien van uw overtredingen in de milieuzone'],
  active: featureToggle.overtredingenActive,
};
