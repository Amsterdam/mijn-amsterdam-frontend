import { featureToggle, themaId, themaTitle } from './Subsidies-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const subsidiesSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw aanvraag voor een subsidie'],
  active: featureToggle.subsidiesActive,
};
