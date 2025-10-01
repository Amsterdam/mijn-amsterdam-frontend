import {
  featureToggle,
  themaId,
  themaTitle,
} from './Overtredingen-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const overtredingensectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Inzien van uw overtredingen in de milieuzone'],
  active: featureToggle.overtredingenActive,
};
