import { themaConfig } from './Bodem-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const bodemsectionProps: InfoSection = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  active: themaConfig.featureToggle.themaActive,
};
