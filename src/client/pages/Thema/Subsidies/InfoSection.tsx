import { featureToggle, themaId, themaTitle } from './Subsidies-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const subsidiesSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw aanvraag voor een subsidie'],
  active: featureToggle.subsidiesActive,
};
