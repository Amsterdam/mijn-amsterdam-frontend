import {
  featureToggle,
  themaId,
  themaTitle,
} from './Overtredingen-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const overtredingensectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Inzien van uw overtredingen in de milieuzone'],
  active: featureToggle.overtredingenActive,
};
