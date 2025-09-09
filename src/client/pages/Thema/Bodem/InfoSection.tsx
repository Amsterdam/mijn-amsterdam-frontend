import { featureToggle, themaConfig } from './Bodem-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const bodemsectionProps: SectionProps = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  active: featureToggle.BodemActive,
};
